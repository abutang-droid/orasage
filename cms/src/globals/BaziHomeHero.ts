import type { GlobalConfig } from 'payload';
import { cmsGlobalWriteAccess } from '../lib/cmsStaffAccess';
import { homeHeroFields } from './homeHeroFields';

export const BaziHomeHero: GlobalConfig = {
  slug: 'bazi-home-hero',
  label: '八字首页 Hero',
  access: {
    read: () => true,
    update: cmsGlobalWriteAccess(),
  },
  admin: {
    group: false,
    description:
      '配置 bazi.orasage.com 计算器表单页顶部 Hero。字段与主站首页 Hero 一致；仅「未出盘」时显示。',
  },
  fields: homeHeroFields({
    eyebrow: '八字命理',
    headline: '精准排盘，洞察五行',
    subtitle: '输入出生信息，即刻生成四柱命盘与免费解读',
  }),
};
