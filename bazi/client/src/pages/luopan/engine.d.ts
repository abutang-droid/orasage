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
  hooks?: { onGo?: (state: LuopanDialState) => void },
): {
  getState: () => LuopanDialState;
  destroy: () => void;
};
