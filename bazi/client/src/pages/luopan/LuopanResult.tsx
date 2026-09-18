import type { SingleBaziResult } from '@/lib/bazi';
import { BRANCH_WU_XING, DI_ZHI_CANG_GAN, WU_XING_MAP } from '@/lib/bazi';

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
  const counts = [result.wuXing.木, result.wuXing.火, result.wuXing.土, result.wuXing.金, result.wuXing.水];
  const max = Math.max(1, ...counts);
  const names = ['木', '火', '土', '金', '水'] as const;

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
          {result.birthCity ? `　${result.birthCity}` : ''}
          {result.trueSolarNote ? <><br />{result.trueSolarNote.replace(/[（）]/g, '')}</> : null}
        </div>
      </div>
      <div className="bamboo-hint">自右向左 · 年 月 日 时</div>
      <div className="bamboo-row">
        {PILLAR_ORDER.map((p, i) => {
          const pl = result[p.key];
          const ss = p.key === 'day' ? '日主' : (result.shiShen[pl.gan] ?? '');
          const cang = (DI_ZHI_CANG_GAN[pl.zhi] ?? []).join(' ');
          const zw = BRANCH_WU_XING[pl.zhi] ?? '土';
          return (
            <div key={p.key} className={`bb${p.key === 'day' ? ' day' : ''}`} style={{ animationDelay: `${i * 0.13}s` }}>
              <div className="fib" />
              <div className="cap">{p.cap}</div>
              <div className="gan">{pl.gan}</div>
              <div className="ss">{ss}</div>
              <div className="line" />
              <div className="zhi">{pl.zhi}</div>
              <div className="wxtag" style={{ background: WX_VAR[zw] }} />
              <div className="cang">{cang ? `藏 ${cang}` : ''}</div>
            </div>
          );
        })}
      </div>
      <div className="ink-sec">
        <div className="ink-h">五 行</div>
        <div className="ink-row">
          {names.map((nm, i) => {
            const n = counts[i];
            const d = Math.round(30 + (n / max) * 34);
            const o = (0.3 + 0.55 * (n / max)).toFixed(2);
            return (
              <div key={nm} className="ink">
                <div className="drop" style={{ ['--c' as string]: WX_VAR[nm], ['--d' as string]: `${d}px`, ['--o' as string]: o }} />
                <div className="nm">{nm}</div>
                <div className="ct">{n}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="creed">知结构，不问吉凶</div>
      <div className="fine">
        已按出生城市校正真太阳时。本盘只呈现干支结构，不判吉凶，不构成任何医疗、法律、财务或人生决策建议。
      </div>
      <div className="res-foot">
        <button type="button" className="b-sec" onClick={onBack}>重 排</button>
        <button type="button" className="b-sec" onClick={onBack}>返回罗盘</button>
      </div>
    </div>
  );
}
