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
    wuXing, daYun, shiShen, birthCity, trueSolarNote,
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
  const stObj = shiShen as Record<string, string> | undefined;
  const stStr = stObj ? Object.entries(stObj).map(([k, v]) => k + "→" + v).join("、") : "";

  const birthNote = birthCity ? "，" + birthCity : "";
  const solarNote = trueSolarNote ? "（" + trueSolarNote + "）" : "";

  const systemPrompt: Record<string, string> = {
    "zh-CN": "你是一位八字结构顾问，名为 OraSage。分析必须准确，但面向用户的正文必须遵守术语白话化规范：现象 → 机制 → 术语后移。每句结论可注明 [OraSage：…]，不要使用「算法依据」。输出 7 章节报告。当前年份是 2026 年。\n\n报告的每个章节必须用简体中文撰写。\n\n",
    "zh-TW": "你是一位八字結構顧問，名為 OraSage。正文必須遵守術語白話化規範：現象 → 機制 → 術語後移。輸出 7 章節報告。當前年份是 2026 年。\n\n必須用繁體中文撰寫。\n\n",
    en: "You are a BaZi structure consultant named OraSage. User-facing prose must follow vernacular rules: phenomenon → mechanism → term last. Output a 7-chapter report. Current year is 2026.\n\nWrite every chapter in English. Do not write the narrative in Chinese.\n\n",
    "pt-BR": "Você é um consultor de estrutura BaZi chamado OraSage. Fenômeno → mecanismo → termo no final. Relatório de 7 capítulos. Ano atual: 2026.\n\nEscreva em Português (Brasil).\n\n",
  };

  const dataHeader: Record<string, string> = {
    "zh-CN": "的排盘数据", "zh-TW": "的排盤數據",
    en: " - Birth Data", "pt-BR": " - Dados de Nascimento",
  };

  const labels: Record<string, Record<string, string>> = {
    birth:  { "zh-CN": "出生", "zh-TW": "出生", en: "Birth", "pt-BR": "Nascimento" },
    pillars:{ "zh-CN": "四组时间坐标", "zh-TW": "四組時間座標", en: "Four Pillars", "pt-BR": "Quatro Pilares" },
    riZhu:  { "zh-CN": "代表你的那个字", "zh-TW": "代表你的那個字", en: "Day Master", "pt-BR": "Day Master" },
    wuXing: { "zh-CN": "五行", "zh-TW": "五行", en: "Five Elements", "pt-BR": "Cinco Elementos" },
    fav:    { "zh-CN": "对你最有用的那一项", "zh-TW": "對你最有用的那一項", en: "Favourable Element", "pt-BR": "Elemento favorável" },
    unfav:  { "zh-CN": "最容易让你失衡的那一项", "zh-TW": "最容易讓你失衡的那一項", en: "Unfavourable Element", "pt-BR": "Elemento desfavorável" },
    shiShen:{ "zh-CN": "十神（仅供你写「体系里叫」）", "zh-TW": "十神（僅供你寫「體系裡叫」）", en: "Ten Gods (term-last only)", "pt-BR": "Dez Deuses (só no final)" },
    daYun:  { "zh-CN": "每十年一换的阶段", "zh-TW": "每十年一換的階段", en: "10-year Pillar", "pt-BR": "Pilar de 10 anos" },
  };

  const vernacularRules: Record<string, string> = {
    "zh-CN": `## 写作硬规则（必须遵守）

1. 一对一：身弱只写「支持你的力量少于消耗你的力量」（短标签写「偏耗」）；身强写「偏补」。不得写成身体弱、体质差、命薄。
2. 每段固定顺序：先现象，再机制，最后一句「体系里叫「……」」把术语放在句尾。禁止用术语起句。
3. 术语后移，不删除。删掉术语那一句，读者仍应完全理解。
4. 断言不得升格：只说「在体系里怎么归」，不说「现实里会怎样」。禁止医疗、财务、法律或人生决策建议。
5. 禁用：投资失利、破财、漏财、心脑、疾病、器官、体质、凶煞、血光、刑伤、克夫、有救、开运、转运、贵人（作为承诺）、旺/相/休/囚/死、神煞、纳音、旬空。
6. 用神 → 「对你最有用的那一项」；忌神 → 「最容易让你失衡的那一项」；大运 → 「每十年一换的阶段」；流年 → 「2026 年（丙午）」这种「公历年（干支）」写法。
7. 年份不得写成「2026丙午年」或「火马年」。

`,
    "zh-TW": `## 寫作硬規則（必須遵守）

1. 身弱只寫「支持你的力量少於消耗你的力量」（短標籤「偏耗」）。
2. 每段：現象 → 機制 → 最後一句「體系裡叫「……」」。
3. 禁止醫療、財務、法律建議；禁止凶煞、有救、開運、神煞、納音。
4. 年份寫成「2026 年（丙午）」。

`,
    en: `## Writing rules (mandatory)

1. One term, one gloss. 身弱 / Weak = Drain-heavy ("support is less than drain"). Never "weak body".
2. Each paragraph: phenomenon → mechanism → last sentence "In the system this is called …".
3. Do not escalate system statements into medical, financial, or life-decision claims.
4. Forbidden: disease, organs, investment loss, luck-changing charms, Seven Killings / Hurting Officer in titles.
5. Favourable Element / Unfavourable Element. 10-year Pillar (not "good luck arriving"). Year: "2026 (Bing Wu)".

`,
    "pt-BR": `## Regras de escrita

1. 身弱 = Drain-heavy, nunca "corpo fraco".
2. Fenômeno → mecanismo → "no sistema isso se chama …".
3. Sem conselhos médicos, financeiros ou de sorte.

`,
  };

  const sections: Record<string, string> = {
    "zh-CN": "## 报告结构（7 章节，用 ### 分隔）\n\n### 这套配置在说什么\n代表你的那个字、出生时的节气、支持与消耗哪边更多。先现象再机制，句尾「体系里叫」。\n\n### 性格与手感\n用十神的白话（自然产出 / 带锋芒的产出 / 硬来的压力 / 偏门来的支撑）写性格。保留代价的一面，但写成配置的自然结果，不要写成批评。\n\n### 做事与收获的节奏\n取用、产出、支撑如何分配力气。不要写成「财」「官」起句，更不要给出投资结论。\n\n### 关系里你怎么站\n写你在关系里习惯站的位置（并列、取用、被压、被托），不要承诺会遇到贵人。\n\n### 节奏与注意力\n只写行为层面：分心、同时开太多条线、被带快。禁止器官、疾病、身心诊断。\n\n### 每十年一换的阶段\n写阶段切换带来的节奏变化。禁止「大运来了」「走好运」。\n\n### 顺的方向\n颜色与方位对应「对你最有用的那一项」。必须补一句：它们不代表运势，只是让你在日常里有一个顺的方向。\n\n---\n注：本报告由 OraSage 生成，仅供自我探索参考，不构成医疗、财务、法律或人生决策建议。",
    "zh-TW": "## 報告結構（7 章節，用 ### 分隔）\n\n### 這套配置在說什麼\n\n### 性格與手感\n\n### 做事與收穫的節奏\n\n### 關係裡你怎麼站\n\n### 節奏與注意力\n禁止疾病與器官。\n\n### 每十年一換的階段\n\n### 順的方向\n顏色與方位不代表運勢。\n\n---\n註：僅供自我探索參考，不構成醫療、財務、法律或人生決策建議。",
    en: "## Report Structure (7 chapters, use ###)\n\n### What this chart is saying\nThe character that stands for you, the season of birth, support vs drain. Phenomenon → mechanism → term-last.\n\n### Feel and cost\nUse Ten-God vernacular. Keep the cost, as a result of the configuration, not a judgement.\n\n### Pace of work and gains\nNo investment conclusions.\n\n### How you stand in relation\nNo promised saviours.\n\n### Pace and attention\nBehaviour only — no organs, no disease.\n\n### The stage that changes every ten years\nNot \"good luck arriving\".\n\n### A direction that fits\nColors and directions map to the Favourable Element. They do not mean luck.\n\n---\nNote: By OraSage. For self-inquiry only. Not medical, financial, legal, or life-decision advice.",
    "pt-BR": "## Estrutura (7 capítulos, use ###)\n\n### O que este mapa diz\n\n### Jeito e custo\n\n### Ritmo de trabalho e ganhos\n\n### Como você se posiciona\n\n### Ritmo e atenção\n\n### A etapa que muda a cada dez anos\n\n### Uma direção que cabe\n\n---\nNota: Por OraSage. Apenas referência. Não é conselho médico, financeiro ou jurídico.",
  };

  let r = pick(systemPrompt, lang, "zh-CN");
  r += "## " + name + "（" + genderStr + "）" + pick(dataHeader, lang, "zh-CN") + "\n\n";
  r += "- **" + pick(labels.birth, lang, "zh-CN") + "**：" + birthStr + birthNote + solarNote + "\n";
  r += "- **" + pick(labels.pillars, lang, "zh-CN") + "**：" + pillarStr + "\n";
  r += "- **" + pick(labels.riZhu, lang, "zh-CN") + "**：" + riZhu + "（" + strength + "；面向用户写偏耗/偏补，不要写身弱/身强）\n";
  r += "- **" + pick(labels.wuXing, lang, "zh-CN") + "**：" + wxStr + "\n";
  r += "- **" + pick(labels.fav, lang, "zh-CN") + "**：" + favStr + "　**" + pick(labels.unfav, lang, "zh-CN") + "**：" + unfavStr + "\n";
  r += "- **" + pick(labels.shiShen, lang, "zh-CN") + "**：" + stStr + "\n";
  r += "- **" + pick(labels.daYun, lang, "zh-CN") + "**：" + dyStr + "\n\n";
  r += pick(vernacularRules, lang, "zh-CN");
  r += sections[lang] || sections["zh-CN"];
  return r;
}

