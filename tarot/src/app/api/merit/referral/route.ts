import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthUser } from '@/lib/auth';
import { bindReferralCode, ensureReferralCode } from '@/lib/merit-service';

const bodySchema = z.object({
  code: z.string().min(3).max(16),
});

/** GET — 自己的推荐码；POST — 绑定推荐人 */
export async function GET() {
  const auth = await getAuthUser();
  if (!auth) return NextResponse.json({ referralCode: null });
  const code = await ensureReferralCode(auth.userId);
  return NextResponse.json({ referralCode: code });
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser();
  if (!auth) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }

  try {
    const { code } = bodySchema.parse(await req.json());
    const result = await bindReferralCode(auth.userId, code);
    if (!result.ok) {
      return NextResponse.json({ error: result.reason }, { status: 400 });
    }
    return NextResponse.json({ bound: true });
  } catch (err) {
    console.error('[api/merit/referral]', err);
    return NextResponse.json({ error: '绑定失败' }, { status: 500 });
  }
}
