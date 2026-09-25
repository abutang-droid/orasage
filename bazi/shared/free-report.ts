/**
 * 免费版八字报告：按规范生成「现象 → 机制 → 术语」四段正文。
 * 不调用模型，保证译法一对一、可复述。
 */

import {
  BRANCH_VERNACULAR,
  BRANCH_VERNACULAR_EN,
  BRANCH_WX,
  GOD_VERNACULAR,
  GOD_VERNACULAR_EN,
  GRID_CAPTION_EN,
  GRID_CAPTION_ZH,
  STEM_VERNACULAR,
  STEM_VERNACULAR_EN,
  STEM_WX,
  WX_FACE,
  WX_FACE_EN,
  classicTermTail,
  luckyFromFavorable,
  relationSentence,
  strengthKind,
  strengthLong,
  strengthShort,
  wxRelation,
} from "./vernacular.ts";

export type FreeReportInput = {
  name: string;
  riZhu: string;
  strength: string;
  favorable: string[];
  unfavorable: string[];
  year: { gan: string; zhi: string };
  month: { gan: string; zhi: string };
  day: { gan: string; zhi: string };
  hour: { gan: string; zhi: string };
  shiShen: Record<string, string>;
  pattern?: { primary?: string; secondary?: string[]; keyStems?: string[] };
};

export type FreeReportSection = {
  title: string;
  body: string;
  classic: string;
};

export type FreeReport = {
  dayMasterLine: string;
  gridCaption: string;
  sections: FreeReportSection[];
  luckyLine: string;
  luckyNote: string;
};

const OUTPUT_GODS = new Set(["食神", "伤官"]);
const SUPPORT_GODS = new Set(["偏印", "正印"]);
const PRESSURE_GODS = new Set(["七杀", "偏官", "正官"]);
const WEALTH_GODS = new Set(["偏财", "正财"]);

function loc(locale: string): "zh" | "en" {
  return locale.startsWith("zh") ? "zh" : "en";
}

function stemWx(gan: string): string {
  return STEM_WX[gan] ?? gan;
}

function pillarStems(input: FreeReportInput): string[] {
  return [input.year.gan, input.month.gan, input.day.gan, input.hour.gan];
}

function countGods(input: FreeReportInput, set: Set<string>): number {
  return pillarStems(input).filter((gan) => set.has(input.shiShen[gan])).length;
}

function itemCountWord(n: number, L: "zh" | "en"): string {
  if (L === "en") return n === 1 ? "item" : "items";
  if (n <= 1) return "一项";
  if (n === 2) return "两项";
  return "几项";
}

function monthRelSentence(dayGan: string, monthZhi: string, L: "zh" | "en"): string {
  const me = stemWx(dayGan);
  const other = BRANCH_WX[monthZhi] ?? "";
  const rel = wxRelation(me, other);
  const relTxt = relationSentence(rel, L);
  const wxFace = L === "en" ? (WX_FACE_EN[other] ?? other) : (WX_FACE[other] ?? other);
  const wxFaceShort = L === "en" ? wxFace : wxFace.replace(/的那一面$/, "");
  if (L === "en") {
    const face = BRANCH_VERNACULAR_EN[monthZhi] ?? monthZhi;
    if (rel === "我生") {
      return `You were born in the month of ${monthZhi} — ${face}. ${other} draws from ${me}, so “${wxFaceShort}” keeps draining you.`;
    }
    return `You were born in the month of ${monthZhi} — ${face}. ${relTxt}`.trim();
  }
  const face = BRANCH_VERNACULAR[monthZhi] ?? `${monthZhi}月`;
  if (rel === "我生") {
    return `你出生在${face}（${monthZhi}月）。${other}会从${me}里取养分，所以「${wxFaceShort}」这件事一直在消耗你。`;
  }
  return `你出生在${face}（${monthZhi}月）。${relTxt}`.trim();
}

function classicMatrix(input: FreeReportInput): string {
  const gan = input.riZhu;
  const wx = stemWx(gan);
  const zhi = input.month.zhi;
  const mwx = BRANCH_WX[zhi] ?? "";
  const rel = wxRelation(wx, mwx);
  const relWord =
    rel === "我生" ? `${mwx}旺泄身` :
    rel === "生我" ? `${mwx}生身` :
    rel === "克我" ? `${mwx}克身` :
    rel === "我克" ? `身克${mwx}` :
    rel === "同我" ? `${mwx}比劫帮身` : `${mwx}当令`;
  const kind = strengthKind(input.strength);
  const strengthWord = kind === "身强" ? "身强" : kind === "身弱" ? "身弱" : "中和";
  const fav = input.favorable.join("") || "均衡";
  const unfav = input.unfavorable.join("") || "无";
  const useVerb = kind === "身强" ? "泄身" : "扶身";
  return `${gan}${wx}生于${zhi}月，${relWord}，${strengthWord}；喜${fav}以${useVerb}，忌${unfav}耗克`;
}

