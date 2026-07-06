/**
 * Seed ziwei knowledge base into Payload CMS.
 * Imports from ziwei app static data (classics, star briefs, heming).
 *
 * Usage (from cms/):
 *   DATABASE_URL=... PAYLOAD_SECRET=... npm run seed:ziwei-knowledge
 */
import { getPayload } from 'payload';
import config from '../src/payload.config';
import { ALL_BOOKS } from '../../ziwei/lib/classics/index';
import {
  ALL_STARS,
  STAR_BRIEF_SEO,
  STAR_TO_SLUG,
} from '../../ziwei/lib/seo/knowledge';
import { STAR_DESCRIPTIONS } from '../../ziwei/lib/ziwei/constants';
import { STAR_IN_FUQI_GU } from '../../ziwei/lib/ziwei/heming-knowledge';

async function upsertBook(
  payload: Awaited<ReturnType<typeof getPayload>>,
  book: (typeof ALL_BOOKS)[number],
  sortOrder: number,
): Promise<number> {
  const data = {
    code: book.slug,
    title: book.title,
    dynasty: book.dynasty,
    author: book.author,
    intro: book.intro,
    wordCount: book.wordCount,
    sortOrder,
    wpStatus: 'publish' as const,
  };

  const existing = await payload.find({
    collection: 'ziwei-classics-books',
    where: { code: { equals: book.slug } },
    limit: 1,
  });

  if (existing.docs[0]) {
    await payload.update({
      collection: 'ziwei-classics-books',
      id: existing.docs[0].id,
      data,
    });
    console.log(`[seed] updated book: ${book.slug}`);
    return existing.docs[0].id as number;
  }

  const created = await payload.create({
    collection: 'ziwei-classics-books',
    data,
  });
  console.log(`[seed] created book: ${book.slug}`);
  return created.id as number;
}

async function main() {
  const payload = await getPayload({ config });
  const bookIdByCode = new Map<string, number>();

  for (let i = 0; i < ALL_BOOKS.length; i++) {
    const book = ALL_BOOKS[i];
    const id = await upsertBook(payload, book, (i + 1) * 10);
    bookIdByCode.set(book.slug, id);
  }

  let chapterCount = 0;
  for (const book of ALL_BOOKS) {
    const bookId = bookIdByCode.get(book.slug);
    if (!bookId) continue;

    for (let chapterIdx = 0; chapterIdx < book.chapters.length; chapterIdx++) {
      const chapter = book.chapters[chapterIdx];
      const code = `${book.slug}-${chapterIdx}`;
      const data = {
        code,
        book: bookId,
        chapterIndex: chapterIdx,
        title: chapter.title,
        subtitle: chapter.subtitle ?? undefined,
        paragraphs: chapter.paragraphs.map((p) => ({
          id: p.id,
          idx: p.idx,
          text: p.text,
          ...(p.translation ? { translation: p.translation } : {}),
          ...(p.niNote ? { niNote: p.niNote } : {}),
        })),
        wpStatus: 'publish' as const,
      };

      const existing = await payload.find({
        collection: 'ziwei-classics-chapters',
        where: { code: { equals: code } },
        limit: 1,
      });

      if (existing.docs[0]) {
        await payload.update({
          collection: 'ziwei-classics-chapters',
          id: existing.docs[0].id,
          data,
        });
      } else {
        await payload.create({
          collection: 'ziwei-classics-chapters',
          data,
        });
      }
      chapterCount++;
    }
  }
  console.log(`[seed] classics chapters: ${chapterCount}`);

  let starCount = 0;
  for (let i = 0; i < ALL_STARS.length; i++) {
    const starName = ALL_STARS[i];
    const code = STAR_TO_SLUG[starName];
    if (!code) continue;

    const desc = STAR_DESCRIPTIONS[starName];
    const data = {
      code,
      starName,
      brief: STAR_BRIEF_SEO[starName] ?? '',
      keywords: desc?.keywords ?? undefined,
      nature: desc?.nature ?? undefined,
      element: desc?.element ?? undefined,
      sortOrder: (i + 1) * 10,
      wpStatus: 'publish' as const,
    };

    const existing = await payload.find({
      collection: 'ziwei-knowledge-stars',
      where: { code: { equals: code } },
      limit: 1,
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: 'ziwei-knowledge-stars',
        id: existing.docs[0].id,
        data,
      });
    } else {
      await payload.create({
        collection: 'ziwei-knowledge-stars',
        data,
      });
    }
    starCount++;
  }
  console.log(`[seed] knowledge stars: ${starCount}`);

  let hemingCount = 0;
  for (const [starName, entry] of Object.entries(STAR_IN_FUQI_GU)) {
    const code = STAR_TO_SLUG[starName];
    if (!code) continue;

    const data = {
      code,
      starName,
      summary: entry.summary,
      good: entry.good,
      bad: entry.bad,
      spouseTraits: entry.spouse_traits,
      timing: entry.timing,
      niQuote: entry.ni_quote ?? undefined,
      wpStatus: 'publish' as const,
    };

    const existing = await payload.find({
      collection: 'ziwei-heming-stars',
      where: { code: { equals: code } },
      limit: 1,
    });

    if (existing.docs[0]) {
      await payload.update({
        collection: 'ziwei-heming-stars',
        id: existing.docs[0].id,
        data,
      });
    } else {
      await payload.create({
        collection: 'ziwei-heming-stars',
        data,
      });
    }
    hemingCount++;
  }
  console.log(`[seed] heming stars: ${hemingCount}`);

  console.log('[seed] ziwei knowledge import complete');
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
