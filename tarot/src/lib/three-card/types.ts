export type ThreeCardQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type ThreeCardAnswer = {
  questionId: string;
  question: string;
  answer: string;
};

export type ThreeCardStoredCard = {
  position: string;
  positionLabel: string;
  cardId: number;
  cardName: string;
  cardNameEn: string;
  orientation: '正位' | '逆位';
  element: string;
};

export type ThreeCardBriefPayload = {
  perCard: Array<{ position: string; text: string }>;
  synthesis: string;
  llm: boolean;
};

export type ThreeCardFullReport = {
  cards: Array<{ interpretation: string; mantra: string }>;
  synthesis: string;
  suggestions: string[];
  affirmation: string;
  llm: boolean;
};

export type ThreeCardRecordDto = {
  id: string;
  question: string;
  qaAnswers: ThreeCardAnswer[] | null;
  cards: ThreeCardStoredCard[];
  briefText: ThreeCardBriefPayload | null;
  fullReport: ThreeCardFullReport | null;
  paidTier: string | null;
  orderNo: string | null;
  createdAt: string;
};
