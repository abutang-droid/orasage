'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useUser } from '@/lib/user';

const MANTO_PORTRAIT = '/images/manto-mentor.png';

type DailyQuota = {
  allowance?: number;
  remaining?: number | null;
  drawsUsed?: number;
  templeBonusGranted?: boolean;
};

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 12) return '早安';
  if (h < 18) return '午安';
  return '晚安';
}

function HeroCards() {
  return (
    <div className="tarot-home-hero-cards animate-float">
      <div className="tarot-home-hero-card left">
        <div className="tarot-home-hero-card-inner tarot-home-hero-card-inner--gold">✦</div>
      </div>
      <div className="tarot-home-hero-card right">
        <div className="tarot-home-hero-card-inner tarot-home-hero-card-inner--gold">☽</div>
      </div>
      <div className="tarot-home-hero-card center">
        <div className="tarot-home-hero-card-inner tarot-home-hero-card-inner--gold">☀</div>
      </div>
    </div>
  );
}

export function TarotHomeV2() {
  const router = useRouter();
  const { user } = useUser();
  const [quota, setQuota] = useState<DailyQuota | null>(null);

  const displayName = useMemo(() => {
    const name = user?.nickname?.trim();
    if (name && name !== '旅人') return name;
    return null;
  }, [user?.nickname]);

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
      <section className="tarot-home-hero tarot-home-hero--v2 animate-fade-in-up">
        <div className="tarot-home-hero-manto">
          <Image
            src={MANTO_PORTRAIT}
            alt=""
            width={56}
            height={56}
            className="tarot-home-hero-manto-img"
            aria-hidden
          />
          <div>
            <p className="tarot-home-hero-greeting">
              {timeGreeting()}
              {displayName ? `，${displayName}` : ''}
            </p>
            <p className="tarot-home-hero-manto-line">Manto 为你守望着今日的星途</p>
          </div>
        </div>

        <HeroCards />

        <h1 className="tarot-home-title">
          翻一张牌
          <br />
          看看今天怎么走
        </h1>
        <p className="tarot-home-subtitle">每日运势与三牌占卜，都在这里开始</p>
      </section>

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
            <span className="tarot-home-v2-badge">
              今日剩余 {remaining ?? 1} 次
            </span>
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
