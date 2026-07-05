/**
 * OraSage Prompt 构建模块
 *
 * 将所有 LLM prompt 构建逻辑集中在此，保持 routers.ts 纯净。
 * parseSections 保留在此因为它是 Markdown 解析工具函数，与 prompt 输出直接相关。
 */

// ─── Markdown 章节解析 ─────────────────────────────────────────────────────

/** 将 Markdown 报告按 ### 标题分割为章节数组 */
export function parseSections(markdown: string): Array<{ title: string; content: string }> {
  const lines = markdown.split("\n");
  const sections: Array<{ title: string; content: string }> = [];
  let currentTitle = "";
  let currentLines: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^###\s+(.+)$/);
    if (headingMatch) {
      if (currentTitle) {
        sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
      }
      currentTitle = headingMatch[1].trim().replace(/[*#]/g, "");
      currentLines = [];
    } else {
      // 跳过分隔线和免责声明行
      if (line.trim() === "---" || line.trim().startsWith("*注：")) continue;
      currentLines.push(line.replace(/\*/g, ""));
    }
  }
  if (currentTitle) {
    sections.push({ title: currentTitle, content: currentLines.join("\n").trim() });
  }
  return sections;
}

// ─── 工具函数 ──────────────────────────────────────────────────────────────

function pick<K extends string>(map: Record<K, string>, lang: string, fallback: K): string {
  return (map as Record<string, string>)[lang] || map[fallback];
}

// ─── 单人八字解读 Prompt ────────────────────────────────────────────────────

export function buildSingleBaziPrompt(data: Record<string, unknown>, lang = "zh-CN"): string {
  const {
    name, gender, birthStr, riZhu, strength, favorable, unfavorable,
    wuXing, daYun, shensha, shiShen, birthCity, trueSolarNote,
    year, month, day, hour,
  } = data as Record<string, unknown>;

  const genderStr = gender === "male" ? "男" : "女";
  const wxObj = wuXing as Record<string, number> | undefined;
  const wxStr = wxObj ? Object.entries(wxObj).map(([k, v]) => k + v).join("、") : "";
  const favStr = Array.isArray(favorable) ? (favorable as string[]).join("、") : "";
  const unfavStr = Array.isArray(unfavorable) ? (unfavorable as string[]).join("、") : "";
  const pillars = [year, month, day, hour] as Array<{ gan: string; zhi: string; naYin?: string } | undefined>;
  const pillarLabels = ["年柱", "月柱", "日柱", "时柱"];
  const pillarStr = pillars.map((p, i) => p ? pillarLabels[i] + "：" + p.gan + p.zhi + "（" + (p.naYin ?? "") + "）" : "").filter(Boolean).join("，");
  const dyArr = Array.isArray(daYun) ? (daYun as Array<{ age: number; ganzhi: string; startYear: number }>) : [];
  const dyStr = dyArr.slice(0, 6).map(d => d.age + "岁起 " + d.ganzhi + "（" + d.startYear + "年）").join("；");
  const ssObj = shensha as Record<string, string[]> | undefined;
  const ssStr = ssObj ? Object.entries(ssObj).filter(([, v]) => v.length > 0).map(([k, v]) => k + "：" + v.join("、")).join("；") : "";
  const stObj = shiShen as Record<string, string> | undefined;
  const stStr = stObj ? Object.entries(stObj).map(([k, v]) => k + "→" + v).join("、") : "";

  const birthNote = birthCity ? "，" + birthCity : "";
  const solarNote = trueSolarNote ? "（" + trueSolarNote + "）" : "";

  const systemPrompt: Record<string, string> = {
    "zh-CN": "你是一位铁口直断派八字命理顾问，名为 OraSage。严格按照《铁口直断》手册的 4 层过滤 + 裁决引擎进行分析，每句结论须注明 OraSage 依据（正文中写「OraSage」或「[OraSage：…]」，不要使用「算法依据」）。输出 7 章节的完整命理报告。当前年份是 2026 年。\n\n报告的每个章节必须用简体中文撰寫，不要使用英文或其他语言。\n\n",
    "zh-TW": "你是一位鐵口直斷派八字命理顧問，名為 OraSage。嚴格按照《鐵口直斷》手冊的 4 層過濾 + 裁決引擎進行分析，每句結論須注明 OraSage 依據（正文中寫「OraSage」或「[OraSage：…]」，不要使用「演算法依據」）。輸出 7 章節的完整命理報告。當前年份是 2026 年。\n\n報告的每個章節必須用繁體中文撰寫，不要使用英文或其他語言。\n\n",
    en: "You are a BaZi consultant named OraSage, Tie Kou Zhi Duan school. Follow 4-layer filtering + verdict engine. Every conclusion should cite OraSage basis (use 'OraSage' in text, not 'algorithm basis'). Output 7-chapter report. Current year is 2026.\n\nEvery single chapter of this report MUST be written entirely in English. Even though the birth data contains Chinese characters, you must write the analysis and narrative in English. Do not write any part of the report in Chinese.\n\n",
    "pt-BR": "Você é um consultor BaZi chamado OraSage, escola Tie Kou Zhi Duan. Siga 4 camadas de filtragem + mecanismo de veredito. Cada conclusão deve citar base OraSage (use 'OraSage' no texto). Gere relatório de 7 capítulos. Ano atual é 2026.\n\nCada capítulo deste relatório deve ser escrito inteiramente em Português (Brasil). Embora os dados de nascimento contenham caracteres chineses, você deve escrever a análise e a narrativa em Português. Não escreva nenhuma parte do relatório em Chinês.\n\n",
  };

  const dataHeader: Record<string, string> = {
    "zh-CN": "的排盘数据", "zh-TW": "的排盤數據",
    en: " - Birth Data", "pt-BR": " - Dados de Nascimento",
  };

  const labels: Record<string, Record<string, string>> = {
    birth:  { "zh-CN": "出生", "zh-TW": "出生", en: "Birth", "pt-BR": "Nascimento" },
    pillars:{ "zh-CN": "四柱", "zh-TW": "四柱", en: "Four Pillars", "pt-BR": "Quatro Pilares" },
    riZhu:  { "zh-CN": "日柱", "zh-TW": "日柱", en: "Day Master", "pt-BR": "Day Master" },
    wuXing: { "zh-CN": "五行", "zh-TW": "五行", en: "WuXing", "pt-BR": "WuXing" },
    fav:    { "zh-CN": "喜用神", "zh-TW": "喜用神", en: "Favorable", "pt-BR": "Favorável" },
    unfav:  { "zh-CN": "忌神", "zh-TW": "忌神", en: "Unfavorable", "pt-BR": "Desfavorável" },
    shiShen:{ "zh-CN": "十神", "zh-TW": "十神", en: "10 Spirits", "pt-BR": "10 Espíritos" },
    shenSha:{ "zh-CN": "神煞", "zh-TW": "神煞", en: "Gods & Demons", "pt-BR": "Deuses & Demônios" },
    daYun:  { "zh-CN": "大运", "zh-TW": "大運", en: "DaYun", "pt-BR": "DaYun" },
  };

  const sections: Record<string, string> = {
    "zh-CN": "## 报告结构（7 章节，用 ### 分隔）\n\n### 命盘总览\n综合四层分析：日主能量、格局类型、季节调候、原局冲合。\n\n### 性格与天赋\n格局+调候解释性格，每句话标注[OraSage：xxx]。\n\n### 事业与财富\n财星（现金流）、官杀（压力/市场）、印星（平台/背书）。\n\n### 感情与关系\n夫妻宫（日支）+ 感情星 + 合冲判断。\n\n### 健康与能量管理\n五行偏颇 + 季节熵值。\n\n### 大运流年推演\n岁运并临/天克地冲 + 死锁点判定。\n\n### 开运建议\n方位、颜色、日常行为对冲方案。\n\n---\n注：本报告由 OraSage 生成，仅供参考。",
    "zh-TW": "## 報告結構（7 章節，用 ### 分隔）\n\n### 命盤總覽\n綜合四層分析：日主能量、格局類型、季節調候、原局沖合。\n\n### 性格與天賦\n格局+調候解釋性格。\n\n### 事業與財富\n財星（現金流）、官殺（壓力/市場）、印星（平台/背書）。\n\n### 感情與關係\n夫妻宮（日支）+ 感情星 + 合沖判斷。\n\n### 健康與能量管理\n五行偏頗 + 季節熵值。\n\n### 大運流年推演\n歲運並臨/天剋地沖 + 死鎖點判定。\n\n### 開運建議\n方位、顏色、日常行為。\n\n---\n註：本報告由 OraSage 生成，僅供參考。",
    en: "## Report Structure (7 chapters, use ###)\n\n### 1. Destiny Overview\n4-layer analysis: Day Master energy, Pattern type, seasonal climate, original chart conflicts.\n\n### 2. Character & Talents\nPattern + climate explains personality. Mark [Basis: xxx].\n\n### 3. Career & Wealth\nWealth Star (cash flow), Officer Star (pressure), Seal Star (platform).\n\n### 4. Relationships & Love\nSpouse Palace + Relationship Stars + Combination/Clash.\n\n### 5. Health & Energy\nWuXing imbalance + seasonal entropy.\n\n### 6. DaYun & Yearly Forecast\nYear-Destiny conjunction, Heaven/Earth Clash threshold + Deadlock.\n\n### 7. Lucky Tips\nDirections, colors, daily habits remedies.\n\n---\nNote: By OraSage. For reference only.",
    "pt-BR": "## Estrutura do Relatório (7 capítulos, use ###)\n\n### 1. Visão Geral\nAnálise de 4 camadas: energia Day Master, tipo de Padrão, clima sazonal, conflitos do mapa.\n\n### 2. Caráter & Talentos\nPadrão + clima explica personalidade. Marque [Base: xxx].\n\n### 3. Carreira & Riqueza\nEstrela da Riqueza (fluxo de caixa), Oficial (pressão), Selo (plataforma).\n\n### 4. Relacionamentos\nPalácio do Cônjuge + Estrelas + Combinação/Conflito.\n\n### 5. Saúde & Energia\nDesequilíbrio WuXing + entropia sazonal.\n\n### 6. Previsão Anual\nConjunção Ano-Destino, Conflito Celeste/Terrestre + Deadlock.\n\n### 7. Dicas da Sorte\nDireções, cores, hábitos.\n\n---\nNota: Por OraSage. Apenas para referência.",
  };

  let r = pick(systemPrompt, lang, "zh-CN");
  r += "## " + name + "（" + genderStr + "）" + pick(dataHeader, lang, "zh-CN") + "\n\n";
  r += "- **" + pick(labels.birth, lang, "zh-CN") + "**：" + birthStr + birthNote + solarNote + "\n";
  r += "- **" + pick(labels.pillars, lang, "zh-CN") + "**：" + pillarStr + "\n";
  r += "- **" + pick(labels.riZhu, lang, "zh-CN") + "**：" + riZhu + "，日主" + strength + "\n";
  r += "- **" + pick(labels.wuXing, lang, "zh-CN") + "**：" + wxStr + "\n";
  r += "- **" + pick(labels.fav, lang, "zh-CN") + "**：" + favStr + "　**" + pick(labels.unfav, lang, "zh-CN") + "**：" + unfavStr + "\n";
  r += "- **" + pick(labels.shiShen, lang, "zh-CN") + "**：" + stStr + "\n";
  r += "- **" + pick(labels.shenSha, lang, "zh-CN") + "**：" + ssStr + "\n";
  r += "- **" + pick(labels.daYun, lang, "zh-CN") + "**：" + dyStr + "\n\n";
  r += sections[lang] || sections["zh-CN"];
  return r;
}

// ─── 双人合盘解读 Prompt ─────────────────────────────────────────────────────

export function buildDoubleBaziPrompt(data: Record<string, unknown>): string {
  const { person1, person2, score, rating, scoreDetails } = data as {
    person1: Record<string, unknown>;
    person2: Record<string, unknown>;
    score: number;
    rating: string;
    scoreDetails: Array<{ label: string; score: number; detail: string }>;
  };

  const p1 = person1;
  const p2 = person2;
  const detailStr = (scoreDetails || [])
    .map(d => `${d.label}（${d.score}分）：${d.detail}`)
    .join("\n- ");

  return `你是一位融合传统命理与现代心理学的东方神秘学顾问，擅长将合盘分析转化为温暖、有洞察力的关系指引。

请根据以下双人合盘数据，撰写一份**个性化合盘解读报告**。

## 合盘数据

**${p1.name}（${p1.gender === "male" ? "男" : "女"}）**
- 日柱：${p1.riZhu}，日主强弱：${p1.strength}
- 五行：${p1.wuXing ? Object.entries(p1.wuXing as Record<string, number>).map(([k, v]) => `${k}${v}`).join("、") : ""}
- 喜用神：${Array.isArray(p1.favorable) ? (p1.favorable as string[]).join("、") : ""}

**${p2.name}（${p2.gender === "male" ? "男" : "女"}）**
- 日柱：${p2.riZhu}，日主强弱：${p2.strength}
- 五行：${p2.wuXing ? Object.entries(p2.wuXing as Record<string, number>).map(([k, v]) => `${k}${v}`).join("、") : ""}
- 喜用神：${Array.isArray(p2.favorable) ? (p2.favorable as string[]).join("、") : ""}

**合盘总分**：${score}分（${rating}）

**各维度评分**：
- ${detailStr}

## 报告要求

请按以下结构撰写，语言温暖、有洞察力，从命理与心理学双重视角解读这段关系：

### 缘分总评
用 2-3 段话描述两人的整体缘分质量，命盘的契合点与互补之处。

### 五行与能量互动
分析两人五行如何相互影响，谁给谁带来能量，谁在关系中更需要被滋养。

### 性格互动模式
从日柱、十神解读两人的性格碰撞，相处中的默契与摩擦点。

### 感情与婚姻展望
结合合盘评分，分析这段关系的长期发展潜力、需要共同努力的方向。

### 关系中的成长功课
每个人在这段关系中能学到什么，如何让彼此都成为更好的人。

### 给两人的建议
3 条具体、可操作的相处建议，帮助两人扬长避短、深化连接。

### 一句话总结
用一句富有诗意的话，概括这段缘分的核心主题。

---
*注：本报告结合传统命理与现代心理学，仅供参考，不构成任何决策依据。*`;
}

// ─── 免费快照解读 Prompt ──────────────────────────────────────────────────

export function buildFreeInsightPrompt(data: Record<string, unknown>, lang = "zh-CN"): string {
  const {
    name, gender, birthStr, riZhu, strength, wuXing, favorable, unfavorable,
    year, month, day, hour, shiShen, shensha
  } = data;

  const genderStr = gender === "male" ? "男" : "女";
  const wxStr = wuXing
    ? Object.entries(wuXing as Record<string, number>).map(([k, v]) => `${k}${v}`).join("、")
    : "";
  const favStr = Array.isArray(favorable) ? (favorable as string[]).join("、") : "";
  const unfavStr = Array.isArray(unfavorable) ? (unfavorable as string[]).join("、") : "";
  const pillars = [year, month, day, hour] as Array<{ gan: string; zhi: string } | undefined>;
  const pillarStr = pillars.map((p) => p ? `${p?.gan || ''}${p?.zhi || ''}` : "").filter(Boolean).join(" ");
  const stObj = shiShen as Record<string, string> | undefined;
  const stStr = stObj ? Object.entries(stObj).map(([k, v]) => `${k}→${v}`).join("、") : "";

  const langHeaders: Record<string, string> = {
    "zh-CN": "你是铁口直断派八字命理顾问。根据排盘数据做两层分析，输出 JSON。当前年份是 2026 年。\n\n",
    "zh-TW": "你是鐵口直斷派八字命理顧問。根據排盤數據做兩層分析，輸出 JSON。當前年份是 2026 年。\n\n",
    en: "You are a Tie Kou Zhi Duan BaZi consultant. Analyze the data in 2 layers and output JSON. Current year is 2026.\n\nAll JSON field values must be written in English.\n\n",
    "pt-BR": "Você é um consultor BaZi Tie Kou Zhi Duan. Analise os dados em 2 camadas e gere JSON. Ano atual é 2026.\n\nTodos os valores dos campos JSON devem ser escritos em Português.\n\n",
  };

  const fieldLabels: Record<string, string> = {
    "zh-CN": "出生", "zh-TW": "出生", en: "Birth", "pt-BR": "Nascimento",
  };
  const fieldPZ: Record<string, string> = {
    "zh-CN": "四柱", "zh-TW": "四柱", en: "Pillars", "pt-BR": "Pilares",
  };
  const fieldStrength: Record<string, string> = {
    "zh-CN": "日主强弱", "zh-TW": "日主強弱", en: "DM Strength", "pt-BR": "Força DM",
  };
  const fieldWX: Record<string, string> = {
    "zh-CN": "五行分布", "zh-TW": "五行分佈", en: "WuXing", "pt-BR": "WuXing",
  };

  const jsonDesc: Record<string, Record<string, string>> = {
    "zh-CN": {
      title: "4字标题，'格局特征+定性'，如'财旺身弱'或'印绶护身'",
      matrix: "20-40字，说明日主强弱+五行喜忌的简要判断，准确描述能量状态",
      pattern: "15-30字，说明是什么格局、成败如何、有无相神（补丁）",
      personality: "25-45字，基于格局和五行解释性格核心特质",
      risk: "20-40字，一句话风险提示，结合流年（2026年）给出关键预警",
      lucky: "幸运色: XX、XX ｜ 幸运方位: XX",
    },
    "zh-TW": {
      title: "4字標題，'格局特徵+定性'，如'財旺身弱'或'印綬護身'",
      matrix: "20-40字，說明日主強弱+五行喜忌的簡要判斷",
      pattern: "15-30字，說明什麼格局、成敗如何、有無相神（補丁）",
      personality: "25-45字，基於格局和五行解釋性格核心特質",
      risk: "20-40字，一句話風險提示，結合流年（2026年）給出關鍵預警",
      lucky: "幸運色: XX、XX ｜ 幸運方位: XX",
    },
    en: {
      title: "4-word title, 'Pattern+Characteristic', e.g. 'Wealth Strong Body Weak'",
      matrix: "20-40 words, Day Master strength + WuXing preference summary",
      pattern: "15-30 words, pattern type, success/fail, supporting element",
      personality: "25-45 words, character core based on pattern and WuXing",
      risk: "20-40 words, one-sentence risk alert based on 2026 yearly analysis",
      lucky: "Lucky Color: XX, XX | Lucky Direction: XX",
    },
    "pt-BR": {
      title: "Título de 4 palavras, 'Padrão+Característica', ex: 'Riqueza Forte Corpo Fraco'",
      matrix: "20-40 palavras, resumo da força do Day Master + preferência WuXing",
      pattern: "15-30 palavras, tipo de padrão, sucesso/falha, elemento de suporte",
      personality: "25-45 palavras, núcleo do caráter baseado no padrão e WuXing",
      risk: "20-40 palavras, alerta de risco de uma frase com base em 2026",
      lucky: "Cor da Sorte: XX, XX | Direção da Sorte: XX",
    },
  };

  const fields = fieldLabels[lang] || fieldLabels["zh-CN"];
  const pz = fieldPZ[lang] || fieldPZ["zh-CN"];
  const st = fieldStrength[lang] || fieldStrength["zh-CN"];
  const wx = fieldWX[lang] || fieldWX["zh-CN"];

  const desc = jsonDesc[lang] || jsonDesc["zh-CN"];

  return (langHeaders[lang] || langHeaders["zh-CN"])
    + `## ${name}（${genderStr}）的排盘\n\n`
    + `- ${fields}：${birthStr}\n`
    + `- ${pz}：${pillarStr}\n`
    + `- 日柱：${riZhu}\n`
    + `- ${st}：${strength}\n`
    + `- ${wx}：${wxStr}\n`
    + `- 喜用神：${favStr}，忌神：${unfavStr}\n`
    + `- 十神：${stStr}\n\n`
    + `## 分析层级\n\n### Layer A — 静态矩阵\n根据日主强弱和五行分布，判断基础能量状态。\n\n### Layer B — 格局定型\n根据月令和透干情况，判断格局类型（财格/官格/印格/食伤格等）及成败。\n\n`
    + `## 输出 JSON\n\n{\n`
    + `  "title": "${desc.title}",\n`
    + `  "matrix": "${desc.matrix}",\n`
    + `  "pattern": "${desc.pattern}",\n`
    + `  "personality": "${desc.personality}",\n`
    + `  "risk": "${desc.risk}",\n`
    + `  "lucky": "${desc.lucky}"\n`
    + `}\n\n只返回 JSON，不要其他文字。`;
}
