import {
  ANSWER_TOPIC_HINTS,
  READING_TOPICS,
  TOPIC_KEYWORDS,
  type ReadingTopic,
} from './topics';

export type TopicClassification = {
  topic: ReadingTopic;
  confidence: number;
  matchedKeywords: string[];
};

function scoreTopic(text: string, topic: ReadingTopic): { score: number; matched: string[] } {
  const keywords = TOPIC_KEYWORDS[topic];
  const lower = text.toLowerCase();
  const matched: string[] = [];
  let score = 0;
  for (const kw of keywords) {
    if (lower.includes(kw.toLowerCase())) {
      matched.push(kw);
      score += kw.length >= 4 ? 2 : 1;
    }
  }
  return { score, matched };
}

function scoreFromAnswers(answers: Array<{ answer: string }>): Partial<Record<ReadingTopic, number>> {
  const scores: Partial<Record<ReadingTopic, number>> = {};
  for (const a of answers) {
    const hint = ANSWER_TOPIC_HINTS[a.answer.trim()];
    if (hint) scores[hint] = (scores[hint] ?? 0) + 3;
    for (const topic of READING_TOPICS) {
      const { score } = scoreTopic(a.answer, topic);
      if (score > 0) scores[topic] = (scores[topic] ?? 0) + score;
    }
  }
  return scores;
}

/**
 * 根据用户问题与引导问答判断主题（规则层，无 LLM）
 */
export function classifyReadingTopic(input: {
  question?: string;
  answers?: Array<{ answer: string; questionId?: string }>;
}): TopicClassification {
  const { question = '', answers = [] } = input;
  const corpus = [question, ...answers.map((a) => a.answer)].join(' ');

  const aggregate: Partial<Record<ReadingTopic, { score: number; matched: string[] }>> = {};

  for (const topic of READING_TOPICS) {
    if (topic === 'general') continue;
    const { score, matched } = scoreTopic(corpus, topic);
    if (score > 0) aggregate[topic] = { score, matched };
  }

  const answerScores = scoreFromAnswers(answers);
  for (const [topic, bonus] of Object.entries(answerScores) as [ReadingTopic, number][]) {
    const prev = aggregate[topic];
    if (prev) prev.score += bonus;
    else aggregate[topic] = { score: bonus, matched: [] };
  }

  const ranked = Object.entries(aggregate)
    .filter(([, v]) => v.score > 0)
    .sort((a, b) => b[1].score - a[1].score);

  if (ranked.length === 0) {
    return { topic: 'general', confidence: 0.3, matchedKeywords: [] };
  }

  const [bestTopic, best] = ranked[0] as [ReadingTopic, { score: number; matched: string[] }];
  const total = ranked.reduce((s, [, v]) => s + v.score, 0);
  return {
    topic: bestTopic,
    confidence: Math.min(0.95, best.score / Math.max(total, 1)),
    matchedKeywords: best.matched,
  };
}

export { type ReadingTopic, TOPIC_LABELS } from './topics';
