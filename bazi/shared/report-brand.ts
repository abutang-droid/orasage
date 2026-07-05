/**
 * 报告正文品牌用语：避免「算法依据」等程序化表述，统一为 Orasage。
 */
export function sanitizeReportBrandText(text: string): string {
  return text
    .replace(/演算法依據/g, 'Orasage')
    .replace(/算法依据/g, 'Orasage')
    .replace(/算法推薦/g, 'Orasage')
    .replace(/算法推荐/g, 'Orasage')
    .replace(/\[依据[：:]/g, '[Orasage：')
    .replace(/\[依據[：:]/g, '[Orasage：')
    .replace(/依据[：:]/g, 'Orasage：')
    .replace(/依據[：:]/g, 'Orasage：');
}
