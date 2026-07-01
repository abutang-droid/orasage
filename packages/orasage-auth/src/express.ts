import type { Request, Response, NextFunction } from 'express';
import { orasageAuthEnv } from './env.ts';
import {
  extractTokenFromAuthHeader,
  extractTokenFromCookie,
  verifyOrasageToken,
  type OrasageAuthUser,
} from './jwt.ts';

declare global {
  namespace Express {
    interface Request {
      orasageUser?: OrasageAuthUser | null;
    }
  }
}

export async function resolveOrasageUser(req: Request): Promise<OrasageAuthUser | null> {
  const token =
    extractTokenFromAuthHeader(req.headers.authorization) ??
    extractTokenFromCookie(req.headers.cookie, orasageAuthEnv.jwtCookieName);
  if (!token) return null;
  return verifyOrasageToken(token);
}

/** Express middleware：解析 JWT，挂到 req.orasageUser；未登录不阻断 */
export function orasageAuthOptional() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    req.orasageUser = await resolveOrasageUser(req);
    next();
  };
}

/** Express middleware：要求已登录，否则 401 + loginUrl */
export function orasageAuthRequired(appOrigin: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = await resolveOrasageUser(req);
    if (!user) {
      const { loginUrl } = await import('./jwt.ts');
      res.status(401).json({
        error: '请先登录',
        loginUrl: loginUrl(appOrigin, req.originalUrl || '/'),
      });
      return;
    }
    req.orasageUser = user;
    next();
  };
}
