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
  literal?: boolean;
  llm: boolean;
};

import type { ThreeCardFullReport } from './trilogy-types';

export type { ThreeCardFullReport, ThreeCardTrilogyPayload, ThreeCardLegacyFullReport } from './trilogy-types';
export { isThreeCardTrilogy } from './trilogy-types';

export type ThreeCardRecordDto = {
  id: string;
  question: string;
  qaAnswers: ThreeCardAnswer[] | null;
  cards: ThreeCardStoredCard[];
  briefText: ThreeCardBriefPayload | null;
  fullReport: ThreeCardFullReport | null;
  paidTier: string | null;
  orderNo: string | null;
  readingSyncId: string | null;
  createdAt: string;
};
