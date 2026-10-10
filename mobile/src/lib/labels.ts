/** 壳层文案 — 结构同步自 shared/app-shell/labels.ts（主源），MVP 先收敛到 zh-CN/en */
type LabelMap = Record<string, string>;

export const LABELS = {
  home: { 'zh-CN': '首页', en: 'Home' },
  explore: { 'zh-CN': '探索', en: 'Explore' },
  blessing: { 'zh-CN': '祈福', en: 'Blessing' },
  shop: { 'zh-CN': '商店', en: 'Shop' },
  mine: { 'zh-CN': '我的', en: 'Me' },
  login: { 'zh-CN': '登录', en: 'Login' },
  register: { 'zh-CN': '注册', en: 'Register' },
  logout: { 'zh-CN': '退出登录', en: 'Log out' },
  email: { 'zh-CN': '邮箱', en: 'Email' },
  password: { 'zh-CN': '密码', en: 'Password' },
  nickname: { 'zh-CN': '昵称（可选）', en: 'Nickname (optional)' },
  bazi: { 'zh-CN': '八字揭秘', en: 'BaZi Insights' },
  ziwei: { 'zh-CN': '紫微斗数', en: 'ZiWei Dou Shu' },
  tarot: { 'zh-CN': '塔罗牌', en: 'Tarot' },
  famous: { 'zh-CN': '名人案例', en: 'Famous Cases' },
  daozang: { 'zh-CN': '道藏库', en: 'Dao Canon' },
  energyShop: { 'zh-CN': '能量商城', en: 'Energy Shop' },
} satisfies Record<string, LabelMap>;

export type LabelKey = keyof typeof LABELS;

const DEFAULT_LOCALE = 'zh-CN';

export function t(key: LabelKey, locale: string = DEFAULT_LOCALE): string {
  const map: LabelMap = LABELS[key];
  if (map[locale]) return map[locale];
  if (locale.startsWith('zh')) return map['zh-CN'] ?? map.en ?? '';
  return map.en ?? map['zh-CN'] ?? '';
}
