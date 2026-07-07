/**
 * 固定命例 — 用于 eval 快照与回归对比（不依赖真实用户数据）。
 */
export const EVAL_FIXTURES = [
  {
    id: '1955-03-01-male',
    birthInfo: { year: 1955, month: 3, day: 1, hour: 0, gender: 'male' as const },
    chatHints: ['今年事业如何？', '感情婚姻怎么样？'],
  },
  {
    id: '1990-07-15-female',
    birthInfo: { year: 1990, month: 7, day: 15, hour: 6, gender: 'female' as const },
    chatHints: ['财运如何', '健康要注意什么'],
  },
  {
    id: '2008-12-20-male-minor',
    birthInfo: { year: 2008, month: 12, day: 20, hour: 4, gender: 'male' as const },
    chatHints: ['学业方向'],
    minorMode: true,
  },
] as const;
