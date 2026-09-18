export type LuopanDialState = {
  y: number;
  m: number;
  d: number;
  hh: number;
  mi: number;
  sex: '女' | '男' | null;
  calendar: 'solar' | 'lunar';
  lunarYear: number;
  lunarMonth: number;
  lunarDay: number;
  lunarLeap: boolean;
};

export function initLuopan(
  root: ParentNode,
  hooks?: {
    onGo?: (state: LuopanDialState) => void;
    onTranscript?: (text: string) => void;
  },
): {
  getState: () => LuopanDialState;
  applyTranscript: (text: string) => void;
  destroy: () => void;
};
