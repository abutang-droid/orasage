'use client';

import { useEffect, useState } from 'react';
import { useTempleCopy } from '@/lib/i18n/ui-strings';

type TempleStatus = {
  prayedToday: boolean;
  streak: number;
  templeBonusGranted: boolean;
  fortuneRemaining: number | null;
};

export function TempleStatusCard() {
  const temple = useTempleCopy();
  const [status, setStatus] = useState<TempleStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch('/api/temple', { credentials: 'include', cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch('/api/single-card/quota', { credentials: 'include', cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([templeData, quota]) => {
        if (cancelled) return;
        setStatus({
          prayedToday: templeData?.prayedToday ?? false,
          streak: templeData?.summary?.streak ?? 0,
          templeBonusGranted: quota?.templeBonusGranted ?? false,
          fortuneRemaining: quota?.remaining ?? null,
        });
      })
      .catch(() => {
        if (!cancelled) setStatus(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!status) return null;

  return (
    <div className="temple-status animate-fade-in-up">
      <div className="temple-status-row">
        <span>{temple.statusPrayedLabel}</span>
        <span
          className={`temple-status-badge${status.prayedToday ? ' temple-status-badge--done' : ''}`}
        >
          {status.prayedToday ? temple.statusPrayedDone : temple.statusPrayedPending}
        </span>
      </div>
      {status.streak > 0 ? (
        <div className="temple-status-row">
          <span>{temple.statusStreakLabel}</span>
          <strong>{temple.statusStreakDays(status.streak)}</strong>
        </div>
      ) : null}
      <div className="temple-status-row">
        <span>{temple.statusFortuneLabel}</span>
        <strong>
          {status.fortuneRemaining != null
            ? temple.statusFortuneRemaining(status.fortuneRemaining)
            : temple.statusFortuneDaily}
          {status.templeBonusGranted ? temple.statusTempleBonusDone : temple.statusTempleBonusHint}
        </strong>
      </div>
    </div>
  );
}
