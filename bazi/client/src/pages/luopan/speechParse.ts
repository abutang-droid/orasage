/** 口述生辰 → 结构化字段。正则兜底；服务端 LLM 结果经 merge 叠加上来。 */

export type LuopanSpeechSex = "女" | "男";

export type LuopanSpeechFields = {
  y: number | null;
  m: number | null;
  d: number | null;
  hh: number | null;
  mi: number;
  sex: LuopanSpeechSex | null;
  lunar: boolean;
  leap: boolean;
  name: string | null;
  city: string | null;
  raw: string;
};

const CNMAP: Record<string, number> = {
  零: 0,
  〇: 0,
  一: 1,
  壹: 1,
  二: 2,
  两: 2,
  贰: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

const SEGKEYS: Array<[RegExp, number]> = [
  [/半夜|深夜|子夜|零点|凌晨/, 1],
  [/天快亮|蒙蒙亮|快天亮|拂晓/, 4],
  [/天刚亮|天亮|清晨|早上|早晨|早起|日出/, 6],
  [/上午|早饭|晌午前/, 9],
  [/中午|晌午|正午/, 12],
  [/下午|过晌/, 15],
  [/傍晚|快天黑|太阳落|日落|黄昏/, 18],
  [/晚上|夜里|掌灯|天黑/, 21],
];

const ZHI_HOUR: Record<string, number> = {
  子: 23,
  丑: 1,
  寅: 3,
  卯: 5,
  辰: 7,
  巳: 9,
  午: 11,
  未: 13,
  申: 15,
  酉: 17,
  戌: 19,
  亥: 21,
};

const NAME_STOP =
  /农历|阴历|夏历|公历|阳历|新历|出生|生在|生于|生於|男|女|[〇零一二三四五六七八九十两0-9]{2,4}年/;

function toDigits(s: string): string {
  let r = "";
  for (const c of s) {
    if (CNMAP[c] !== undefined) r += CNMAP[c];
    else if (/[0-9]/.test(c)) r += c;
  }
  return r;
}

function cnNum(s: string): number {
  if (/^\d+$/.test(s)) return parseInt(s, 10);
  let n = 0;
  let cur = 0;
  for (const ch of s) {
    if (CNMAP[ch] !== undefined) cur = CNMAP[ch];
    else if (ch === "十") {
      n += (cur || 1) * 10;
      cur = 0;
    }
  }
  return n + cur;
}

function minuteOf(q: string | undefined | null): number {
  if (!q) return 0;
  if (q === "半") return 30;
  if (q === "一刻") return 15;
  if (q === "两刻") return 30;
  if (q === "三刻") return 45;
  const s = q.replace(/分/g, "").trim();
  const v = /^\d+$/.test(s) ? parseInt(s, 10) : cnNum(s);
  return Number.isFinite(v) && v >= 0 && v <= 59 ? v : 0;
}

function parseYearToken(token: string): number | null {
  const dg = toDigits(token);
  if (dg.length === 4) {
    const y = parseInt(dg, 10);
    return y >= 1920 && y <= 2031 ? y : y >= 1900 && y <= 2100 ? y : null;
  }
  if (dg.length === 2) {
    const v = parseInt(dg, 10);
    return v >= 30 ? 1900 + v : 2000 + v;
  }
  const v = cnNum(token);
  if (v >= 1900 && v <= 2031) return v;
  if (v < 100) return v >= 30 ? 1900 + v : 2000 + v;
  return null;
}

function parseName(t: string): string | null {
  const m = t.match(
    /(?:我叫|名叫|姓名(?:是|叫)?|名字(?:是|叫)?)([\u4e00-\u9fff]{1,8})/,
  );
  if (!m) return null;
  let name = m[1];
  const stop = name.search(NAME_STOP);
  if (stop > 0) name = name.slice(0, stop);
  name = name.replace(/的$/g, "").trim();
  if (name.length < 1 || name.length > 8) return null;
  if (/^(农历|公历|阳历|阴历|男|女)$/.test(name)) return null;
  return name;
}

export function emptyLuopanSpeechFields(raw = ""): LuopanSpeechFields {
  return {
    y: null,
    m: null,
    d: null,
    hh: null,
    mi: 0,
    sex: null,
    lunar: false,
    leap: false,
    name: null,
    city: null,
    raw,
  };
}

/** 中文口语 → 结构化生辰（正则，不依赖网络） */
export function parseLuopanSpeech(text: string): LuopanSpeechFields {
  const t = text.replace(/\s+/g, "");
  const o = emptyLuopanSpeechFields(text);

  let m = t.match(/([〇零一二三四五六七八九十两0-9]{1,6})年/);
  if (m) o.y = parseYearToken(m[1]);

  m = t.match(/([〇零一二三四五六七八九十两0-9]{1,3})月/);
  if (m) o.m = cnNum(m[1]) || parseInt(toDigits(m[1]), 10) || null;
  else if (/腊月/.test(t)) o.m = 12;
  else if (/冬月/.test(t)) o.m = 11;
  else if (/正月/.test(t)) o.m = 1;

  m = t.match(/([〇零一二三四五六七八九十两0-9]{1,3})[日号]/);
  if (m) o.d = cnNum(m[1]) || parseInt(toDigits(m[1]), 10) || null;
  else {
    m = t.match(/初([〇零一二三四五六七八九十0-9]{1,2})/);
    if (m) o.d = cnNum(m[1]);
    else {
      m = t.match(/月([〇零一二三四五六七八九十两0-9]{1,3})(?![日号月])/);
      if (m) o.d = cnNum(m[1]) || parseInt(toDigits(m[1]), 10) || null;
    }
  }

  m = t.match(
    /([0-9]{1,2}|[一二三四五六七八九十两]{1,3})\s*[点时](半|一刻|两刻|三刻|([〇零一二三四五六七八九十两0-9]{1,3})\s*分?)?/,
  );
  if (m) {
    let h = /[0-9]/.test(m[1]) ? parseInt(m[1], 10) : cnNum(m[1]);
    const isPM = /(下午|过晌)/.test(t);
    const isNight = /(晚上|夜里|黄昏|掌灯|半宿|傍晚)/.test(t);
    if (isPM && h < 12) h += 12;
    else if (isNight && h >= 6 && h < 12) h += 12;
    if (h >= 0 && h <= 23) {
      o.hh = h;
      o.mi = minuteOf(m[2] || m[3]);
    }
  }
  if (o.hh === null) {
    const zhi = t.match(/([子丑寅卯辰巳午未申酉戌亥])时/);
    if (zhi && ZHI_HOUR[zhi[1]] != null) {
      o.hh = ZHI_HOUR[zhi[1]];
      o.mi = 0;
    }
  }
  if (o.hh === null) {
    for (const [re, h] of SEGKEYS) {
      if (re.test(t)) {
        o.hh = h;
        o.mi = 0;
        break;
      }
    }
  }

  if (/(农历|阴历|夏历)/.test(t) || /腊月|正月|冬月|闰月/.test(t) || /初[一二三四五六七八九十]/.test(t)) {
    o.lunar = true;
  } else if (/(公历|阳历|新历)/.test(t)) {
    o.lunar = false;
  }

  o.leap = /闰(月|[正一二三四五六七八九十冬腊])/.test(t);

  if (/(女的|女性|女士|女孩|女儿|我妈|我婆婆|我奶奶|我姥姥|我媳妇|姑娘)/.test(t)) o.sex = "女";
  else if (/(男的|男性|男士|男孩|儿子|我爸|我爷爷|我姥爷|我老公|小子)/.test(t)) o.sex = "男";
  else if (/女/.test(t) && !/男女|子女/.test(t)) o.sex = "女";
  else if (/男/.test(t) && !/男女/.test(t)) o.sex = "男";

  o.name = parseName(t);
  return o;
}

function asInt(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" && v.trim() ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  return i >= min && i <= max ? i : null;
}

function asSex(v: unknown): LuopanSpeechSex | null {
  if (v === "女" || v === "female" || v === "F") return "女";
  if (v === "男" || v === "male" || v === "M") return "男";
  return null;
}

function asCalendarLunar(v: unknown): boolean | undefined {
  if (v === "lunar" || v === "农历" || v === "阴历" || v === true) return true;
  if (v === "solar" || v === "gregorian" || v === "公历" || v === "阳历" || v === false) return false;
  return undefined;
}

function asName(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, "").trim();
  if (s.length < 1 || s.length > 32) return null;
  return s;
}

