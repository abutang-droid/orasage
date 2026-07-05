export type DailyFortuneQuestion = {
  id: string;
  text: string;
  options: string[];
};

export type DailyFortuneAnswer = {
  questionId: string;
  question: string;
  answer: string;
};

export type DailyFortuneDimension = {
  tag: string;
  text: string;
};

export type DailyFortuneFullReport = {
  work: DailyFortuneDimension;
  love: DailyFortuneDimension;
  career: DailyFortuneDimension;
  wealth: DailyFortuneDimension;
  summary: string;
};

export type DailyFortuneReportPayload = {
  brief: string;
  full: DailyFortuneFullReport;
  llm: boolean;
};

export type DailyFortuneRecordDto = {
  id: string;
  dateKey: string;
  cardId: number | null;
  cardName: string | null;
  orientation: string | null;
  qaAnswers: DailyFortuneAnswer[] | null;
  briefText: string | null;
  fullReport: DailyFortuneFullReport | null;
  accessSource: string;
  createdAt: string;
};
