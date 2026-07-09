'use server';

import { revalidatePath } from 'next/cache';
import { syncStripeMirror } from '@/lib/api';
import { getStaffUser } from '@/lib/auth';

export async function syncStripeMirrorAction(days = 90) {
  const admin = await getStaffUser(['admin']);
  if (!admin) {
    return { ok: false as const, error: '无权限' };
  }
  try {
    const { syncRun } = await syncStripeMirror(days);
    revalidatePath('/finance');
    return { ok: true as const, syncRun };
  } catch (err) {
    const message = err instanceof Error ? err.message : '同步失败';
    revalidatePath('/finance');
    return { ok: false as const, error: message };
  }
}
