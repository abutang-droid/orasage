/**
 * 将 wold/oricosmos 手串详情页 en / pt-BR 内容导入当前 CMS。
 * 不覆盖已有 zh-CN（OraSage 中文 SATYA 页保持不变）。
 *
 * Usage (cms/):
 *   set -a && source .env && set +a && npm run seed:crystal-pdp-locales
 *
 * Env:
 *   ONLY_MISSING=1 — 跳过已存在的 sku+locale
 *   DRY_RUN=1 — 只打印不写库
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPayload } from 'payload';
import config from '../src/payload.config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, 'data/crystal-pdp-locales');
const ONLY_MISSING = process.env.ONLY_MISSING === '1';
const DRY_RUN = process.env.DRY_RUN === '1';

type ImportPage = {
  sku: string;
  locale: string;
  status: 'draft' | 'published';
  subtitle?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  galleryVideoUrl?: string | null;
  sceneVideoUrl?: string | null;
  sections?: Array<Record<string, unknown>>;
};

type ImportTestimonial = {
  sku: string;
  locale: string;
  author?: string | null;
  rating?: number;
  body?: string | null;
  sort?: number;
  enabled?: boolean;
};

async function heroImagesFromZh(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
): Promise<Array<{ image: number; alt?: string; sort?: number }> | undefined> {
  const existing = await payload.find({
    collection: 'shop-product-pages',
    where: { and: [{ sku: { equals: sku } }, { locale: { equals: 'zh-CN' } }] },
    limit: 1,
    depth: 0,
  });
  const heroes = (existing.docs[0] as { heroImages?: Array<{ image?: number | { id?: number }; alt?: string; sort?: number }> } | undefined)
    ?.heroImages;
  if (!heroes?.length) return undefined;
  const mapped = heroes
    .map((row, index) => {
      const id =
        typeof row.image === 'number'
          ? row.image
          : typeof row.image === 'object' && row.image && typeof row.image.id === 'number'
            ? row.image.id
            : null;
      if (id == null) return null;
      return { image: id, alt: row.alt, sort: row.sort ?? index * 10 };
    })
    .filter((row): row is { image: number; alt?: string; sort?: number } => Boolean(row));
  return mapped.length ? mapped : undefined;
}

async function upsertPage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  page: ImportPage,
): Promise<'created' | 'updated' | 'skipped'> {
  const existing = await payload.find({
    collection: 'shop-product-pages',
    where: { and: [{ sku: { equals: page.sku } }, { locale: { equals: page.locale } }] },
    limit: 1,
  });
  if (existing.docs[0] && ONLY_MISSING) return 'skipped';

  const heroImages = await heroImagesFromZh(payload, page.sku);
  const data: Record<string, unknown> = {
    sku: page.sku,
    locale: page.locale,
    status: page.status,
    subtitle: page.subtitle ?? undefined,
    seoTitle: page.seoTitle ?? undefined,
    seoDescription: page.seoDescription ?? undefined,
    galleryVideoUrl: page.galleryVideoUrl ?? undefined,
    sceneVideoUrl: page.sceneVideoUrl ?? undefined,
    sections: page.sections ?? [],
  };
  if (heroImages) data.heroImages = heroImages;

  if (DRY_RUN) {
    console.log(
      `[dry-run] would ${existing.docs[0] ? 'update' : 'create'} ${page.sku}/${page.locale} sections=${(page.sections ?? []).length}`,
    );
    return existing.docs[0] ? 'updated' : 'created';
  }

  if (existing.docs[0]) {
    await payload.update({ collection: 'shop-product-pages', id: existing.docs[0].id, data });
    return 'updated';
  }
  await payload.create({ collection: 'shop-product-pages', data });
  return 'created';
}

async function replaceTestimonialsForLocale(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
  locale: string,
  items: ImportTestimonial[],
) {
  const existing = await payload.find({
    collection: 'shop-product-testimonials',
    where: { and: [{ sku: { equals: sku } }, { locale: { equals: locale } }] },
    limit: 100,
  });
  if (DRY_RUN) {
    console.log(
      `[dry-run] would replace ${existing.docs.length} → ${items.length} testimonials for ${sku}/${locale}`,
    );
    return;
  }
  for (const doc of existing.docs) {
    await payload.delete({ collection: 'shop-product-testimonials', id: doc.id });
  }
  for (const t of items) {
    if (!t.body?.trim() || !t.author?.trim()) continue;
    await payload.create({
      collection: 'shop-product-testimonials',
      data: {
        sku,
        locale,
        author: t.author,
        rating: t.rating ?? 5,
        body: t.body,
        sort: t.sort ?? 0,
        enabled: t.enabled !== false,
      },
    });
  }
}

async function main() {
  const pages = JSON.parse(readFileSync(join(DATA_DIR, 'pages.import.json'), 'utf8')) as ImportPage[];
  const testimonials = JSON.parse(
    readFileSync(join(DATA_DIR, 'testimonials.import.json'), 'utf8'),
  ) as ImportTestimonial[];

  const payload = await getPayload({ config });
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const page of pages) {
    if (page.locale === 'zh-CN') {
      skipped++;
      continue;
    }
    const action = await upsertPage(payload, page);
    if (action === 'created') created++;
    else if (action === 'updated') updated++;
    else skipped++;
    console.log(`[seed-crystal-pdp-locales] ${action} ${page.sku}/${page.locale}`);
  }

  const byKey = new Map<string, ImportTestimonial[]>();
  for (const t of testimonials) {
    if (t.locale === 'zh-CN') continue;
    const key = `${t.sku}::${t.locale}`;
    const list = byKey.get(key) ?? [];
    list.push(t);
    byKey.set(key, list);
  }
  for (const [key, items] of byKey) {
    const [sku, locale] = key.split('::');
    await replaceTestimonialsForLocale(payload, sku, locale, items);
    console.log(`[seed-crystal-pdp-locales] testimonials ${sku}/${locale} ×${items.length}`);
  }

  console.log(
    `[seed-crystal-pdp-locales] done created=${created} updated=${updated} skipped=${skipped} dryRun=${DRY_RUN}`,
  );
}

main().catch((err) => {
  console.error('[seed-crystal-pdp-locales]', err);
  process.exit(1);
});
