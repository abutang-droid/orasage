import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generatePayloadCookie, getFieldsToSign, getPayload, jwtSign } from 'payload';
import config from '@payload-config';

import { resolveUserFromOrasageToken } from '../auth/orasageSso';

const AUTH_URL = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.orasage.com';
const ADMIN_URL = process.env.NEXT_PUBLIC_ADMIN_URL || 'https://admin.orasage.com';
const JWT_COOKIE = process.env.JWT_COOKIE_NAME || 'orasage_token';

async function issuePayloadSession(doc: Record<string, unknown>): Promise<void> {
  const payload = await getPayload({ config });
  const usersConfig = payload.collections.users.config;
  const user = { ...doc, collection: 'users' };
  const fieldsToSign = getFieldsToSign({
    collectionConfig: usersConfig,
    email: typeof doc.email === 'string' ? doc.email : '',
    user: user as Parameters<typeof getFieldsToSign>[0]['user'],
  });
  const { token } = await jwtSign({
    fieldsToSign,
    secret: payload.secret,
    tokenExpiration: usersConfig.auth.tokenExpiration,
  });
  const payloadCookie = generatePayloadCookie({
    collectionAuthConfig: usersConfig.auth,
    cookiePrefix: payload.config.cookiePrefix,
    returnCookieAsObject: true,
    token,
  });
  if (!payloadCookie.value) return;

  const jar = await cookies();
  jar.set(payloadCookie.name, payloadCookie.value, {
    domain: usersConfig.auth.cookies.domain ?? undefined,
    expires: payloadCookie.expires ? new Date(payloadCookie.expires) : undefined,
    httpOnly: true,
    path: '/',
    sameSite:
      typeof usersConfig.auth.cookies.sameSite === 'string'
        ? usersConfig.auth.cookies.sameSite.toLowerCase() as 'lax' | 'strict' | 'none'
        : 'lax',
    secure: usersConfig.auth.cookies.secure || process.env.NODE_ENV === 'production',
  });
}

/**
 * 登录页：已有 orasage_token 时签发 payload-token 并进入后台；
 * 否则跳转统一登录。
 */
export async function OrasageLoginRedirect() {
  const jar = await cookies();
  const orasageToken = jar.get(JWT_COOKIE)?.value;
  const payload = await getPayload({ config });
  const doc = await resolveUserFromOrasageToken(payload, orasageToken);

  if (doc) {
    await issuePayloadSession(doc);
    redirect('/admin');
  }

  const redirectTarget = `${ADMIN_URL}/cms/admin`;
  redirect(`${AUTH_URL}/login?redirect=${encodeURIComponent(redirectTarget)}`);
}
