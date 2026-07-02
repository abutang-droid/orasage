import type { Request, Response, NextFunction } from "express";
import { getAuthUser } from "./auth-user.ts";

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: "未登录" });
    return;
  }
  if (user.role !== "admin") {
    res.status(403).json({ error: "需要管理员权限" });
    return;
  }
  (req as Request & { adminUser: typeof user }).adminUser = user;
  next();
}
