export function loginUrl(redirectPath = '/chart') {
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';
  const appUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ziwei.orasage.com';
  return `${authUrl}/login?redirect=${encodeURIComponent(`${appUrl}${redirectPath}`)}`;
}
