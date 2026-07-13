'use client';

import Link from 'next/link';
import { Church } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { useLang } from '@/lib/i18n/context';
import { profileMeritUrlFromLang, profileSettingsUrlFromLang } from '@/lib/orasage-locale';
import { useTempleCopy } from '@/lib/i18n/ui-strings';
import { meritLevelTitle } from '@/lib/merit';
import { TempleDonation } from '@/components/temple/TempleDonation';
import { TempleStatusCard } from '@/components/temple/TempleStatusCard';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
import { loadLastBlessing, type LastBlessing } from '@/lib/temple/last-blessing';
import './temple.css';

type MeritSummary = {
  total: number;
  level: number;
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
  level: number;
};

type TempleHomeProps = {
  deity?: Sanctuary;
  donated?: boolean;
  onWorship: () => void;
  onSetupFaith?: () => void;
  latestBlessing?: LastBlessing | null;
};

export function TempleHome({
  deity,
  donated,
  onWorship,
  onSetupFaith,
  latestBlessing,
}: TempleHomeProps) {
  const { lang } = useLang();
  const temple = useTempleCopy();
  const settingsHref = profileSettingsUrlFromLang(lang);
  const meritHref = profileMeritUrlFromLang(lang);
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
            streak: templeData.summary.streak,
            prayedToday: templeData.summary.prayedToday,
            meritTime: templeData.summary.meritTime,
            meritOffer: templeData.summary.meritOffer,
            progressInLevel: templeData.summary.progressInLevel,
            neededForNext: templeData.summary.neededForNext,
          });
        }
        if (boardData?.entries) {
          setLeaderboard(
            boardData.entries.map((entry: LeaderboardEntry & { levelTitleZh?: string }) => ({
              rank: entry.rank,
              nickname: entry.nickname,
              meritTotal: entry.meritTotal,
              level: entry.level,
            })),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const displayBlessing = blessing?.text ?? deity?.blessingText;

  return (
    <div className="temple-home">
      {donated && (
        <div className="temple-donation-toast">{temple.donationSuccess}</div>
      )}

      <TempleStatusCard />

      <section className="temple-home-shrine" aria-label={deity ? temple.myPatron : temple.skippedHomeTitle}>
        <div className="temple-home-shrine-bg" aria-hidden />
        <div className="temple-home-shrine-inner">
          {deity ? (
            <>
              <div className="temple-home-deity-portrait">
                <img src={deity.imageUrl} alt={deity.name} />
              </div>
              <h1 className="temple-home-deity-name">{deity.name}</h1>
              <p className="temple-home-deity-en">{deity.nameEN}</p>
              <Button type="button" className="temple-home-worship-btn w-full" onClick={onWorship}>
                <Church size={18} strokeWidth={1.75} aria-hidden />
                {summary?.prayedToday ? temple.worshipAgain : temple.worshipToday}
              </Button>
            </>
          ) : (
            <>
              <div className="temple-home-deity-portrait temple-home-deity-portrait--placeholder" aria-hidden>
                <Church size={28} strokeWidth={1.5} />
              </div>
              <h1 className="temple-home-deity-name">{temple.skippedHomeTitle}</h1>
              <p className="temple-home-deity-en temple-home-skipped-lead">{temple.skippedHomeLead}</p>
              {onSetupFaith ? (
                <Button type="button" className="temple-home-worship-btn w-full" onClick={onSetupFaith}>
                  {temple.setupFaithCta}
                </Button>
              ) : null}
            </>
          )}
        </div>
      </section>

      {displayBlessing ? (
        <section className="temple-home-verse" aria-label={temple.verseAria}>
          <div className="temple-home-verse-label">{temple.verseLabel}</div>
          <p className="temple-home-verse-text">{displayBlessing}</p>
          {blessing?.date ? (
            <p className="temple-home-verse-meta">
              {blessing.deityName} · {blessing.date}
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="temple-home-merit card-gold" aria-label={temple.meritAria}>
        {loading ? (
          <p className="temple-home-loading">{temple.meritLoading}</p>
        ) : (
          <>
            <div className="temple-home-merit-head">
              <div>
                <div className="temple-home-merit-label">{temple.meritLabel}</div>
                <div className="temple-home-merit-level">
                  {meritLevelTitle(lang, summary?.level ?? 0)}
                </div>
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
              {temple.meritTimeOffer(summary?.meritTime ?? 0, summary?.meritOffer ?? 0)}
              {summary?.streak && summary.streak > 1 ? temple.meritStreak(summary.streak) : ''}
            </div>
            <a href={meritHref} className="temple-home-merit-link">
              {temple.meritDetails}
            </a>
          </>
        )}
      </section>

      <section className="temple-home-leaderboard" aria-label={temple.leaderboardAria}>
        <div className="temple-home-section-title">{temple.leaderboardTitle}</div>
        <p className="temple-home-section-sub">{temple.leaderboardSub}</p>
        {leaderboard.length === 0 ? (
          <p className="temple-home-loading">{temple.leaderboardEmpty}</p>
        ) : (
          <ol className="temple-home-leaderboard-list">
            {leaderboard.map((entry) => (
              <li key={`${entry.rank}-${entry.nickname}`} className="temple-home-leaderboard-item">
                <span className={`temple-home-rank${entry.rank <= 3 ? ' is-top' : ''}`}>
                  {entry.rank}
                </span>
                <span className="temple-home-board-name">{entry.nickname}</span>
                <span className="temple-home-board-level">{meritLevelTitle(lang, entry.level)}</span>
                <span className="temple-home-board-merit">{entry.meritTotal}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="temple-home-donation" aria-label={temple.donationAria}>
        <TempleDonation deityName={deity?.name} />
      </section>

      <p className="temple-home-settings-hint">
        {temple.changeFaithHint}
        <a href={settingsHref} className="temple-home-settings-link">
          {temple.settingsLink}
        </a>
      </p>
    </div>
  );
}
