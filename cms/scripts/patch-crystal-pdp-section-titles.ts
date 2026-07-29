/**
 * Fix leftover Chinese section titles on en / pt-BR crystal PDP pages.
 *
 * Usage (cms/):
 *   set -a && source .env && set +a && npx tsx scripts/patch-crystal-pdp-section-titles.ts
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';

const TITLE_MAP: Record<string, Record<string, string>> = {
  en: {
    商品规格: 'Product Specifications',
    常见问题: 'Frequently Asked Questions',
  },
  'pt-BR': {
    商品规格: 'Especificações do produto',
    常见问题: 'Perguntas frequentes',
  },
};

async function main() {
  const payload = await getPayload({ config });
  const rows = await payload.find({
    collection: 'shop-product-pages',
    where: {
      and: [
        { sku: { like: 'crystal-%' } },
        { locale: { in: ['en', 'pt-BR'] } },
      ],
    },
    limit: 100,
    depth: 0,
  });

  let updated = 0;
  for (const doc of rows.docs) {
    const locale = String(doc.locale);
    const map = TITLE_MAP[locale];
    if (!map) continue;
    const sections = Array.isArray(doc.sections) ? [...doc.sections] : [];
    let dirty = false;
    const next = sections.map((raw) => {
      const section = { ...(raw as Record<string, unknown>) };
      const title = typeof section.title === 'string' ? section.title.trim() : '';
      if (title && map[title]) {
        section.title = map[title];
        dirty = true;
      }
      return section;
    });
    if (!dirty) continue;
    await payload.update({
      collection: 'shop-product-pages',
      id: doc.id,
      data: { sections: next },
    });
    updated++;
    console.log(`[patch-section-titles] ${doc.sku}/${locale}`);
  }
  console.log(`[patch-section-titles] done updated=${updated}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