// ─── 双人合盘解读 Prompt ─────────────────────────────────────────────────────

export function buildDoubleBaziPrompt(data: Record<string, unknown>, lang = "zh-CN"): string {
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

  const langLine: Record<string, string> = {
    "zh-CN": "请用简体中文撰写全文。",
    "zh-TW": "請用繁體中文撰寫全文。",
    en: "Write the entire report in English.",
    "pt-BR": "Escreva todo o relatório em Português (Brasil).",
  };

  return `${langLine[lang] ?? langLine["zh-CN"]}

你是一位八字结构顾问，名为 OraSage。合盘正文必须遵守术语白话化规范：现象 → 机制 → 术语后移（句尾「体系里叫……」）。

硬规则：
1. 身弱只写「支持你的力量少于消耗你的力量」（短标签「偏耗」）；身强写「偏补」。不得写成身体弱。
2. 用神 → 「对你最有用的那一项」；忌神 → 「最容易让你失衡的那一项」。
3. 禁止医疗、财务、法律建议；禁止投资失利、疾病、器官、有救、开运、神煞、贵人承诺。
4. 术语后移，不删除。

请根据以下双人合盘数据，撰写一份**个性化合盘解读报告**。

## 合盘数据

**${p1.name}（${p1.gender === "male" ? "男" : "女"}）**
- 代表你的那个字：${p1.riZhu}（${p1.strength}；面向用户写偏耗/偏补）
- 五行：${p1.wuXing ? Object.entries(p1.wuXing as Record<string, number>).map(([k, v]) => `${k}${v}`).join("、") : ""}
- 对你最有用的那一项：${Array.isArray(p1.favorable) ? (p1.favorable as string[]).join("、") : ""}

**${p2.name}（${p2.gender === "male" ? "男" : "女"}）**
- 代表你的那个字：${p2.riZhu}（${p2.strength}；面向用户写偏耗/偏补）
- 五行：${p2.wuXing ? Object.entries(p2.wuXing as Record<string, number>).map(([k, v]) => `${k}${v}`).join("、") : ""}
- 对你最有用的那一项：${Array.isArray(p2.favorable) ? (p2.favorable as string[]).join("、") : ""}

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
    year, month, day, hour, shiShen,
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
    "zh-CN": "你是八字结构顾问。根据排盘数据写白话解读，输出 JSON。当前年份是 2026 年。\n\n硬规则：每段现象→机制→句尾「体系里叫」。身弱只写「支持你的力量少于消耗你的力量」或短标签「偏耗」。禁止投资、疾病、器官、有救、开运、神煞。不得写成身体弱。\n\n",
    "zh-TW": "你是八字結構顧問。輸出 JSON。身弱寫「偏耗」。禁止疾病、投資、有救、開運。每段最後一句「體系裡叫」。\n\n",
    en: "You are a BaZi structure consultant. Output JSON. Current year is 2026. Phenomenon → mechanism → term last. Drain-heavy, never weak body. No disease, investment, luck charms.\n\nAll JSON field values must be written in English.\n\n",
    "pt-BR": "Você é um consultor de estrutura BaZi. Gere JSON. Fenômeno → mecanismo → termo no final. Sem doença, investimento ou amuletos.\n\nTodos os valores dos campos JSON devem ser escritos em Português.\n\n",
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
      title: "白话标题，如'你需要的不是继续输出，而是先补回来'。禁止'身弱''财旺'",
      matrix: "现象+机制：代表你的那个字的取象、出生时的节气、支持少于/多于消耗。句尾必须有体系里叫「……」",
      pattern: "这套配置的主要结构用白话写（能输出但需要刹车 / 立得住）。句尾体系里叫",
      personality: "手感与代价。不要批评人格。句尾体系里叫",
      risk: "2026 年（丙午）：机会变多、注意力变散。只写行为，禁止疾病与投资。句尾体系里叫",
      lucky: "幸运色: XX、XX ｜ 幸运方位: XX（并说明对应最有用的五行，不代表运势）",
    },
    "zh-TW": {
      title: "白話標題，禁止「身弱」",
      matrix: "現象+機制，句尾體系裡叫",
      pattern: "主要結構白話，句尾體系裡叫",
      personality: "手感與代價，句尾體系裡叫",
      risk: "2026 年（丙午）只寫注意力與節奏，禁止疾病投資",
      lucky: "幸運色與方位，不代表運勢",
    },
    en: {
      title: "Vernacular title, e.g. 'Refill first, do not keep outputting'. Never 'weak body'",
      matrix: "Phenomenon + mechanism of Day Master and birth season; term last",
      pattern: "Main structure in plain words; this structure holds; term last",
      personality: "Feel and cost, not a judgement; term last",
      risk: "2026 (Bing Wu): more openings, scattered attention. No disease, no investing",
      lucky: "Colors and directions mapped to Favourable Element; they do not mean luck",
    },
    "pt-BR": {
      title: "Título em linguagem comum. Nunca 'corpo fraco'",
      matrix: "Fenômeno + mecanismo; termo no final",
      pattern: "Estrutura principal em linguagem comum",
      personality: "Jeito e custo, sem julgamento",
      risk: "2026 (Bing Wu): mais aberturas, atenção dispersa. Sem doença nem investimento",
      lucky: "Cores e direções; não significam sorte",
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
    + `- 代表你的那个字：${riZhu}\n`
    + `- ${st}：${strength}（面向用户写偏耗/偏补）\n`
    + `- ${wx}：${wxStr}\n`
    + `- 对你最有用的那一项：${favStr}；最容易让你失衡的那一项：${unfavStr}\n`
    + `- 十神（只用于句尾「体系里叫」）：${stStr}\n\n`
    + `## 分析层级\n\n### 现象\n读者能观察到什么（取象、节气、支持与消耗）。\n\n### 机制\n为什么会这样（五行往哪边走）。不要写成现实因果。\n\n### 术语\n句尾「体系里叫「……」」。\n\n`
    + `## 输出 JSON\n\n{\n`
    + `  "title": "${desc.title}",\n`
    + `  "matrix": "${desc.matrix}",\n`
    + `  "pattern": "${desc.pattern}",\n`
    + `  "personality": "${desc.personality}",\n`
    + `  "risk": "${desc.risk}",\n`
    + `  "lucky": "${desc.lucky}"\n`
    + `}\n\n只返回 JSON，不要其他文字。`;
}
