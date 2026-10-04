/**
 * 报告正文品牌用语：避免「算法依据」等程序化表述。
 * 中文源文统一署名「海棠未眠」（双品牌主名）；不含汉字的片段不改。
 */
import { ZH_PRIMARY_BRAND } from "./site-brand.ts";

export function sanitizeReportBrandText(text: string): string {
  const brand = ZH_PRIMARY_BRAND;
  return text
    .replace(/演算法依據/g, brand)
    .replace(/算法依据/g, brand)
    .replace(/算法推薦/g, brand)
    .replace(/算法推荐/g, brand)
    .replace(/\[依据[：:]/g, `[${brand}：`)
    .replace(/\[依據[：:]/g, `[${brand}：`)
    .replace(/依据[：:]/g, `${brand}：`)
    .replace(/依據[：:]/g, `${brand}：`);
}
