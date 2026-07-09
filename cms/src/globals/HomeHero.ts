import type { GlobalConfig } from 'payload';
import { cmsGlobalWriteAccess } from '../lib/cmsStaffAccess';
import { homeHeroFields } from './homeHeroFields';

export const HomeHero: GlobalConfig = {
  slug: 'home-hero',
  label: '首页 Hero',
  access: {
    read: () => true,
    update: cmsGlobalWriteAccess(),
  },
  admin: {
    group: false,
    description:
      '配置 orasage.com 门户首页顶部 Hero 区。保存后约 1 分钟内各前台生效；「启用」取消勾选可隐藏整段 Hero。',
  },
  fields: homeHeroFields({
    eyebrow: 'OraSage',
    headline: '探索命运，平衡能量',
    subtitle: '八字 · 紫微 · 塔罗 — 东方智慧与现代科技的融合',
  }),
};
