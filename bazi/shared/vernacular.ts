/**
 * OraSage 术语白话化规范 v1.0 的可复用词典。
 * 写作时逐字取用「规范译法」；术语后移到「体系里叫……」，不删除。
 */

export const STEM_WX: Record<string, string> = {
  甲: "木", 乙: "木", 丙: "火", 丁: "火", 戊: "土", 己: "土",
  庚: "金", 辛: "金", 壬: "水", 癸: "水",
};

export const STEM_POLARITY: Record<string, "阳" | "阴"> = {
  甲: "阳", 丙: "阳", 戊: "阳", 庚: "阳", 壬: "阳",
  乙: "阴", 丁: "阴", 己: "阴", 辛: "阴", 癸: "阴",
};

export const BRANCH_WX: Record<string, string> = {
  子: "水", 丑: "土", 寅: "木", 卯: "木", 辰: "土", 巳: "火",
  午: "火", 未: "土", 申: "金", 酉: "金", 戌: "土", 亥: "水",
};

/** 天干规范译法（现象层 · 逐字取用） */
export const STEM_VERNACULAR: Record<string, string> = {
  甲: "朝上长、有主见、习惯站在最前面",
  乙: "不硬碰，但能绕着达到目的",
  丙: "外放、显性、情绪写在脸上",
  丁: "不喧哗，但对细节有反应",
  戊: "厚、稳、扛得住；决定慢，但定了不改",
  己: "能容纳、能滋养，但也容易被搅动",
  庚: "直接、先讲结论、要切开重来",
  辛: "讲究、精细、对呈现方式有要求",
  壬: "流动、铺得开、不喜欢被固定在一个框架里",
  癸: "细、渗、感应力强；不争，但能慢慢穿过去",
};

export const STEM_VERNACULAR_EN: Record<string, string> = {
  甲: "grows upward, has a view, tends to stand in front",
  乙: "does not collide head-on, but still finds a way through",
  丙: "outward, visible, feelings show on the face",
  丁: "quiet, but reacts to small details",
  戊: "thick, steady, can carry weight; slow to decide, then does not reverse",
  己: "can hold and nourish, and is easily stirred",
  庚: "direct, leads with the conclusion, wants to cut and rebuild",
  辛: "particular, precise, cares how things are presented",
  壬: "flowing, wide-ranging, dislikes being fixed in one frame",
  癸: "fine, seeping, highly sensitive; does not compete, but can pass through slowly",
};

/** 地支规范译法（落在季节与盛衰，不译成生肖） */
export const BRANCH_VERNACULAR: Record<string, string> = {
  子: "水最纯、最定的时候，像深夜",
  丑: "冻着的土：慢、冷；里面还留着水和金的余气",
  寅: "刚破土的木：有劲、往上冲，还带一点火气",
  卯: "木最纯、长势最盛的时候",
  辰: "湿润的土，还留着春天的余气",
  巳: "火起来了，但下面还压着土的重量",
  午: "火最盛也最短的时候，像正午",
  未: "干热的土，还留着夏天的余气",
  申: "开始有锋芒，但底下有水在动",
  酉: "金最纯、最精的时候",
  戌: "干土，还留着火的余气",
  亥: "表面安静，底下已经开始积木的力量",
};

export const BRANCH_VERNACULAR_EN: Record<string, string> = {
  子: "deepest winter water — the stillest point",
  丑: "frozen earth — slow and cold, still holding water and metal",
  寅: "first wood breaking ground — driving upward, with a spark of fire",
  卯: "purest wood — peak growth",
  辰: "damp earth, still holding spring's remains",
  巳: "fire rising, still weighted by earth beneath",
  午: "peak fire — brightest and shortest, like noon",
  未: "dry warm earth, still holding summer's remains",
  申: "edge forming, with water moving underneath",
  酉: "purest metal — most refined",
  戌: "dry earth, still holding fire's remains",
  亥: "quiet on the surface, already gathering wood beneath",
};

