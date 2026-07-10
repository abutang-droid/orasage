'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TarotHomeDailyInsight } from '@/components/home/TarotHomeDailyInsight';
import { TarotHomeGreeting } from '@/components/home/TarotHomeGreeting';
import { TarotHomeHero } from '@/components/home/TarotHomeHero';
import { TarotProductVisual } from '@/components/home/TarotProductVisual';
import { useHomeCopy } from '@/lib/i18n/reading-copy';

type SingleQuota = {
  allowance?: number;
  remaining?: number | null;
  drawsUsed?: number;
  templeBonusGranted?: boolean;
};

export function TarotHomeV2() {
  const router = useRouter();
  const home = useHomeCopy();
  const [singleQuota, setSingleQuota] = useState<SingleQuota | null>(null);

  useEffect(() => {
    void fetch('/api/single-card/quota', { credentials: 'include', cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((single) => setSingleQuota(single))
      .catch(() => setSingleQuota(null));
  }, []);

  const singleRemaining = singleQuota?.remaining ?? 1;
  const templeBonus = singleQuota?.templeBonusGranted ?? false;

  return (
    <div className="tarot-home tarot-home-visual">
      <div className="tarot-home-visual-bg" aria-hidden>
        <div className="tarot-home-visual-glow tarot-home-visual-glow--a" />
        <div className="tarot-home-visual-glow tarot-home-visual-glow--b" />
      </div>

      <TarotHomeGreeting />
      <TarotHomeHero />
      <TarotHomeDailyInsight />

      <section className="tarot-home-spreads animate-fade-in-up delay-150">
        <div className="tarot-home-visual-grid">
          <TarotProductVisual
            href="/single-card"
            variant="single"
            title={home.singleCardTitle}
            desc={home.singleCardDesc}
            cta={home.singleCardCta}
            badges={[
              { key: 'remaining', label: home.quotaTodayRemaining(singleRemaining ?? 1) },
              {
                key: 'temple',
                label: templeBonus ? home.templeBonusGranted : home.templeBonusAvailable,
                muted: !templeBonus,
              },
            ]}
          />

          <TarotProductVisual
            variant="three"
            title={home.threeCardTitle}
            desc={home.threeCardDesc}
            note={home.threeCardNote}
            cta={home.threeCardCta}
            onClick={() => router.push('/reading')}
          />
        </div>
      </section>

      <section className="tarot-home-temple animate-fade-in-up delay-200">
        <TarotProductVisual
          href="/temple"
          variant="temple"
          title={home.templeTitle}
          desc={home.templeDesc}
          cta={home.templeCta}
          className="tarot-home-visual-temple"
        />
      </section>
    </div>
  );
}
