/** Strip AI/meta wording from user-facing tarot copy. */

const REPLACEMENTS: Array<[RegExp, string]> = [
  [/作为\s*AI[助辅]?/gi, ''],
  [/作为人工智能/g, ''],
  [/我是\s*AI/gi, ''],
  [/我是人工智能/g, ''],
  [/语言模型/g, ''],
  [/大语言模型/g, ''],
  [/机器学习模型/g, ''],
  [/\bAI\b/g, ''],
  [/\bLLM\b/g, ''],
  [/Artificial Intelligence/gi, ''],
  [/language model/gi, ''],
  [/As an AI/gi, ''],
  [/I'm an AI/gi, 'I'],
];

export function sanitizeTarotReaderText(text: string): string {
  let out = text.trim();
  for (const [pattern, replacement] of REPLACEMENTS) {
    out = out.replace(pattern, replacement);
  }
  return out.replace(/\s{2,}/g, ' ').trim();
}

export function sanitizeTarotFullReport<T extends {
  cards: Array<{ interpretation: string; mantra: string }>;
  synthesis: string;
  suggestions: string[];
  affirmation: string;
}>(report: T): T {
  return {
    ...report,
    cards: report.cards.map((c) => ({
      interpretation: sanitizeTarotReaderText(c.interpretation),
      mantra: sanitizeTarotReaderText(c.mantra),
    })),
    synthesis: sanitizeTarotReaderText(report.synthesis),
    suggestions: report.suggestions.map((s) => sanitizeTarotReaderText(s)),
    affirmation: sanitizeTarotReaderText(report.affirmation),
  };
}
