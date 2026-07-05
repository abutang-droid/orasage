import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
export { loginUrl } from './login-url';

/**
 * ziwei 本身没有账号体系（历史记录纯 localStorage），这里只桥接 orasage
 * 统一登录态：能识别"当前用户是否已在 auth.orasage.com 登录"，
 * 但不落地任何本地用户表 —— 更深的个性化/同步能力留待后续迭代。
 * 未部署在 orasage 生态下（没有 JWT_SECRET / 没有 cookie）时，
 * 始终返回 null，不影响现有匿名使用体验。
 */

export interface OrasageUser {
  id: string;
  role: 'user' | 'admin';
}

const COOKIE_NAME = process.env.PARENT_AUTH_COOKIE_NAME || 'orasage_token';

export async function getOrasageUser(): Promise<OrasageUser | null> {
  const secretEnv = process.env.JWT_SECRET;
  if (!secretEnv) return null;

  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const secret = new TextEncoder().encode(secretEnv);
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload.sub !== 'string' || (payload.role !== 'user' && payload.role !== 'admin')) {
      return null;
    }
    return { id: payload.sub, role: payload.role };
  } catch {
    return null;
  }
}
