import { Router } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { salesChannelMembers, salesChannels, users } from "../db/schema.ts";
import {
  assertPermission,
  requireStaff,
} from "../lib/admin-auth.ts";
import {
  CHANNEL_MEMBER_ROLES,
  CHANNEL_MEMBER_ROLE_LABELS,
  CHANNEL_STATUS_LABELS,
  COMMISSION_BPS_MAX,
  bpsToPercent,
  formatBpsPercent,
  rateForRole,
  sumDefaultRates,
  type ChannelDefaultRatesBps,
  type ChannelMemberRole,
} from "../../../shared/sales-channels/index.ts";

export const channelsAdminRouter = Router();
channelsAdminRouter.use(requireStaff);
channelsAdminRouter.use(assertPermission("channels.manage"));

const bpsSchema = z.number().int().min(0).max(COMMISSION_BPS_MAX);

const ratesSchema = z.object({
  bd: bpsSchema.optional(),
  ops: bpsSchema.optional(),
  designer: bpsSchema.optional(),
  salesperson: bpsSchema.optional(),
  store: bpsSchema.optional(),
});

function defaultRatesFromRow(row: typeof salesChannels.$inferSelect): ChannelDefaultRatesBps {
  return {
    bd: row.rateBdBps,
    ops: row.rateOpsBps,
    designer: row.rateDesignerBps,
    salesperson: row.rateSalespersonBps,
    store: row.rateStoreBps,
  };
}

function formatUserBrief(user: typeof users.$inferSelect | undefined | null) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    staffLabel: user.staffLabel,
  };
}

function formatRates(rates: ChannelDefaultRatesBps) {
  return {
    bdBps: rates.bd,
    opsBps: rates.ops,
    designerBps: rates.designer,
    salespersonBps: rates.salesperson,
    storeBps: rates.store,
    bdPercent: bpsToPercent(rates.bd),
    opsPercent: bpsToPercent(rates.ops),
    designerPercent: bpsToPercent(rates.designer),
    salespersonPercent: bpsToPercent(rates.salesperson),
    storePercent: bpsToPercent(rates.store),
    sumBps: sumDefaultRates(rates),
    sumPercent: bpsToPercent(sumDefaultRates(rates)),
    sumExceeds100: sumDefaultRates(rates) > COMMISSION_BPS_MAX,
  };
}

