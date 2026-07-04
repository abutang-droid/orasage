import { postgresAdapter } from '@payloadcms/db-postgres';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
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

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
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