function sectionMatrix(input: FreeReportInput, L: "zh" | "en"): FreeReportSection {
  const gan = input.riZhu;
  const wx = stemWx(gan);
  const stemFace = L === "en" ? (STEM_VERNACULAR_EN[gan] ?? "") : (STEM_VERNACULAR[gan] ?? "");
  const kind = strengthKind(input.strength);
  const long = strengthLong(input.strength, L);
  const fav = input.favorable.length ? input.favorable.join(L === "en" ? " and " : "与") : (L === "en" ? "none singled out" : "尚未偏出");
  const unfav = input.unfavorable.length ? input.unfavorable.join(L === "en" ? " and " : "与") : (L === "en" ? "none singled out" : "尚未偏出");
  const title = L === "en"
    ? (kind === "身弱" ? "What you need is not more output — it is to refill first" :
      kind === "身强" ? "What you need is not more refill — it is to send force outward" :
      "Support and drain are roughly even")
    : (kind === "身弱" ? "你需要的不是继续输出，而是先补回来" :
      kind === "身强" ? "你需要的不是再补，而是把力气用出去" :
      "支持和消耗大致相当");

  let body: string;
  if (L === "en") {
    body = [
      `The character that stands for you is ${gan} (${wx}) — ${stemFace}.`,
      monthRelSentence(gan, input.month.zhi, L),
      `In this chart, ${long}.`,
      `The items most useful to you are ${fav}; the items most likely to throw you off balance are ${unfav} — in the system, they drain this chart.`,
    ].filter(Boolean).join(" ");
  } else {
    body = [
      `代表你的那个字是 ${gan}（${wx}）——${stemFace}。`,
      monthRelSentence(gan, input.month.zhi, L),
      `你这套配置里，${long}。`,
      `对你最有用的${itemCountWord(input.favorable.length, L)}是${fav}；最需要注意的是${unfav}——在体系里，它们对这个盘起消耗作用。`,
    ].join("");
  }
  return { title, body, classic: classicTermTail(classicMatrix(input), L) };
}

function patternTitle(primary: string, L: "zh" | "en"): string {
  if (primary.includes("食神")) return L === "en" ? "You can produce, but you need a brake" : "能输出，但需要一道刹车";
  if (primary.includes("伤官")) return L === "en" ? "What you produce has an edge" : "产出带锋芒，也耗自己";
  if (primary.includes("印")) return L === "en" ? "Support is the main structure" : "支撑是这套配置的主结构";
  if (primary.includes("财")) return L === "en" ? "This structure is about taking and exchanging" : "这套结构在讲取用与交换";
  if (primary.includes("杀") || primary.includes("官")) return L === "en" ? "Pressure is the main structure" : "压力是这套配置的主结构";
  return L === "en" ? "This is the main structure of the chart" : "这套配置的主要结构";
}

function classicPattern(input: FreeReportInput): string {
  const zhi = input.month.zhi;
  const monthGan = input.month.gan;
  const monthGod = input.shiShen[monthGan] ?? "";
  const primary = input.pattern?.primary ?? "";
  const yinCount = countGods(input, SUPPORT_GODS);
  const stems = [input.year.gan, input.month.gan, input.day.gan, input.hour.gan];
  const xinCount = stems.filter((s) => s === "辛").length;
  const parts = [`${zhi}月${monthGan}${stemWx(monthGan)}${monthGod ? "透干" : ""}`];
  if (primary) parts.push(`成${primary}`);
  if (xinCount >= 2 && yinCount >= 1) parts.push("双辛偏印透出制食生身，以印为相神，格成有救");
  else if (yinCount >= 2) parts.push("印星重叠制食生身，格成有救");
  return parts.filter(Boolean).join("，");
}

