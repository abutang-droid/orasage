import type { Request, Response, NextFunction } from "express";
import { getAuthUser } from "./auth-user.ts";
import {
  ALL_STAFF_ROLES,
  roleInSet,
  type StaffRole,
} from "../../../shared/staff-roles/index.ts";

export function requireRoles(...allowed: StaffRole[]) {
  const set = allowed.length > 0 ? allowed : ALL_STAFF_ROLES;
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await getAuthUser(req);
    if (!user) {
      res.status(401).json({ error: "未登录" });
      return;
    }
    if (!roleInSet(user.role, set)) {
      res.status(403).json({ error: "权限不足" });
      return;
    }
    (req as Request & { adminUser: typeof user }).adminUser = user;
    next();
  };
}

/** 任意运营员工（admin / shop_ops / content_ops） */
export const requireStaff = requireRoles(...ALL_STAFF_ROLES);

/** 商城运营（admin + shop_ops） */
export const requireShopOps = requireRoles("admin", "shop_ops");

/** 仅超级管理员 */
export const requireSuperAdmin = requireRoles("admin");
