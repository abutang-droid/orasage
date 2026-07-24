'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { getCardById } from '@/lib/tarot/cards';
import { getDailyAttitudeGuide, getDailyTone } from '@/lib/daily-fortune/attitude-guide';
import { useCardName, useLang } from '@/lib/i18n/context';
import { useHomeCopy } from '@/lib/i18n/reading-copy';
import { DailyInsightGlyph } from '@/components/home/HomeTileGlyphs';
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

export function TarotHomeDailyInsight() {
  const router = useRouter();
  const home = useHomeCopy();
  const { lang } = useLang();
  const cardNameFor = useCardName();
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
  const tone = getDailyTone(orientation, lang);
  const localizedCardName = cardMeta ? cardNameFor(cardMeta) : '';
  const attitude = cardMeta && localizedCardName
    ? getDailyAttitudeGuide(cardMeta.id, localizedCardName, orientation, cardMeta.suit, lang)
    : '';

  return (
    <Link
      href="/daily-fortune"
      className={`home-tile home-tile--featured home-tile--daily${completed ? ' home-tile--done' : ''} animate-fade-in-up delay-100`}
      onClick={handleNavigate}
    >
      <div className="home-tile-body">
        <h2 className="home-tile-title">{home.dailyInsightTitle}</h2>

        {completed ? (
          <div className="home-tile-daily-result">
            <p className="home-tile-daily-tone">{tone.result}</p>
            <div className="home-tile-daily-guide">
              <p className="home-tile-daily-guide-label">{home.attitudeGuideLabel}</p>
              <p className="home-tile-daily-guide-text">{attitude}</p>
            </div>
          </div>
        ) : (
          <div className="home-tile-daily-copy">
            {home.dailyInsightLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
            {stats ? (
              <p className="home-tile-daily-count">
                {home.participantCount(formatCount(stats.displayCount))}
              </p>
            ) : null}
          </div>
        )}

        <span className="home-tile-cta home-tile-cta--primary">
          <span>{completed ? home.dailyInsightViewAgain : home.dailyCta}</span>
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </span>
      </div>
      {!completed ? (
        <div className="home-tile-art" aria-hidden>
          <DailyInsightGlyph />
        </div>
      ) : null}
    </Link>
  );
}