function formatChannel(
  row: typeof salesChannels.$inferSelect,
  owner?: typeof users.$inferSelect | null,
  memberCount = 0,
) {
  const rates = defaultRatesFromRow(row);
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    status: row.status,
    statusLabel: CHANNEL_STATUS_LABELS[row.status],
    note: row.note,
    ownerUserId: row.ownerUserId,
    owner: formatUserBrief(owner),
    rates: formatRates(rates),
    memberCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function formatMember(
  row: typeof salesChannelMembers.$inferSelect,
  channelRates: ChannelDefaultRatesBps,
  user?: typeof users.$inferSelect | null,
) {
  const role = row.memberRole as ChannelMemberRole;
  const effectiveBps = row.commissionBps ?? rateForRole(channelRates, role);
  return {
    id: row.id,
    channelId: row.channelId,
    memberRole: role,
    memberRoleLabel: CHANNEL_MEMBER_ROLE_LABELS[role],
    name: row.name,
    userId: row.userId,
    user: formatUserBrief(user),
    commissionBps: row.commissionBps,
    commissionPercent: row.commissionBps == null ? null : bpsToPercent(row.commissionBps),
    effectiveCommissionBps: effectiveBps,
    effectiveCommissionPercent: bpsToPercent(effectiveBps),
    effectiveCommissionLabel: formatBpsPercent(effectiveBps),
    usesChannelDefault: row.commissionBps == null,
    contact: row.contact,
    address: row.address,
    note: row.note,
    disabled: row.disabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function loadUsersByIds(ids: number[]) {
  const unique = [...new Set(ids.filter((id) => Number.isInteger(id) && id > 0))];
  if (unique.length === 0) return new Map<number, typeof users.$inferSelect>();
  const rows = await db.select().from(users).where(inArray(users.id, unique));
  return new Map(rows.map((u) => [u.id, u]));
}

async function resolveUserIdByEmail(email: string | null | undefined): Promise<number | null> {
  if (!email) return null;
  const [row] = await db.select().from(users).where(eq(users.email, email.trim().toLowerCase())).limit(1);
  if (!row) {
    const [row2] = await db.select().from(users).where(eq(users.email, email.trim())).limit(1);
    return row2?.id ?? null;
  }
  return row.id;
}

channelsAdminRouter.get("/meta", async (_req, res) => {
  res.json({
    memberRoles: CHANNEL_MEMBER_ROLES.map((role) => ({
      value: role,
      label: CHANNEL_MEMBER_ROLE_LABELS[role],
    })),
    statuses: (Object.keys(CHANNEL_STATUS_LABELS) as Array<keyof typeof CHANNEL_STATUS_LABELS>).map(
      (value) => ({ value, label: CHANNEL_STATUS_LABELS[value] }),
    ),
  });
});

channelsAdminRouter.get("/", async (_req, res) => {
  const rows = await db.select().from(salesChannels).orderBy(desc(salesChannels.createdAt));
  const members = rows.length
    ? await db.select().from(salesChannelMembers).where(
      inArray(salesChannelMembers.channelId, rows.map((r) => r.id)),
    )
    : [];
  const countByChannel = new Map<number, number>();
  for (const m of members) {
    countByChannel.set(m.channelId, (countByChannel.get(m.channelId) ?? 0) + 1);
  }
  const owners = await loadUsersByIds(rows.map((r) => r.ownerUserId ?? 0));
  res.json({
    channels: rows.map((row) =>
      formatChannel(row, owners.get(row.ownerUserId ?? 0) ?? null, countByChannel.get(row.id) ?? 0),
    ),
  });
});

const createChannelSchema = z.object({
  code: z.string().trim().min(1).max(64).regex(/^[a-zA-Z0-9_-]+$/, "渠道编码仅允许字母数字_-"),
  name: z.string().trim().min(1).max(120),
  note: z.string().max(2000).optional().nullable(),
  ownerUserId: z.number().int().positive().optional().nullable(),
  ownerEmail: z.string().email().max(320).optional().nullable(),
  rates: ratesSchema.optional(),
});

channelsAdminRouter.post("/", async (req, res) => {
  try {
    const body = createChannelSchema.parse(req.body);
    const code = body.code.toLowerCase();
    const [existing] = await db.select().from(salesChannels).where(eq(salesChannels.code, code)).limit(1);
    if (existing) {
      res.status(409).json({ error: "渠道编码已存在" });
      return;
    }

    let ownerUserId = body.ownerUserId ?? null;
    if (!ownerUserId && body.ownerEmail) {
      ownerUserId = await resolveUserIdByEmail(body.ownerEmail);
      if (!ownerUserId) {
        res.status(400).json({ error: "绑定账号邮箱不存在" });
        return;
      }
    }
    if (ownerUserId) {
      const [owner] = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
      if (!owner) {
        res.status(400).json({ error: "绑定账号不存在" });
        return;
      }
    }

    const rates = {
      bd: body.rates?.bd ?? 0,
      ops: body.rates?.ops ?? 0,
      designer: body.rates?.designer ?? 0,
      salesperson: body.rates?.salesperson ?? 0,
      store: body.rates?.store ?? 0,
    };

    const [row] = await db.insert(salesChannels).values({
      code,
      name: body.name,
      note: body.note ?? null,
      ownerUserId,
      rateBdBps: rates.bd,
      rateOpsBps: rates.ops,
      rateDesignerBps: rates.designer,
      rateSalespersonBps: rates.salesperson,
      rateStoreBps: rates.store,
    }).returning();

    const owners = await loadUsersByIds(ownerUserId ? [ownerUserId] : []);
    res.status(201).json({
      channel: formatChannel(row, owners.get(ownerUserId ?? 0) ?? null, 0),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] create channel:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

channelsAdminRouter.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const [row] = await db.select().from(salesChannels).where(eq(salesChannels.id, id)).limit(1);
  if (!row) {
    res.status(404).json({ error: "渠道不存在" });
    return;
  }
  const members = await db
    .select()
    .from(salesChannelMembers)
    .where(eq(salesChannelMembers.channelId, id))
    .orderBy(desc(salesChannelMembers.createdAt));
  const userMap = await loadUsersByIds([
    row.ownerUserId ?? 0,
    ...members.map((m) => m.userId ?? 0),
  ]);
  const rates = defaultRatesFromRow(row);
  res.json({
    channel: formatChannel(row, userMap.get(row.ownerUserId ?? 0) ?? null, members.length),
    members: members.map((m) => formatMember(m, rates, userMap.get(m.userId ?? 0) ?? null)),
  });
});

const patchChannelSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  note: z.string().max(2000).nullable().optional(),
  status: z.enum(["active", "disabled"]).optional(),
  ownerUserId: z.number().int().positive().nullable().optional(),
  ownerEmail: z.string().email().max(320).nullable().optional(),
  rates: ratesSchema.optional(),
}).refine((b) => Object.keys(b).length > 0, { message: "至少提供一个更新字段" });

channelsAdminRouter.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const body = patchChannelSchema.parse(req.body);
    const [existing] = await db.select().from(salesChannels).where(eq(salesChannels.id, id)).limit(1);
    if (!existing) {
      res.status(404).json({ error: "渠道不存在" });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.note !== undefined) updates.note = body.note;
    if (body.status !== undefined) updates.status = body.status;

    if (body.ownerUserId !== undefined || body.ownerEmail !== undefined) {
      let ownerUserId = body.ownerUserId === undefined ? existing.ownerUserId : body.ownerUserId;
      if (body.ownerEmail === null) {
        ownerUserId = null;
      } else if (body.ownerEmail) {
        ownerUserId = await resolveUserIdByEmail(body.ownerEmail);
        if (!ownerUserId) {
          res.status(400).json({ error: "绑定账号邮箱不存在" });
          return;
        }
      }
      if (ownerUserId) {
        const [owner] = await db.select().from(users).where(eq(users.id, ownerUserId)).limit(1);
        if (!owner) {
          res.status(400).json({ error: "绑定账号不存在" });
          return;
        }
      }
      updates.ownerUserId = ownerUserId;
    }

    if (body.rates) {
      if (body.rates.bd !== undefined) updates.rateBdBps = body.rates.bd;
      if (body.rates.ops !== undefined) updates.rateOpsBps = body.rates.ops;
      if (body.rates.designer !== undefined) updates.rateDesignerBps = body.rates.designer;
      if (body.rates.salesperson !== undefined) updates.rateSalespersonBps = body.rates.salesperson;
      if (body.rates.store !== undefined) updates.rateStoreBps = body.rates.store;
    }

    const [row] = await db.update(salesChannels).set(updates).where(eq(salesChannels.id, id)).returning();
    const members = await db.select().from(salesChannelMembers).where(eq(salesChannelMembers.channelId, id));
    const owners = await loadUsersByIds(row.ownerUserId ? [row.ownerUserId] : []);
    res.json({
      channel: formatChannel(row, owners.get(row.ownerUserId ?? 0) ?? null, members.length),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] patch channel:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const createMemberSchema = z.object({
  memberRole: z.enum(CHANNEL_MEMBER_ROLES),
  name: z.string().trim().min(1).max(120),
  userId: z.number().int().positive().optional().nullable(),
  userEmail: z.string().email().max(320).optional().nullable(),
  commissionBps: bpsSchema.optional().nullable(),
  contact: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  note: z.string().max(2000).optional().nullable(),
});

channelsAdminRouter.post("/:id/members", async (req, res) => {
  try {
    const channelId = Number(req.params.id);
    if (!Number.isInteger(channelId) || channelId <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const body = createMemberSchema.parse(req.body);
    const [channel] = await db.select().from(salesChannels).where(eq(salesChannels.id, channelId)).limit(1);
    if (!channel) {
      res.status(404).json({ error: "渠道不存在" });
      return;
    }

    let userId = body.userId ?? null;
    if (!userId && body.userEmail) {
      userId = await resolveUserIdByEmail(body.userEmail);
      if (!userId) {
        res.status(400).json({ error: "绑定账号邮箱不存在" });
        return;
      }
    }
    if (userId) {
      const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
      if (!u) {
        res.status(400).json({ error: "绑定账号不存在" });
        return;
      }
    }

    const [row] = await db.insert(salesChannelMembers).values({
      channelId,
      memberRole: body.memberRole,
      name: body.name,
      userId,
      commissionBps: body.commissionBps === undefined ? null : body.commissionBps,
      contact: body.contact ?? null,
      address: body.address ?? null,
      note: body.note ?? null,
    }).returning();

    const userMap = await loadUsersByIds(userId ? [userId] : []);
    res.status(201).json({
      member: formatMember(row, defaultRatesFromRow(channel), userMap.get(userId ?? 0) ?? null),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] create channel member:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const patchMemberSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  memberRole: z.enum(CHANNEL_MEMBER_ROLES).optional(),
  userId: z.number().int().positive().nullable().optional(),
  userEmail: z.string().email().max(320).nullable().optional(),
  commissionBps: bpsSchema.nullable().optional(),
  contact: z.string().max(200).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  note: z.string().max(2000).nullable().optional(),
  disabled: z.boolean().optional(),
}).refine((b) => Object.keys(b).length > 0, { message: "至少提供一个更新字段" });

channelsAdminRouter.patch("/:id/members/:memberId", async (req, res) => {
  try {
    const channelId = Number(req.params.id);
    const memberId = Number(req.params.memberId);
    if (!Number.isInteger(channelId) || channelId <= 0 || !Number.isInteger(memberId) || memberId <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const body = patchMemberSchema.parse(req.body);
    const [channel] = await db.select().from(salesChannels).where(eq(salesChannels.id, channelId)).limit(1);
    if (!channel) {
      res.status(404).json({ error: "渠道不存在" });
      return;
    }
    const [existing] = await db
      .select()
      .from(salesChannelMembers)
      .where(and(eq(salesChannelMembers.id, memberId), eq(salesChannelMembers.channelId, channelId)))
      .limit(1);
    if (!existing) {
      res.status(404).json({ error: "成员不存在" });
      return;
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.name !== undefined) updates.name = body.name;
    if (body.memberRole !== undefined) updates.memberRole = body.memberRole;
    if (body.commissionBps !== undefined) updates.commissionBps = body.commissionBps;
    if (body.contact !== undefined) updates.contact = body.contact;
    if (body.address !== undefined) updates.address = body.address;
    if (body.note !== undefined) updates.note = body.note;
    if (body.disabled !== undefined) updates.disabled = body.disabled;

    if (body.userId !== undefined || body.userEmail !== undefined) {
      let userId = body.userId === undefined ? existing.userId : body.userId;
      if (body.userEmail === null) {
        userId = null;
      } else if (body.userEmail) {
        userId = await resolveUserIdByEmail(body.userEmail);
        if (!userId) {
          res.status(400).json({ error: "绑定账号邮箱不存在" });
          return;
        }
      }
      if (userId) {
        const [u] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (!u) {
          res.status(400).json({ error: "绑定账号不存在" });
          return;
        }
      }
      updates.userId = userId;
    }

    const [row] = await db
      .update(salesChannelMembers)
      .set(updates)
      .where(eq(salesChannelMembers.id, memberId))
      .returning();
    const userMap = await loadUsersByIds(row.userId ? [row.userId] : []);
    res.json({
      member: formatMember(row, defaultRatesFromRow(channel), userMap.get(row.userId ?? 0) ?? null),
    });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] patch channel member:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

channelsAdminRouter.delete("/:id/members/:memberId", async (req, res) => {
  const channelId = Number(req.params.id);
  const memberId = Number(req.params.memberId);
  if (!Number.isInteger(channelId) || channelId <= 0 || !Number.isInteger(memberId) || memberId <= 0) {
    res.status(400).json({ error: "参数错误" });
    return;
  }
  const [existing] = await db
    .select()
    .from(salesChannelMembers)
    .where(and(eq(salesChannelMembers.id, memberId), eq(salesChannelMembers.channelId, channelId)))
    .limit(1);
  if (!existing) {
    res.status(404).json({ error: "成员不存在" });
    return;
  }
  await db.delete(salesChannelMembers).where(eq(salesChannelMembers.id, memberId));
  res.json({ success: true });
});
