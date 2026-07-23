'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, buttonVariants } from '@orasage/ui/button';
import { cn } from '@orasage/ui';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { MantoThinking } from '@/components/MantoThinking';
import { TarotFlipCard } from '@/components/TarotFlipCard';
import { buildLoginUrl } from '@/lib/login-url';
import { profileUrlFromLang } from '@/lib/orasage-locale';
import { useCardName } from '@/lib/i18n/context';
import { aiLangBody } from '@/lib/i18n/ai-lang-body';
import { POSITION_KEYS, useThreeCardCopy } from '@/lib/i18n/reading-copy';
import { getCardById } from '@/lib/tarot/cards';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import type { TarotBillingProduct } from '@/lib/tarot-billing-config';
import { ThreeCardTrilogyResult } from '@/components/three-card/ThreeCardTrilogyResult';
import type {
  ThreeCardBriefPayload,
  ThreeCardFullReport,
  ThreeCardRecordDto,
  ThreeCardStoredCard,
} from '@/lib/three-card/types';
import { isThreeCardTrilogy } from '@/lib/three-card/trilogy-types';

type BillingPayload = {
  threeCardReport: TarotBillingProduct | null;
  threeCardBundle: TarotBillingProduct | null;
  skus: { threeCardReportSku: string; threeCardBundleSku: string };
};

type SessionPayload = {
  isLoggedIn: boolean;
  nickname: string | null;
  billing: BillingPayload;
  record: ThreeCardRecordDto | null;
};

type Step = 'loading' | 'intro' | 'revealing' | 'brief' | 'paywall' | 'full_report';

const POSITION_ORDER = [...POSITION_KEYS];

