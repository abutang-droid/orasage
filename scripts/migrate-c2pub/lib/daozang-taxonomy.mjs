/**
 * 道藏「山医命相卜」五术分类映射（脚本侧）。
 *
 * 与 `main/src/lib/daozang-taxonomy.ts`、`cms/src/collections/Pages.ts` 的
 * DAOZANG_CATEGORY_OPTIONS 保持一致，改动需三处同步。
 *
 * - `wpCategoryId`：c2.pub WordPress `doc_category` term id（权威归类来源）
 * - `slugPrefix`：迁移 slug `docs/zh-cn/A_B_C` 的 `A_B` 编号段（兜底规则）
 */

export const DAOZANG_CATEGORIES = [
  { key: 'quanfa', top: 'shan', wpCategoryId: 45, slugPrefix: '1_1' },
  { key: 'zhongyi', top: 'yi', wpCategoryId: 59, slugPrefix: '2_1' },
  { key: 'bazi', top: 'ming', wpCategoryId: 60, slugPrefix: '3_1' },
  { key: 'ziweidoushu', top: 'ming', wpCategoryId: 61, slugPrefix: '3_2' },
  { key: 'qizhengsheyu', top: 'ming', wpCategoryId: 62, slugPrefix: '3_3' },
  { key: 'dixiang', top: 'xiang', wpCategoryId: 63, slugPrefix: '4_1' },
  { key: 'renxiang', top: 'xiang', wpCategoryId: 64, slugPrefix: '4_2' },
  { key: 'xingxiang', top: 'xiang', wpCategoryId: 65, slugPrefix: '4_3' },
  { key: 'yijing', top: 'bu', wpCategoryId: 66, slugPrefix: '5_1' },
  { key: 'liuyao', top: 'bu', wpCategoryId: 67, slugPrefix: '5_2' },
  { key: 'meihuayishu', top: 'bu', wpCategoryId: 68, slugPrefix: '5_3' },
  { key: 'qimendunjia', top: 'bu', wpCategoryId: 69, slugPrefix: '5_4' },
  { key: 'daliuren', top: 'bu', wpCategoryId: 70, slugPrefix: '5_5' },
];

export const CATEGORY_BY_WP_ID = new Map(DAOZANG_CATEGORIES.map((c) => [c.wpCategoryId, c]));
export const CATEGORY_BY_PREFIX = new Map(DAOZANG_CATEGORIES.map((c) => [c.slugPrefix, c]));

/** 从 WP doc_category term id 数组取分类（取第一个可映射的叶子分类） */
export function categoryFromWpTerms(termIds) {
  for (const id of termIds || []) {
    const cat = CATEGORY_BY_WP_ID.get(Number(id));
    if (cat) return cat;
  }
  return null;
}

/** 兜底：从 slug（`docs/zh-cn/3_1_7` 或 WP 原始 `3_1_7`）的编号段推断分类 */
export function categoryFromSlug(slug) {
  const match = String(slug || '').match(/(?:^|\/)(\d+_\d+)_[^/]*$/);
  if (!match) return null;
  return CATEGORY_BY_PREFIX.get(match[1]) || null;
}

/** 类内排序权重：编号段最后一节数字，如 `2_1_27-3` → 27 */
export function sortWeightFromSlug(slug) {
  const match = String(slug || '').match(/(?:^|\/)\d+_\d+_(\d+)/);
  return match ? Number(match[1]) : null;
}
