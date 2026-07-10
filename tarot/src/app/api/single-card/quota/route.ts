import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { getSingleCardQuota } from '@/lib/single-card-quota';

export async function GET() {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({
      requiresAuth: false,
      dateKey: null,
      allowance: 1,
      remaining: null,
      drawsUsed: 0,
      templeBonusGranted: false,
    });
  }
  const quota = await getSingleCardQuota(auth.userId);
  return NextResponse.json({
    requiresAuth: true,
    ...quota,
  });
}
