import type { Locale, TranslationDict } from "./index";

const termFiles: Record<Locale, () => Promise<TranslationDict>> = {
  "zh-CN": () => import("./zh-CN").then((m) => m.default),
  "zh-TW": () => import("./zh-TW").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
  "pt-BR": () => import("./pt-BR").then((m) => m.default),
};

const termData: Record<string, Record<Locale, string>> = {
  /* 五行 */
  金: { "zh-CN": "金", "zh-TW": "金", en: "Metal", "pt-BR": "Metal" },
  木: { "zh-CN": "木", "zh-TW": "木", en: "Wood", "pt-BR": "Madeira" },
  水: { "zh-CN": "水", "zh-TW": "水", en: "Water", "pt-BR": "Água" },
  火: { "zh-CN": "火", "zh-TW": "火", en: "Fire", "pt-BR": "Fogo" },
  土: { "zh-CN": "土", "zh-TW": "土", en: "Earth", "pt-BR": "Terra" },

  /* 身强/弱 */
  身强: { "zh-CN": "身强", "zh-TW": "身強", en: "Strong", "pt-BR": "Forte" },
  身弱: { "zh-CN": "身弱", "zh-TW": "身弱", en: "Weak", "pt-BR": "Fraco" },
  身中和: { "zh-CN": "身中和", "zh-TW": "身中和", en: "Balanced", "pt-BR": "Equilibrado" },

  /* 十神 */
  比肩: { "zh-CN": "比肩", "zh-TW": "比肩", en: "Friend", "pt-BR": "Amigo" },
  劫财: { "zh-CN": "劫财", "zh-TW": "劫財", en: "Rob Wealth", "pt-BR": "Rival" },
  食神: { "zh-CN": "食神", "zh-TW": "食神", en: "Food God", "pt-BR": "Deus da Comida" },
  伤官: { "zh-CN": "伤官", "zh-TW": "傷官", en: "Hurt Officer", "pt-BR": "Ferir Oficial" },
  偏财: { "zh-CN": "偏财", "zh-TW": "偏財", en: "Indirect Wealth", "pt-BR": "Riqueza Indireta" },
  正财: { "zh-CN": "正财", "zh-TW": "正財", en: "Direct Wealth", "pt-BR": "Riqueza Direta" },
  偏官: { "zh-CN": "偏官", "zh-TW": "偏官", en: "Seven Kill", "pt-BR": "Sete Matador" },
  正官: { "zh-CN": "正官", "zh-TW": "正官", en: "Direct Officer", "pt-BR": "Oficial Direto" },
  偏印: { "zh-CN": "偏印", "zh-TW": "偏印", en: "Indirect Seal", "pt-BR": "Selo Indireto" },
  正印: { "zh-CN": "正印", "zh-TW": "正印", en: "Direct Seal", "pt-BR": "Selo Direto" },

  /* 天干 */
  甲: { "zh-CN": "甲", "zh-TW": "甲", en: "Jia", "pt-BR": "Jia" },
  乙: { "zh-CN": "乙", "zh-TW": "乙", en: "Yi", "pt-BR": "Yi" },
  丙: { "zh-CN": "丙", "zh-TW": "丙", en: "Bing", "pt-BR": "Bing" },
  丁: { "zh-CN": "丁", "zh-TW": "丁", en: "Ding", "pt-BR": "Ding" },
  戊: { "zh-CN": "戊", "zh-TW": "戊", en: "Wu", "pt-BR": "Wu" },
  己: { "zh-CN": "己", "zh-TW": "己", en: "Ji", "pt-BR": "Ji" },
  庚: { "zh-CN": "庚", "zh-TW": "庚", en: "Geng", "pt-BR": "Geng" },
  辛: { "zh-CN": "辛", "zh-TW": "辛", en: "Xin", "pt-BR": "Xin" },
  壬: { "zh-CN": "壬", "zh-TW": "壬", en: "Ren", "pt-BR": "Ren" },
  癸: { "zh-CN": "癸", "zh-TW": "癸", en: "Gui", "pt-BR": "Gui" },

  /* 地支 */
  子: { "zh-CN": "子", "zh-TW": "子", en: "Zi", "pt-BR": "Zi" },
  丑: { "zh-CN": "丑", "zh-TW": "丑", en: "Chou", "pt-BR": "Chou" },
  寅: { "zh-CN": "寅", "zh-TW": "寅", en: "Yin", "pt-BR": "Yin" },
  卯: { "zh-CN": "卯", "zh-TW": "卯", en: "Mao", "pt-BR": "Mao" },
  辰: { "zh-CN": "辰", "zh-TW": "辰", en: "Chen", "pt-BR": "Chen" },
  巳: { "zh-CN": "巳", "zh-TW": "巳", en: "Si", "pt-BR": "Si" },
  午: { "zh-CN": "午", "zh-TW": "午", en: "Wu", "pt-BR": "Wu" },
  未: { "zh-CN": "未", "zh-TW": "未", en: "Wei", "pt-BR": "Wei" },
  申: { "zh-CN": "申", "zh-TW": "申", en: "Shen", "pt-BR": "Shen" },
  酉: { "zh-CN": "酉", "zh-TW": "酉", en: "You", "pt-BR": "You" },
  戌: { "zh-CN": "戌", "zh-TW": "戌", en: "Xu", "pt-BR": "Xu" },
  亥: { "zh-CN": "亥", "zh-TW": "亥", en: "Hai", "pt-BR": "Hai" },

  /* 性别 */
  男命: { "zh-CN": "男命", "zh-TW": "男命", en: "Male", "pt-BR": "Masculino" },
  女命: { "zh-CN": "女命", "zh-TW": "女命", en: "Female", "pt-BR": "Feminino" },
};

const termFallback: Record<string, string> = {};
for (const [key, map] of Object.entries(termData)) {
  termFallback[key] = map["zh-CN"];
}

export { termFiles, termData, termFallback };
