'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getCardById } from '@/lib/tarot/cards';
import { getDailyAttitudeGuide, getDailyTone } from '@/lib/daily-fortune/attitude-guide';
import { useHomeCopy } from '@/lib/i18n/reading-copy';
import type { DailyFortuneRecordDto } from '@/lib/daily-fortune/types';

type StatsPayload = {
  displayCount: number;
};

type SessionPayload = {
  latest: DailyFortuneRecordDto | null;
  quota: { remaining: number };
};

function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

function DailyInsightIcon() {
  return (
    <div className="tarot-daily-insight-icon" aria-hidden>
      <span className="tarot-daily-insight-icon-orbit" />
      <span className="tarot-daily-insight-icon-core" />
      <span className="tarot-daily-insight-icon-ray tarot-daily-insight-icon-ray--1" />
      <span className="tarot-daily-insight-icon-ray tarot-daily-insight-icon-ray--2" />
      <span className="tarot-daily-insight-icon-ray tarot-daily-insight-icon-ray--3" />
    </div>
  );
}

export function TarotHomeDailyInsight() {
  const router = useRouter();
  const home = useHomeCopy();
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [latest, setLatest] = useState<DailyFortuneRecordDto | null>(null);
  const [remaining, setRemaining] = useState(1);

  const load = useCallback(async () => {
    const [statsRes, sessionRes] = await Promise.all([
      fetch('/api/daily-fortune/stats', { cache: 'no-store' }),
      fetch('/api/daily-fortune/session', { credentials: 'include', cache: 'no-store' }),
    ]);
    if (statsRes.ok) setStats((await statsRes.json()) as StatsPayload);
    if (sessionRes.ok) {
      const session = (await sessionRes.json()) as SessionPayload;
      setLatest(session.latest);
      setRemaining(session.quota.remaining);
    }
  }, []);

  useEffect(() => {
    void load().catch(() => {});
  }, [load]);

  const handleNavigate = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/daily-fortune/stats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ increment: true }),
      });
      if (res.ok) setStats((await res.json()) as StatsPayload);
    } catch {
      /* optional */
    }
    router.push('/daily-fortune');
  };

  const completed = latest?.cardId != null && remaining <= 0;
  const cardMeta = latest?.cardId != null ? getCardById(latest.cardId) : null;
  const orientation = (latest?.orientation as '正位' | '逆位') ?? '正位';
  const tone = getDailyTone(orientation, home.lang);
  const attitude = cardMeta && latest?.cardName
    ? getDailyAttitudeGuide(cardMeta.id, latest.cardName, orientation, cardMeta.suit)
    : '';

  return (
    <Link
      href="/daily-fortune"
      className={`tarot-home-daily-insight${completed ? ' tarot-home-daily-insight--done' : ''} animate-fade-in-up delay-100`}
      onClick={handleNavigate}
    >
      <div className="tarot-home-daily-insight-art">
        <DailyInsightIcon />
      </div>
      <div className="tarot-home-daily-insight-body">
        <div className="tarot-home-daily-insight-head">
          <h2 className="tarot-home-daily-insight-title">{home.dailyInsightTitle}</h2>
        </div>

        {completed ? (
          <div className="tarot-home-daily-insight-result">
            <p className="tarot-home-daily-insight-tone">{tone.result}</p>
            {stats ? (
              <p className="tarot-home-daily-insight-count">
                {home.participantCount(formatCount(stats.displayCount))}
              </p>
            ) : null}
            <div className="tarot-home-daily-insight-guide">
              <p className="tarot-home-daily-insight-guide-label">{home.attitudeGuideLabel}</p>
              <p className="tarot-home-daily-insight-guide-text">{attitude}</p>
            </div>
          </div>
        ) : (
          <div className="tarot-home-daily-insight-copy">
            {home.dailyInsightLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <span className="tarot-home-daily-insight-cta">
          <span>{completed ? home.dailyInsightViewAgain : home.dailyCta}</span>
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