function sectionPattern(input: FreeReportInput, L: "zh" | "en"): FreeReportSection {
  const primary = input.pattern?.primary ?? "";
  const title = patternTitle(primary, L);
  const outputN = countGods(input, OUTPUT_GODS);
  const yinN = countGods(input, SUPPORT_GODS);
  const pressN = countGods(input, PRESSURE_GODS);
  const wealthN = countGods(input, WEALTH_GODS);
  const monthGan = input.month.gan;
  const monthGod = input.shiShen[monthGan] ?? "";
  const monthGodFace = L === "en" ? (GOD_VERNACULAR_EN[monthGod] ?? "") : (GOD_VERNACULAR[monthGod] ?? "");

  const bits: string[] = [];
  if (L === "en") {
    if (outputN > 0) bits.push("You have a clear talent structure: expressing and making things is a strong suit.");
    else if (pressN > 0) bits.push("The main structure here is pressure — the kind that either constrains you or builds you.");
    else if (wealthN > 0) bits.push("The main structure here is taking and exchanging — gains that take effort.");
    else if (yinN > 0) bits.push("The main structure here is support coming in from outside.");
    else bits.push("This chart has a readable main structure.");
    bits.push("That structure shows on the surface — it appears in the open, not only underneath.");
    if (yinN >= 1) {
      bits.push(`At the same time there ${yinN >= 2 ? "are overlapping forces" : "is a force"} that pulls inward and helps you refine.`);
      bits.push("In plain words: something is helping you brake, and it is protecting you.");
    }
    bits.push("This structure holds.");
  } else {
    if (outputN > 0) bits.push("你有一个很明确的天赋结构：表达和创作是你的强项。");
    else if (pressN > 0) bits.push("这套配置的主结构是压力——硬来的，或讲规矩的。");
    else if (wealthN > 0) bits.push("这套配置的主结构是取用：你要花力气去换收获。");
    else if (yinN > 0) bits.push("这套配置的主结构是从外部来的支撑。");
    else bits.push("这套配置有一个读得出来的主结构。");
    bits.push("这个结构在你身上是亮出来的——它出现在明面上，不是藏在底下。");
    if (monthGodFace) bits.push(`出生那个月明面上的角色，是「${monthGodFace}」。`);
    const xinCount = [input.year.gan, input.month.gan, input.day.gan, input.hour.gan].filter((s) => s === "辛").length;
    if (yinN >= 1) {
      bits.push(xinCount >= 2
        ? "同时，你身上还有两股「往里收、帮你打磨」的力量（两个辛）。它们压住了你过度往外给的倾向，把资源转回到支撑你自己这一边。"
        : yinN >= 2
        ? "同时，你身上还有两股「往里收、帮你打磨」的力量。它们压住了过度往外给的倾向，把资源转回到支撑你自己这一边。"
        : "同时，你身上还有一股「往里收、帮你打磨」的力量，把资源转回到支撑你自己这一边。");
      bits.push("说白了：有一件事在帮你踩刹车，而且它是在保护你。");
    }
    bits.push("这个结构是立得住的。");
  }

  return { title, body: bits.join(L === "en" ? " " : ""), classic: classicTermTail(classicPattern(input), L) };
}

function sectionPersonality(input: FreeReportInput, L: "zh" | "en"): FreeReportSection {
  const gan = input.riZhu;
  const stemFace = L === "en" ? (STEM_VERNACULAR_EN[gan] ?? "") : (STEM_VERNACULAR[gan] ?? "");
  const outputN = countGods(input, OUTPUT_GODS);
  const yinN = countGods(input, SUPPORT_GODS);
  const gods = Array.from(new Set(Object.values(input.shiShen).filter(Boolean)));
  const classic = outputN > 0 && yinN >= 2
    ? "食神旺而偏印重叠"
    : outputN > 0 && yinN >= 1
    ? "食神佩印"
    : gods.slice(0, 4).join(L === "en" ? ", " : "、");

  if (L === "en") {
    const good = outputN > 0
      ? "On the useful side, you have a feel for craft and making — the quality of what you ship is high."
      : `On the useful side, the Day Master’s image is: ${stemFace}.`;
    const cost = yinN > 0
      ? "The cost is thinking too deep, and being less willing to play along with surface social rounds — you would rather find your own path."
      : "The cost is that this configuration does not come free: it asks you to spend yourself when you send force outward.";
    return {
      title: "The feel is good; the cost is going deep",
      body: `The “naturally producing” side is strong, and there are also forces that pull inward and think deep. ${good} ${cost}`,
      classic: classicTermTail(classic || "十神组合", L),
    };
  }

  const good = outputN > 0
    ? "好的一面是：你在技术类、手艺类的事情上手感好，出活的质量高。"
    : `好的一面是：代表你的那个字，取象是「${stemFace}」。`;
  const cost = yinN > 0
    ? "代价的一面是：容易想得太深，不太愿意配合场面上的应酬，更习惯自己找一条路走。"
    : "代价的一面是：往外给的时候，消耗的是自己。";
  return {
    title: "手感好，代价是想得深",
    body: `你身上「自然产出」的那一面很强，同时又有${yinN >= 2 ? "两股" : "一股"}「往里收、往深里想」的力量叠在一起。${good}${cost}`,
    classic: classicTermTail(classic || "十神组合", L),
  };
}

