import { NextResponse } from 'next/server';
import { fetchShopPublicConfig } from '@/lib/shop-config';

/** 前台可读商城配置（首页布局、USDT↔WOLD 汇率） */
export async function GET() {
  const config = await fetchShopPublicConfig();
  return NextResponse.json(config, {
    headers: { 'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=60' },
  });
}
