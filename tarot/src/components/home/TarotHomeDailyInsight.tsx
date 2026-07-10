'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { TarotMiniCard } from '@/components/home/TarotMiniCard';
import { useHomeCopy } from '@/lib/i18n/reading-copy';

export function TarotHomeDailyInsight() {
  const home = useHomeCopy();

  return (
    <Link href="/daily-fortune" className="tarot-home-daily-insight animate-fade-in-up delay-100">
      <div className="tarot-home-daily-insight-art" aria-hidden>
        <div className="tarot-home-daily-insight-glow" />
        <TarotMiniCard
          src="/cards/19.webp"
          className="tarot-home-daily-insight-card"
          rotate={6}
          glow
          priority
        />
      </div>
      <div className="tarot-home-daily-insight-body">
        <div className="tarot-home-daily-insight-head">
          <h2 className="tarot-home-daily-insight-title">{home.dailyInsightTitle}</h2>
          {home.quotaFreeToday ? (
            <span className="tarot-home-daily-insight-badge">{home.quotaFreeToday}</span>
          ) : null}
        </div>
        <div className="tarot-home-daily-insight-copy">
          {home.dailyInsightLines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
        <span className="tarot-home-daily-insight-cta">
          <span>{home.dailyCta}</span>
          <ChevronRight size={16} strokeWidth={2} aria-hidden />
        </span>
      </div>
    </Link>
  );
}
