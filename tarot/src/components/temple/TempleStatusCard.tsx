'use client';

import { useEffect, useState } from 'react';

type TempleStatus = {
  prayedToday: boolean;
  streak: number;
  templeBonusGranted: boolean;
  fortuneRemaining: number | null;
};

export function TempleStatusCard() {
  const [status, setStatus] = useState<TempleStatus | null>(null);

  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      fetch('/api/temple', { credentials: 'include', cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
      fetch('/api/daily-fortune/quota', { credentials: 'include', cache: 'no-store' }).then((r) =>
        r.ok ? r.json() : null,
      ),
    ])
      .then(([temple, quota]) => {
        if (cancelled) return;
        setStatus({
          prayedToday: temple?.prayedToday ?? false,
          streak: temple?.summary?.streak ?? 0,
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
        <span>今日祈福</span>
        <span
          className={`temple-status-badge${status.prayedToday ? ' temple-status-badge--done' : ''}`}
        >
          {status.prayedToday ? '已完成' : '未完成'}
        </span>
      </div>
      {status.streak > 0 ? (
        <div className="temple-status-row">
          <span>连续参拜</span>
          <strong>{status.streak} 天</strong>
        </div>
      ) : null}
      <div className="temple-status-row">
        <span>每日运势</span>
        <strong>
          {status.fortuneRemaining != null ? `剩余 ${status.fortuneRemaining} 次` : '每日 1 次'}
          {!status.templeBonusGranted ? ' · 祈福可 +1' : ' · 已获祈福加成'}
        </strong>
      </div>
    </div>
  );
}
