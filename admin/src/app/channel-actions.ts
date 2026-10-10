'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import {
  createChannel,
  createChannelMember,
  deleteChannelMember,
  updateChannel,
  updateChannelMember,
  type ChannelMemberRole,
} from '@/lib/api';
import { getChannelManager } from '@/lib/auth';
import { parsePercentToBps } from '../../../shared/sales-channels/index';

function requireRatesFromForm(formData: FormData) {
  const roles: ChannelMemberRole[] = ['bd', 'ops', 'designer', 'salesperson', 'store'];
  const rates: Partial<Record<ChannelMemberRole, number>> = {};
  for (const role of roles) {
    const raw = String(formData.get(`rate_${role}`) ?? '').trim();
    if (!raw) {
      rates[role] = 0;
      continue;
    }
    const bps = parsePercentToBps(raw);
    if (bps == null) throw new Error(`${role} 分成比例无效（0–100）`);
    rates[role] = bps;
  }
  return rates;
}

/** 空串视为未填；非空则做基本格式校验，避免落到 API 只返回含糊的「参数错误」 */
function optionalBoundEmail(raw: string, label = '绑定账号邮箱'): string | undefined {
  const email = raw.trim();
  if (!email) return undefined;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error(`${label}格式无效；不绑定请留空`);
  }
  return email;
}

function assertChannelCode(code: string) {
  if (!/^[a-zA-Z0-9_-]+$/.test(code)) {
    throw new Error('渠道编码仅允许字母、数字、下划线、连字符（不要用中文）');
  }
}

export async function createChannelAction(formData: FormData) {
  const manager = await getChannelManager();
  if (!manager) throw new Error('无权限');

  const code = String(formData.get('code') ?? '').trim();
  const name = String(formData.get('name') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const ownerEmail = optionalBoundEmail(String(formData.get('ownerEmail') ?? ''), '渠道主账号邮箱');
  if (!code || !name) throw new Error('请填写渠道编码与名称');
  assertChannelCode(code);

  const channel = await createChannel({
    code,
    name,
    note: note || null,
    ownerEmail: ownerEmail ?? null,
    rates: requireRatesFromForm(formData),
  });
  revalidatePath('/channels');
  redirect(`/channels/${channel.channel.id}`);
}

export async function updateChannelAction(formData: FormData) {
  const manager = await getChannelManager();
  if (!manager) throw new Error('无权限');

  const id = Number(formData.get('id') ?? 0);
  if (!Number.isInteger(id) || id <= 0) throw new Error('参数错误');

  const name = String(formData.get('name') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const status = String(formData.get('status') ?? 'active') as 'active' | 'disabled';
  const clearOwner = formData.get('clearOwner') === '1';
  const ownerEmail = clearOwner
    ? null
    : optionalBoundEmail(String(formData.get('ownerEmail') ?? ''), '渠道主账号邮箱');

  await updateChannel(id, {
    name,
    note: note || null,
    status,
    ownerEmail,
    rates: requireRatesFromForm(formData),
  });
  revalidatePath('/channels');
  revalidatePath(`/channels/${id}`);
}

export async function createChannelMemberAction(formData: FormData) {
  const manager = await getChannelManager();
  if (!manager) throw new Error('无权限');

  const channelId = Number(formData.get('channelId') ?? 0);
  if (!Number.isInteger(channelId) || channelId <= 0) throw new Error('参数错误');

  const memberRole = String(formData.get('memberRole') ?? '') as ChannelMemberRole;
  const name = String(formData.get('name') ?? '').trim();
  const userEmail = optionalBoundEmail(String(formData.get('userEmail') ?? ''));
  const contact = String(formData.get('contact') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const commissionRaw = String(formData.get('commissionPercent') ?? '').trim();

  let commissionBps: number | null = null;
  if (commissionRaw) {
    commissionBps = parsePercentToBps(commissionRaw);
    if (commissionBps == null) throw new Error('成员分成比例无效（0–100）');
  }

  if (!name) throw new Error('请填写名称');

  await createChannelMember(channelId, {
    memberRole,
    name,
    userEmail: userEmail ?? null,
    commissionBps,
    contact: contact || null,
    address: address || null,
    note: note || null,
  });
  revalidatePath(`/channels/${channelId}`);
  revalidatePath('/channels');
}

export async function updateChannelMemberAction(formData: FormData) {
  const manager = await getChannelManager();
  if (!manager) throw new Error('无权限');

  const channelId = Number(formData.get('channelId') ?? 0);
  const memberId = Number(formData.get('memberId') ?? 0);
  if (!Number.isInteger(channelId) || channelId <= 0 || !Number.isInteger(memberId) || memberId <= 0) {
    throw new Error('参数错误');
  }

  const name = String(formData.get('name') ?? '').trim();
  const memberRole = String(formData.get('memberRole') ?? '') as ChannelMemberRole;
  const clearUser = formData.get('clearUser') === '1';
  const userEmail = clearUser
    ? null
    : optionalBoundEmail(String(formData.get('userEmail') ?? ''));
  const contact = String(formData.get('contact') ?? '').trim();
  const address = String(formData.get('address') ?? '').trim();
  const note = String(formData.get('note') ?? '').trim();
  const disabled = formData.get('disabled') === '1';
  const commissionRaw = String(formData.get('commissionPercent') ?? '').trim();
  const useDefault = formData.get('useDefaultRate') === '1';

  let commissionBps: number | null | undefined = undefined;
  if (useDefault) {
    commissionBps = null;
  } else if (commissionRaw) {
    commissionBps = parsePercentToBps(commissionRaw);
    if (commissionBps == null) throw new Error('成员分成比例无效（0–100）');
  }

  await updateChannelMember(channelId, memberId, {
    name,
    memberRole,
    userEmail,
    commissionBps,
    contact: contact || null,
    address: address || null,
    note: note || null,
    disabled,
  });
  revalidatePath(`/channels/${channelId}`);
  revalidatePath('/channels');
}

export async function deleteChannelMemberAction(formData: FormData) {
  const manager = await getChannelManager();
  if (!manager) throw new Error('无权限');

  const channelId = Number(formData.get('channelId') ?? 0);
  const memberId = Number(formData.get('memberId') ?? 0);
  if (!Number.isInteger(channelId) || channelId <= 0 || !Number.isInteger(memberId) || memberId <= 0) {
    throw new Error('参数错误');
  }

  await deleteChannelMember(channelId, memberId);
  revalidatePath(`/channels/${channelId}`);
  revalidatePath('/channels');
}
