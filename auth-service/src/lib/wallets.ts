import { and, count, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "../db/index.ts";
import { userWallets, users, walletLedgerEntries } from "../db/schema.ts";
import type { walletLedgerKindEnum } from "../db/schema.ts";

export const SUPPORTED_WALLET_CURRENCIES = ["CNY", "USD", "BRL", "USDT", "WOLD"] as const;
export type WalletCurrency = (typeof SUPPORTED_WALLET_CURRENCIES)[number];

export type WalletLedgerKind = typeof walletLedgerKindEnum.enumValues[number];

const KIND_LABELS: Record<WalletLedgerKind, string> = {
  credit: "入账",
  debit: "出账",
  adjustment: "人工调整",
  refund: "退款",
  hold: "冻结",
  release: "解冻",
};

function normalizeCurrency(raw: string): WalletCurrency {
  const cur = raw.toUpperCase();
  if ((SUPPORTED_WALLET_CURRENCIES as readonly string[]).includes(cur)) {
    return cur as WalletCurrency;
  }
  throw new Error(`不支持的币种: ${raw}`);
}

export function formatWalletAmount(cents: number, currency: string): string {
  const value = (cents / 100).toFixed(2);
  const cur = currency.toUpperCase();
  if (cur === "CNY") return `¥${value}`;
  if (cur === "USD") return `$${value}`;
  if (cur === "BRL") return `R$${value}`;
  if (cur === "USDT") return `${value} USDT`;
  if (cur === "WOLD") return `${value} WOLD`;
  return `${value} ${cur}`;
}

export function formatWalletRow(wallet: typeof userWallets.$inferSelect) {
  return {
    id: wallet.id,
    userId: wallet.userId,
    currency: wallet.currency,
    balanceCents: wallet.balanceCents,
    balanceDisplay: formatWalletAmount(wallet.balanceCents, wallet.currency),
    updatedAt: wallet.updatedAt,
  };
}

export function formatLedgerRow(entry: typeof walletLedgerEntries.$inferSelect) {
  return {
    id: entry.id,
    walletId: entry.walletId,
    userId: entry.userId,
    currency: entry.currency,
    kind: entry.kind,
    kindLabel: KIND_LABELS[entry.kind] ?? entry.kind,
    amountCents: entry.amountCents,
    amountDisplay: formatWalletAmount(entry.amountCents, entry.currency),
    balanceAfterCents: entry.balanceAfterCents,
    balanceAfterDisplay: formatWalletAmount(entry.balanceAfterCents, entry.currency),
    referenceType: entry.referenceType,
    referenceId: entry.referenceId,
    note: entry.note,
    createdBy: entry.createdBy,
    idempotencyKey: entry.idempotencyKey,
    createdAt: entry.createdAt,
  };
}

async function getOrCreateWallet(userId: number, currency: WalletCurrency) {
  const [existing] = await db
    .select()
    .from(userWallets)
    .where(and(eq(userWallets.userId, userId), eq(userWallets.currency, currency)))
    .limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(userWallets)
    .values({ userId, currency, balanceCents: 0 })
    .returning();
  return created;
}

export async function listWalletsForUser(userId: number) {
  const rows = await db
    .select()
    .from(userWallets)
    .where(eq(userWallets.userId, userId))
    .orderBy(userWallets.currency);
  if (rows.length > 0) return rows.map(formatWalletRow);
  const defaultWallet = await getOrCreateWallet(userId, "CNY");
  return [formatWalletRow(defaultWallet)];
}

export async function listLedgerForUser(userId: number, limit = 50) {
  const rows = await db
    .select()
    .from(walletLedgerEntries)
    .where(eq(walletLedgerEntries.userId, userId))
    .orderBy(desc(walletLedgerEntries.createdAt))
    .limit(Math.min(limit, 200));
  return rows.map(formatLedgerRow);
}

export type PostLedgerInput = {
  userId: number;
  currency: string;
  amountCents: number;
  kind: WalletLedgerKind;
  referenceType?: string | null;
  referenceId?: string | null;
  note?: string | null;
  createdBy?: number | null;
  idempotencyKey?: string | null;
};

/** 记账并更新余额（事务 + 幂等键） */
export async function postWalletLedgerEntry(input: PostLedgerInput) {
  const currency = normalizeCurrency(input.currency);
  if (!Number.isInteger(input.amountCents) || input.amountCents === 0) {
    throw new Error("amountCents 必须为非零整数");
  }

  if (input.idempotencyKey) {
    const [dup] = await db
      .select()
      .from(walletLedgerEntries)
      .where(eq(walletLedgerEntries.idempotencyKey, input.idempotencyKey))
      .limit(1);
    if (dup) {
      const [wallet] = await db.select().from(userWallets).where(eq(userWallets.id, dup.walletId)).limit(1);
      return { duplicate: true as const, ledger: formatLedgerRow(dup), wallet: wallet ? formatWalletRow(wallet) : null };
    }
  }

  return db.transaction(async (tx) => {
    const [user] = await tx.select({ id: users.id }).from(users).where(eq(users.id, input.userId)).limit(1);
    if (!user) throw new Error("用户不存在");

    let [wallet] = await tx
      .select()
      .from(userWallets)
      .where(and(eq(userWallets.userId, input.userId), eq(userWallets.currency, currency)))
      .limit(1);

    if (!wallet) {
      [wallet] = await tx.insert(userWallets).values({
        userId: input.userId,
        currency,
        balanceCents: 0,
      }).returning();
    }

    const nextBalance = wallet.balanceCents + input.amountCents;
    if (nextBalance < 0) {
      throw new Error("余额不足");
    }

    const [ledger] = await tx.insert(walletLedgerEntries).values({
      walletId: wallet.id,
      userId: input.userId,
      currency,
      kind: input.kind,
      amountCents: input.amountCents,
      balanceAfterCents: nextBalance,
      referenceType: input.referenceType ?? null,
      referenceId: input.referenceId ?? null,
      note: input.note ?? null,
      createdBy: input.createdBy ?? null,
      idempotencyKey: input.idempotencyKey ?? null,
    }).returning();

    const [updatedWallet] = await tx
      .update(userWallets)
      .set({ balanceCents: nextBalance, updatedAt: new Date() })
      .where(eq(userWallets.id, wallet.id))
      .returning();

    return {
      duplicate: false as const,
      ledger: formatLedgerRow(ledger),
      wallet: formatWalletRow(updatedWallet),
    };
  });
}

export async function listWalletsAdmin(opts: { q?: string; limit?: number; offset?: number }) {
  const limit = Math.min(opts.limit ?? 50, 100);
  const offset = Math.max(0, opts.offset ?? 0);
  const q = (opts.q ?? "").trim();

  const userFilter = q
    ? or(
        ilike(users.email, `%${q}%`),
        ilike(users.nickname, `%${q}%`),
        ilike(users.displayId, `%${q}%`),
        eq(users.id, Number(q) || -1),
      )
    : undefined;

  const rows = await db
    .select({
      wallet: userWallets,
      user: users,
    })
    .from(userWallets)
    .innerJoin(users, eq(userWallets.userId, users.id))
    .where(userFilter)
    .orderBy(desc(userWallets.updatedAt))
    .limit(limit)
    .offset(offset);

  const [totalRow] = await db
    .select({ value: count() })
    .from(userWallets)
    .innerJoin(users, eq(userWallets.userId, users.id))
    .where(userFilter);

  return {
    wallets: rows.map(({ wallet, user }) => ({
      ...formatWalletRow(wallet),
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        displayId: user.displayId,
      },
    })),
    total: totalRow?.value ?? 0,
    limit,
    offset,
  };
}

export async function getWalletUserSummary(userId: number) {
  const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  if (!user) return null;
  const wallets = await listWalletsForUser(userId);
  return {
    user: {
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      displayId: user.displayId,
    },
    wallets,
  };
}