function sectionYear(input: FreeReportInput, L: "zh" | "en"): FreeReportSection {
  const yearWx = "火";
  const me = stemWx(input.riZhu);
  const rel = wxRelation(me, yearWx);

  if (L === "en") {
    let mechanism = "Clues of opportunity will increase; at the same time, the part of you that thinks deep can be crowded out. Things can be taken on, but attention scatters.";
    if (rel === "克我") mechanism = "Fire is the side that makes things visible. It can press on you this year — more heat, more exposure, easier to be rushed.";
    if (rel === "我生") mechanism = "Fire is the side that makes things visible. You feed it when you output, so the year can look busy while you yourself are drained.";
    return {
      title: "2026: more openings, more scattered attention",
      body: `2026 (Bing Wu) is a year when things are easier to see and the pace is easier to speed up. ${mechanism} This year fits “holding steady” — not doing nothing, but not opening too many lines at once.`,
      classic: classicTermTail("2026 年（丙午）", L),
    };
  }

  let mechanism = "收入和机会的线索会明显增加；但与此同时，你原本用来「往深里想」的那部分支撑会被挤占。结果是：事情接得下，但容易分心，也容易为了眼前的收益而消耗自己的注意力。";
  if (rel === "克我") mechanism = "火是「让事情显出来的那一面」。这一年它更容易压到你的节奏——热度上来，被看见的机会变多，人也更容易被带着跑。";
  if (rel === "我生") mechanism = "火是「让事情显出来的那一面」。你往外给的时候会喂到它，所以这一年看起来热闹，消耗的仍是自己。";
  const yinN = countGods(input, SUPPORT_GODS);
  const yearClassic = yinN >= 1 ? "2026 年（丙午）财旺合印，印星受制" : "2026 年（丙午）";
  return {
    title: "2026：机会变多，注意力变散",
    body: `2026 年对你是一个「机会变多、注意力变散」的年份。${mechanism}这一年适合「稳守」——不是不做，而是不要同时开太多条线。`,
    classic: classicTermTail(yearClassic, L),
  };
}

export function composeFreeReport(input: FreeReportInput, locale = "zh-CN"): FreeReport {
  const L = loc(locale);
  const gan = input.riZhu;
  const wx = stemWx(gan);
  const short = strengthShort(input.strength, L);
  const lucky = luckyFromFavorable(input.favorable, L);
  const dayMasterLine = L === "en"
    ? `The character that stands for you: ${gan} (${wx})  ·  ${short}`
    : `代表你的字：${gan}（${wx}）　·　${short}`;
  return {
    dayMasterLine,
    gridCaption: L === "en" ? GRID_CAPTION_EN : GRID_CAPTION_ZH,
    sections: [
      sectionMatrix(input, L),
      sectionPattern(input, L),
      sectionPersonality(input, L),
      sectionYear(input, L),
    ],
    luckyLine: lucky.line,
    luckyNote: lucky.note,
  };
}

export function trueSolarCaption(offsetMinutes: number | undefined, locale = "zh-CN"): string {
  const L = loc(locale);
  if (offsetMinutes === undefined) return "";
  if (offsetMinutes === 0) {
    return L === "en"
      ? "Clock time already matches local solar noon — no correction needed."
      : "钟表时间与当地太阳过正午的时刻一致，无需校正。";
  }
  const abs = Math.abs(offsetMinutes);
  const sign = offsetMinutes > 0 ? "+" : "−";
  if (L === "en") {
    return `Time corrected by longitude of your birthplace (${sign}${abs} min). Clocks follow a time zone; the sun crosses noon at a different minute in each place, so we convert clock time to local solar time.`;
  }
  return `已按你出生地的经度校正过时间（${sign}${abs} 分钟）。因为各地太阳过正午的时刻不同，所以用经度把钟表时间校正到当地太阳时。`;
}
