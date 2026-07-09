import { getStaffUser } from '@/lib/auth';
import { getChatUnreadCount } from '@/lib/api';
import { NextResponse } from 'next/server';

export async function GET() {
  const admin = await getStaffUser(['admin', 'shop_ops']);
  if (!admin) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  try {
    const { count } = await getChatUnreadCount();
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
