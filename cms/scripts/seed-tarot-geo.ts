/**
 * Seed geo-regions, geo-countries, country-faiths into Payload CMS.
 * Prerequisite: faiths seeded (npm run seed:tarot).
 * Usage (from cms/): DATABASE_URL=... PAYLOAD_SECRET=... npx tsx scripts/seed-tarot-geo.ts
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';
import {
  SEED_COUNTRY_FAITHS,
  SEED_GEO_COUNTRIES,
  SEED_GEO_REGIONS,
} from '../../shared/tarot-geo-seed';

async function main() {
  const payload = await getPayload({ config });
  const regionIdByCode = new Map<string, number>();
  const countryIdByCode = new Map<string, number>();
  const faithIdByCode = new Map<string, number>();

  const faiths = await payload.find({ collection: 'faiths', limit: 200 });
  for (const f of faiths.docs) {
    faithIdByCode.set(f.code as string, f.id as number);
  }
  if (faithIdByCode.size === 0) {
    console.error('[seed-geo] no faiths found — run seed:tarot first');
    process.exit(1);
  }

  for (const r of SEED_GEO_REGIONS) {
    const existing = await payload.find({
      collection: 'geo-regions',
      where: { code: { equals: r.code } },
      limit: 1,
    });
    const data = {
      code: r.code,
      nameZh: r.nameZh,
      nameEn: r.nameEn,
      mapX: r.mapX,
      mapY: r.mapY,
      sortOrder: r.sortOrder,
      wpStatus: 'publish' as const,
    };
    if (existing.docs[0]) {
      await payload.update({ collection: 'geo-regions', id: existing.docs[0].id, data });
      regionIdByCode.set(r.code, existing.docs[0].id as number);
      console.log(`[seed-geo] updated region: ${r.code}`);
    } else {
      const created = await payload.create({ collection: 'geo-regions', data });
      regionIdByCode.set(r.code, created.id as number);
      console.log(`[seed-geo] created region: ${r.code}`);
    }
  }

  for (const c of SEED_GEO_COUNTRIES) {
    const regionId = regionIdByCode.get(c.regionCode);
    if (!regionId) {
      console.warn(`[seed-geo] skip country ${c.code}: unknown region ${c.regionCode}`);
      continue;
    }
    const existing = await payload.find({
      collection: 'geo-countries',
      where: { code: { equals: c.code } },
      limit: 1,
    });
    const data = {
      code: c.code,
      nameZh: c.nameZh,
      nameEn: c.nameEn,
      region: regionId,
      sortOrder: c.sortOrder,
      wpStatus: 'publish' as const,
    };
    if (existing.docs[0]) {
      await payload.update({ collection: 'geo-countries', id: existing.docs[0].id, data });
      countryIdByCode.set(c.code, existing.docs[0].id as number);
      console.log(`[seed-geo] updated country: ${c.code}`);
    } else {
      const created = await payload.create({ collection: 'geo-countries', data });
      countryIdByCode.set(c.code, created.id as number);
      console.log(`[seed-geo] created country: ${c.code}`);
    }
  }

  for (const link of SEED_COUNTRY_FAITHS) {
    const countryId = countryIdByCode.get(link.countryCode);
    const faithId = faithIdByCode.get(link.faithCode);
    if (!countryId || !faithId) {
      console.warn(`[seed-geo] skip link ${link.countryCode}/${link.faithCode}`);
      continue;
    }

    const existing = await payload.find({
      collection: 'country-faiths',
      where: {
        and: [
          { country: { equals: countryId } },
          { faith: { equals: faithId } },
        ],
      },
      limit: 1,
    });

    const country = SEED_GEO_COUNTRIES.find((x) => x.code === link.countryCode);
    const faith = faiths.docs.find((x) => x.code === link.faithCode);
    const label = `${country?.nameZh ?? link.countryCode} · ${faith?.nameZh ?? link.faithCode}`;

    const data = {
      label,
      country: countryId,
      faith: faithId,
      prevalence: link.prevalence,
      isPrimary: link.isPrimary ?? false,
      wpStatus: 'publish' as const,
    };

    if (existing.docs[0]) {
      await payload.update({ collection: 'country-faiths', id: existing.docs[0].id, data });
      console.log(`[seed-geo] updated link: ${label}`);
    } else {
      await payload.create({ collection: 'country-faiths', data });
      console.log(`[seed-geo] created link: ${label}`);
    }
  }

  console.log('[seed-geo] done');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
