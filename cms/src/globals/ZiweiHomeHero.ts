import type { GlobalConfig } from 'payload';
import { cmsGlobalWriteAccess } from '../lib/cmsStaffAccess';
import { homeHeroFields } from './homeHeroFields';

export const ZiweiHomeHero: GlobalConfig = {
  slug: 'ziwei-home-hero',
  label: '紫微首页 Hero',
  access: {
    read: () => true,
    update: cmsGlobalWriteAccess(),
  },
  admin: {
    group: false,
    description:
      '配置 ziwei.orasage.com 计算器表单页顶部 Hero。字段与八字首页 Hero 一致；仅「未出盘」时显示。',
  },
  fields: homeHeroFields({
    eyebrow: '紫微斗数',
    headline: '紫微排盘，洞察命盘十二宫',
    subtitle: '输入出生信息，即刻生成紫微命盘与 AI 解读',
  }),
};
