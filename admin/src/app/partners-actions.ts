'use server';

import { revalidatePath } from 'next/cache';
import {
  createPartnerApiKey,
  revokePartnerApiKey,
  updatePartnerModules,
  upsertPartner,
} from '@/lib/api';
import { getAdminUser, staffCan } from '@/lib/auth';

async function requirePartnersAdmin() {
  const user = await getAdminUser();
  if (!user || user.role !== 'admin' || !staffCan(user, 'platform.partners')) {
    throw new Error('无权限');
  }
  return user;
}

export async function upsertPartnerAction(formData: FormData) {
  await requirePartnersAdmin();
  const slug = String(formData.get('slug') ?? '')
    .trim()
    .toLowerCase();
  const name = String(formData.get('name') ?? '').trim();
  const template = String(formData.get('template') ?? '').trim();
  const status = String(formData.get('status') ?? 'active').trim();
  if (!slug || !name) throw new Error('请填写 slug 与名称');
  await upsertPartner({
    slug,
    name,
    status: status === 'disabled' ? 'disabled' : 'active',
    template: template || undefined,
  });
  revalidatePath('/partners');
}

export async function applyPartnerTemplateAction(formData: FormData) {
  await requirePartnersAdmin();
  const slug = String(formData.get('slug') ?? '').trim();
  const template = String(formData.get('template') ?? '').trim();
  if (!slug || !template) throw new Error('参数错误');
  await updatePartnerModules(slug, { template });
  revalidatePath('/partners');
}

export async function createPartnerApiKeyAction(formData: FormData): Promise<{
  raw: string;
  note: string;
  keyPrefix: string;
}> {
  await requirePartnersAdmin();
  const slug = String(formData.get('slug') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  if (!slug) throw new Error('缺少 slug');
  const result = await createPartnerApiKey(slug, {
    name: name || undefined,
  });
  revalidatePath('/partners');
  return {
    raw: result.raw,
    note: result.note,
    keyPrefix: result.key.keyPrefix,
  };
}

export async function revokePartnerApiKeyAction(formData: FormData) {
  await requirePartnersAdmin();
  const slug = String(formData.get('slug') ?? '').trim();
  const id = Number(formData.get('id') ?? 0);
  if (!slug || !Number.isInteger(id) || id <= 0) throw new Error('参数错误');
  await revokePartnerApiKey(slug, id);
  revalidatePath('/partners');
}
