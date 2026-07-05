import { NextRequest, NextResponse } from 'next/server';
import { fetchTarotBillingConfig } from '@/lib/tarot-billing-config';

export async function GET(req: NextRequest) {
  const locale = req.nextUrl.searchParams.get('locale') ?? 'zh-CN';
  const config = await fetchTarotBillingConfig(locale);
  return NextResponse.json(config);
}
