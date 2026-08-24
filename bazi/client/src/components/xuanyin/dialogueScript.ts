/** 玄隐先生 · V3 真人对话场景 — 脚本化采集流程（后续可接 lunar-data + NLP） */

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
  if (/女|姑娘|小姐|female|woman|girl|坤造/.test(t)) return 'female';
  if (/男|公子|先生|male|man|boy|乾造/.test(t)) return 'male';
  return null;
}

/** 极简生辰解析：支持「1995年农历三月初八下午三点」一类口语 */
export function parseBirthUtterance(raw: string): Partial<CollectedBirth> | null {
  const t = raw.replace(/\s+/g, '');
  const year = t.match(/(19\d{2}|20\d{2})年?/)?.[1];
  const lunar = /农历|阴历/.test(t);
  const solar = /公历|阳历/.test(t);
  const monthNum = t.match(/(?:农历|阴历)?([正一二三四五六七八九十]+)月/)?.[1];
  const dayPart = t.match(/(初[一二三四五六七八九十]|十[一二三四五六七八九]|廿[一二三四五六七八九]|三十|[1-9]|[12]\d|3[01])日?/)?.[1];
  const hour =
    t.match(/([上下]午)?\s*([一二三四五六七八九十\d]{1,2})\s*[点时]/)?.[2] ||
    t.match(/([子丑寅卯辰巳午未申酉戌亥])时/)?.[1];

  if (!year && !monthNum && !dayPart && !hour) return null;

  const monthMap: Record<string, string> = {
    正: '1', 一: '1', 二: '2', 三: '3', 四: '4', 五: '5', 六: '6',
    七: '7', 八: '8', 九: '9', 十: '10', 十一: '11', 十二: '12',
  };
  const month = monthNum ? monthMap[monthNum] || monthNum : undefined;

  let hourHint: string | undefined;
  if (hour) {
    if (/申/.test(String(hour))) hourHint = '申时（约十五点）';
    else if (/^\d+$/.test(String(hour))) {
      const h = Number(hour);
      const adj = /下午|晚上/.test(t) && h < 12 ? h + 12 : h;
      hourHint = `${String(adj).padStart(2, '0')}时许`;
    } else hourHint = `${hour}时`;
  } else if (/下午三|三点左右|15\s*[:：]?00?/.test(t)) {
    hourHint = '申时（约十五点）';
  }

  const dayLabel = dayPart || '';
  const calLabel = lunar || (!solar && /初|廿/.test(t)) ? '农历' : '公历';
  const mLabel = month ? `${calLabel === '农历' && month === '1' ? '正' : month}月` : '';
  const summaryParts = [
    year ? `${year}年` : '',
    calLabel,
    mLabel,
    dayLabel,
    hourHint || '',
  ].filter(Boolean);

  return {
    year,
    month,
    day: dayPart,
    hourHint,
    calendar: calLabel === '农历' ? 'lunar' : 'solar',
    birthSummary: summaryParts.join('').replace(/公历公历|农历农历/g, (s) => s.slice(0, 2)) || raw.trim(),
  };
}

export function parsePlace(raw: string): string | null {
  const t = raw.trim();
  if (!t || t.length > 40) return null;
  if (/对|是的|没错|可以|确认/.test(t) && t.length < 4) return null;
  return t.replace(/市$|省$/, '') || t;
}

export function isAffirmative(raw: string): boolean {
  return /^(对|是|没错|可以|确认|好|嗯|yes|ok|是的|可是如此)/i.test(raw.trim());
}

export function isNegative(raw: string): boolean {
  return /^(不|错|不对|重来|改|no)/i.test(raw.trim());
}

/** 根据当前步骤与用户输入，推进脚本并返回玄隐下一句 */
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
        xuanLines: [{ role: 'xuan', text: '方才未听真切——你是公子，还是姑娘？' }],
      };
    }
    const next: CollectedBirth = { ...collected, gender };
    const address = gender === 'male' ? '公子' : '姑娘';
    return {
      nextStep: 'ask_birth',
      collected: next,
      xuanLines: [
        {
          role: 'xuan',
          text: `原是位${address}。那你的生辰是哪一日？不拘公历农历，约莫什么时辰降生，都请道来。`,
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
            text: '生辰还请说得再分明些——例如「一九九五年农历三月初八，下午三点左右」。',
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
          text: `唔…我记下了：${next.birthSummary}。可是如此？`,
          choices: [
            { id: 'confirm', label: '可是如此 ✓' },
            { id: 'edit', label: '不对 ✎' },
          ],
        },
      ],
    };
  }

  if (step === 'confirm_birth') {
    if (isNegative(text) || text === 'edit') {
      return {
        nextStep: 'ask_birth',
        collected: { ...collected, birthSummary: '', year: undefined, month: undefined, day: undefined, hourHint: undefined },
        xuanLines: [{ role: 'xuan', text: '无妨，再道一遍生辰便是。' }],
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
              text: `唔…我记下了：${next.birthSummary}。可是如此？`,
              choices: [
                { id: 'confirm', label: '可是如此 ✓' },
                { id: 'edit', label: '不对 ✎' },
              ],
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
          text: '好。最后一事——你降生于何地？我须校正真太阳时。',
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
        xuanLines: [{ role: 'xuan', text: '出生之地还请告知，例如「北京」「上海」「广州」。' }],
      };
    }
    const next = { ...collected, place };
    const beijingLike = /北京|京畿|帝都/.test(place);
    const placeLine = beijingLike
      ? '京畿之地，经度近乎标准，无需校正。'
      : `${place}之地，我会按经度略作校正。`;
    return {
      nextStep: 'closing_chart',
      collected: next,
      xuanLines: [
        {
          role: 'xuan',
          text: `${placeLine}如此，生辰已齐。且待我为你排盘……`,
        },
      ],
      openChart: true,
    };
  }

  return { nextStep: step, collected, xuanLines: [] };
}

export const OPENING_LINE: Line = {
  role: 'xuan',
  text: '夜安。我是玄隐。先问一句——你是公子，还是姑娘？',
};
