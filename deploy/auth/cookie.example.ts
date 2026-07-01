/**
 * OraSage auth 服务 — Cookie 配置示例
 * 方案 B：子域名架构，domain = .orasage.com
 */

import type { Response } from 'express';

const COOKIE_NAME = process.env.JWT_COOKIE_NAME ?? 'orasage_token';
const COOKIE_DOMAIN = process.env.JWT_COOKIE_DOMAIN ?? '.orasage.com';
const COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 天
const IS_PROD = process.env.NODE_ENV === 'production';

export function setAuthCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAME, token, {
    domain: COOKIE_DOMAIN,
    path: '/',
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
  });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, {
    domain: COOKIE_DOMAIN,
    path: '/',
  });
}

/**
 * 登录成功后重定向回来源 App
 *
 * 示例请求:
 *   GET /login?redirect=https://bazi.orasage.com/chart
 *
 * 白名单校验（防止开放重定向）:
 */
const ALLOWED_REDIRECT_HOSTS = [
  'orasage.com',
  'auth.orasage.com',
  'shop.orasage.com',
  'admin.orasage.com',
  'bazi.orasage.com',
  'ziwei.orasage.com',
  'tarot.orasage.com',
  'cms.orasage.com',
  // 开发环境
  'orasage.localhost',
  'auth.orasage.localhost',
  'bazi.orasage.localhost',
  'ziwei.orasage.localhost',
  'tarot.orasage.localhost',
  'shop.orasage.localhost',
];

export function getSafeRedirect(redirectParam: string | undefined): string {
  const fallback = 'https://orasage.com';

  if (!redirectParam) return fallback;

  try {
    const url = new URL(redirectParam);
    if (ALLOWED_REDIRECT_HOSTS.includes(url.hostname)) {
      return redirectParam;
    }
  } catch {
    // invalid URL
  }

  return fallback;
}

/**
 * 各 App 登录链接生成
 */
export const LOGIN_URLS = {
  bazi: 'https://auth.orasage.com/login?redirect=https://bazi.orasage.com',
  ziwei: 'https://auth.orasage.com/login?redirect=https://ziwei.orasage.com',
  tarot: 'https://auth.orasage.com/login?redirect=https://tarot.orasage.com',
  shop: 'https://auth.orasage.com/login?redirect=https://shop.orasage.com',
  admin: 'https://auth.orasage.com/login?redirect=https://admin.orasage.com',
} as const;
