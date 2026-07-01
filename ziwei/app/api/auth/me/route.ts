import { NextResponse } from 'next/server';
import { getOrasageUser, loginUrl } from '@/lib/auth';

export async function GET() {
  const user = await getOrasageUser();
  return NextResponse.json({ user, loginUrl: user ? null : loginUrl() });
}
