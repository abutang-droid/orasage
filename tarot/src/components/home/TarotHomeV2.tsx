'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { TarotHomeHero } from '@/components/home/TarotHomeHero';

type DailyQuota = {
  allowance?: number;
  remaining?: number | null;
  drawsUsed?: number;
  templeBonusGranted?: boolean;
};

export function TarotHomeV2() {
  const router = useRouter();
  const [quota, setQuota] = useState<DailyQuota | null>(null);

  useEffect(() => {
    void fetch('/api/daily-fortune/quota', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((data: DailyQuota) => setQuota(data))
      .catch(() => setQuota(null));
  }, []);

  const remaining = quota?.remaining ?? 1;
  const templeBonus = quota?.templeBonusGranted ?? false;

  return (
    <div className="tarot-home tarot-home-v2">
      <TarotHomeHero />

      <section className="tarot-home-v2-actions animate-fade-in-up delay-100">
        <Link href="/daily-fortune" className="tarot-home-v2-card tarot-home-v2-card--primary">
          <div className="tarot-home-v2-card-head">
            <span className="tarot-home-v2-card-icon" aria-hidden>
              ✦
            </span>
            <div>
              <h2 className="tarot-home-v2-card-title">每日运势</h2>
              <p className="tarot-home-v2-card-desc">工作 · 爱情 · 事业 · 财运 四维解读</p>
            </div>
          </div>
          <div className="tarot-home-v2-card-meta">
            <span className="tarot-home-v2-badge">今日剩余 {remaining ?? 1} 次</span>
            {!templeBonus ? (
              <span className="tarot-home-v2-badge tarot-home-v2-badge--muted">祈福可 +1</span>
            ) : (
              <span className="tarot-home-v2-badge tarot-home-v2-badge--muted">已获祈福加成</span>
            )}
          </div>
          <span className="tarot-home-v2-card-cta">抽取今日运势 →</span>
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
              <h2 className="tarot-home-v2-card-title">三牌阵</h2>
              <p className="tarot-home-v2-card-desc">过去 · 现在 · 未来，简读免费</p>
            </div>
          </div>
          <p className="tarot-home-v2-card-note">深度报告与专属解读需登录后解锁</p>
          <span className="tarot-home-v2-card-cta">开始三牌占卜 →</span>
        </button>
      </section>

      <section className="tarot-home-v2-temple animate-fade-in-up delay-200">
        <Link href="/temple" className="tarot-home-v2-temple-link">
          <div className="tarot-home-v2-temple-inner">
            <span className="tarot-home-v2-temple-icon" aria-hidden>
              🛐
            </span>
            <div className="tarot-home-v2-temple-copy">
              <h2 className="tarot-home-v2-temple-title">每日祈福</h2>
              <p className="tarot-home-v2-temple-desc">
                翻完牌护个体。轻触神像完成今日参拜，还可获得额外运势抽取机会。
              </p>
            </div>
            <span className="tarot-home-v2-temple-arrow">→</span>
          </div>
        </Link>
      </section>
    </div>
  );
}
