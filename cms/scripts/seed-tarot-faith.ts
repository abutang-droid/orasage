/**
 * Seed faiths + sanctuaries into Payload CMS.
 * Usage (from cms/): DATABASE_URL=... PAYLOAD_SECRET=... npx tsx scripts/seed-tarot-faith.ts
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { SEED_FAITHS, SEED_SANCTUARIES } from '../../shared/tarot-faith-seed';

async function main() {
  const payload = await getPayload({ config });
  const faithIdByCode = new Map<string, number>();

  for (const f of SEED_FAITHS) {
    const existing = await payload.find({
      collection: 'faiths',
      where: { code: { equals: f.code } },
      limit: 1,
    });
    if (existing.docs[0]) {
      faithIdByCode.set(f.code, existing.docs[0].id as number);
      await payload.update({
        collection: 'faiths',
        id: existing.docs[0].id,
        data: {
          nameZh: f.nameZh,
          nameEn: f.nameEn,
          emoji: f.emoji,
          rank: f.rank,
          adherentsM: f.adherentsM,
          worshipFacing: f.worshipFacing ?? 'none',
          wpStatus: 'publish',
        },
      });
      console.log(`[seed] updated faith: ${f.code}`);
    } else {
      const created = await payload.create({
        collection: 'faiths',
        data: {
          code: f.code,
          nameZh: f.nameZh,
          nameEn: f.nameEn,
          emoji: f.emoji,
          rank: f.rank,
          adherentsM: f.adherentsM,
          worshipFacing: f.worshipFacing ?? 'none',
          wpStatus: 'publish',
        },
      });
      faithIdByCode.set(f.code, created.id as number);
      console.log(`[seed] created faith: ${f.code}`);
    }
  }

  for (const s of SEED_SANCTUARIES) {
    const faithIds = s.faithCodes
      .map((code) => faithIdByCode.get(code))
      .filter((id): id is number => id != null);

    const data = {
      code: s.code,
      nameZh: s.nameZh,
      nameEn: s.nameEn,
      namePt: s.namePt ?? s.nameEn,
      nameEs: s.nameEs ?? s.nameEn,
      faiths: faithIds,
      tradition: s.tradition,
      region: s.region,
      domains: s.domains.map((label) => ({ label })),
      color: s.color,
      gradient: s.gradient,
      imageUrl: s.imageUrl,
      sortOrder: s.sortOrder,
      blessingText: s.blessingText,
      wpStatus: 'publish' as const,
    };

    const existing = await payload.find({
      collection: 'sanctuaries',
      where: { code: { equals: s.code } },
      limit: 1,
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: 'sanctuaries',
        id: existing.docs[0].id,
        data,
      });
      console.log(`[seed] updated sanctuary: ${s.code}`);
    } else {
      await payload.create({ collection: 'sanctuaries', data });
      console.log(`[seed] created sanctuary: ${s.code}`);
    }
  }

  console.log('[seed] done');
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
