/** 沈知微 · V3 真人对话场景 — 脚本化采集流程（后续可接 lunar-data + NLP） */

export type CharacterMood = 'idle' | 'listening' | 'thinking' | 'speaking';

export type DialogueRole = 'xuan' | 'user' | 'system';

export type DialogueStepId =
  | 'greet_gender'
  | 'ask_birth'
  | 'confirm_birth'
  | 'ask_place'
  | 'closing_chart'
  | 'done';

export type CollectedBirth = {
  gender: 'male' | 'female' | null;
  /** 展示用生辰摘要 */
  birthSummary: string;
  /** 解析出的粗略字段（脚本原型） */
  year?: string;
  month?: string;
  day?: string;
  hourHint?: string;
  calendar?: 'solar' | 'lunar';
  place?: string;
};

export type Line = {
  role: DialogueRole;
  text: string;
  /** 可选确认按钮 */
  choices?: { id: string; label: string }[];
};

export const INITIAL_COLLECTED: CollectedBirth = {
  gender: null,
  birthSummary: '',
};

export function parseGender(raw: string): 'male' | 'female' | null {
  const t = raw.trim().toLowerCase();
  if (/我是女士/.test(t)) return 'female';
  if (/我是男士/.test(t)) return 'male';
  const hasFemale = /女士|姑娘|小姐|坤造|\bfemale\b|\bwoman\b|\bgirl\b/.test(t) || (/女/.test(t) && !/男/.test(t));
  const hasMale = /男士|公子|先生|乾造|\bmale\b|\bman\b|\bboy\b/.test(t) || (/男/.test(t) && !/女/.test(t));
  if (hasFemale && hasMale) return null;
  if (hasFemale) return 'female';
  if (hasMale) return 'male';
  return null;
}

/** 大按钮：避免只能靠打字或文言称呼 */
export const GENDER_CHOICES = [
  { id: 'female', label: '女 · 我是女士' },
  { id: 'male', label: '男 · 我是男士' },
];

export const CONFIRM_CHOICES = [
  { id: 'confirm', label: '对，就是这样' },
  { id: 'edit', label: '不对，我再改' },
];

