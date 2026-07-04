import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { zh } from '@payloadcms/translations/languages/zh';
import path from 'path';
import { buildConfig } from 'payload';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from './collections/Users';
import { Media } from './collections/Media';
import { Pages } from './collections/Pages';
import { Faiths } from './collections/Faiths';
import { Sanctuaries } from './collections/Sanctuaries';
import { HomeHero } from './globals/HomeHero';
import { BaziHomeHero } from './globals/BaziHomeHero';
import { ZiweiHomeHero } from './globals/ZiweiHomeHero';
import { ShopHomeHero } from './globals/ShopHomeHero';
import { BaziFeed } from './collections/BaziFeed';
import { ZiweiFeed } from './collections/ZiweiFeed';
import { cmsZhTranslations } from './lib/cms-zh';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

/** 允许各子站浏览器直连 CMS 公开读接口（globals / collections GET） */
const CMS_CORS_ORIGINS = [
  'https://orasage.com',
  'https://www.orasage.com',
  'https://shop.orasage.com',
  'https://auth.orasage.com',
  'https://admin.orasage.com',
  'https://bazi.orasage.com',
  'https://ziwei.orasage.com',
  'https://tarot.orasage.com',
  'http://localhost:3000',
  'http://localhost:3102',
  'http://localhost:3110',
  'http://localhost:3111',
  'http://localhost:3112',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3102',
  'http://127.0.0.1:3110',
  'http://127.0.0.1:3111',
  'http://127.0.0.1:3112',
];

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || '',
  cors: CMS_CORS_ORIGINS,
  i18n: {
    supportedLanguages: { zh },
    fallbackLanguage: 'zh',
    translations: cmsZhTranslations,
  },
  admin: {
    user: Users.slug,
    meta: {
      title: 'OraSage 内容管理',
      titleSuffix: ' · CMS',
      description: '全站 Hero、内容页面、媒体库与塔罗祈福数据管理',
    },
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      views: {
        login: {
          Component: '/components/OrasageLoginRedirect#OrasageLoginRedirect',
        },
      },
    },
  },
  collections: [Users, Media, Pages, Faiths, Sanctuaries, BaziFeed, ZiweiFeed],
  globals: [HomeHero, BaziHomeHero, ZiweiHomeHero, ShopHomeHero],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
});
