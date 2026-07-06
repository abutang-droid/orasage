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

/** 朝拜朝向（视觉示意，非 GPS 定位） */
export const WORSHIP_FACING_DEFAULTS: Record<
  Exclude<WorshipFacingMode, 'none'>,
  WorshipFacingDefaults
> = {
  qibla: { labelZh: '面朝克尔白，心怀敬意', labelEn: 'Toward Mecca with reverence', bearing: 52 },
  east: { labelZh: '面朝东方，静默祈愿', labelEn: 'Facing east in quiet prayer', bearing: 90 },
  jerusalem: { labelZh: '面朝耶路撒冷，默想上天的护佑', labelEn: 'Toward Jerusalem in contemplation', bearing: 48 },
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
