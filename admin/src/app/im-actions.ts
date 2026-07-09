'use server';

import { revalidatePath } from 'next/cache';
import { sendChatOpsMessage } from '@/lib/api';
import { getStaffUser } from '@/lib/auth';

export async function sendImReplyAction(conversationId: number, body: string) {
  const admin = await getStaffUser(['admin', 'shop_ops']);
  if (!admin) return { ok: false as const, error: '无权限' };
  try {
    await sendChatOpsMessage(conversationId, body);
    revalidatePath('/im');
    return { ok: true as const };
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : '发送失败' };
  }
}