/** 十神规范译法（逐字取用） */
export const GOD_VERNACULAR: Record<string, string> = {
  比肩: "和我一样的人",
  劫财: "和我同源、但要分走我东西的人",
  食神: "我自然产出的东西",
  伤官: "我带锋芒的产出",
  偏财: "不固定的收获",
  正财: "按规矩换来的收获",
  七杀: "硬来的压力",
  偏官: "硬来的压力",
  正官: "讲规矩的压力",
  偏印: "偏门来的支撑",
  正印: "正向来的支撑",
};

export const GOD_VERNACULAR_EN: Record<string, string> = {
  比肩: "people cut from the same cloth as you",
  劫财: "same source, but sharing your resources",
  食神: "what you produce naturally, and with ease",
  伤官: "what you produce with an edge",
  偏财: "gains that arrive unfixed — through opportunity and people",
  正财: "gains that follow the rules — steady and traceable",
  七杀: "hard pressure",
  偏官: "hard pressure",
  正官: "rule-bound pressure",
  偏印: "support from an unusual source",
  正印: "support from a straightforward source",
};

export const WX_FACE: Record<string, string> = {
  木: "往外长的那一面",
  火: "让事情显出来的那一面",
  土: "承住的那一面",
  金: "收起来、定下来、做取舍的那一面",
  水: "往深里走、往暗处渗的那一面",
};

export const WX_FACE_EN: Record<string, string> = {
  木: "the outward-growing side",
  火: "the side that makes things visible",
  土: "the side that holds",
  金: "the side that gathers, settles, and chooses",
  水: "the side that goes deeper and seeps inward",
};

const SHENG: Record<string, string> = { 木: "火", 火: "土", 土: "金", 金: "水", 水: "木" };
const KE: Record<string, string> = { 木: "土", 土: "水", 水: "火", 火: "金", 金: "木" };

export type WxRelation = "生我" | "我生" | "同我" | "我克" | "克我";

export function wxRelation(me: string, other: string): WxRelation | null {
  if (!me || !other || me === "未知") return null;
  if (me === other) return "同我";
  if (SHENG[other] === me) return "生我";
  if (SHENG[me] === other) return "我生";
  if (KE[me] === other) return "我克";
  if (KE[other] === me) return "克我";
  return null;
}

export function relationSentence(rel: WxRelation | null, locale: "zh" | "en" = "zh"): string {
  if (locale === "en") {
    switch (rel) {
      case "生我": return "This item is giving you support.";
      case "我生": return "When you produce it, you are drained.";
      case "同我": return "It is of the same kind as you, and will compete for the same resources.";
      case "我克": return "You take from it, and that takes effort.";
      case "克我": return "This item is pressing on you; it constrains how you move.";
      default: return "";
    }
  }
  switch (rel) {
    case "生我": return "这一项在给你支撑。";
    case "我生": return "你产出它的时候，自己会被消耗。";
    case "同我": return "它和你同类，会和你争夺同一份资源。";
    case "我克": return "你去取用它，需要花力气。";
    case "克我": return "这一项在压着你，它会约束你的动作。";
    default: return "";
  }
}

export type StrengthKind = "身强" | "身弱" | "身中和";

export function strengthKind(raw: string): StrengthKind {
  if (raw.includes("强")) return "身强";
  if (raw.includes("弱")) return "身弱";
  return "身中和";
}

/** 短版：标签、副标题一律用这个，不另写 */
export function strengthShort(raw: string, locale: "zh" | "en" = "zh"): string {
  const k = strengthKind(raw);
  if (locale === "en") {
    if (k === "身强") return "Support-heavy";
    if (k === "身弱") return "Drain-heavy";
    return "Balanced";
  }
  if (k === "身强") return "偏补";
  if (k === "身弱") return "偏耗";
  return "均衡";
}

/** 长版：完整句子里展开 */
export function strengthLong(raw: string, locale: "zh" | "en" = "zh"): string {
  const k = strengthKind(raw);
  if (locale === "en") {
    if (k === "身强") return "the forces that support you outweigh the forces that drain you";
    if (k === "身弱") return "the forces that support you are less than the forces that drain you";
    return "support and drain are roughly even";
  }
  if (k === "身强") return "支持你的力量多于消耗你的力量";
  if (k === "身弱") return "支持你的力量少于消耗你的力量";
  return "支持和消耗大致相当";
}

