import { cookies } from 'next/headers';
import { orasageAuthEnv } from './env.ts';
import { verifyOrasageToken, loginUrl, centerUrl, type OrasageAuthUser } from './jwt.ts';

export type { OrasageAuthUser };

export async function getOrasageUser(): Promise<OrasageAuthUser | null> {
  const jar = await cookies();
  const token = jar.get(orasageAuthEnv.jwtCookieName)?.value;
  if (!token) return null;
  return verifyOrasageToken(token);
}

export { loginUrl, centerUrl };
