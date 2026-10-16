export type InstallAppId = 'main' | 'shop' | 'auth' | 'admin' | 'cms' | 'bazi' | 'ziwei' | 'tarot';

type InstallApp = {
  name: string;
  short_name: string;
  description: string;
  start_url: string;
};

/** One installable app per origin. Scope stays `/` so in-app routes do not jump to the browser. */
const INSTALL_APPS: Record<InstallAppId, InstallApp> = {
  main: {
    name: 'OraSage — 命理与能量',
    short_name: 'OraSage',
    description: '八字、紫微、塔罗与能量器物。',
    start_url: '/',
  },
  shop: {
    name: 'OraSage 商城',
    short_name: '商城',
    description: '水晶手串、数字报告与能量咨询。',
    start_url: '/',
  },
  auth: {
    name: 'OraSage 登录',
    short_name: '登录',
    description: '登录、注册与账户。',
    start_url: '/login',
  },
  admin: {
    name: 'OraSage 后台',
    short_name: '后台',
    description: 'OraSage 运营管理后台。',
    start_url: '/',
  },
  cms: {
    name: 'OraSage 内容',
    short_name: '内容',
    description: 'OraSage 内容管理。',
    start_url: '/admin',
  },
  bazi: {
    name: 'OraSage 八字',
    short_name: '八字',
    description: '八字排盘与五行结构参考。',
    start_url: '/',
  },
  ziwei: {
    name: 'OraSage 紫微',
    short_name: '紫微',
    description: '紫微斗数排盘。',
    start_url: '/chart',
  },
  tarot: {
    name: 'OraSage 塔罗',
    short_name: '塔罗',
    description: '塔罗、祈愿与水晶。',
    start_url: '/',
  },
};

const ICONS = [
  { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' as const },
  { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' as const },
  { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' as const },
];

export function installManifest(app: InstallAppId) {
  const meta = INSTALL_APPS[app];
  return {
    id: meta.start_url,
    name: meta.name,
    short_name: meta.short_name,
    description: meta.description,
    start_url: meta.start_url,
    scope: '/',
    display: 'standalone' as const,
    orientation: 'any' as const,
    background_color: '#FAFAF8',
    theme_color: '#FAFAF8',
    categories: ['lifestyle'],
    icons: ICONS,
  };
}

/** Head tags for documents that are not emitted by Next.js (auth HTML, bazi shell, static reports). */
export function installHeadTags(app: InstallAppId): string {
  const title = INSTALL_APPS[app].short_name;
  return [
    '<link rel="manifest" href="/manifest.webmanifest">',
    '<meta name="mobile-web-app-capable" content="yes">',
    '<meta name="apple-mobile-web-app-capable" content="yes">',
    `<meta name="apple-mobile-web-app-title" content="${title}">`,
  ].join('\n');
}
