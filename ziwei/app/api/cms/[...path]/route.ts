import { NextRequest, NextResponse } from 'next/server';

const CMS_INTERNAL_URL =
  process.env.CMS_URL || process.env.CMS_INTERNAL_URL || 'http://127.0.0.1:3120/cms';

const ALLOWED_PREFIXES = [
  'ziwei-classics-books',
  'ziwei-classics-chapters',
  'ziwei-knowledge-stars',
  'ziwei-heming-stars',
  'ziwei-feed',
  'ziwei-home-hero',
];

/** 同源代理 CMS 紫微知识库等公开读接口 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const { path } = await params;
  const collection = path[0];
  if (!collection || !ALLOWED_PREFIXES.includes(collection)) {
    return NextResponse.json({ error: 'not found' }, { status: 404 });
  }

  const query = request.nextUrl.searchParams.toString();
  const cmsPath = query ? `/api/${path.join('/')}?${query}` : `/api/${path.join('/')}`;

  try {
    const res = await fetch(`${CMS_INTERNAL_URL}${cmsPath}`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return NextResponse.json({ docs: [] }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600' },
    });
  } catch {
    return NextResponse.json({ docs: [] }, { status: 502 });
  }
}
