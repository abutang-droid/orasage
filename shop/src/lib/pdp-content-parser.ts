export type RichBannerBlock = { type: 'banner'; title: string };

export type RichFeatureBlock = {
  type: 'feature';
  heading: string;
  bullets: string[];
  paragraphs: string[];
};

export type RichParagraphBlock = { type: 'paragraph'; text: string };

export type RichTimingBlock = {
  type: 'timing';
  items: Array<{ icon: string; scene: string; effect: string }>;
};

export type RichPairingBlock = {
  type: 'pairing';
  intro?: string;
  items: Array<{ combo: string; effect: string }>;
};

export type RichBlock =
  | RichBannerBlock
  | RichFeatureBlock
  | RichParagraphBlock
  | RichTimingBlock
  | RichPairingBlock;

const TIMING_LINE = /^(\S+)\s+(.+?)\s*→\s*(.+)$/;
const PAIRING_LINE = /^[•·]\s*(.+?)\s*→\s*(.+)$/;
const BULLET_LINE = /^[•·]\s*(.+)$/;

function stripBannerDashes(line: string): string {
  return line.replace(/^[\s─—-]+/, '').replace(/[\s─—-]+$/, '').trim();
}

function parseFeatureBlock(raw: string): RichFeatureBlock {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const heading = lines[0]?.replace(/^✦\s*/, '') ?? '';
  const bullets: string[] = [];
  const paragraphs: string[] = [];

  for (const line of lines.slice(1)) {
    const bullet = line.match(BULLET_LINE);
    if (bullet) {
      bullets.push(bullet[1]);
      continue;
    }
    paragraphs.push(line);
  }

  return { type: 'feature', heading, bullets, paragraphs };
}

function parseTimingBlock(raw: string): RichTimingBlock | null {
  const items = raw
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const m = line.match(TIMING_LINE);
      if (!m) return null;
      return { icon: m[1], scene: m[2].trim(), effect: m[3].trim() };
    })
    .filter((item): item is NonNullable<typeof item> => Boolean(item));

  return items.length ? { type: 'timing', items } : null;
}

function parsePairingBlock(raw: string): RichPairingBlock | null {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  const items: Array<{ combo: string; effect: string }> = [];
  let intro: string | undefined;

  for (const line of lines) {
    const pairing = line.match(PAIRING_LINE);
    if (pairing) {
      items.push({ combo: pairing[1].trim(), effect: pairing[2].trim() });
      continue;
    }
    if (!intro && !line.startsWith('•') && !line.startsWith('·')) {
      intro = line.replace(/^[\s─—-]+/, '').replace(/[\s─—-]+$/, '').trim();
    }
  }

  return items.length ? { type: 'pairing', intro, items } : null;
}

/** 将 CMS richText 正文解析为可结构化渲染的区块 */
export function parseRichTextBody(body: string): RichBlock[] {
  const chunks = body.split(/\n{2,}/).map((c) => c.trim()).filter(Boolean);
  const blocks: RichBlock[] = [];

  for (const chunk of chunks) {
    const firstLine = chunk.split('\n')[0]?.trim() ?? '';

    if (/^[\s─—-]{2,}/.test(firstLine) || firstLine.startsWith('──')) {
      blocks.push({ type: 'banner', title: stripBannerDashes(firstLine) });
      const rest = chunk.split('\n').slice(1).join('\n').trim();
      if (rest) blocks.push(...parseRichTextBody(rest));
      continue;
    }

    if (firstLine.startsWith('✦')) {
      blocks.push(parseFeatureBlock(chunk));
      continue;
    }

    const timing = parseTimingBlock(chunk);
    if (timing) {
      blocks.push(timing);
      continue;
    }

    const pairing = parsePairingBlock(chunk);
    if (pairing) {
      blocks.push(pairing);
      continue;
    }

    blocks.push({ type: 'paragraph', text: chunk });
  }

  return blocks;
}

export function splitManifestQuote(quote: string): { english: string; chinese: string } {
  const parts = quote.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  if (parts.length <= 1) return { english: quote.trim(), chinese: '' };

  const englishLines: string[] = [];
  const chineseLines: string[] = [];
  let inChinese = false;

  for (const part of parts) {
    const hasCjk = /[\u4e00-\u9fff]/.test(part);
    if (hasCjk) inChinese = true;
    if (inChinese) chineseLines.push(part);
    else englishLines.push(part);
  }

  return {
    english: englishLines.join('\n\n'),
    chinese: chineseLines.join('\n\n'),
  };
}
