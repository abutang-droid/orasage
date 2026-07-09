import { getStaffUser, loginUrl } from '@/lib/auth';
import { getChatMessages } from '@/lib/api';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const admin = await getStaffUser(['admin', 'shop_ops']);
  if (!admin) {
    return NextResponse.json({ error: '未登录' }, { status: 401 });
  }
  const { id } = await params;
  const conversationId = Number(id);
  if (!Number.isInteger(conversationId) || conversationId <= 0) {
    return NextResponse.json({ error: '参数错误' }, { status: 400 });
  }
  try {
    const { messages } = await getChatMessages(conversationId);
    return NextResponse.json({ messages });
  } catch (err) {
    const message = err instanceof Error ? err.message : '加载失败';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
