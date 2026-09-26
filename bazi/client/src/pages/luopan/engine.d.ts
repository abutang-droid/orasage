import type { LuopanSpeechFields } from './speechParse';

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

export type LuopanVoicePayload = {
  transcript: string;
  audio?: Blob | null;
};

export function initLuopan(
  root: ParentNode,
  hooks?: {
    onGo?: (state: LuopanDialState) => void;
    onTranscript?: (text: string) => void;
    onVoice?: (payload: LuopanVoicePayload) => Promise<LuopanSpeechFields | null | void>;
    preferAudio?: () => boolean;
  },
): {
  getState: () => LuopanDialState;
  applyTranscript: (text: string) => void;
  applyParsed: (fields: LuopanSpeechFields, heard?: string) => void;
  destroy: () => void;
};
