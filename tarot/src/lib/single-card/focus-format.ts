import type { DestinySliceFocusPayload } from './types';

/** 将 Focus 切片格式化为模块化展示文本 */
export function formatDestinySliceFocusText(payload: DestinySliceFocusPayload): string {
  return [
    '[ 倾向判定 ]',
    `- 核心倾向：${payload.tendency}`,
    `- 能量概率：${payload.probability}`,
    '[ 现状解构 ]',
    payload.deconstruction,
    '[ 破局阈值 ]',
    payload.threshold,
  ].join('\n');
}
