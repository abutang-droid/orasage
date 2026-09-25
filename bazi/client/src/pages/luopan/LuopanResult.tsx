import type { SingleBaziResult } from '@/lib/bazi';
import { BRANCH_WU_XING, DI_ZHI_CANG_GAN, WU_XING_MAP } from '@/lib/bazi';
import { WuXingPolarChart } from '@/components/WuXingPolarChart';
import { polarTag, GRID_CAPTION_ZH, GOD_VERNACULAR } from '@shared/vernacular';
import { trueSolarCaption } from '@shared/free-report';

const WX_VAR: Record<string, string> = {
  木: 'var(--wx-wood)',
  火: 'var(--wx-fire)',
  土: 'var(--wx-earth)',
  金: 'var(--wx-metal)',
  水: 'var(--wx-water)',
};

const PILLAR_ORDER = [
  { key: 'year' as const, cap: '年柱' },
  { key: 'month' as const, cap: '月柱' },
  { key: 'day' as const, cap: '日柱' },
  { key: 'hour' as const, cap: '时柱' },
];

export function LuopanResult({
  result,
  onBack,
}: {
  result: SingleBaziResult;
  onBack: () => void;
}) {
  const dayGan = result.day.gan;
  const dmWx = WU_XING_MAP[dayGan] ?? '';

  return (
    <div className="res">
      <div className="res-top">
        <button type="button" className="bk" onClick={onBack} aria-label="返回罗盘">
          <svg viewBox="0 0 10 17" fill="none" width="10" height="17">
            <path d="M8.5 1L1.5 8.5L8.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <span className="tt">你的命盘</span>
      </div>
      <div className="dm">
        <div className="ring">
          <div className="lb">日 主</div>
          <div className="gz">{dayGan}</div>
          <div className="wx">五行属 {dmWx}</div>
        </div>
        <div className="cap">
          {result.birthStr}
          {result.birthCity && !result.birthStr.includes(result.birthCity) ? `　${result.birthCity}` : ''}
        </div>
      </div>
      <div className="bamboo-hint">自右向左 · 年 月 日 时</div>
      <div className="bamboo-row">
        {PILLAR_ORDER.map((p, i) => {
          const pl = result[p.key];
          const rawSs = p.key === 'day' ? '日主' : (result.shiShen[pl.gan] ?? '');
          const ss = p.key === 'day' ? '日主' : (GOD_VERNACULAR[rawSs] ?? rawSs);
          const cang = (DI_ZHI_CANG_GAN[pl.zhi] ?? []).join(' ');
          const zw = BRANCH_WU_XING[pl.zhi] ?? '土';
          const tag = polarTag(pl.gan, pl.zhi, p.key === 'day');
          return (
            <div key={p.key} className={`bb${p.key === 'day' ? ' day' : ''}`} style={{ animationDelay: `${i * 0.13}s` }}>
              <div className="fib" />
              <div className="cap">{p.cap}</div>
              <div className="wxlab">{tag}</div>
              <div className="gan">{pl.gan}</div>
              <div className="ss">{ss}</div>
              <div className="line" />
              <div className="zhi">{pl.zhi}</div>
              <div className="wxtag" style={{ background: WX_VAR[zw] }} />
              <div className="cang">{cang ? `内含 ${cang}` : ''}</div>
            </div>
          );
        })}
      </div>
      <p className="grid-cap">{GRID_CAPTION_ZH}</p>
      <div className="ink-sec">
        <div className="ink-h">五 行</div>
        <WuXingPolarChart wuXing={result.wuXing} />
      </div>
      <div className="creed">知结构，不问吉凶</div>
      <div className="fine">
        {trueSolarCaption(result.trueSolarOffset) || '已按你出生地的经度校正过时间。'}本盘只呈现干支结构，不判吉凶，不构成任何医疗、法律、财务或人生决策建议。
      </div>
      <div className="res-foot">
        <button type="button" className="b-sec" onClick={onBack}>重 排</button>
        <button type="button" className="b-sec" onClick={onBack}>返回罗盘</button>
      </div>
    </div>
  );
}
