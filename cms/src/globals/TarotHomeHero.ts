import type { GlobalConfig } from 'payload';
import { cmsGlobalWriteAccess } from '../lib/cmsStaffAccess';
import { homeHeroFields } from './homeHeroFields';

export const TarotHomeHero: GlobalConfig = {
  slug: 'tarot-home-hero',
  label: '塔罗首页 Hero',
  access: {
    read: () => true,
    update: cmsGlobalWriteAccess(),
  },
  admin: {
    group: false,
    description:
      '配置 tarot 首页顶部 Hero 文案与媒体（运营文案按中文维护）。英文 / 葡语 / 西语前台会自动使用内置翻译；未启用或拉取失败时，前台使用内置默认文案。',
  },
  fields: homeHeroFields({
    eyebrow: '塔罗占卜',
    headline: '翻一张牌，看看今天怎么走',
    subtitle: '每日运势与三牌占卜，都在这里开始',
  }),
};
