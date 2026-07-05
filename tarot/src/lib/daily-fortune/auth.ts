import { cookies } from 'next/headers';

const PARENT_COOKIE = process.env.PARENT_AUTH_COOKIE_NAME || 'orasage_token';

export async function isOrasageLoggedIn(email?: string | null): Promise<boolean> {
  const cookieStore = await cookies();
  if (cookieStore.get(PARENT_COOKIE)?.value) return true;
  if (email && !email.endsWith('@manto.guest')) return true;
  return false;
}
