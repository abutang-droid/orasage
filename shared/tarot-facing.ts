/**
 * 朝拜朝向（视觉象征，非 GPS 定位）
 * CMS faiths / sanctuaries 与 tarot 前端共用
 */

export const WORSHIP_FACING_MODES = [
  'none',
  'qibla',
  'east',
  'jerusalem',
] as const;

export type WorshipFacingMode = (typeof WORSHIP_FACING_MODES)[number];

export const SANCTUARY_FACING_MODES = [
  'inherit',
  ...WORSHIP_FACING_MODES,
  'custom',
] as const;

export type SanctuaryFacingMode = (typeof SANCTUARY_FACING_MODES)[number];

export type WorshipFacingDefaults = {
  labelZh: string;
  labelEn: string;
  bearing: number;
};

/** 默认方位角（0=北，90=东）— 仅作 UI 罗盘示意 */
export const WORSHIP_FACING_DEFAULTS: Record<
  Exclude<WorshipFacingMode, 'none'>,
  WorshipFacingDefaults
> = {
  qibla: { labelZh: '面向麦加', labelEn: 'Toward Mecca', bearing: 52 },
  east: { labelZh: '面向东方', labelEn: 'Facing East', bearing: 90 },
  jerusalem: { labelZh: '面向耶路撒冷', labelEn: 'Toward Jerusalem', bearing: 48 },
};

export const FAITH_FACING_SEED: Partial<Record<string, WorshipFacingMode>> = {
  islam: 'qibla',
  judaism: 'jerusalem',
  buddhism: 'east',
  hinduism: 'east',
  sikhism: 'east',
  shinto: 'east',
  confucianism: 'east',
  taoism: 'east',
  chinese_folk: 'east',
};
