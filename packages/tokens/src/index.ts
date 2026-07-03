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
  muted: '#9ca3af',
  border: '#e7e5e4',
  gold: '#b8943f',
  goldLight: '#d4b86a',
} as const;
