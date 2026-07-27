'use server';

import { revalidatePath } from 'next/cache';
import { adjustAdminWallet } from '@/lib/api';
import { getStaffUser } from '@/lib/auth';

export async function adjustWalletAction(formData: FormData) {
  const admin = await getStaffUser(['admin']);
  if (!admin) throw new Error('无权限');

  const userId = Number(formData.get('userId') ?? 0);
  const currency = String(formData.get('currency') ?? 'USDT').trim();
  const amountYuan = String(formData.get('amountYuan') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();

  if (!Number.isInteger(userId) || userId <= 0) throw new Error('用户 ID 无效');
  const yuan = Number(amountYuan);
  if (!Number.isFinite(yuan) || yuan === 0) throw new Error('请输入非零调整金额（可负数）');

  const amountCents = Math.round(yuan * 100);
  await adjustAdminWallet(userId, { currency, amountCents, note: note || undefined });
  revalidatePath('/wallets');
  revalidatePath(`/wallets/${userId}`);
}
