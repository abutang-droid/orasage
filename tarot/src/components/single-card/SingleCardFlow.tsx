'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { MantoThinking } from '@/components/MantoThinking';
import { TarotFlipCard } from '@/components/TarotFlipCard';
import { buildLoginUrl } from '@/lib/login-url';
import { profileUrlFromLang } from '@/lib/orasage-locale';
import { useCardName } from '@/lib/i18n/context';
import { useSingleCardCopy } from '@/lib/i18n/reading-copy';
import { getCardById } from '@/lib/tarot/cards';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import type { TarotBillingProduct } from '@/lib/tarot-billing-config';
import type {
  SingleCardBriefPayload,
  SingleCardFullReport,
  SingleCardRecordDto,
  SingleCardStoredCard,
} from '@/lib/single-card/types';

type Quota = {
  dateKey: string;
  allowance: number;
  remaining: number;
  drawsUsed: number;
  templeBonusGranted: boolean;
};

type BillingPayload = {
  threeCardReport: TarotBillingProduct | null;
  threeCardBundle: TarotBillingProduct | null;
  skus: { threeCardReportSku: string; threeCardBundleSku: string };
};

type SessionPayload = {
  isLoggedIn: boolean;
  nickname: string | null;
  quota: Quota;
  billing: BillingPayload;
  record: SingleCardRecordDto | null;
};

type Step =
  | 'loading'
  | 'intro'
  | 'drawing'
  | 'brief'
  | 'paywall'
  | 'full_report'
  | 'quota_exhausted';

