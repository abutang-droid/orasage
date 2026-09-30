/** Control size contract — only these three sizes are allowed in product UI */
export type OrasageControlSize = 'sm' | 'md' | 'lg';

export const CONTROL_HEIGHT_PX: Record<OrasageControlSize, number> = {
  sm: 36,
  md: 44,
  lg: 48,
};

export const ORASAGE_COLORS = {
  background: '#faf9f5',
  surface: '#ffffff',
  primary: '#3d3929',
  secondary: '#6e6d68',
  muted: '#9b988c',
  border: '#dad9d4',
  gold: '#c96442',
  goldLight: '#e0a892',
  brand: '#c96442',
  cream: '#faf9f5',
  creamCard: '#f5f4ef',
} as const;
