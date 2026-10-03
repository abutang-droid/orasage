/** Control size contract — only these three sizes are allowed in product UI */
export type OrasageControlSize = 'sm' | 'md' | 'lg';

export const CONTROL_HEIGHT_PX: Record<OrasageControlSize, number> = {
  sm: 36,
  md: 44,
  lg: 48,
};

export const ORASAGE_COLORS = {
  background: '#fafaf8',
  surface: '#ffffff',
  primary: '#171717',
  secondary: '#6b7280',
  muted: '#a1a1aa',
  border: '#e7e5e4',
  cinnabar: '#a63f33',
  vibe: '#c96442',
  /** @deprecated 壳层无金色；保留别名指向深灰以免旧引用报错 */
  gold: '#6b7280',
  goldLight: '#a1a1aa',
} as const;
