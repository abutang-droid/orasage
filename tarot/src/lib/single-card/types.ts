export type SingleCardStoredCard = {
  cardId: number;
  cardName: string;
  cardNameEn: string;
  orientation: '正位' | '逆位';
  element: string;
};

export type SingleCardBriefPayload = {
  text: string;
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
  card: SingleCardStoredCard;
  briefText: SingleCardBriefPayload | null;
  fullReport: SingleCardFullReport | null;
  paidTier: string | null;
  orderNo: string | null;
  readingSyncId: string | null;
  createdAt: string;
};
