const DEV_JWT_SECRET = 'dev-secret-change-in-production-32chars';

export interface OrasageAuthEnv {
  jwtSecret: string;
  jwtCookieName: string;
  jwtCookieDomain: string;
  authUrl: string;
  authInternalUrl: string;
  isProduction: boolean;
}

function readEnv(): OrasageAuthEnv {
  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction && !process.env.JWT_SECRET) {
    throw new Error('Missing required env var: JWT_SECRET');
  }

  return {
    jwtSecret: process.env.JWT_SECRET ?? DEV_JWT_SECRET,
    jwtCookieName: process.env.JWT_COOKIE_NAME ?? 'orasage_token',
    jwtCookieDomain: process.env.JWT_COOKIE_DOMAIN ?? '.orasage.com',
    authUrl: process.env.AUTH_URL ?? 'https://auth.orasage.com',
    authInternalUrl: process.env.AUTH_INTERNAL_URL ?? 'http://127.0.0.1:3101',
    isProduction,
  };
}

export const orasageAuthEnv = readEnv();
