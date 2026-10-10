/** 销售渠道成员角色（BD / 运营 / 设计师 / 业务员 / 店面） */
export const CHANNEL_MEMBER_ROLES = [
  'bd',
  'ops',
  'designer',
  'salesperson',
  'store',
] as const;

export type ChannelMemberRole = (typeof CHANNEL_MEMBER_ROLES)[number];

export const CHANNEL_MEMBER_ROLE_LABELS: Record<ChannelMemberRole, string> = {
  bd: 'BD',
  ops: '运营',
  designer: '设计师',
  salesperson: '业务员',
  store: '店面',
};

export const CHANNEL_STATUSES = ['active', 'disabled'] as const;
export type ChannelStatus = (typeof CHANNEL_STATUSES)[number];

export const CHANNEL_STATUS_LABELS: Record<ChannelStatus, string> = {
  active: '启用',
  disabled: '停用',
};

/** 万分比：10000 = 100%，1500 = 15% */
export const COMMISSION_BPS_MAX = 10_000;

export function isChannelMemberRole(value: string): value is ChannelMemberRole {
  return (CHANNEL_MEMBER_ROLES as readonly string[]).includes(value);
}

export function bpsToPercent(bps: number): number {
  return Math.round(bps) / 100;
}

export function percentToBps(percent: number): number {
  return Math.round(percent * 100);
}

/** 解析表单百分比字符串（支持 15 / 15.5 / 15%），返回 bps；非法返回 null */
export function parsePercentToBps(raw: string): number | null {
  const cleaned = raw.trim().replace(/%/g, '');
  if (!cleaned) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n) || n < 0 || n > 100) return null;
  return percentToBps(n);
}

export function formatBpsPercent(bps: number): string {
  const p = bpsToPercent(bps);
  return Number.isInteger(p) ? `${p}%` : `${p.toFixed(2)}%`;
}

export type ChannelDefaultRatesBps = {
  bd: number;
  ops: number;
  designer: number;
  salesperson: number;
  store: number;
};

export function sumDefaultRates(rates: ChannelDefaultRatesBps): number {
  return rates.bd + rates.ops + rates.designer + rates.salesperson + rates.store;
}

export function rateForRole(rates: ChannelDefaultRatesBps, role: ChannelMemberRole): number {
  return rates[role];
}
