import { and, count, desc, eq, gt, sql } from "drizzle-orm";
import { db } from "../db/index.ts";
import { chatConversations, chatMessages, users } from "../db/schema.ts";
import { sendHubTelegramReturningId } from "./message-hub.ts";
import type { User } from "../db/schema.ts";

const MAX_BODY = 2000;

export function formatChatMessage(row: typeof chatMessages.$inferSelect) {
  return {
    id: row.id,
    conversationId: row.conversationId,
    direction: row.direction,
    body: row.body,
    readByUser: row.readByUser,
    readByOps: row.readByOps,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getOrCreateOpenConversation(userId: number) {
  const [existing] = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.userId, userId), eq(chatConversations.status, "open")))
    .orderBy(desc(chatConversations.updatedAt))
    .limit(1);
  if (existing) return existing;

  const [created] = await db
    .insert(chatConversations)
    .values({ userId, status: "open" })
    .returning();
  return created;
}

export async function listMessagesForConversation(conversationId: number, afterId = 0) {
  const conditions = [eq(chatMessages.conversationId, conversationId)];
  if (afterId > 0) conditions.push(gt(chatMessages.id, afterId));

  const rows = await db
    .select()
    .from(chatMessages)
    .where(and(...conditions))
    .orderBy(chatMessages.id)
    .limit(200);

  return rows.map(formatChatMessage);
}

export async function markMessagesReadByUser(conversationId: number, userId: number) {
  const [conv] = await db
    .select()
    .from(chatConversations)
    .where(and(eq(chatConversations.id, conversationId), eq(chatConversations.userId, userId)))
    .limit(1);
  if (!conv) return false;

  await db
    .update(chatMessages)
    .set({ readByUser: true })
    .where(
      and(
        eq(chatMessages.conversationId, conversationId),
        eq(chatMessages.direction, "ops"),
        eq(chatMessages.readByUser, false),
      ),
    );
  return true;
}

export async function markMessagesReadByOps(conversationId: number) {
  await db
    .update(chatMessages)
    .set({ readByOps: true })
    .where(
      and(
        eq(chatMessages.conversationId, conversationId),
        eq(chatMessages.direction, "user"),
        eq(chatMessages.readByOps, false),
      ),
    );
}

async function insertMessage(input: {
  conversationId: number;
  direction: "user" | "ops";
  body: string;
  telegramMessageId?: number | null;
}) {
  const [row] = await db
    .insert(chatMessages)
    .values({
      conversationId: input.conversationId,
      direction: input.direction,
      body: input.body.slice(0, MAX_BODY),
      telegramMessageId: input.telegramMessageId ?? null,
      readByUser: input.direction === "user",
      readByOps: input.direction === "ops",
    })
    .returning();

  await db
    .update(chatConversations)
    .set({ updatedAt: new Date() })
    .where(eq(chatConversations.id, input.conversationId));

  return row;
}

function buildTelegramForwardText(conversationId: number, user: Pick<User, "email" | "nickname">, body: string) {
  const label = user.nickname?.trim() || user.email;
  return [`💬 IM #${conversationId}`, `${label}`, "", body.slice(0, 1500)].join("\n");
}

export async function sendUserChatMessage(user: User, body: string) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("消息不能为空");
  if (trimmed.length > MAX_BODY) throw new Error("消息过长");

  const conversation = await getOrCreateOpenConversation(user.id);
  const row = await insertMessage({
    conversationId: conversation.id,
    direction: "user",
    body: trimmed,
  });

  const tgId = await sendHubTelegramReturningId(
    buildTelegramForwardText(conversation.id, user, trimmed),
  );
  if (tgId) {
    await db
      .update(chatMessages)
      .set({ telegramMessageId: tgId })
      .where(eq(chatMessages.id, row.id));
    row.telegramMessageId = tgId;
  }

  return { conversation, message: formatChatMessage(row) };
}

export async function sendOpsChatMessage(conversationId: number, body: string) {
  const trimmed = body.trim();
  if (!trimmed) throw new Error("消息不能为空");

  const [conv] = await db
    .select()
    .from(chatConversations)
    .where(eq(chatConversations.id, conversationId))
    .limit(1);
  if (!conv) throw new Error("会话不存在");

  const row = await insertMessage({
    conversationId,
    direction: "ops",
    body: trimmed,
  });

  return formatChatMessage(row);
}

export async function ingestTelegramOpsReply(replyToMessageId: number, body: string) {
  const trimmed = body.trim();
  if (!trimmed) return null;

  const [anchor] = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.telegramMessageId, replyToMessageId))
    .limit(1);
  if (!anchor || anchor.direction !== "user") return null;

  const [existing] = await db
    .select()
    .from(chatMessages)
    .where(
      and(
        eq(chatMessages.conversationId, anchor.conversationId),
        eq(chatMessages.direction, "ops"),
        eq(chatMessages.body, trimmed),
      ),
    )
    .orderBy(desc(chatMessages.id))
    .limit(1);
  if (existing && Date.now() - existing.createdAt.getTime() < 5000) return existing;

  return insertMessage({
    conversationId: anchor.conversationId,
    direction: "ops",
    body: trimmed,
  });
}

export async function listChatConversationsForAdmin(status?: string) {
  const conditions = status ? [eq(chatConversations.status, status)] : [];
  const rows = await db
    .select({
      id: chatConversations.id,
      userId: chatConversations.userId,
      status: chatConversations.status,
      createdAt: chatConversations.createdAt,
      updatedAt: chatConversations.updatedAt,
      userEmail: users.email,
      userNickname: users.nickname,
      unreadOps: sql<number>`(
        SELECT count(*)::int FROM chat_messages m
        WHERE m.conversation_id = ${chatConversations.id}
          AND m.direction = 'user' AND m.read_by_ops = false
      )`,
      lastBody: sql<string | null>`(
        SELECT m.body FROM chat_messages m
        WHERE m.conversation_id = ${chatConversations.id}
        ORDER BY m.id DESC LIMIT 1
      )`,
    })
    .from(chatConversations)
    .innerJoin(users, eq(chatConversations.userId, users.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(chatConversations.updatedAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    userId: r.userId,
    status: r.status,
    userEmail: r.userEmail,
    userLabel: r.userNickname?.trim() || r.userEmail,
    unreadOps: r.unreadOps,
    lastBody: r.lastBody,
    updatedAt: r.updatedAt.toISOString(),
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function getUnreadImCountForOps() {
  const [row] = await db
    .select({ value: count() })
    .from(chatMessages)
    .where(and(eq(chatMessages.direction, "user"), eq(chatMessages.readByOps, false)));
  return row?.value ?? 0;
}

export async function closeConversation(conversationId: number) {
  await db
    .update(chatConversations)
    .set({ status: "closed", updatedAt: new Date() })
    .where(eq(chatConversations.id, conversationId));
}
