export type SpeechCityHit = {
  city: string;
  country: string;
  province?: string;
  lng?: number;
  lat?: number;
  timezone?: string;
  alias?: string[];
};

const PLACE_PREFIX = /(?:出生地|出生在|出生于|生于|生在|老家在|地址|城市)/;

function stripTrailingAdmin(s: string) {
  return s.replace(/[省市县区]$/, "");
}

/** 从口述全文里抽出城市名。matchLocalCity 会因日期汉字紧贴城市名而失败。 */
export function pickCityFromSpeech<T extends SpeechCityHit>(
  text: string,
  catalog: T[],
): T | null {
  const t = text.replace(/[\s\u3000]/g, "").replace(/[，。,.、；;！!？?]/g, "");
  if (!t || catalog.length === 0) return null;

  const labeled = t.match(new RegExp(`${PLACE_PREFIX.source}([\\u4e00-\\u9fff]{2,8})`));
  if (labeled) {
    const q = stripTrailingAdmin(labeled[1]);
    const exact = catalog.find((c) => c.city === q || c.alias?.includes(q));
    if (exact) return exact;
    const fuzzy = catalog.find((c) => c.city.includes(q) || q.includes(c.city));
    if (fuzzy) return fuzzy;
  }

  let best: T | null = null;
  let bestLen = 0;
  let bestPos = -1;
  for (const c of catalog) {
    const names = [c.city, ...(c.alias ?? [])].filter((n) => n && n.length >= 2);
    for (const name of names) {
      const idx = t.indexOf(name);
      if (idx < 0) continue;
      if (name.length > bestLen || (name.length === bestLen && idx > bestPos)) {
        best = c;
        bestLen = name.length;
        bestPos = idx;
      }
    }
  }
  return best;
}