/** 极简生辰解析：支持「1995年农历三月初八下午三点」一类口语 */
export function parseBirthUtterance(raw: string): Partial<CollectedBirth> | null {
  const t = raw.replace(/\s+/g, '');
  const year = t.match(/(19\d{2}|20\d{2})年?/)?.[1];
  const lunar = /农历|阴历/.test(t);
  const solar = /公历|阳历/.test(t);
  const monthCnTok = t.match(/(?:农历|阴历)?([正一二三四五六七八九十]+)月/)?.[1];
  const monthArTok = !monthCnTok ? t.match(/(1[0-2]|[1-9])月/)?.[1] : undefined;
  const dayCn = t.match(/(初[一二三四五六七八九十]|十[一二三四五六七八九]|廿[一二三四五六七八九]|三十)日?/)?.[1];
  const dayCnAr = !dayCn ? t.match(/初([1-9]|10)日?/)?.[1] : undefined;
  const dayAr = !dayCn && !dayCnAr ? t.match(/(?:月)([12]?\d|3[01])日?/)?.[1] : undefined;

  const monthMap: Record<string, string> = {
    正: '1', 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6',
    七: '7', 八: '8', 九: '9', 十: '10', 十一: '11', 十二: '12',
  };
  const monthCnMap: Record<string, string> = {
    '1': '正', '2': '二', '3': '三', '4': '四', '5': '五', '6': '六',
    '7': '七', '8': '八', '9': '九', '10': '十', '11': '十一', '12': '十二',
  };
  const month = monthCnTok ? monthMap[monthCnTok] || monthCnTok : monthArTok;
  const dayArMap: Record<string, string> = {
    '1': '初一', '2': '初二', '3': '初三', '4': '初四', '5': '初五',
    '6': '初六', '7': '初七', '8': '初八', '9': '初九', '10': '初十',
  };
  const dayPart = dayCn || (dayCnAr ? dayArMap[dayCnAr] || `初${dayCnAr}` : dayAr);
  const dayIsLunarStyle = !!(dayCn || dayCnAr || (lunar && dayAr));

  let hourHint: string | undefined;
  if (/下午\s*[三3]\s*点|三点左右|15\s*[:：]?00?|申时|午\s*[三3]\s*点/.test(t)) {
    hourHint = '申时（约十五点）';
  } else {
    const zhi = t.match(/([子丑寅卯辰巳午未申酉戌亥])时/)?.[1];
    const clockMatch = t.match(/(上午|下午|晚上)?([一二三四五六七八九十两\d]{1,2})[点时]/);
    const period = clockMatch?.[1];
    const clock = clockMatch?.[2];
    if (zhi) hourHint = `${zhi}时`;
    else if (clock) {
      const cnToNum: Record<string, number> = {
        一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9, 十: 10,
      };
      const n = /^\d+$/.test(clock) ? Number(clock) : cnToNum[clock];
      if (n != null) {
        const isPm = period === '下午' || period === '晚上' || /下午|晚上/.test(t);
        const adj = isPm && n < 12 ? n + 12 : n;
        if (adj >= 15 && adj < 17) hourHint = '申时（约十五点）';
        else hourHint = `${String(adj).padStart(2, '0')}时许`;
      }
    }
  }

  if (!year && !month && !dayPart && !hourHint) return null;

  const calLabel = lunar || (!solar && dayIsLunarStyle) ? '农历' : '公历';
  const monthLabel =
    month == null
      ? ''
      : calLabel === '农历'
        ? `${monthCnMap[month] || month}月`
        : `${month}月`;
  let dayLabel = '';
  if (dayPart) {
    if (calLabel === '农历') {
      if (/^初|^十|^廿|^三十/.test(String(dayPart))) dayLabel = String(dayPart);
      else if (/^\d+$/.test(String(dayPart)) && Number(dayPart) <= 10) {
        dayLabel = dayArMap[String(dayPart)] || `初${dayPart}`;
      } else dayLabel = `${dayPart}日`;
    } else {
      dayLabel = `${dayPart}日`;
    }
  }

  const hasDate = !!(year || month || dayPart);
  const summary = [year ? `${year}年` : '', hasDate ? calLabel : '', monthLabel, dayLabel, hourHint]
    .filter(Boolean)
    .join('')
    .replace(/^(.*)(农历|公历)\2/, '$1$2');

  return {
    year,
    month,
    day: dayPart,
    hourHint,
    calendar: calLabel === '农历' ? 'lunar' : 'solar',
    birthSummary: summary || raw.trim(),
  };
}

export function parsePlace(raw: string): string | null {
  const t = raw.trim();
  if (!t || t.length > 40) return null;
  if (/对|是的|没错|可以|确认/.test(t) && t.length < 4) return null;
  return t.replace(/市$|省$/, '') || t;
}

export function isAffirmative(raw: string): boolean {
  return /^(对|是|没错|可以|确认|好|嗯|yes|ok|是的|可是如此|就是这样)/i.test(raw.trim());
}

export function isNegative(raw: string): boolean {
  return /^(不|错|不对|重来|改|no)/i.test(raw.trim());
}

