export type SingleCardQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type SingleCardAnswer = {
  questionId: string;
  question: string;
  answer: string;
};

export type SingleCardStoredCard = {
  cardId: number;
  cardName: string;
  cardNameEn: string;
  orientation: '正位' | '逆位';
  element: string;
};

/** 定命切片：简洁行动指引 */
export type DestinySliceGuidancePayload = {
  action: string;
  insight: string;
  llm: boolean;
};

/** @deprecated 旧版是/否结论 */
export type SingleCardVerdictKind = 'yes' | 'no' | 'lean_yes' | 'lean_no' | 'unclear';

export type SingleCardVerdictPayload = {
  verdict: SingleCardVerdictKind;
  headline: string;
  explanation: string;
  guidance: string;
  llm: boolean;
};

/** @deprecated 旧版字面释义 */
export type SingleCardLegacyBriefPayload = {
  text: string;
  literal: true;
  llm: boolean;
};

export type SingleCardBriefPayload =
  | DestinySliceGuidancePayload
  | SingleCardVerdictPayload
  | SingleCardLegacyBriefPayload;

export function isDestinySliceGuidance(
  brief: SingleCardBriefPayload | null | undefined,
): brief is DestinySliceGuidancePayload {
  return brief != null && 'action' in brief && typeof brief.action === 'string';
}

export function isSingleCardVerdict(
  brief: SingleCardBriefPayload | null | undefined,
): brief is SingleCardVerdictPayload {
  return brief != null && 'verdict' in brief;
}

export type SingleCardFullReport = {
  cards: Array<{ interpretation: string; mantra: string }>;
  synthesis: string;
  suggestions: string[];
  affirmation: string;
  llm: boolean;
};

export type SingleCardRecordDto = {
  id: string;
  question: string;
  qaAnswers: SingleCardAnswer[] | null;
  card: SingleCardStoredCard;
  briefText: SingleCardBriefPayload | null;
  fullReport: SingleCardFullReport | null;
  paidTier: string | null;
  orderNo: string | null;
  readingSyncId: string | null;
  createdAt: string;
};
