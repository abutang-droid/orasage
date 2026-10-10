/** 罗盘语音：把口述/ASR 文本收成年月日时、性别、历法。城市仍走 speechPlace。 */

export type SpeechParse = {
  y: number | null;
  m: number | null;
  d: number | null;
  hh: number | null;
  mi: number;
  sex: "女" | "男" | null;
  lunar: boolean;
  solar: boolean;
  leap: boolean;
  raw: string;
};

const CNMAP: Record<string, number> = {
  零: 0,
  〇: 0,
  "○": 0,
  一: 1,
  壹: 1,
  二: 2,
  两: 2,
  贰: 2,
  三: 3,
  叁: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

const CN = "〇零○一二三四五六七八九十两壹贰叁0-9";

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

const SEGKEYS: [RegExp, number][] = [
  [/半夜|深夜|子夜|零点|凌晨/, 1],
  [/天快亮|蒙蒙亮|快天亮|拂晓/, 4],
  [/天刚亮|天亮|清晨|早上|早晨|早起|日出/, 6],
  [/上午|早饭|晌午前/, 9],
  [/中午|晌午|正午/, 12],
  [/下午|过晌/, 15],
  [/傍晚|快天黑|太阳落|日落|黄昏/, 18],
  [/晚上|夜里|掌灯|天黑/, 21],
];

export function toDigits(s: string): string {
  let r = "";
  for (const c of s) {
    if (CNMAP[c] !== undefined) r += String(CNMAP[c]);
    else if (/[0-9]/.test(c)) r += c;
  }
  return r;
}

/** 「二十三 / 十二 / 八 / 14」→ 数字。必须先认「十」，否则「二十」会被拆成 2。 */
export function cnNum(s: string): number {
  if (!s) return NaN;
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

export function minuteOf(q: string | undefined | null): number {
  if (!q) return 0;
  if (q === "半" || q === "两刻") return 30;
  if (q === "一刻") return 15;
  if (q === "三刻") return 45;
  if (q === "整") return 0;
  const s = q.replace(/分/g, "").trim();
  const v = /^\d+$/.test(s) ? parseInt(s, 10) : cnNum(s);
  return Number.isFinite(v) && v >= 0 && v <= 59 ? v : 0;
}

export function normalizeSpeech(text: string): string {
  return text
    .replace(/[\s\u3000]/g, "")
    .replace(/(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/g, "$1年$2月$3日")
    .replace(/[，。,.、；;！!？?]/g, "")
    .replace(/[：:]/g, "点")
    .replace(/号/g, "日")
    .replace(/点钟/g, "点");
}

function clampMonth(n: number): number | null {
  return n >= 1 && n <= 12 ? n : null;
}

function clampDay(n: number): number | null {
  return n >= 1 && n <= 31 ? n : null;
}

function parseYearToken(tok: string): number | null {
  const dg = toDigits(tok);
  if (dg.length === 4) {
    const v = parseInt(dg, 10);
    return v >= 1900 && v <= 2100 ? v : null;
  }
  if (dg.length === 2) {
    const v = parseInt(dg, 10);
    if (!Number.isFinite(v)) return null;
    return v >= 30 ? 1900 + v : 2000 + v;
  }
  const v = cnNum(tok);
  if (v >= 1900 && v <= 2100) return v;
  if (v >= 0 && v < 100) return v >= 30 ? 1900 + v : 2000 + v;
  return null;
}

export function parseSpeech(text: string): SpeechParse {
  const t = normalizeSpeech(text);
  const o: SpeechParse = {
    y: null,
    m: null,
    d: null,
    hh: null,
    mi: 0,
    sex: null,
    lunar: false,
    solar: false,
    leap: false,
    raw: text,
  };

  o.solar = /公历|阳历|新历/.test(t);
  o.leap = /闰(?:[正一二三四五六七八九十冬腊]|1[0-2]|[1-9])?月/.test(t);
  o.lunar =
    o.leap ||
    /农历|阴历|旧历/.test(t) ||
    /正月|正初|腊月|冬月/.test(t) ||
    /初[一二三四五六七八九十0-9]/.test(t) ||
    /廿[一二三四五六七八九0-9]?/.test(t);
  if (o.solar) o.lunar = false;

  let m = t.match(new RegExp(`([${CN}]{1,6})年`));
  if (m) o.y = parseYearToken(m[1]);
  if (o.y == null) {
    m = t.match(/(19\d{2}|20\d{2})/);
    if (m) o.y = parseInt(m[1], 10);
    else {
      m = t.match(/^([〇零一二三四五六七八九]{4})/);
      if (m) o.y = parseYearToken(m[1]);
    }
  }

  if (/正月|正初/.test(t)) o.m = 1;
  else if (/腊月/.test(t)) o.m = 12;
  else if (/冬月/.test(t)) o.m = 11;
  else {
    m = t.match(new RegExp(`闰?([${CN}]{1,3})月`));
    if (m) {
      const v = cnNum(m[1]);
      const n = Number.isFinite(v) && v > 0 ? v : parseInt(toDigits(m[1]), 10);
      o.m = clampMonth(n);
    }
  }

  m = t.match(/初([〇零一二三四五六七八九十0-9]{1,2})/);
  if (m) {
    o.d = clampDay(cnNum(m[1]) || parseInt(toDigits(m[1]), 10));
  } else if ((m = t.match(/三十日?/))) {
    o.d = 30;
  } else if ((m = t.match(/廿([一二三四五六七八九0-9])?/))) {
    o.d = clampDay(20 + (m[1] ? cnNum(m[1]) || parseInt(m[1], 10) : 0));
  } else if ((m = t.match(new RegExp(`([${CN}]{1,3})日`)))) {
    o.d = clampDay(cnNum(m[1]) || parseInt(toDigits(m[1]), 10));
  } else if ((m = t.match(new RegExp(`月([${CN}]{1,3})(?![点时月年])`)))) {
    o.d = clampDay(cnNum(m[1]) || parseInt(toDigits(m[1]), 10));
  }

  m = t.match(
    new RegExp(
      `([0-9]{1,2}|[一二三四五六七八九十两]{1,3})[点时](半|一刻|两刻|三刻|整|(?:[${CN}]{1,3})分?)?`,
    ),
  );
  if (m) {
    let h = /[0-9]/.test(m[1]) ? parseInt(m[1], 10) : cnNum(m[1]);
    const isPM = /下午|过晌/.test(t);
    const isNight = /晚上|夜里|黄昏|掌灯|半宿|傍晚|晚[0-9一二三四五六七八九十两]/.test(t);
    const isDawn = /凌晨|半夜|深夜|子夜/.test(t);
    if (isPM && h > 0 && h < 12) h += 12;
    else if (isNight && h >= 6 && h < 12) h += 12;
    else if ((isNight || isDawn) && h === 12) h = 0;
    if (h === 24) h = 0;
    if (h >= 0 && h <= 23) {
      o.hh = h;
      o.mi = minuteOf(m[2]);
    }
  }
  if (o.hh === null) {
    m = t.match(/([子丑寅卯辰巳午未申酉戌亥])时/);
    if (m && ZHI_HOUR[m[1]] != null) {
      o.hh = ZHI_HOUR[m[1]];
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

  if (/(女的|女性|女士|女孩|女儿|我妈|我婆婆|我奶奶|我姥姥|我媳妇|姑娘|坤造)/.test(t)) {
    o.sex = "女";
  } else if (/(男的|男性|男士|男孩|儿子|我爸|我爷爷|我姥爷|我老公|小子|乾造)/.test(t)) {
    o.sex = "男";
  } else if (/女/.test(t) && !/男女|子女/.test(t)) {
    o.sex = "女";
  } else if (/男/.test(t) && !/男女/.test(t)) {
    o.sex = "男";
  }

  return o;
}
