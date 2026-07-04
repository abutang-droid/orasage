import { NextRequest, NextResponse } from 'next/server';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120';

/** 同源代理 CMS 紫微信息流，避免公网封禁后浏览器直连失败 */
export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.toString();
  const path = query ? `/api/ziwei-feed?${query}` : '/api/ziwei-feed';

  try {
    const res = await fetch(`${CMS_INTERNAL_URL}${path}`, {
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.json({ docs: [] }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return NextResponse.json({ docs: [] }, { status: 502 });
  }
}
