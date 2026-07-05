import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { forwardSetCookies, proxyAuthCheckout } from '@/lib/checkout-flow';

const emailSchema = z.object({
  email: z.string().email().max(320),
});

/** 结账页邮箱识别：新用户静默注册，已注册返回 exists */
export async function POST(req: NextRequest) {
  try {
    const body = emailSchema.parse(await req.json());
    const authRes = await proxyAuthCheckout('/checkout-register', body, req.headers.get('cookie'));
    const data = await authRes.json().catch(() => ({}));
    const nextRes = NextResponse.json(data, { status: authRes.status });
    forwardSetCookies(authRes, nextRes);
    return nextRes;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: '请输入有效邮箱' }, { status: 400 });
    }
    console.error('[checkout/identify]', err);
    return NextResponse.json({ error: '识别邮箱失败' }, { status: 500 });
  }
}
