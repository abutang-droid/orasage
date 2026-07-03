/**
 * OraSage DS v1.1 (Revised) — monochrome theme tokens for 八字应用
 */

/** 主强调色（黑） */
export const GOLD = 'var(--os-color-mono-black)';
export const GOLD_LIGHT = 'var(--os-color-mono-gray-deep)';
export const GOLD_FAINT = 'var(--os-color-mono-gray-light)';
export const GOLD_GHOST = 'rgb(var(--os-rgb-mono-gray-light) / 0.45)';
export const GOLD_DIM = 'rgb(var(--os-rgb-mono-gray-deep) / 0.85)';

export const PRIMARY = 'var(--orasage-brand-primary)';
export const PRIMARY_HOVER = 'var(--orasage-brand-primary-hover)';

export const HEADING = 'var(--orasage-text-primary)';
export const BODY_CLR = 'var(--orasage-text-secondary)';
export const MUTED_CLR = 'var(--orasage-text-muted)';

export const BG_PAGE = 'var(--orasage-background)';
export const BG_CARD = 'var(--orasage-surface)';
export const BORDER_CLR = 'var(--orasage-border)';

/** 四柱深色锚点 — 保留对比度 */
export const INK_DEEP = 'var(--os-color-mono-black)';

export const SERIF_F = "var(--orasage-font-serif, 'Source Han Serif SC', 'Noto Serif SC', serif)";
export const SANS_F = "var(--orasage-font-sans, 'Inter', 'PingFang SC', sans-serif)";

export const CARD_SHADOW = 'var(--os-shadow-surface-1)';
export const CARD_BORDER = 'var(--orasage-border)';

/** 图表 / 分隔 */
export const TRACK_BG = 'rgb(var(--os-rgb-mono-black) / 0.06)';
export const DIVIDER_SUBTLE = 'rgb(var(--os-rgb-mono-black) / 0.08)';
export const CHART_GRID = 'rgb(var(--os-rgb-mono-gray-light) / 0.8)';
export const CHART_FILL = 'rgb(var(--os-rgb-mono-black) / 0.1)';
export const CHART_STROKE = 'rgb(var(--os-rgb-mono-black) / 0.75)';
export const CHART_FILL_ALT = 'rgb(var(--os-rgb-mono-gray-deep) / 0.12)';
export const CHART_STROKE_ALT = 'rgb(var(--os-rgb-mono-gray-deep) / 0.55)';

export const TEXT_SUBTLE = 'var(--os-color-mono-gray-deep)';
export const TEXT_FAINT = 'var(--os-color-mono-gray-mid)';

export const CARD_GRADIENT = `linear-gradient(180deg, rgb(var(--os-rgb-mono-bg)) 0%, ${BG_CARD} 100%)`;
export const CARD_GRADIENT_SOFT = `linear-gradient(135deg, rgb(var(--os-rgb-mono-bg)) 0%, ${BG_CARD} 100%)`;

export const GOLD_GHOST_LEGACY = GOLD_GHOST;