export function SingleCardFlow() {
  const copy = useSingleCardCopy();
  const cardNameFor = useCardName();
  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [question, setQuestion] = useState('');
  const [readingId, setReadingId] = useState<string | null>(null);
  const [card, setCard] = useState<SingleCardStoredCard | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [brief, setBrief] = useState<SingleCardBriefPayload | null>(null);
  const [fullReport, setFullReport] = useState<SingleCardFullReport | null>(null);
  const [paidTier, setPaidTier] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingOrderNo, setPendingOrderNo] = useState<string | null>(null);
  const [checkoutSku, setCheckoutSku] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);

  const loadBrief = useCallback(async (id: string) => {
    setBriefLoading(true);
    setError('');
    try {
      const res = await fetch('/api/single-card/brief', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || copy.briefFailed);
      setBrief(data.brief);
      setStep('brief');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.briefFailed);
    } finally {
      setBriefLoading(false);
    }
  }, [copy.briefFailed]);

  const hydrateRecord = useCallback((rec: SingleCardRecordDto, loggedIn: boolean) => {
    setReadingId(rec.id);
    setQuestion(rec.question);
    setCard(rec.card);
    setBrief(rec.briefText);
    setFullReport(rec.fullReport);
    setPaidTier(rec.paidTier);
    setFlipped(true);
    if (rec.fullReport && rec.paidTier) {
      setStep('full_report');
    } else if (rec.briefText) {
      setStep(loggedIn ? 'paywall' : 'brief');
    } else {
      setStep('drawing');
      void loadBrief(rec.id);
    }
  }, [loadBrief]);

  const fetchFullReport = useCallback(async (id: string, orderNo?: string | null) => {
    const res = await fetch('/api/single-card/full-report', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: id, orderNo: orderNo ?? undefined }),
    });
    const data = await res.json();
    if (res.status === 401 || res.status === 402) {
      setStep('paywall');
      return;
    }
    if (!res.ok) throw new Error(data.error || copy.fullFailed);
    setFullReport(data.fullReport);
    setPaidTier(data.tier);
    setStep('full_report');
    setPendingOrderNo(null);
  }, [copy.fullFailed]);

  const loadSession = useCallback(async () => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const orderParam = params?.get('order');
    const readingParam = params?.get('readingId');
    if (orderParam) setPendingOrderNo(orderParam);

    const qs = readingParam ? `?readingId=${encodeURIComponent(readingParam)}` : '';
    const res = await fetch(`/api/single-card/session${qs}`, { credentials: 'include', cache: 'no-store' });
    const data = (await res.json()) as SessionPayload;
    setSession(data);
    setIsLoggedIn(data.isLoggedIn);

    if (data.record) {
      hydrateRecord(data.record, data.isLoggedIn);
      if (orderParam && data.record.id && !data.record.fullReport) {
        await fetchFullReport(data.record.id, orderParam);
      }
      return;
    }

    if (orderParam && readingParam) {
      setReadingId(readingParam);
      await fetchFullReport(readingParam, orderParam);
      return;
    }

    if (data.quota.remaining <= 0) {
      setStep('quota_exhausted');
      return;
    }

    setStep('intro');
  }, [fetchFullReport, hydrateRecord]);

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
      const res = await fetch('/api/single-card/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: question.trim() || undefined }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setSession((s) => (s ? { ...s, quota: data.quota } : s));
        setStep('quota_exhausted');
        return;
      }
      if (!res.ok) throw new Error(data.error || copy.drawFailed);
      setReadingId(data.readingId);
      setCard(data.card);
      setSession((s) => (s ? { ...s, quota: data.quota } : s));
      setDrawLoading(false);
      setTimeout(() => setFlipped(true), 500);
      setTimeout(() => void loadBrief(data.readingId), 1400);
    } catch (err) {
      setDrawLoading(false);
      setError(err instanceof Error ? err.message : copy.drawFailed);
      setStep('intro');
    }
  };

  const goToPaywall = () => setStep('paywall');

  const handleCheckout = async (sku: string) => {
    if (!isLoggedIn) {
      setError(copy.loginBeforeBuy);
      return;
    }
    if (!readingId) return;
    setCheckoutSku(sku);
    setError('');
    try {
      const successUrl = `${window.location.origin}/single-card?readingId=${encodeURIComponent(readingId)}&paid=1`;
      const result = await startAppCheckout({
        sku,
        readingId,
        successUrl,
        cancelUrl: `${window.location.origin}/single-card?readingId=${encodeURIComponent(readingId)}`,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.checkoutFailed);
    } finally {
      setCheckoutSku(null);
    }
  };

  const cardMeta = card ? getCardById(card.cardId) : null;
  const reportProduct = session?.billing.threeCardReport;
  const bundleProduct = session?.billing.threeCardBundle;
  const readingReturnPath = readingId
    ? `/single-card?readingId=${encodeURIComponent(readingId)}`
    : '/single-card';
  const loginHref = buildLoginUrl(readingReturnPath);

  if (step === 'loading') {
    return (
      <div className="three-card-page">
        <div className="daily-fortune-quota-loading" style={{ padding: '48px 0' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="three-card-page">
      <div className="page-header animate-fade-in-up">
        <span className="label">{copy.label}</span>
        <h1>{copy.title}</h1>
        <p>
          {copy.nicknameGreeting(session?.nickname)}
          {copy.subtitle}
        </p>
      </div>

      {session && step !== 'paywall' && step !== 'quota_exhausted' && (
        <div className="daily-fortune-quota card animate-fade-in-up delay-100">
          <div className="daily-fortune-quota-row">
            <span>{copy.quotaAllowance}</span>
            <strong>{copy.times(session.quota.allowance)}</strong>
          </div>
          <div className="daily-fortune-quota-row">
            <span>{copy.quotaRemaining}</span>
            <strong>{copy.times(session.quota.remaining)}</strong>
          </div>
          {session.quota.templeBonusGranted ? (
            <div className="daily-fortune-quota-row">
              <span>{copy.templeBonusGranted}</span>
            </div>
          ) : (
            <div className="daily-fortune-quota-row">
              <span>{copy.templeBonusHint}</span>
            </div>
          )}
        </div>
      )}

      {step === 'intro' && (
        <div className="daily-fortune-panel card animate-fade-in-up delay-200">
          <p className="daily-fortune-panel-lead">{copy.introLead}</p>
          <label className="three-card-question-label" htmlFor="single-card-question">
            {copy.questionLabel}
          </label>
          <textarea
            id="single-card-question"
            className="three-card-question-input"
            rows={3}
            maxLength={500}
            placeholder={copy.questionPlaceholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button type="button" className="daily-fortune-panel-btn w-full" onClick={() => void submitDraw()}>
            {copy.start}
          </Button>
        </div>
      )}

      {step === 'drawing' && (
        <div className="daily-fortune-draw card animate-fade-in-up">
          {drawLoading || !card || !cardMeta ? (
            <MantoThinking message={copy.drawing} hint={copy.drawingHint} />
          ) : briefLoading ? (
            <MantoThinking message={copy.writingBrief} hint={copy.writingBriefHint} />
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
                      : undefined
                  }
                />
              </div>
            </>
          )}
        </div>
      )}

      {step === 'brief' && brief && card && cardMeta && (
        <div className="three-card-brief animate-fade-in-up">
          <div className="daily-fortune-draw-card" style={{ marginBottom: 16 }}>
            <TarotFlipCard
              card={cardMeta}
              flipped
              size="md"
              orientation={card.orientation}
              caption={`${cardNameFor(cardMeta)} · ${copy.orientation(card.orientation)}`}
            />
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">{copy.freeBrief}</h2>
            <p>{brief.text}</p>
          </div>

          <div className="card three-card-unlock-cta">
            <p>{copy.unlockLead}</p>
            {!isLoggedIn ? (
              <Button asChild className="w-full">
                <Link href={loginHref} className="block text-center no-underline">
                  {copy.loginUnlock}
                </Link>
              </Button>
            ) : (
              <Button type="button" className="w-full" onClick={goToPaywall}>
                {copy.viewPlans}
              </Button>
            )}
          </div>

          {session && session.quota.remaining > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-3"
              onClick={() => {
                setReadingId(null);
                setCard(null);
                setBrief(null);
                setFlipped(false);
                setStep('intro');
              }}
            >
              {copy.drawAgain(session.quota.remaining)}
            </Button>
          )}
        </div>
      )}

      {step === 'paywall' && (
        <div className="three-card-paywall animate-fade-in-up">
          {!isLoggedIn ? (
            <GuestLoginWall
              title={copy.paywallTitle}
              message={copy.paywallMessage}
              hint={copy.paywallHint}
              ctaLabel={copy.paywallCta}
              returnPath={readingReturnPath}
            />
          ) : (
            <>
              <div className="card three-card-tier">
                <h2 className="daily-fortune-section-title">{copy.tier1Title}</h2>
                {reportProduct ? (
                  <>
                    <p className="three-card-tier-name">{reportProduct.name}</p>
                    <p className="three-card-tier-desc">{reportProduct.desc}</p>
                    <p className="three-card-tier-price">{reportProduct.priceDisplay}</p>
                  </>
                ) : (
                  <p className="three-card-tier-desc">{copy.tier1Fallback}</p>
                )}
                <Button
                  type="button"
                  className="w-full mt-3"
                  disabled={checkoutSku !== null}
                  onClick={() =>
                    void handleCheckout(
                      reportProduct?.sku ?? session?.billing.skus.threeCardReportSku ?? 'report-tarot',
                    )
                  }
                >
                  {checkoutSku === (reportProduct?.sku ?? session?.billing.skus.threeCardReportSku)
                    ? copy.redirecting
                    : copy.buyReport}
                </Button>
              </div>

              <div className="card three-card-tier three-card-tier--bundle">
                <h2 className="daily-fortune-section-title">{copy.tier2Title}</h2>
                {bundleProduct ? (
                  <>
                    <p className="three-card-tier-name">{bundleProduct.name}</p>
                    <p className="three-card-tier-desc">{bundleProduct.desc}</p>
                    <p className="three-card-tier-price">{bundleProduct.priceDisplay}</p>
                  </>
                ) : (
                  <p className="three-card-tier-desc">{copy.tier2Fallback}</p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-3"
                  disabled={checkoutSku !== null}
                  onClick={() =>
                    void handleCheckout(
                      bundleProduct?.sku ?? session?.billing.skus.threeCardBundleSku ?? 'report-tarot-bundle',
                    )
                  }
                >
                  {checkoutSku === (bundleProduct?.sku ?? session?.billing.skus.threeCardBundleSku)
                    ? copy.redirecting
                    : copy.buyBundle}
                </Button>
              </div>
            </>
          )}
          {brief && (
            <Button type="button" variant="ghost" className="w-full mt-3" onClick={() => setStep('brief')}>
              {copy.backBrief}
            </Button>
          )}
        </div>
      )}

      {step === 'full_report' && fullReport && card && cardMeta && (
        <div className="three-card-full animate-fade-in-up">
          <div className="daily-fortune-draw-card" style={{ marginBottom: 16 }}>
            <TarotFlipCard
              card={cardMeta}
              flipped
              size="md"
              orientation={card.orientation}
              caption={`${cardNameFor(cardMeta)} · ${copy.orientation(card.orientation)}`}
            />
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">{copy.paidView}</h2>
            {fullReport.cards.map((item, i) => (
              <div key={i} className="three-card-brief-item">
                <p>{item.interpretation}</p>
                {item.mantra ? <p className="three-card-mantra">{item.mantra}</p> : null}
              </div>
            ))}
            <div className="three-card-brief-synthesis">
              <strong>{copy.fullSynthesis}</strong>
              <p>{fullReport.synthesis}</p>
            </div>
            {fullReport.suggestions.length > 0 && (
              <div className="three-card-suggestions">
                <strong>{copy.suggestions}</strong>
                <ul>
                  {fullReport.suggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {fullReport.affirmation && (
              <p className="three-card-affirmation">{fullReport.affirmation}</p>
            )}
          </div>

          {paidTier === 'bundle' && (
            <p className="three-card-bundle-note">{copy.bundleNote}</p>
          )}

          <Button asChild variant="outline" className="w-full mt-3">
            <a href={profileUrlFromLang(copy.lang)} className="block text-center no-underline">
              {copy.viewOrders}
            </a>
          </Button>
        </div>
      )}

      {step === 'quota_exhausted' && (
        <div className="card daily-fortune-paywall animate-fade-in-up">
          <h2 className="daily-fortune-section-title">{copy.quotaExhaustedTitle}</h2>
          <p className="daily-fortune-paywall-desc">{copy.quotaExhaustedDesc}</p>
          {!session?.quota.templeBonusGranted && (
            <Button asChild variant="outline" className="w-full mb-2.5">
              <Link href="/temple" className="block text-center no-underline">
                {copy.templeBonus}
              </Link>
            </Button>
          )}
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