export function ThreeCardFlow() {
  const copy = useThreeCardCopy();
  const cardNameFor = useCardName();
  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [question, setQuestion] = useState('');
  const [readingId, setReadingId] = useState<string | null>(null);
  const [cards, setCards] = useState<ThreeCardStoredCard[]>([]);
  const [revealedCount, setRevealedCount] = useState(0);
  const [brief, setBrief] = useState<ThreeCardBriefPayload | null>(null);
  const [fullReport, setFullReport] = useState<ThreeCardFullReport | null>(null);
  const [paidTier, setPaidTier] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [pendingOrderNo, setPendingOrderNo] = useState<string | null>(null);
  const [checkoutSku, setCheckoutSku] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [briefLoading, setBriefLoading] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);

  const sortedCards = [...cards].sort(
    (a, b) =>
      POSITION_ORDER.indexOf(a.positionLabel as (typeof POSITION_ORDER)[number]) -
      POSITION_ORDER.indexOf(b.positionLabel as (typeof POSITION_ORDER)[number]),
  );

  const hydrateRecord = useCallback((rec: ThreeCardRecordDto, loggedIn: boolean) => {
    setReadingId(rec.id);
    setQuestion(rec.question);
    setCards(rec.cards);
    setBrief(rec.briefText);
    setFullReport(rec.fullReport);
    setPaidTier(rec.paidTier);
    setRevealedCount(rec.cards.length);
    if (rec.fullReport && rec.paidTier) {
      setStep('full_report');
    } else if (rec.briefText) {
      setStep(loggedIn ? 'paywall' : 'brief');
    }
  }, []);

  const fetchFullReport = useCallback(async (id: string, orderNo?: string | null) => {
    const res = await fetch('/api/three-card/full-report', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ readingId: id, orderNo: orderNo ?? undefined, ...aiLangBody(copy.lang) }),
    });
    const data = await res.json();
    if (res.status === 401) {
      setIsLoggedIn(false);
      setStep('paywall');
      return;
    }
    if (res.status === 402) {
      setStep('paywall');
      return;
    }
    if (!res.ok) throw new Error(data.error || copy.fullFailed);
    setFullReport(data.fullReport);
    setPaidTier(data.tier);
    setStep('full_report');
    setPendingOrderNo(null);
  }, [copy.fullFailed, copy.lang]);

  const loadSession = useCallback(async () => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const orderParam = params?.get('order');
    const readingParam = params?.get('readingId');
    if (orderParam) setPendingOrderNo(orderParam);

    const qs = readingParam ? `?readingId=${encodeURIComponent(readingParam)}` : '';
    const res = await fetch(`/api/three-card/session${qs}`, { credentials: 'include', cache: 'no-store' });
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

    setStep('intro');
  }, [fetchFullReport, hydrateRecord]);

  useEffect(() => {
    void loadSession().catch(() => setError(copy.loadFailed));
  }, [loadSession]);

  const beginDraw = () => {
    void submitStart();
  };

  const submitStart = async () => {
    setStep('revealing');
    setRevealedCount(0);
    setCards([]);
    setDrawLoading(true);
    setError('');
    try {
      const res = await fetch('/api/three-card/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim() || undefined,
          answers: [],
          ...aiLangBody(copy.lang),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || copy.drawFailed);
      setReadingId(data.readingId);
      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.drawFailed);
      setStep('intro');
    } finally {
      setDrawLoading(false);
    }
  };

  const revealNext = () => {
    if (revealedCount >= cards.length) return;
    const next = revealedCount + 1;
    setRevealedCount(next);
    if (next >= cards.length) {
      void loadBrief();
    }
  };

  const loadBrief = async () => {
    if (!readingId) return;
    setBriefLoading(true);
    setError('');
    try {
      const res = await fetch('/api/three-card/brief', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId, ...aiLangBody(copy.lang) }),
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
  };

  const goToPaywall = () => {
    setStep('paywall');
  };

  const handleCheckout = async (sku: string) => {
    if (!isLoggedIn) {
      setError(copy.loginBeforeBuy);
      return;
    }
    if (!readingId) {
      setError(copy.checkoutFailed);
      return;
    }
    setCheckoutSku(sku);
    setError('');
    try {
      const successUrl = `${window.location.origin}/reading?readingId=${encodeURIComponent(readingId)}&paid=1`;
      const result = await startAppCheckout({
        sku,
        readingId,
        successUrl,
        cancelUrl: `${window.location.origin}/reading?readingId=${encodeURIComponent(readingId)}`,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.checkoutFailed);
    } finally {
      setCheckoutSku(null);
    }
  };

  const reportProduct = session?.billing.threeCardReport;
  const bundleProduct = session?.billing.threeCardBundle;
  const readingReturnPath = readingId
    ? `/reading?readingId=${encodeURIComponent(readingId)}`
    : '/reading';
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
    <div className="three-card-page trilogy-page">
      <div className="page-header animate-fade-in-up">
        <h1>{copy.title}</h1>
        <p className="trilogy-status">{copy.statusBadge}</p>
        {session?.nickname ? (
          <p className="trilogy-greeting">{copy.nicknameGreeting(session.nickname)}</p>
        ) : null}
      </div>

      {step === 'intro' && (
        <div className="daily-fortune-panel card animate-fade-in-up delay-100">
          <p className="daily-fortune-panel-lead trilogy-intro-lead">
            {copy.introLead.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < copy.introLead.split('\n').length - 1 ? <br /> : null}
              </span>
            ))}
          </p>
          <label className="three-card-question-label" htmlFor="three-card-question">
            {copy.questionLabel}
          </label>
          <textarea
            id="three-card-question"
            className="three-card-question-input"
            rows={3}
            maxLength={500}
            placeholder={copy.questionPlaceholder}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <Button
            type="button"
            className="daily-fortune-panel-btn w-full"
            onClick={beginDraw}
          >
            {copy.start}
          </Button>
        </div>
      )}

      {step === 'revealing' && (
        <div className="three-card-reveal animate-fade-in-up">
          {drawLoading || sortedCards.length === 0 ? (
            <MantoThinking message={copy.drawing} hint={copy.drawingHint} />
          ) : (
            <>
              <p className="daily-fortune-draw-hint">
                {revealedCount < cards.length
                  ? copy.tapReveal(revealedCount + 1)
                  : briefLoading
                    ? copy.briefGenerating
                    : copy.allRevealed}
              </p>
              <div className="three-card-grid">
                {sortedCards.map((c, i) => {
                  const meta = getCardById(c.cardId);
                  if (!meta) return null;
                  const isRevealed = i < revealedCount;
                  const localizedName = cardNameFor(meta);
                  return (
                    <div key={c.positionLabel} className="three-card-slot">
                      <span className="three-card-position">{copy.position(c.positionLabel)}</span>
                      <span className="three-card-position-sub">{copy.positionSublabel(c.positionLabel)}</span>
                      <TarotFlipCard
                        card={meta}
                        flipped={isRevealed}
                        glowing={i === revealedCount && !isRevealed}
                        size="sm"
                        orientation={c.orientation}
                        disabled={!isRevealed && i !== revealedCount}
                        onClick={i === revealedCount && !isRevealed ? revealNext : undefined}
                        caption={
                          isRevealed
                            ? `${localizedName} · ${copy.orientation(c.orientation)}`
                            : undefined
                        }
                      />
                    </div>
                  );
                })}
              </div>
              {briefLoading && (
                <MantoThinking message={copy.writingBrief} hint={copy.writingBriefHint} />
              )}
            </>
          )}
        </div>
      )}

      {step === 'brief' && brief && (
        <div className="three-card-brief animate-fade-in-up">
          <div className="three-card-grid three-card-grid--compact">
            {sortedCards.map((c) => {
              const meta = getCardById(c.cardId);
              return (
                <div key={c.positionLabel} className="three-card-slot">
                  {meta ? (
                    <TarotFlipCard
                      card={meta}
                      flipped
                      size="sm"
                      orientation={c.orientation}
                      caption={`${copy.position(c.positionLabel)} · ${cardNameFor(meta)}`}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">{copy.freeBrief}</h2>
            {brief.perCard.map((item) => (
              <div key={item.position} className="three-card-brief-item">
                <strong>{copy.position(item.position)}</strong>
                <span className="three-card-brief-sub">{copy.positionSublabel(item.position)}</span>
                <p>{item.text}</p>
              </div>
            ))}
          </div>

          <div className="card three-card-unlock-cta">
            <p>{copy.unlockLead}</p>
            {!isLoggedIn ? (
              <a
                href={loginHref}
                className={cn(buttonVariants(), 'w-full block text-center no-underline')}
              >
                {copy.loginUnlock}
              </a>
            ) : (
              <Button type="button" className="w-full" onClick={goToPaywall}>
                {copy.viewPlans}
              </Button>
            )}
          </div>
        </div>
      )}

      {step === 'paywall' && (
        <div className="three-card-paywall animate-fade-in-up">
          {error ? <p className="paywall-error">{error}</p> : null}
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

              {pendingOrderNo && readingId && (
                <Button
                  type="button"
                  variant="ghost"
                  className="w-full mt-3"
                  onClick={() => void fetchFullReport(readingId, pendingOrderNo)}
                >
                  {copy.paidView}
                </Button>
              )}
            </>
          )}

          {brief && (
            <Button type="button" variant="ghost" className="w-full mt-3" onClick={() => setStep('brief')}>
              {copy.backBrief}
            </Button>
          )}
        </div>
      )}

      {step === 'full_report' && fullReport && (
        <div className="three-card-full animate-fade-in-up">
          <div className="three-card-grid three-card-grid--compact">
            {sortedCards.map((c) => {
              const meta = getCardById(c.cardId);
              return (
                <div key={c.positionLabel} className="three-card-slot">
                  {meta ? (
                    <TarotFlipCard
                      card={meta}
                      flipped
                      size="sm"
                      orientation={c.orientation}
                      caption={`${copy.position(c.positionLabel)} · ${cardNameFor(meta)}`}
                    />
                  ) : null}
                  <span className="three-card-position-sub">{copy.positionSublabel(c.positionLabel)}</span>
                </div>
              );
            })}
          </div>

          {isThreeCardTrilogy(fullReport) ? (
            <ThreeCardTrilogyResult
              trilogy={fullReport}
              sectionArchitecture={copy.sectionArchitecture}
              modeLabel={copy.modeLabel}
              sectionNodes={copy.sectionNodes}
              sectionChain={copy.sectionChain}
              sectionThreshold={copy.sectionThreshold}
              positionLabel={copy.position}
            />
          ) : (
            <>
              <div className="three-card-grid three-card-grid--compact">
                {sortedCards.map((c, i) => {
                  const meta = getCardById(c.cardId);
                  const cardReport = fullReport.cards[i];
                  return (
                    <div key={c.positionLabel} className="three-card-full-card card">
                      {meta ? (
                        <div className="three-card-full-card-visual">
                          <TarotFlipCard
                            card={meta}
                            flipped
                            size="sm"
                            orientation={c.orientation}
                          />
                        </div>
                      ) : null}
                      <p className="three-card-caption">
                        {copy.position(c.positionLabel)} · {meta ? cardNameFor(meta) : c.cardName} ·{' '}
                        {copy.orientation(c.orientation)}
                      </p>
                      {cardReport && (
                        <>
                          <p className="three-card-full-text">{cardReport.interpretation}</p>
                          <p className="three-card-mantra">「{cardReport.mantra}」</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="card daily-fortune-brief">
                <h2 className="daily-fortune-section-title">{copy.fullSynthesis}</h2>
                <p>{fullReport.synthesis}</p>
              </div>

              <div className="card three-card-suggestions">
                <h2 className="daily-fortune-section-title">{copy.suggestions}</h2>
                <ul>
                  {fullReport.suggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>

              {'affirmation' in fullReport && fullReport.affirmation ? (
                <div className="card three-card-affirmation">
                  <p>{fullReport.affirmation}</p>
                </div>
              ) : null}
            </>
          )}

          {paidTier === 'bundle' && bundleProduct?.requiresShipping && (
            <div className="card three-card-bundle-note">
              <p>{copy.bundleNote}</p>
              <Button asChild variant="outline" className="w-full mt-2.5">
                <a
                  href={`${profileUrlFromLang(copy.lang)}/orders`}
                  className="block text-center no-underline"
                >
                  {copy.viewOrders}
                </a>
              </Button>
            </div>
          )}

          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3"
            onClick={() => {
              setQuestion('');
              setReadingId(null);
              setCards([]);
              setBrief(null);
              setFullReport(null);
              setRevealedCount(0);
              setStep('intro');
            }}
          >
            {copy.again}
          </Button>
        </div>
      )}

      {error && step !== 'paywall' ? (
        <p style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13, marginTop: 16 }}>{error}</p>
      ) : null}

      <Button asChild variant="ghost" className="daily-fortune-coming-back mt-5 orasage-subpage-back-local">
        <Link href="/">{copy.backHome}</Link>
      </Button>
    </div>
  );
}
