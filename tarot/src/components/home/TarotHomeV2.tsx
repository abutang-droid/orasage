'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TarotHomeHero } from '@/components/home/TarotHomeHero';
import { useHomeCopy } from '@/lib/i18n/reading-copy';

type DailyQuota = {
  allowance?: number;
  remaining?: number | null;
  drawsUsed?: number;
};

type SingleQuota = {
  allowance?: number;
  remaining?: number | null;
  drawsUsed?: number;
  templeBonusGranted?: boolean;
};

export function TarotHomeV2() {
  const router = useRouter();
  const home = useHomeCopy();
  const [dailyQuota, setDailyQuota] = useState<DailyQuota | null>(null);
  const [singleQuota, setSingleQuota] = useState<SingleQuota | null>(null);

  useEffect(() => {
    void Promise.all([
      fetch('/api/daily-fortune/quota', { credentials: 'include', cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch('/api/single-card/quota', { credentials: 'include', cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([daily, single]) => {
        setDailyQuota(daily);
        setSingleQuota(single);
      })
      .catch(() => {
        setDailyQuota(null);
        setSingleQuota(null);
      });
  }, []);

  const singleRemaining = singleQuota?.remaining ?? 1;
  const templeBonus = singleQuota?.templeBonusGranted ?? false;

  return (
    <div className="tarot-home tarot-home-v2">
      <TarotHomeHero />

      <section className="tarot-home-v2-actions animate-fade-in-up delay-100">
        <Link href="/single-card" className="tarot-home-v2-card tarot-home-v2-card--primary">
          <div className="tarot-home-v2-card-head">
            <span className="tarot-home-v2-card-icon" aria-hidden>
              🂡
            </span>
            <div>
              <h2 className="tarot-home-v2-card-title">{home.singleCardTitle}</h2>
              <p className="tarot-home-v2-card-desc">{home.singleCardDesc}</p>
            </div>
          </div>
          <div className="tarot-home-v2-card-meta">
            <span className="tarot-home-v2-badge">{home.quotaTodayRemaining(singleRemaining ?? 1)}</span>
            <span className="tarot-home-v2-badge tarot-home-v2-badge--muted">
              {templeBonus ? home.templeBonusGranted : home.templeBonusAvailable}
            </span>
          </div>
          <span className="tarot-home-v2-card-cta">{home.singleCardCta}</span>
        </Link>

        <Link href="/daily-fortune" className="tarot-home-v2-card">
          <div className="tarot-home-v2-card-head">
            <span className="tarot-home-v2-card-icon" aria-hidden>
              ✦
            </span>
            <div>
              <h2 className="tarot-home-v2-card-title">{home.dailyTitle}</h2>
              <p className="tarot-home-v2-card-desc">{home.dailyDesc}</p>
            </div>
          </div>
          <div className="tarot-home-v2-card-meta">
            <span className="tarot-home-v2-badge">{home.quotaFreeToday}</span>
          </div>
          <span className="tarot-home-v2-card-cta">{home.dailyCta}</span>
        </Link>

        <button
          type="button"
          className="tarot-home-v2-card tarot-home-v2-card--button"
          onClick={() => router.push('/reading')}
        >
          <div className="tarot-home-v2-card-head">
            <span className="tarot-home-v2-card-icon" aria-hidden>
              🃏
            </span>
            <div>
              <h2 className="tarot-home-v2-card-title">{home.threeCardTitle}</h2>
              <p className="tarot-home-v2-card-desc">{home.threeCardDesc}</p>
            </div>
          </div>
          <p className="tarot-home-v2-card-note">{home.threeCardNote}</p>
          <span className="tarot-home-v2-card-cta">{home.threeCardCta}</span>
        </button>
      </section>

      <section className="tarot-home-v2-temple animate-fade-in-up delay-200">
        <Link href="/temple" className="tarot-home-v2-temple-link">
          <div className="tarot-home-v2-temple-inner">
            <span className="tarot-home-v2-temple-icon" aria-hidden>
              🛐
            </span>
            <div className="tarot-home-v2-temple-copy">
              <h2 className="tarot-home-v2-temple-title">{home.templeTitle}</h2>
              <p className="tarot-home-v2-temple-desc">{home.templeDesc}</p>
            </div>
            <span className="tarot-home-v2-temple-arrow">→</span>
          </div>
        </Link>
      </section>
    </div>
  );
}
