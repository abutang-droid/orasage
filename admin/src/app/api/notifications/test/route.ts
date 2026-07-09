import { NextResponse } from 'next/server';
import { getAdminUser } from '@/lib/auth';
import { sendNotificationTest } from '@/lib/api';

export async function POST() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: '未授权' }, { status: 401 });
  }
  try {
    const data = await sendNotificationTest();
    return NextResponse.json(data);
  } catch (err) {
    console.error('[admin/api/notifications/test]', err);
    return NextResponse.json({ error: '发送失败' }, { status: 502 });
  }
}
