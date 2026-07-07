import type { ZiweiChart } from '@/lib/ziwei/types';
import { getLiuNianSiHua } from '@/lib/ziwei/sihua';

/** 大限 + 流年四化摘要，供 AI 结合本命盘作答 */
export function formatDaXianLiuNianContext(chart: ZiweiChart): string {
  const lines: string[] = ['【运程层次参考（本命 / 大限 / 流年）】'];

  const age = chart.currentAge;
  if (Number.isFinite(age)) {
    lines.push(`虚岁：约 ${age} 岁`);
  }

  const dx = chart.daXians[chart.currentDaXianIndex];
  if (dx) {
    const palace = chart.palaces.find((p) => p.branch === dx.palaceBranch);
    const majors =
      palace?.stars
        .filter((s) => s.type === 'major')
        .map((s) => s.name)
        .join('、') || '空宫借星';
    lines.push(
      `当前大限：${dx.palaceName}宫（${dx.startAge}–${dx.endAge}岁），主星 ${majors}`,
    );
    if (dx.siHua) {
      lines.push(
        `大限四化：禄→${dx.siHua.lu}，权→${dx.siHua.quan}，科→${dx.siHua.ke}，忌→${dx.siHua.ji}`,
      );
    }
  }

  const year = new Date().getFullYear();
  const ln = getLiuNianSiHua(year);
  const t = ln.transforms;
  lines.push(
    `${year} 流年（${ln.stemName}干）：禄→${t['禄']}，权→${t['权']}，科→${t['科']}，忌→${t['忌']}`,
  );
  lines.push('解读时请区分本命、大限、流年三层，勿混为一谈。');

  return lines.join('\n');
}