/** 根据当前步骤与用户输入，推进脚本并返回沈知微下一句 */
export function advanceDialogue(
  step: DialogueStepId,
  userText: string,
  collected: CollectedBirth,
): {
  nextStep: DialogueStepId;
  collected: CollectedBirth;
  xuanLines: Line[];
  /** 触发墨迹过渡并进入排盘 */
  openChart?: boolean;
} {
  const text = userText.trim();

  if (step === 'greet_gender') {
    const gender = parseGender(text);
    if (!gender) {
      return {
        nextStep: 'greet_gender',
        collected,
        xuanLines: [
          {
            role: 'xuan',
            text: '刚才没听清。请点下面的按钮：您是女士，还是男士？',
            choices: GENDER_CHOICES,
          },
        ],
      };
    }
    const next: CollectedBirth = { ...collected, gender };
    const who = gender === 'female' ? '女士' : '男士';
    return {
      nextStep: 'ask_birth',
      collected: next,
      xuanLines: [
        {
          role: 'xuan',
          text: `好，您是${who}。请告诉我您的出生日期。公历、农历都可以，再补上大概几点出生。例如：一九九五年农历三月初八，下午三点。`,
        },
      ],
    };
  }

  if (step === 'ask_birth') {
    const parsed = parseBirthUtterance(text);
    if (!parsed?.birthSummary) {
      return {
        nextStep: 'ask_birth',
        collected,
        xuanLines: [
          {
            role: 'xuan',
            text: '生日请再说清楚一些。例如：一九九五年农历三月初八，下午三点。',
          },
        ],
      };
    }
    const next = { ...collected, ...parsed, birthSummary: parsed.birthSummary! };
    return {
      nextStep: 'confirm_birth',
      collected: next,
      xuanLines: [
        {
          role: 'xuan',
          text: `我记下了：${next.birthSummary}。对不对？`,
          choices: CONFIRM_CHOICES,
        },
      ],
    };
  }

  if (step === 'confirm_birth') {
    if (isNegative(text) || text === 'edit') {
      return {
        nextStep: 'ask_birth',
        collected: { ...collected, birthSummary: '', year: undefined, month: undefined, day: undefined, hourHint: undefined },
        xuanLines: [{ role: 'xuan', text: '没关系，请再告诉我一次出生日期。' }],
      };
    }
    if (!isAffirmative(text) && text !== 'confirm' && text !== '可是如此') {
      // 用户可能直接改述生辰
      const parsed = parseBirthUtterance(text);
      if (parsed?.birthSummary) {
        const next = { ...collected, ...parsed, birthSummary: parsed.birthSummary! };
        return {
          nextStep: 'confirm_birth',
          collected: next,
          xuanLines: [
            {
              role: 'xuan',
              text: `我记下了：${next.birthSummary}。对不对？`,
              choices: CONFIRM_CHOICES,
            },
          ],
        };
      }
    }
    return {
      nextStep: 'ask_place',
      collected,
      xuanLines: [
        {
          role: 'xuan',
          text: '好。最后请告诉我您的出生城市，例如北京、上海、广州。用来把时间校准。',
        },
      ],
    };
  }

  if (step === 'ask_place') {
    const place = parsePlace(text);
    if (!place) {
      return {
        nextStep: 'ask_place',
        collected,
        xuanLines: [{ role: 'xuan', text: '请告诉我出生的城市，例如北京、上海、广州。' }],
      };
    }
    const next = { ...collected, place };
    const beijingLike = /北京|京畿|帝都/.test(place);
    const placeLine = beijingLike
      ? '北京不用额外校正时间。'
      : `${place}我会按经度稍作校正。`;
    return {
      nextStep: 'closing_chart',
      collected: next,
      xuanLines: [
        {
          role: 'xuan',
          text: `${placeLine}生辰齐了，现在为您排盘。`,
        },
      ],
      openChart: true,
    };
  }

  if (step === 'closing_chart' || step === 'done') {
    return {
      nextStep: 'done',
      collected,
      xuanLines: [
        {
          role: 'xuan',
          text: '您还可以继续问我。下面几个按钮可以看命盘、大运和报告。',
        },
      ],
    };
  }

  return { nextStep: step, collected, xuanLines: [] };
}

/** 出场自我介绍（先说完再问性别） */
export const OPENING_LINES: Line[] = [
  {
    role: 'xuan',
    text: '您好。我是沈知微。请告诉我您的生辰，我来为您排盘。',
  },
  {
    role: 'xuan',
    text: '请问您是女士，还是男士？点下面的按钮，或者说出来都行。',
    choices: GENDER_CHOICES,
  },
];

/** @deprecated 请用 OPENING_LINES；保留首句兼容旧引用 */
export const OPENING_LINE: Line = OPENING_LINES[0];
