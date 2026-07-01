const DEV_JWT_SECRET = 'dev-secret-change-in-production-32chars';

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  throw new Error('Missing required env var: JWT_SECRET');
}

export const ENV = {
  jwtSecret: process.env.JWT_SECRET ?? DEV_JWT_SECRET,
  jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'orasage_token',
  authUrl: process.env.AUTH_URL ?? 'https://auth.orasage.com',
  adminUrl: process.env.ADMIN_URL ?? 'https://admin.orasage.com',
};
