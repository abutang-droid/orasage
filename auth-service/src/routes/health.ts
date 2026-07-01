import { Router, type Request, type Response } from "express";
import { pingDb } from "../db/index.ts";
import { verifyToken, extractToken } from "../lib/jwt.ts";

export const healthRouter = Router();

healthRouter.get("/health", async (_req: Request, res: Response) => {
  const dbOk = await pingDb();
  res.status(dbOk ? 200 : 503).json({
    status: dbOk ? "ok" : "degraded",
    db: dbOk ? "connected" : "disconnected",
  });
});

// ── GET /auth/verify (供其他服务调用的 JWT 验证端点) ──
healthRouter.get("/verify", async (req: Request, res: Response) => {
  const token = extractToken(req.headers.authorization, req.headers.cookie);
  if (!token) {
    res.status(401).json({ valid: false, error: "no token" });
    return;
  }
  const payload = await verifyToken(token);
  if (!payload) {
    res.status(401).json({ valid: false, error: "invalid token" });
    return;
  }
  res.json({ valid: true, sub: payload.sub, role: payload.role });
});
