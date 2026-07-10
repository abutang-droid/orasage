import type { Request, Response, NextFunction } from "express";
import { getAuthUser } from "./auth-user.ts";
import {
  ALL_STAFF_ROLES,
  roleInSet,
  type StaffRole,
} from "../../../shared/staff-roles/index.ts";
import {
  hasStaffPermission,
  type AnyStaffPermission,
} from "../../../shared/staff-permissions/index.ts";
import {
  effectivePermissionsForUser,
  userIsActiveStaff,
} from "./staff-permissions.ts";

export type AdminRequest = Request & {
  adminUser: NonNullable<Awaited<ReturnType<typeof getAuthUser>>>;
  staffPermissions: Set<AnyStaffPermission>;
};

/** 在 requireStaff / assertPermission 中间件之后读取运营上下文 */
export function asAdminRequest(req: Request): AdminRequest {
  return req as AdminRequest;
}

async function loadAdminContext(
  req: Request,
  res: Response,
  allowedRoles: readonly StaffRole[],
): Promise<AdminRequest | null> {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return null;
  }
  if (!roleInSet(user.role, allowedRoles)) {
    res.status(403).json({ error: "权限不足" });
    return null;
  }
  if (!userIsActiveStaff(user)) {
    res.status(403).json({ error: "运营账号已停用" });
    return null;
  }
  const staffPermissions = effectivePermissionsForUser(user);
  const ctx = req as AdminRequest;
  ctx.adminUser = user;
  ctx.staffPermissions = staffPermissions;
  return ctx;
}

export function requireRoles(...allowed: StaffRole[]) {
  const set = allowed.length > 0 ? allowed : ALL_STAFF_ROLES;
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = await loadAdminContext(req, res, set);
    if (!ctx) return;
    next();
  };
}

export function requirePermission(...required: AnyStaffPermission[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const ctx = await loadAdminContext(req, res, ALL_STAFF_ROLES);
    if (!ctx) return;
    const ok = required.some((perm) => hasStaffPermission(ctx.staffPermissions, perm));
    if (!ok) {
      res.status(403).json({ error: "权限不足", required });
      return;
    }
    next();
  };
}

/** 任意运营员工（admin / shop_ops / content_ops） */
export const requireStaff = requireRoles(...ALL_STAFF_ROLES);

/** 商城运营（admin + shop_ops）— 保留兼容，优先用 requirePermission */
export const requireShopOps = requireRoles("admin", "shop_ops");

/** 仅超级管理员 */
export const requireSuperAdmin = requireRoles("admin");

/** 子账号管理 */
export const requireStaffManage = requirePermission("staff.manage");

/** 在 requireStaff 之后校验权限点（避免重复鉴权） */
export function assertPermission(...required: AnyStaffPermission[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = req as AdminRequest;
    if (!ctx.staffPermissions) {
      res.status(500).json({ error: "内部错误" });
      return;
    }
    const ok = required.some((perm) => hasStaffPermission(ctx.staffPermissions, perm));
    if (!ok) {
      res.status(403).json({ error: "权限不足", required });
      return;
    }
    next();
  };
}
