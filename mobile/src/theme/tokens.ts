/**
 * OraSage 设计变量 — 同步自 packages/tokens/src/index.ts（主源）。
 * 与 shared/app-shell 的「构建前同步副本」模式一致：改动请先改主源，再同步此处。
 */
export const ORASAGE_COLORS = {
  background: '#fafaf8',
  surface: '#ffffff',
  primary: '#171717',
  secondary: '#6b7280',
  muted: '#9ca3af',
  border: '#e7e5e4',
  gold: '#b8943f',
  goldLight: '#d4b86a',
} as const;

export const CONTROL_HEIGHT = {
  sm: 36,
  md: 44,
  lg: 48,
} as const;
