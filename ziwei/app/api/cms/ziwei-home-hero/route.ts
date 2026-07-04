import { NextResponse } from 'next/server';

const CMS_URL =
  process.env.CMS_URL || process.env.NEXT_PUBLIC_CMS_URL || 'https://cms.orasage.com';

/** 同源代理 CMS 紫微 Hero，供客户端组件拉取（避免跨域 CORS 拦截） */
export async function GET() {
  try {
    const res = await fetch(`${CMS_URL}/api/globals/ziwei-home-hero?depth=1`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json(null, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json(null, { status: 502 });
  }
}
