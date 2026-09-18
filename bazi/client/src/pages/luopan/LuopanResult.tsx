import type { SingleBaziResult } from '@/lib/bazi';
import { BRANCH_WU_XING, SHI_SHEN_MAP, WU_XING_MAP, ZANG_GAN_MAP } from '@/lib/bazi';
import { cangGanList } from './luopanPerson';

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

function formatWx(n: number) {
  return n % 1 === 0 ? String(n) : n.toFixed(1);
}

function pillarShiShen(result: SingleBaziResult, gan: string, isDay: boolean) {
  if (isDay) return '日主';
  return SHI_SHEN_MAP[result.day.gan]?.[gan] ?? result.shiShen[gan] ?? '';
}

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
  const genderLabel = result.gender === 'female' ? '女命' : '男命';
  const shenshaEntries = Object.entries(result.shensha ?? {}).filter(([, vals]) => vals?.length);
  const daYun = result.daYun ?? [];
  const hit = result.oneLineHit;

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
          {genderLabel} · {result.birthStr}
          {result.birthCity && !result.birthStr.includes(result.birthCity) ? `　${result.birthCity}` : ''}
        </div>
        {hit?.headline ? (
          <p className="hit">{hit.headline}{hit.subline ? ` · ${hit.subline}` : ''}</p>
        ) : null}
      </div>
      <div className="bamboo-hint">自右向左 · 年 月 日 时</div>
      <div className="bamboo-row">
        {PILLAR_ORDER.map((p, i) => {
          const pl = result[p.key];
          const ss = pillarShiShen(result, pl.gan, p.key === 'day');
          const cang = cangGanList(pl.zhi, ZANG_GAN_MAP).join(' ');
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
        <div className="ink-h">五 行 · 藏干加权</div>
        <div className="ink-row">
          {names.map((nm, i) => {
            const n = counts[i];
            const d = Math.round(30 + (n / max) * 34);
            const o = (0.3 + 0.55 * (n / max)).toFixed(2);
            return (
              <div key={nm} className="ink">
                <div className="drop" style={{ ['--c' as string]: WX_VAR[nm], ['--d' as string]: `${d}px`, ['--o' as string]: o }} />
                <div className="nm">{nm}</div>
                <div className="ct">{formatWx(n)}</div>
              </div>
            );
          })}
        </div>
      </div>

      <section className="ora-sec" aria-label="格局强弱喜忌">
        <div className="ora-h">格局 · 强弱 · 喜忌</div>
        <div className="ora-grid">
          <div className="ora-cell">
            <div className="ora-k">格局</div>
            <div className="ora-v">{result.pattern?.primary ?? '—'}</div>
          </div>
          <div className="ora-cell">
            <div className="ora-k">强弱</div>
            <div className="ora-v">{result.strength || '—'}</div>
          </div>
          <div className="ora-cell">
            <div className="ora-k">喜用</div>
            <div className="ora-v fav">{result.favorable?.length ? result.favorable.join(' / ') : '均衡'}</div>
          </div>
          <div className="ora-cell">
            <div className="ora-k">忌神</div>
            <div className="ora-v unfav">{result.unfavorable?.length ? result.unfavorable.join(' / ') : '均衡'}</div>
          </div>
        </div>
        {result.pattern?.description ? <p className="ora-p">{result.pattern.description}</p> : null}
        {result.climate?.active && result.climate.description ? (
          <p className="ora-p climate">{result.climate.description}</p>
        ) : null}
      </section>

      {result.mingLiSummary?.overview ? (
        <section className="ora-sec" aria-label="命理小结">
          <div className="ora-h">命理小结</div>
          <p className="ora-p">{result.mingLiSummary.overview}</p>
          {result.mingLiSummary.personality ? <p className="ora-p">{result.mingLiSummary.personality}</p> : null}
        </section>
      ) : null}

      {daYun.length > 0 ? (
        <section className="ora-sec" aria-label="大运">
          <div className="ora-h">大 运</div>
          <div className="yun-row">
            {daYun.map((dy, i) => (
              <div key={`${dy.startAge}-${dy.gan}${dy.zhi}-${i}`} className="yun">
                <div className="yun-gz">{dy.gan}{dy.zhi}</div>
                <div className="yun-age">{dy.startAge}岁起</div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {shenshaEntries.length > 0 ? (
        <section className="ora-sec" aria-label="神煞">
          <div className="ora-h">神 煞</div>
          <ul className="sha-list">
            {shenshaEntries.map(([name, vals]) => (
              <li key={name}>
                <span className="sha-n">{name}</span>
                <span className="sha-v">{vals.join('、')}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="creed">与经典排盘同一套算法</div>
      <div className="fine">
        四柱、藏干加权五行、格局、喜忌、大运、神煞均来自 OraSage 排盘引擎
        {result.trueSolarNote ? `；${result.trueSolarNote.replace(/[（）]/g, '')}` : '；已按出生城市校正真太阳时'}。
        本盘不构成任何医疗、法律、财务或人生决策建议。
      </div>
      <div className="res-foot">
        <button type="button" className="b-sec" onClick={onBack}>重 排</button>
        <button type="button" className="b-sec" onClick={onBack}>返回罗盘</button>
      </div>
    </div>
  );
}
