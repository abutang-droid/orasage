/**
 * 共振定制：类型与常量（客户端组件也会引用，禁止 import 服务端 env）
 * 服务端数据获取见 ./diy-server.ts
 */

export { DIY_ORDER_SKU } from '../../../shared/shop-diy/order-context';

export type DiyBeadType = 'crystal' | 'spacer' | 'disc';

export type DiyBead = {
  code: string;
  name: string;
  element: string | null;
  material: string;
  type: DiyBeadType;
  diameterMm: number;
  thicknessMm: number | null;
  /** 占串长 mm（隔片=厚度，其余=直径） */
  lengthMm: number;
  priceCents: number;
  priceCentsUsd: number | null;
  imageUrl: string | null;
  colors: string | null;
  stock: number;
  sortOrder: number;
};

export type DiyConfig = {
  lengthCorrectionMm: number;
  minOrderCents: number;
  fitToleranceMm: number;
  wristEaseMm: number;
};

export type DiyCatalog = {
  beads: DiyBead[];
  config: DiyConfig;
};

export const FALLBACK_DIY_CONFIG: DiyConfig = {
  lengthCorrectionMm: 3,
  minOrderCents: 9900,
  fitToleranceMm: 8,
  wristEaseMm: 10,
};

/** 商城水晶 SKU → 珠子材质前缀（PDP「定制手链」预填基底） */
export const PRODUCT_SKU_TO_BEAD_MATERIAL: Record<string, string> = {
  'crystal-metal': 'clear',
  'crystal-wood': 'phantom',
  'crystal-fire': 'carnelian',
  'crystal-earth': 'citrine',
  'crystal-water': 'obsidian',
};

/** 五行 → 主珠材质（八字推荐） */
export const ELEMENT_TO_MAIN_MATERIAL: Record<string, string> = {
  金: 'clear',
  木: 'phantom',
  水: 'obsidian',
  火: 'carnelian',
  土: 'citrine',
};

/** 五行相生：生 X 的辅珠材质 */
export const ELEMENT_TO_FEED_MATERIAL: Record<string, string> = {
  金: 'citrine',
  木: 'obsidian',
  水: 'clear',
  火: 'phantom',
  土: 'carnelian',
};