function asCity(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.replace(/\s+/g, "").replace(/[省市县区]$/g, "").trim();
  if (s.length < 2 || s.length > 32) return null;
  return s;
}

/** 解析模型返回的 JSON，字段不全时留下空，交给 merge 用正则补。 */
export function parseLlmSpeechJson(content: string): Partial<LuopanSpeechFields> | null {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const j = JSON.parse(match[0]) as Record<string, unknown>;
    const lunar = asCalendarLunar(j.calendar) ?? asCalendarLunar(j.lunar);
    const fields: Partial<LuopanSpeechFields> = {
      y: asInt(j.year ?? j.y, 1900, 2100),
      m: asInt(j.month ?? j.m, 1, 12),
      d: asInt(j.day ?? j.d, 1, 31),
      hh: asInt(j.hour ?? j.hh, 0, 23),
      sex: asSex(j.gender ?? j.sex),
      name: asName(j.name),
      city: asCity(j.city ?? j.birthplace),
    };
    const mi = asInt(j.minute ?? j.mi, 0, 59);
    if (mi != null) fields.mi = mi;
    if (typeof lunar === "boolean") fields.lunar = lunar;
    if (typeof j.leap === "boolean") fields.leap = j.leap;
    else if (typeof j.isLeapMonth === "boolean") fields.leap = j.isLeapMonth;
    return fields;
  } catch {
    return null;
  }
}

export function mergeLuopanSpeechFields(
  primary: Partial<LuopanSpeechFields> | null | undefined,
  fallback: LuopanSpeechFields,
): LuopanSpeechFields {
  const p = primary ?? {};
  const hh = p.hh != null ? p.hh : fallback.hh;
  const mi = p.hh != null || p.mi != null ? (p.mi ?? 0) : fallback.mi;
  return {
    y: p.y != null ? p.y : fallback.y,
    m: p.m != null ? p.m : fallback.m,
    d: p.d != null ? p.d : fallback.d,
    hh,
    mi,
    sex: p.sex ?? fallback.sex,
    lunar: typeof p.lunar === "boolean" ? p.lunar : fallback.lunar,
    leap: typeof p.leap === "boolean" ? p.leap : fallback.leap,
    name: p.name || fallback.name,
    city: p.city || fallback.city,
    raw: fallback.raw,
  };
}
