/**
 * 把 LLM 报告里的术语升格 / 禁用译法，压回规范口径。
 * 只做同级或降级替换，不发明新判断。
 */

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/身身弱/g, "偏耗"],
  [/身弱之局/g, "支持你的力量少于消耗你的力量"],
  [/日主身弱/g, "代表你的那个字：支持少于消耗"],
  [/日主身强/g, "代表你的那个字：支持多于消耗"],
  [/命局身弱/g, "这套配置里，支持你的力量少于消耗你的力量"],
  [/命局身强/g, "这套配置里，支持你的力量多于消耗你的力量"],
  [/身弱/g, "支持你的力量少于消耗你的力量"],
  [/身強/g, "支持你的力量多于消耗你的力量"],
  [/身强/g, "支持你的力量多于消耗你的力量"],
  [/身体弱|体质差|命薄|能量不足/g, "支持少于消耗"],
  [/喜用神/g, "对你最有用的那一项"],
  [/用神/g, "对你最有用的那一项"],
  [/忌神/g, "最容易让你失衡的那一项"],
  [/开运物|转运法宝|幸运符/g, "顺的方向"],
  [/开运建议/g, "顺的方向"],
  [/开运/g, "顺的方向"],
  [/转运/g, "换一个顺的方向"],
  [/大运来了|走好运/g, "新的十年阶段开始"],
  [/大运流年/g, "每十年一换的阶段，以及这一年"],
  [/流年/g, "这一年"],
  [/大运/g, "每十年一换的阶段"],
  [/格成有救/g, "这个结构是立得住的"],
  [/逢凶化吉|命中有解/g, "这个结构是立得住的"],
  [/有救/g, "立得住"],
  [/透干/g, "出现在明面上"],
  [/透出/g, "出现在明面上"],
  [/泄身/g, "你往外给的时候，消耗的是自己"],
  [/漏财|破财/g, "消耗"],
  [/投资失利/g, "为眼前的收益消耗注意力"],
  [/心脑火旺之疾|心脑之疾/g, "节奏被带得过快"],
  [/凶神|破财的东西|你的克星/g, "最容易让你失衡的那一项"],
  [/凶煞|血光|刑伤/g, "硬来的压力"],
  [/克夫|犯上|命硬/g, "带锋芒的产出"],
  [/破财星|会被人骗/g, "和我同源、但要分走我东西的人"],
  [/上等命|富贵命|格局高|命好|命贵/g, "这套配置的主要结构"],
  [/贵人/g, "配合主结构起作用的那个角色"],
  [/相冲|犯冲|相害/g, "被压住或被拿走"],
  [/\bWeak body\b/gi, "Drain-heavy"],
  [/\bStrong body\b/gi, "Support-heavy"],
  [/Wealth Strong Body Weak/gi, "Drain-heavy with visible gains"],
];

/** 整句删除：带器官 / 疾病 / 明确投资结论的因果断言 */
const DROP_SENTENCE =
  /[^。！？\n]*?(心脏病|肝|肾|肺|心脑|疾病|之疾|痊愈|投资理财|控制杠杆|回款压力|家人健康|身心调节|身体健康)[^。！？\n]*[。！？]?/g;

export function sanitizeVernacularText(text: string): string {
  if (!text) return text;
  const tails: string[] = [];
  const park = (m: string) => {
    tails.push(m);
    return `\u0000TAIL${tails.length - 1}\u0000`;
  };
  let out = text
    .replace(/体系里叫「[^」]*」[。.]?/g, park)
    .replace(/In the system this is called [“"][^”"]*[”"]\.?/g, park);
  out = out.replace(DROP_SENTENCE, "");
  for (const [re, to] of REPLACEMENTS) out = out.replace(re, to);
  out = out.replace(/\u0000TAIL(\d+)\u0000/g, (_, i) => tails[Number(i)]);
  return out.replace(/\n{3,}/g, "\n\n").trim();
}

export function sanitizeInsightJson<T extends Record<string, unknown>>(obj: T): T {
  const next = { ...obj };
  for (const key of Object.keys(next)) {
    const v = next[key];
    if (typeof v === "string") (next as Record<string, unknown>)[key] = sanitizeVernacularText(v);
  }
  return next;
}
