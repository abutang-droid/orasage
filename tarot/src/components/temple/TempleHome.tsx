'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLang } from '@/lib/i18n/context';
import { profileSettingsUrlFromLang } from '@/lib/orasage-locale';
import { TempleDonation } from '@/components/temple/TempleDonation';
import { TempleStatusCard } from '@/components/temple/TempleStatusCard';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
import { loadLastBlessing, type LastBlessing } from '@/lib/temple/last-blessing';
import './temple.css';

type MeritSummary = {
  total: number;
  level: number;
  levelTitleZh: string;
  streak: number;
  prayedToday: boolean;
  meritTime: number;
  meritOffer: number;
  progressInLevel: number;
  neededForNext: number | null;
};

type LeaderboardEntry = {
  rank: number;
  nickname: string;
  meritTotal: number;
  levelTitleZh: string;
};

type TempleHomeProps = {
  deity: Sanctuary;
  donated?: boolean;
  onWorship: () => void;
  latestBlessing?: LastBlessing | null;
};

export function TempleHome({
  deity,
  donated,
  onWorship,
  latestBlessing,
}: TempleHomeProps) {
  const { lang } = useLang();
  const settingsHref = profileSettingsUrlFromLang(lang);
  const [summary, setSummary] = useState<MeritSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [blessing, setBlessing] = useState<LastBlessing | null>(latestBlessing ?? null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBlessing(latestBlessing ?? loadLastBlessing());
  }, [latestBlessing]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      fetch('/api/temple', { credentials: 'include' }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/merit/leaderboard?limit=8').then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([templeData, boardData]) => {
        if (cancelled) return;
        if (templeData?.summary) {
          setSummary({
            total: templeData.summary.total,
            level: templeData.summary.level,
            levelTitleZh: templeData.summary.levelTitleZh,
            streak: templeData.summary.streak,
            prayedToday: templeData.summary.prayedToday,
            meritTime: templeData.summary.meritTime,
            meritOffer: templeData.summary.meritOffer,
            progressInLevel: templeData.summary.progressInLevel,
            neededForNext: templeData.summary.neededForNext,
          });
        }
        if (boardData?.entries) setLeaderboard(boardData.entries);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayBlessing = blessing?.text ?? deity.blessingText;

  return (
    <div className="temple-home">
      {donated && (
        <div className="temple-donation-toast">乐捐成功，功德已计入您的修行记录。</div>
      )}

      <TempleStatusCard />

      <section className="temple-home-shrine" aria-label="我的守护神">
        <div className="temple-home-shrine-bg" aria-hidden />
        <div className="temple-home-shrine-inner">
          <div className="temple-home-deity-portrait">
            <img src={deity.imageUrl} alt={deity.name} />
          </div>
          <h1 className="temple-home-deity-name">{deity.name}</h1>
          <p className="temple-home-deity-en">{deity.nameEN}</p>
          <button type="button" className="btn-primary temple-home-worship-btn" onClick={onWorship}>
            {summary?.prayedToday ? '🛐 再次参拜' : '🛐 今日参拜'}
          </button>
        </div>
      </section>

      {displayBlessing ? (
        <section className="temple-home-verse" aria-label="今日偈语">
          <div className="temple-home-verse-label">── 今日偈语 ──</div>
          <p className="temple-home-verse-text">{displayBlessing}</p>
          {blessing?.date ? (
            <p className="temple-home-verse-meta">
              {blessing.deityName} · {blessing.date}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="temple-home-merit card-gold" aria-label="我的功德">
        {loading ? (
          <p className="temple-home-loading">加载功德…</p>
        ) : (
          <>
            <div className="temple-home-merit-head">
              <div>
                <div className="temple-home-merit-label">我的功德</div>
                <div className="temple-home-merit-level">{summary?.levelTitleZh ?? '朝圣者'}</div>
              </div>
              <div className="temple-home-merit-total">{summary?.total ?? 0}</div>
            </div>
            <div className="temple-home-merit-track">
              <div
                className="temple-home-merit-fill"
                style={{ width: `${Math.round((summary?.progressInLevel ?? 0) * 100)}%` }}
              />
            </div>
            <div className="temple-home-merit-meta">
              日积月累 {summary?.meritTime ?? 0} · 诚心供养 {summary?.meritOffer ?? 0}
              {summary?.streak && summary.streak > 1 ? ` · 连续 ${summary.streak} 天` : ''}
            </div>
            <Link href="/profile/merit" className="temple-home-merit-link">
              查看功德详情 →
            </Link>
          </>
        )}
      </section>

      <section className="temple-home-leaderboard" aria-label="功德排行榜">
        <div className="temple-home-section-title">功德排行榜</div>
        <p className="temple-home-section-sub">持光者及以上信徒</p>
        {leaderboard.length === 0 ? (
          <p className="temple-home-loading">暂无上榜信徒</p>
        ) : (
          <ol className="temple-home-leaderboard-list">
            {leaderboard.map((entry) => (
              <li key={`${entry.rank}-${entry.nickname}`} className="temple-home-leaderboard-item">
                <span className={`temple-home-rank${entry.rank <= 3 ? ' is-top' : ''}`}>
                  {entry.rank}
                </span>
                <span className="temple-home-board-name">{entry.nickname}</span>
                <span className="temple-home-board-level">{entry.levelTitleZh}</span>
                <span className="temple-home-board-merit">{entry.meritTotal}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="temple-home-donation" aria-label="乐捐">
        <TempleDonation deityName={deity.name} />
      </section>

      <p className="temple-home-settings-hint">
        更换守护神或信仰地区，请前往
        <a href={settingsHref} className="temple-home-settings-link">
          我的 → 设置
        </a>
      </p>
    </div>
  );
}
