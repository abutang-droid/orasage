const DEV_JWT_SECRET = 'dev-secret-change-in-production-32chars';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Missing required env var: JWT_SECRET');
}

export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? DEV_JWT_SECRET,
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'orasage_token',
  authUrl: process.env.AUTH_URL ?? 'https://auth.orasage.com',
  /** 服务端调 auth API 优先走内网，避免绕公网/CF；浏览器登录跳转仍用 authUrl */
  authInternalUrl: process.env.AUTH_INTERNAL_URL || process.env.AUTH_URL || 'http://127.0.0.1:3101',
  adminUrl: process.env.ADMIN_URL ?? 'https://admin.orasage.com',
};
