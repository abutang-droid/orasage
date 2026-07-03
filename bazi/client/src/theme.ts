/**
 * OraSage 主题常量 — 统一设计令牌（极简克制版）
 *
 * 浅色纸感底色 · 鎏金点睛 · 四柱区保留墨玉视觉锚点
 */

// ─── 颜色 ──────────────────────────────────────────────────────

/** 品牌金 */
export const GOLD = 'var(--orasage-brand-gold)';

/** 亮金高亮 */
export const GOLD_LIGHT = 'var(--orasage-gold-light)';

/** 淡化金（分隔线/边框） */
export const GOLD_FAINT = 'var(--orasage-gold-border)';

/** 极淡金背景 */
export const GOLD_GHOST = 'var(--orasage-gold-pale)';

export const PRIMARY = 'var(--orasage-brand-primary)';
export const PRIMARY_HOVER = 'var(--orasage-brand-primary-hover)';

/** 标题色 */
export const HEADING = 'var(--orasage-text-primary)';

/** 正文色 */
export const BODY_CLR = 'var(--orasage-text-secondary)';

/** 弱化文字 */
export const MUTED_CLR = 'var(--orasage-text-muted)';

/** 页面底色 */
export const BG_PAGE = 'var(--orasage-background)';

/** 卡片背景 */
export const BG_CARD = 'var(--orasage-surface)';

/** 四柱等深色视觉锚点（保留对比） */
export const INK_DEEP = 'rgb(var(--os-rgb-ink-950))';

/** 边框 */
export const BORDER_CLR = 'var(--orasage-border)';

// ─── 字体 ──────────────────────────────────────────────────────

export const SERIF_F = "'Noto Serif SC', 'Source Han Serif SC', 'Songti SC', serif";

export const SANS_F = "'Noto Sans SC', 'Inter', 'PingFang SC', sans-serif";

// ─── 阴影 ──────────────────────────────────────────────────────

export const CARD_SHADOW = 'var(--os-shadow-surface-1)';
export const CARD_BORDER = 'var(--orasage-border)';

// Legacy aliases used in components
export const GOLD_DIM = BODY_CLR;
export const GOLD_GHOST_LEGACY = GOLD_GHOST;
