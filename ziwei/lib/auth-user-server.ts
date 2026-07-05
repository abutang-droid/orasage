import { cookies } from 'next/headers';

const AUTH_INTERNAL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';

export async function resolveAuthUserIdFromCookies(): Promise<number | null> {
  const jar = await cookies();
  const cookieHeader = jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
  if (!cookieHeader) return null;
  try {
    const res = await fetch(`${AUTH_INTERNAL}/verify`, {
      headers: { cookie: cookieHeader },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { sub?: string };
    const id = Number(data.sub);
    return Number.isFinite(id) ? id : null;
  } catch {
    return null;
  }
}

export async function authCookieHeader(): Promise<string> {
  const jar = await cookies();
  return jar
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ');
}
