import { NextResponse } from 'next/server';
import { ENV } from '@/lib/env';

export async function GET() {
  return NextResponse.json({ status: 'ok', service: 'orasage-shop', port: 3102, stripe: Boolean(ENV.stripeSecretKey) });
}
