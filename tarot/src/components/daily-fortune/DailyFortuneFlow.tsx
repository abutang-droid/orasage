'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { MantoThinking } from '@/components/MantoThinking';
import { TarotFlipCard } from '@/components/TarotFlipCard';
import { getDailyAttitudeGuide, getDailyTone } from '@/lib/daily-fortune/attitude-guide';
import { getCardById } from '@/lib/tarot/cards';
import { useCardName } from '@/lib/i18n/context';
import { aiLangBody } from '@/lib/i18n/ai-lang-body';
import { useCrystalCopy, type WuxingSku } from '@/lib/i18n/crystal-copy';
import { useDailyFortuneCopy } from '@/lib/i18n/reading-copy';
import { buildLoginUrlFromWindow } from '@/lib/login-url';
import {
  startAppCheckout,
  redirectAfterCheckout,
  isCheckoutAuthRequiredError,
} from '@/lib/shop-checkout';
import { recommendCrystal } from '@/lib/tarot/crystals';
import type {
  DailyFortuneFullReport,
  DailyFortuneRecordDto,
} from '@/lib/daily-fortune/types';
import type { TarotBillingProduct } from '@/lib/tarot-billing-config';

type Quota = {
  dateKey: string;
  allowance: number;
  remaining: number;
  drawsUsed: number;
};

type SessionPayload = {
  quota: Quota;
  latest: DailyFortuneRecordDto | null;
  records: DailyFortuneRecordDto[];
  isLoggedIn: boolean;
  nickname: string | null;
};

type DrawCard = {
  id: number;
  name: string;
  nameEn: string;
  symbol: string;
  orientation: '正位' | '逆位';
  element: string;
};

type Step = 'loading' | 'start' | 'drawing' | 'report' | 'exhausted';

function formatCount(n: number): string {
  return n.toLocaleString('en-US');
}

