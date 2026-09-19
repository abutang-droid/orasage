import { Router } from "express";
import bcrypt from "bcryptjs";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.ts";
import { users } from "../db/schema.ts";
import {
  asAdminRequest,
  assertPermission,
  requireStaff,
} from "../lib/admin-auth.ts";
import { generateUniqueDisplayId } from "../lib/display-id.ts";
import { effectivePermissionsArray } from "../lib/staff-permissions.ts";
import {
  ASSIGNABLE_EXTRA_PERMISSIONS,
  CREATABLE_STAFF_ROLES,
  STAFF_PERMISSION_LABELS,
  type StaffPermission,
} from "../../../shared/staff-permissions/index.ts";
import {
  ALL_STAFF_ROLES,
  STAFF_ROLE_LABELS,
  type StaffRole,
} from "../../../shared/staff-roles/index.ts";

export const staffAdminRouter = Router();
staffAdminRouter.use(requireStaff);
staffAdminRouter.use(assertPermission("staff.manage"));

function formatStaffRow(user: typeof users.$inferSelect) {
  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    role: user.role,
    roleLabel: STAFF_ROLE_LABELS[user.role as StaffRole] ?? user.role,
    staffLabel: user.staffLabel,
    staffDisabled: user.staffDisabled,
    staffGrants: user.staffGrants,
    staffRevokes: user.staffRevokes,
    permissions: effectivePermissionsArray(user),
    lastSignedIn: user.lastSignedIn,
    createdAt: user.createdAt,
  };
}

staffAdminRouter.get("/meta", async (_req, res) => {
  res.json({
    roles: CREATABLE_STAFF_ROLES.map((role) => ({
      value: role,
      label: STAFF_ROLE_LABELS[role],
    })),
    permissionLabels: STAFF_PERMISSION_LABELS,
    assignableExtras: ASSIGNABLE_EXTRA_PERMISSIONS.map((p) => ({
      value: p,
      label: STAFF_PERMISSION_LABELS[p],
    })),
  });
});

staffAdminRouter.get("/", async (_req, res) => {
  const rows = await db
    .select()
    .from(users)
    .where(inArray(users.role, [...ALL_STAFF_ROLES]))
    .orderBy(desc(users.createdAt));
  res.json({ staff: rows.map(formatStaffRow) });
});

const createStaffSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  nickname: z.string().max(100).optional(),
  role: z.enum(["shop_ops", "content_ops"]),
  staffLabel: z.string().max(100).optional(),
  staffGrants: z.array(z.string()).optional(),
  staffRevokes: z.array(z.string()).optional(),
});

staffAdminRouter.post("/", async (req, res) => {
  try {
    const body = createStaffSchema.parse(req.body);
    const existing = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (existing.length > 0) {
      res.status(409).json({ error: "该邮箱已存在" });
      return;
    }
    const passwordHash = await bcrypt.hash(body.password, 10);
    const displayId = await generateUniqueDisplayId();
    const [row] = await db.insert(users).values({
      email: body.email,
      passwordHash,
      displayId,
      nickname: body.nickname || body.email.split("@")[0],
      role: body.role,
      staffLabel: body.staffLabel || null,
      staffGrants: body.staffGrants ?? [],
      staffRevokes: body.staffRevokes ?? [],
    }).returning();
    res.status(201).json({ staff: formatStaffRow(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] create staff:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});

const patchStaffSchema = z.object({
  nickname: z.string().max(100).optional(),
  role: z.enum(["shop_ops", "content_ops"]).optional(),
  staffLabel: z.string().max(100).nullable().optional(),
  staffDisabled: z.boolean().optional(),
  staffGrants: z.array(z.string()).optional(),
  staffRevokes: z.array(z.string()).optional(),
  password: z.string().min(8).max(128).optional(),
}).refine((b) => Object.keys(b).length > 0, { message: "至少提供一个更新字段" });

staffAdminRouter.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: "参数错误" });
      return;
    }
    const ctx = asAdminRequest(req);
    if (id === ctx.adminUser.id) {
      res.status(400).json({ error: "不能修改自己的角色或停用状态" });
      return;
    }
    const body = patchStaffSchema.parse(req.body);
    const [existing] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!existing || !ALL_STAFF_ROLES.includes(existing.role as StaffRole)) {
      res.status(404).json({ error: "子账号不存在" });
      return;
    }
    if (existing.role === "admin") {
      res.status(403).json({ error: "不能修改超级管理员" });
      return;
    }
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (body.nickname !== undefined) updates.nickname = body.nickname;
    if (body.role !== undefined) updates.role = body.role;
    if (body.staffLabel !== undefined) updates.staffLabel = body.staffLabel;
    if (body.staffDisabled !== undefined) updates.staffDisabled = body.staffDisabled;
    if (body.staffGrants !== undefined) updates.staffGrants = body.staffGrants;
    if (body.staffRevokes !== undefined) updates.staffRevokes = body.staffRevokes;
    if (body.password) updates.passwordHash = await bcrypt.hash(body.password, 10);
    const [row] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    res.json({ staff: formatStaffRow(row) });
  } catch (err) {
    if (err instanceof z.ZodError) {
      res.status(400).json({ error: "参数错误", details: err.errors });
      return;
    }
    console.error("[admin] patch staff:", err);
    res.status(500).json({ error: "服务器内部错误" });
  }
});
