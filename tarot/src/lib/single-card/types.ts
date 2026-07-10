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

/** 免费层：韦特牌面字面释义（非个性化简读） */
export type SingleCardBriefPayload = {
  text: string;
  literal: true;
  llm: boolean;
};

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
