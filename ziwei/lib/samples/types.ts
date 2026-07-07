import type { BirthInfo } from '@/lib/ziwei/types';

/** 样本库 13 个主题（与 jsonl.gz 内 topics 字段一致） */
export type SampleTopicKey =
  | 'overview'
  | 'personality'
  | 'love'
  | 'career'
  | 'wealth'
  | 'health'
  | 'family'
  | 'children'
  | 'move'
  | 'friends'
  | 'home'
  | 'spirit'
  | 'parents';

export type SampleTopics = Record<SampleTopicKey, string>;

export interface SampleBirthInfo {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
}

export interface SampleRecord {
  birthInfo: SampleBirthInfo;
  topics: SampleTopics;
  system?: string;
}

export interface SampleLookupKey {
  year: number;
  month: number;
  day: number;
  hour: number;
  gender: 'male' | 'female';
}

export function birthInfoToLookupKey(info: BirthInfo): SampleLookupKey {
  return {
    year: info.year,
    month: info.month,
    day: info.day,
    hour: info.hour,
    gender: info.gender,
  };
}