export function polarTag(gan: string, zhi: string, isDay = false, locale: "zh" | "en" = "zh"): string {
  const pol = STEM_POLARITY[gan] ?? "";
  const gwx = STEM_WX[gan] ?? "";
  const zwx = BRANCH_WX[zhi] ?? "";
  if (locale === "en") {
    const polEn = pol === "阳" ? "Yang" : pol === "阴" ? "Yin" : "";
    const you = isDay ? " (you)" : "";
    return `${polEn} ${gwx}${you} / ${zwx}`.trim();
  }
  const you = isDay ? "（你）" : "";
  return `${pol}${gwx}${you} / ${zwx}`;
}

export function classicTermTail(classic: string, locale: "zh" | "en" = "zh"): string {
  const inner = classic.replace(/^「|」$/g, "").trim();
  if (!inner) return "";
  return locale === "en"
    ? `In the system this is called “${inner}”.`
    : `体系里叫「${inner}」。`;
}

export const GRID_CAPTION_ZH =
  "日柱的第一个字是日主，代表你本人；其余七个字描述你出生时的环境。一个地支里通常同时含两到三个五行，分主次——网格上的「内含」就是它装着的那几项。";

export const GRID_CAPTION_EN =
  "The first character of the Day Pillar is the Day Master — it stands for you. The other seven characters describe the environment at birth. An earthly branch usually holds two or three elements, ranked by weight; what the chart labels as Hidden Stems are those inner elements.";

export const LUCKY_WX: Record<string, { colors: string; dir: string; colorsEn: string; dirEn: string }> = {
  金: { colors: "白色", dir: "西方", colorsEn: "white", dirEn: "West" },
  木: { colors: "绿色", dir: "东方", colorsEn: "green", dirEn: "East" },
  水: { colors: "黑色", dir: "北方", colorsEn: "black", dirEn: "North" },
  火: { colors: "红色", dir: "南方", colorsEn: "red", dirEn: "South" },
  土: { colors: "黄色", dir: "中央", colorsEn: "yellow", dirEn: "Center" },
};

export function luckyFromFavorable(favorable: string[], locale: "zh" | "en" = "zh"): { line: string; note: string } {
  const items = favorable.map((w) => LUCKY_WX[w]).filter(Boolean);
  if (items.length === 0) {
    return locale === "en"
      ? { line: "Colors and directions follow whichever side currently supports you.", note: "They do not mean luck. They are only a direction that fits this chart." }
      : { line: "颜色与方位随对你最有用的那几项而定。", note: "它们不代表运势，只是让你在日常里有一个顺的方向。" };
  }
  const colorParts = items.flatMap((i) => (locale === "en" ? i.colorsEn : i.colors).split(/、|, /));
  const colors = Array.from(new Set(colorParts)).join(locale === "en" ? ", " : "、");
  const dirs = Array.from(new Set(items.map((i) => locale === "en" ? i.dirEn : i.dir))).join(locale === "en" ? ", " : "、");
  const favJoin = favorable.join(locale === "en" ? " and " : "与");
  if (locale === "en") {
    return {
      line: `Colors: ${colors}  |  Directions: ${dirs}`,
      note: `These map to ${favJoin} — the items most useful to you above. They do not mean luck; they are only a direction that fits this chart.`,
    };
  }
  return {
    line: `幸运色：${colors}　｜　幸运方位：${dirs}`,
    note: `这两组颜色与方位对应的是${favJoin}——也就是上面说的、对你最有用的那几项。它们不代表运势，只是让你在日常里有一个顺的方向。`,
  };
}

export function formatGanZhiYear(year: number, ganZhi: string, locale: "zh" | "en" = "zh"): string {
  const gz = ganZhi.replace(/年$/, "");
  return locale === "en" ? `${year} (${gz})` : `${year} 年（${gz}）`;
}
