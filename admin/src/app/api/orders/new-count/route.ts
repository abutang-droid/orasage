import { NextResponse, type NextRequest } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { getNewOrdersCount } from '@/lib/api';

export async function GET(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  const since = req.nextUrl.searchParams.get('since') ?? undefined;
  try {
    const data = await getNewOrdersCount(since);
    return NextResponse.json(data);
  } catch (err) {
    console.error('[admin/api/orders/new-count]', err);
    return NextResponse.json({ error: '查询失败' }, { status: 502 });
  }
}
