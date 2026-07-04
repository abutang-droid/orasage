'use client';

import { useEffect } from 'react';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.orasage.com';

/** 无 orasage_token 时跳转统一登录，登录后回到 CMS */
export function OrasageLoginRedirect() {
  useEffect(() => {
    const redirect = `${ADMIN_URL}/cms/admin`;
    window.location.replace(
      `${AUTH_URL}/login?redirect=${encodeURIComponent(redirect)}`,
    );
  }, []);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <p>正在跳转至 OraSage 统一登录…</p>
      <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#6b7280' }}>
        请使用管理员账号登录；登录成功后将自动进入内容管理。
      </p>
    </div>
  );
}
