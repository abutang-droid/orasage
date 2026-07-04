import type { GlobalConfig } from 'payload';
import { homeHeroFields } from './homeHeroFields';

export const ShopHomeHero: GlobalConfig = {
  slug: 'shop-home-hero',
  label: '商城首页 Hero',
  access: {
    read: () => true,
  },
  admin: {
    description:
      '配置 shop.orasage.com 商城首页顶部 Hero。顶栏品牌名「能量商城」不受此配置影响。',
  },
  fields: homeHeroFields({
    eyebrow: 'OraSage',
    headline: '能量商城',
    subtitle: '命理解读推荐 · 水晶手串 · 数字报告',
  }),
};