export function DailyFortuneFlow() {
  const copy = useDailyFortuneCopy();
  const crystalCopy = useCrystalCopy();
  const cardNameFor = useCardName();
  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [record, setRecord] = useState<DailyFortuneRecordDto | null>(null);
  const [card, setCard] = useState<DrawCard | null>(null);
  const [brief, setBrief] = useState('');
  const [fullReport, setFullReport] = useState<DailyFortuneFullReport | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [billingRecommend, setBillingRecommend] = useState<TarotBillingProduct | null>(null);
  const [error, setError] = useState('');
  const [drawLoading, setDrawLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [alreadyDrewToday, setAlreadyDrewToday] = useState(false);
  const [participantCount, setParticipantCount] = useState<number | null>(null);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/daily-fortune/stats', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setParticipantCount(data.displayCount ?? null);
      }
    } catch {
      /* optional */
    }
  };

  const hydrateReport = (rec: DailyFortuneRecordDto, loggedIn: boolean) => {
    setRecord(rec);
    setBrief(rec.briefText ?? '');
    setFullReport(loggedIn ? rec.fullReport : null);
    let recommendSku: string | undefined;
    if (rec.cardId != null) {
      const meta = getCardById(rec.cardId);
      setCard({
        id: rec.cardId,
        name: rec.cardName ?? meta?.name ?? '',
        nameEn: meta?.nameEn ?? '',
        symbol: meta?.symbol ?? '',
        orientation: (rec.orientation as '正位' | '逆位') ?? '正位',
        element: meta?.element ?? '',
      });
      setFlipped(true);
      recommendSku = recommendCrystal([meta?.element || 'major']).shopSku;
    }
    void loadRecommend(recommendSku);
  };

  const loadRecommend = async (sku?: string) => {
    try {
      const qs = sku ? `?sku=${encodeURIComponent(sku)}` : '';
      const res = await fetch(`/api/tarot/daily-recommend${qs}`, {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setBillingRecommend(data.product ?? null);
      }
    } catch {
      /* optional — card-element crystal fallback still renders */
    }
  };

  const loadSession = useCallback(async () => {
    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const recordIdParam = params?.get('recordId') ?? null;

    const res = await fetch('/api/daily-fortune/session', { credentials: 'include', cache: 'no-store' });
    const data = (await res.json()) as SessionPayload;
    setSession(data);
    setIsLoggedIn(data.isLoggedIn);
    void loadStats();

    const resumeRecord =
      (recordIdParam ? data.records.find((r) => r.id === recordIdParam) : null) ?? data.latest;

    if (resumeRecord) {
      hydrateReport(resumeRecord, data.isLoggedIn);
      setAlreadyDrewToday(true);
      setStep('report');
      return;
    }

    if (data.quota.remaining <= 0) {
      setStep('exhausted');
      return;
    }
    setStep('start');
  }, []);

  useEffect(() => {
    void loadSession().catch(() => setError(copy.loadFailed));
  }, [loadSession, copy.loadFailed]);

  const submitDraw = async () => {
    setStep('drawing');
    setFlipped(false);
    setCard(null);
    setDrawLoading(true);
    setError('');
    try {
      const res = await fetch('/api/daily-fortune/draw', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: [], ...aiLangBody(copy.lang) }),
      });
      const data = await res.json();
      if (res.status === 409 || data.alreadyDrewToday) {
        if (data.record) {
          hydrateReport(data.record, data.isLoggedIn);
          setAlreadyDrewToday(true);
          setStep('report');
        } else {
          setStep('exhausted');
        }
        return;
      }
      if (!res.ok) throw new Error(data.error || copy.drawFailed);

      setRecord(data.record);
      setCard(data.card);
      setBrief(data.brief);
      setFullReport(data.fullReport);
      setIsLoggedIn(data.isLoggedIn);
      setSession((s) =>
        s ? { ...s, quota: data.quota, isLoggedIn: data.isLoggedIn } : s,
      );
      setAlreadyDrewToday(Boolean(data.alreadyDrewToday));
      setDrawLoading(false);
      void loadStats();
      const drawSku = data.card
        ? recommendCrystal([data.card.element || 'major']).shopSku
        : undefined;
      setTimeout(() => setFlipped(true), 500);
      setTimeout(() => {
        setStep('report');
        void loadRecommend(drawSku);
      }, 1400);
    } catch (err) {
      setDrawLoading(false);
      setError(err instanceof Error ? err.message : copy.drawFailed);
      setStep('start');
    }
  };

  const cardMeta = card ? getCardById(card.id) : null;

  /** Prefer card-element crystal; overlay name/price from product API when SKU matches. */
  const crystalRecommend = useMemo(() => {
    if (!card) return null;
    const picked = recommendCrystal([card.element || cardMeta?.element || 'major']);
    const wuxing = (picked.wuxing in { 木: 1, 火: 1, 土: 1, 金: 1, 水: 1 }
      ? picked.wuxing
      : '金') as WuxingSku;
    const localized = crystalCopy.get(wuxing);
    const productMatch =
      billingRecommend && billingRecommend.sku === picked.shopSku ? billingRecommend : null;
    return {
      sku: picked.shopSku,
      name: productMatch?.name || `${localized.name}${copy.lang === 'zh' ? '能量手串' : ' bracelet'}`,
      desc: productMatch?.desc || localized.desc,
      priceDisplay: productMatch?.priceDisplay || '',
      elementLabel: crystalCopy.wuxingLabel(localized.wuxingLabel),
    };
  }, [card, cardMeta?.element, crystalCopy, billingRecommend, copy.lang]);

  const handleRecommendBuy = async () => {
    if (!crystalRecommend?.sku || buyLoading) return;
    setBuyLoading(true);
    setError('');
    try {
      const qs = record?.id ? `?recordId=${encodeURIComponent(record.id)}` : '';
      const returnUrl = `${window.location.origin}/daily-fortune${qs}`;
      const result = await startAppCheckout({
        sku: crystalRecommend.sku,
        recommendationContext: `每日启示推荐：${crystalRecommend.name}`,
        readingId: record?.id,
        successUrl: `${returnUrl}${qs ? '&' : '?'}paid=1`,
        cancelUrl: returnUrl,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      if (isCheckoutAuthRequiredError(err)) {
        setError(copy.recommendLoginBeforeBuy);
        window.location.assign(buildLoginUrlFromWindow());
        return;
      }
      setError(err instanceof Error ? err.message : copy.checkoutFailed);
    } finally {
      setBuyLoading(false);
    }
  };

  const orientation = card?.orientation ?? '正位';
  const tone = getDailyTone(orientation, copy.lang);
  const attitude = cardMeta
    ? getDailyAttitudeGuide(
      cardMeta.id,
      cardNameFor(cardMeta),
      orientation,
      cardMeta.suit,
      copy.lang,
    )
    : '';

  if (step === 'loading') {
    return (
      <div className="daily-fortune-page">
        <div className="daily-fortune-quota-loading" style={{ padding: '48px 0' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="daily-fortune-page">
      {step === 'start' && (
        <div className="daily-insight-intro animate-fade-in-up">
          <h1 className="daily-insight-intro-title">{copy.introTitle}</h1>
          <p className="daily-insight-intro-subtitle">{copy.introSubtitle}</p>
          {participantCount != null ? (
            <p className="daily-insight-intro-count">
              {copy.participantCount(formatCount(participantCount))}
            </p>
          ) : null}
          <div className="daily-insight-intro-divider" aria-hidden />
          <button
            type="button"
            className="daily-insight-intro-draw"
            onClick={() => void submitDraw()}
            disabled={drawLoading}
          >
            <div className="daily-insight-intro-card">
              <Image
                src="/cards/back.webp"
                alt=""
                width={120}
                height={186}
                className="daily-insight-intro-card-img"
                priority
              />
            </div>
            <span className="daily-insight-intro-draw-label">{copy.tapToDraw}</span>
          </button>
          <div className="daily-insight-intro-divider" aria-hidden />
          <div className="daily-insight-intro-calm">
            {copy.introCalmLines.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        </div>
      )}

      {step === 'drawing' && (
        <div className="daily-fortune-draw card animate-fade-in-up">
          {drawLoading || !card || !cardMeta ? (
            <MantoThinking message={copy.drawing} hint={copy.drawingHint} />
          ) : (
            <>
              <p className="daily-fortune-draw-hint">
                {flipped ? copy.cardRevealed : copy.cardFlipping}
              </p>
              <div className="daily-fortune-draw-card">
                <TarotFlipCard
                  card={cardMeta}
                  flipped={flipped}
                  glowing
                  size="lg"
                  orientation={card.orientation}
                  caption={
                    flipped
                      ? `${cardNameFor(cardMeta)} · ${copy.orientation(card.orientation)}`
                      : null
                  }
                />
              </div>
            </>
          )}
        </div>
      )}

      {step === 'report' && card && cardMeta && (
        <div className="daily-fortune-report animate-fade-in-up">
          <div className="page-header">
            <span className="label">{copy.label}</span>
            <h1>{copy.introTitle}</h1>
          </div>

          {alreadyDrewToday ? (
            <div className="card daily-fortune-already-drew animate-fade-in-up" role="status">
              <p>{copy.alreadyDrewToday}</p>
            </div>
          ) : null}

          <div className="card daily-insight-summary">
            <p className="daily-insight-summary-tone">{tone.result}</p>
            <div className="daily-insight-summary-guide">
              <p className="daily-insight-summary-guide-label">{copy.attitudeGuideLabel}</p>
              <p>{attitude}</p>
            </div>
          </div>

          <div className="card daily-fortune-draw" style={{ marginBottom: 16 }}>
            <div className="daily-fortune-draw-card">
              <TarotFlipCard
                card={cardMeta}
                flipped
                size="md"
                orientation={card.orientation}
                caption={`${cardNameFor(cardMeta)} · ${copy.orientation(card.orientation)}`}
              />
            </div>
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">{copy.briefTitle}</h2>
            <p>{brief}</p>
          </div>

          <div className="card daily-fortune-dims">
            <h2 className="daily-fortune-section-title">{copy.dimsTitle}</h2>
            {fullReport ? (
              <div className="daily-fortune-dim-grid">
                {(['work', 'love', 'career', 'wealth'] as const).map((key) => (
                  <div key={key} className="daily-fortune-dim">
                    <div className="daily-fortune-dim-head">
                      <span>{copy.dimLabel(key)}</span>
                      <span className="daily-fortune-dim-tag">{fullReport[key].tag}</span>
                    </div>
                    <p>{fullReport[key].text}</p>
                  </div>
                ))}
                <div className="daily-fortune-dim daily-fortune-dim--summary">
                  <div className="daily-fortune-dim-head">
                    <span>{copy.dimLabel('summary')}</span>
                  </div>
                  <p>{fullReport.summary}</p>
                </div>
              </div>
            ) : (
              <GuestLoginWall
                title={copy.loginDimsTitle}
                message={copy.loginDimsMessage}
                hint={copy.loginDimsHint}
                ctaLabel={copy.loginDimsCta}
                returnPath={
                  record
                    ? `/daily-fortune?recordId=${encodeURIComponent(record.id)}`
                    : '/daily-fortune'
                }
              >
                {record?.fullReport ? (
                  <div className="daily-fortune-dim-grid daily-fortune-dim-grid--blurred">
                    {(['work', 'love', 'career', 'wealth'] as const).map((key) => (
                      <div key={key} className="daily-fortune-dim">
                        <div className="daily-fortune-dim-head">
                          <span>{copy.dimLabel(key)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </GuestLoginWall>
            )}
          </div>

          {crystalRecommend ? (
            <div className="card daily-fortune-recommend">
              <h2 className="daily-fortune-section-title">{copy.recommendTitle}</h2>
              <p className="daily-fortune-recommend-lead">{copy.recommendLead}</p>
              <p className="daily-fortune-recommend-element">{crystalRecommend.elementLabel}</p>
              <p className="daily-fortune-recommend-name">{crystalRecommend.name}</p>
              <p className="daily-fortune-recommend-desc">{crystalRecommend.desc}</p>
              <div className="daily-fortune-recommend-buy">
                {crystalRecommend.priceDisplay ? (
                  <p className="daily-fortune-recommend-price">{crystalRecommend.priceDisplay}</p>
                ) : null}
                <Button
                  type="button"
                  className="w-full"
                  disabled={buyLoading}
                  loading={buyLoading}
                  onClick={() => void handleRecommendBuy()}
                >
                  {buyLoading ? copy.recommendBuying : copy.recommendCta}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {step === 'exhausted' && (
        <div className="card daily-fortune-paywall animate-fade-in-up">
          <h2 className="daily-fortune-section-title">{copy.exhaustedToday}</h2>
          <p className="daily-fortune-paywall-desc">{copy.alreadyDrewToday}</p>
        </div>
      )}

      {error ? (
        <p style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13, marginTop: 16 }}>{error}</p>
      ) : null}

      <Button asChild variant="ghost" className="daily-fortune-coming-back mt-5 orasage-subpage-back-local">
        <Link href="/">{copy.backHome}</Link>
      </Button>
    </div>
  );
}
