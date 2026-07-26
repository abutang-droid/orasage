import { NextRequest, NextResponse } from 'next/server';
import { fetchTarotBillingConfig } from '@/lib/tarot-billing-config';
import { resolveAiLocaleFromRequest } from '../../../../../../shared/ai-locale/index';

export async function GET(req: NextRequest) {
  const locale = resolveAiLocaleFromRequest(req);
  const config = await fetchTarotBillingConfig(locale);
  return NextResponse.json(config);
}
