/**
 * 为 auth-service 全部上架商品批量生成 SATYA 风格 CMS 详情页 + 精选评价（zh-CN）
 *
 * Usage (from cms/, on VPS):
 *   set -a && source .env && set +a && npm run seed:shop-pages-all
 *
 * Env:
 *   AUTH_INTERNAL_URL — default http://127.0.0.1:3101
 *   SKIP_TESTIMONIALS=1 — 仅生成详情页
 *   ONLY_MISSING=1 — 跳过已有详情页（默认 upsert 全部）
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { generateSatyaPage, type ProductRow } from './lib/pdp-satya-content';

const AUTH_URL = process.env.AUTH_INTERNAL_URL || 'http://127.0.0.1:3101';
const ONLY_MISSING = process.env.ONLY_MISSING === '1';
const SKIP_TESTIMONIALS = process.env.SKIP_TESTIMONIALS === '1';

function hashSku(sku: string): number {
  let h = 0;
  for (let i = 0; i < sku.length; i++) h = (h * 31 + sku.charCodeAt(i)) >>> 0;
  return h;
}

async function fetchProducts(): Promise<ProductRow[]> {
  const res = await fetch(`${AUTH_URL}/api/products?locale=zh-CN`);
  if (!res.ok) throw new Error(`auth products ${res.status}`);
  const data = (await res.json()) as { products: ProductRow[] };
  return (data.products ?? []).filter((p) => p.active !== false);
}

async function fetchSkuThumbMap(payload: Awaited<ReturnType<typeof getPayload>>) {
  const map = new Map<string, number>();
  const rows = await payload.find({ collection: 'shop-product-images', limit: 500, depth: 1 });
  for (const row of rows.docs) {
    const sku = row.sku as string | undefined;
    const image = row.image;
    const id = typeof image === 'object' && image && 'id' in image ? (image.id as number) : image;
    if (sku && typeof id === 'number') map.set(sku, id);
  }
  return map;
}

async function pickHeroImages(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
  name: string,
  thumbMap: Map<string, number>,
  mediaPool: number[],
) {
  const ids: number[] = [];
  const thumb = thumbMap.get(sku);
  if (thumb) ids.push(thumb);

  const offset = hashSku(sku) % Math.max(mediaPool.length, 1);
  for (let i = 0; ids.length < 3 && i < mediaPool.length; i++) {
    const id = mediaPool[(offset + i) % mediaPool.length];
    if (!ids.includes(id)) ids.push(id);
  }

  return ids.map((imageId, index) => ({
    image: imageId,
    alt: index === 0 ? `${name}主图` : `${name}展示 ${index + 1}`,
    sort: index * 10,
  }));
}

async function upsertPage(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
  data: Record<string, unknown>,
) {
  const existing = await payload.find({
    collection: 'shop-product-pages',
    where: { and: [{ sku: { equals: sku } }, { locale: { equals: 'zh-CN' } }] },
    limit: 1,
  });
  if (existing.docs[0]) {
    await payload.update({ collection: 'shop-product-pages', id: existing.docs[0].id, data });
    return 'updated';
  }
  await payload.create({ collection: 'shop-product-pages', data });
  return 'created';
}

async function replaceTestimonials(
  payload: Awaited<ReturnType<typeof getPayload>>,
  sku: string,
  items: Array<{ author: string; rating: number; body: string; sort: number }>,
) {
  const existing = await payload.find({
    collection: 'shop-product-testimonials',
    where: { and: [{ sku: { equals: sku } }, { locale: { equals: 'zh-CN' } }] },
    limit: 100,
  });

  for (const doc of existing.docs) {
    await payload.delete({ collection: 'shop-product-testimonials', id: doc.id });
  }

  for (const t of items) {
    await payload.create({
      collection: 'shop-product-testimonials',
      data: {
        sku,
        author: t.author,
        rating: t.rating,
        body: t.body,
        locale: 'zh-CN',
        sort: t.sort,
        enabled: true,
      },
    });
  }
}

async function main() {
  const payload = await getPayload({ config });
  const products = await fetchProducts();
  if (!products.length) {
    console.error('[seed-shop-pages-all] 无商品数据');
    process.exit(1);
  }

  const thumbMap = await fetchSkuThumbMap(payload);
  const media = await payload.find({ collection: 'media', limit: 30, sort: '-createdAt' });
  const mediaPool = media.docs.map((d) => d.id as number).filter(Boolean);
  if (!mediaPool.length) {
    console.error('[seed-shop-pages-all] 媒体库为空');
    process.exit(1);
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const product of products) {
    if (ONLY_MISSING) {
      const exists = await payload.find({
        collection: 'shop-product-pages',
        where: { and: [{ sku: { equals: product.sku } }, { locale: { equals: 'zh-CN' } }] },
        limit: 1,
      });
      if (exists.docs[0]) {
        skipped++;
        console.log(`[seed-shop-pages-all] skip ${product.sku} (exists)`);
        continue;
      }
    }

    let generated;
    try {
      generated = generateSatyaPage(product, products);
    } catch (err) {
      // 无 SATYA 模板的商品（如 diy-bracelet 走独立设计器页）跳过，不中断整批 upsert
      skipped++;
      console.log(`[seed-shop-pages-all] skip ${product.sku} (${err instanceof Error ? err.message : err})`);
      continue;
    }
    const heroImages = await pickHeroImages(
      payload,
      product.sku,
      product.name,
      thumbMap,
      mediaPool,
    );

    const pageData: Record<string, unknown> = {
      sku: product.sku,
      locale: 'zh-CN',
      status: 'published',
      subtitle: generated.subtitle,
      seoTitle: generated.seoTitle,
      seoDescription: generated.seoDescription,
      heroImages,
      sections: generated.sections,
    };

    if (generated.galleryVideoUrl) pageData.galleryVideoUrl = generated.galleryVideoUrl;
    if (generated.sceneVideoUrl) pageData.sceneVideoUrl = generated.sceneVideoUrl;

    const action = await upsertPage(payload, product.sku, pageData);
    if (action === 'created') created++;
    else updated++;

    if (!SKIP_TESTIMONIALS) {
      await replaceTestimonials(payload, product.sku, generated.testimonials);
    }

    console.log(`[seed-shop-pages-all] ${action} ${product.sku} — ${product.name}`);
  }

  console.log(
    `[seed-shop-pages-all] done: ${products.length} products, created=${created}, updated=${updated}, skipped=${skipped}`,
  );
}

main().catch((err) => {
  console.error('[seed-shop-pages-all]', err);
  process.exit(1);
});
