import { NextResponse } from 'next/server';
import { ensureAuthUser, setAuthCookie } from '@/lib/auth';
import { isDestinySliceUnlocked } from '@/lib/single-card-unlock';

export async function GET() {
  const ensured = await ensureAuthUser();
  const unlocked = await isDestinySliceUnlocked(ensured.userId);
  const res = NextResponse.json({ unlocked });
  if (ensured.newToken) res.cookies.set(setAuthCookie(ensured.newToken));
  return res;
}
