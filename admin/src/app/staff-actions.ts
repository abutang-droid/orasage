'use server';

import { revalidatePath } from 'next/cache';
import { createStaffAccount, updateStaffAccount } from '@/lib/api';
import { getStaffManager } from '@/lib/auth';

export async function createStaffAction(formData: FormData) {
  const manager = await getStaffManager();
  if (!manager) throw new Error('无权限');

  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const nickname = String(formData.get('nickname') ?? '').trim();
  const staffLabel = String(formData.get('staffLabel') ?? '').trim();
  const role = String(formData.get('role') ?? 'shop_ops') as 'shop_ops' | 'content_ops';
  const extraGrants = formData.getAll('extraGrant').map(String);

  if (!email || password.length < 8) throw new Error('请填写邮箱与至少 8 位密码');

  await createStaffAccount({
    email,
    password,
    nickname: nickname || undefined,
    role,
    staffLabel: staffLabel || undefined,
    staffGrants: extraGrants,
  });
  revalidatePath('/staff');
}

export async function updateStaffAction(formData: FormData) {
  const manager = await getStaffManager();
  if (!manager) throw new Error('无权限');

  const id = Number(formData.get('id') ?? 0);
  const role = String(formData.get('role') ?? '') as 'shop_ops' | 'content_ops';
  const staffLabel = String(formData.get('staffLabel') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const staffDisabled = formData.get('staffDisabled') === '1';
  const extraGrants = formData.getAll('extraGrant').map(String);

  if (!Number.isInteger(id) || id <= 0) throw new Error('参数错误');

  await updateStaffAccount(id, {
    role,
    staffLabel: staffLabel || null,
    staffDisabled,
    staffGrants: extraGrants,
    password: password || undefined,
  });
  revalidatePath('/staff');
}
