'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { MantoThinking } from '@/components/MantoThinking';
import { DestinySliceDeck } from '@/components/single-card/DestinySliceDeck';
import { SingleCardReveal } from '@/components/single-card/SingleCardReveal';
import { useSingleCardCopy } from '@/lib/i18n/reading-copy';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import type { TarotBillingProduct } from '@/lib/tarot-billing-config';
import type {
  DestinySliceGuidancePayload,
  SingleCardBriefPayload,
  SingleCardRecordDto,
  SingleCardStoredCard,
} from '@/lib/single-card/types';
import {
  isDestinySliceGuidance,
  isSingleCardVerdict,
} from '@/lib/single-card/types';

type SessionPayload = {
  isLoggedIn: boolean;
  nickname: string | null;
  unlocked: boolean;
  billing: {
    destinySliceUnlock: TarotBillingProduct | null;
    skus: { destinySliceUnlockSku: string };
  };
  record: SingleCardRecordDto | null;
};

type Step = 'loading' | 'paywall' | 'intro' | 'drawing' | 'result';

function langBody(lang: string) {
  if (lang === 'en') return { language: 'en' };
  if (lang === 'pt') return { language: 'pt-BR' };
  if (lang === 'es') return { language: 'en' };
  return { language: 'zh-CN' };
}

function normalizeGuidance(
  brief: SingleCardBriefPayload | null,
  copy: ReturnType<typeof useSingleCardCopy>,
): DestinySliceGuidancePayload | null {
  if (!brief) return null;
  if (isDestinySliceGuidance(brief)) return brief;
  if (isSingleCardVerdict(brief)) {
    return {
      action: brief.headline,
      insight: brief.explanation || brief.guidance,
      llm: brief.llm,
    };
  }
  return {
    action: copy.legacyAction,
    insight: brief.text,
    llm: brief.llm,
  };
}

export function SingleCardFlow() {
  const copy = useSingleCardCopy();
  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [question, setQuestion] = useState('');
  const [readingId, setReadingId] = useState<string | null>(null);
  const [card, setCard] = useState<SingleCardStoredCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [guidance, setGuidance] = useState<DestinySliceGuidancePayload | null>(null);
  const [error, setError] = useState('');
  const [guidanceLoading, setGuidanceLoading] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);
  const [checkoutSku, setCheckoutSku] = useState<string | null>(null);

  const loadGuidance = useCallback(async (id: string) => {
    setGuidanceLoading(true);
    setError('');
    try {
      const res = await fetch('/api/single-card/brief', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: id, ...langBody(copy.lang) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || copy.guidanceFailed);
      setGuidance(normalizeGuidance(data.brief as SingleCardBriefPayload, copy));
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.guidanceFailed);
    } finally {
      setGuidanceLoading(false);
    }
  }, [copy]);

  const hydrateRecord = useCallback((rec: SingleCardRecordDto) => {
    setReadingId(rec.id);
    setQuestion(rec.question);
    setCard(rec.card);
    setRevealed(true);
    const g = normalizeGuidance(rec.briefText, copy);
    if (g) {
      setGuidance(g);
      setStep('result');
    } else {
      setStep('drawing');
      void loadGuidance(rec.id);
    }
  }, [copy, loadGuidance]);

  const loadSession = useCallback(async () => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const orderParam = params?.get('order');
    const readingParam = params?.get('readingId');

    const qs = new URLSearchParams();
    if (readingParam) qs.set('readingId', readingParam);
    if (orderParam) qs.set('order', orderParam);
    const query = qs.toString() ? `?${qs.toString()}` : '';

    const res = await fetch(`/api/single-card/session${query}`, { credentials: 'include', cache: 'no-store' });
    const data = (await res.json()) as SessionPayload;
    setSession(data);

    if (data.record) {
      hydrateRecord(data.record);
      return;
    }

    if (!data.unlocked) {
      setStep('paywall');
      return;
    }

    setStep('intro');
  }, [hydrateRecord]);

  useEffect(() => {
    void loadSession().catch(() => setError(copy.loadFailed));
  }, [loadSession, copy.loadFailed]);

  const submitDraw = async (pickIndex: number) => {
    const trimmed = question.trim();
    if (trimmed.length < 4) {
      setError(copy.questionTooShort);
      return;
    }

    setStep('drawing');
    setRevealed(false);
    setCard(null);
    setGuidance(null);
    setDrawLoading(true);
    setError('');
    try {
      const res = await fetch('/api/single-card/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed, pickIndex }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setStep('paywall');
        return;
      }
      if (!res.ok) throw new Error(data.error || copy.drawFailed);
      setReadingId(data.readingId);
      setCard(data.card);
      setDrawLoading(false);
      setTimeout(() => setRevealed(true), 600);
      setTimeout(() => void loadGuidance(data.readingId), 1300);
    } catch (err) {
      setDrawLoading(false);
      setError(err instanceof Error ? err.message : copy.drawFailed);
      setStep('intro');
    }
  };

  const handleUnlockCheckout = async () => {
    if (!session?.isLoggedIn) {
      setError(copy.loginBeforeBuy);
      return;
    }
    const sku =
      session.billing.destinySliceUnlock?.sku
      ?? session.billing.skus.destinySliceUnlockSku
      ?? 'tarot-destiny-slice';
    setCheckoutSku(sku);
    setError('');
    try {
      const successUrl = `${window.location.origin}/single-card?unlocked=1`;
      const result = await startAppCheckout({
        sku,
        successUrl,
        cancelUrl: `${window.location.origin}/single-card`,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.checkoutFailed);
    } finally {
      setCheckoutSku(null);
    }
  };

  const unlockProduct = session?.billing.destinySliceUnlock;
  const returnPath = '/single-card';

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
    <div className="three-card-page destiny-slice-page">
      <div className="page-header animate-fade-in-up">
        <span className="label">{copy.label}</span>
        <h1>{copy.title}</h1>
        <p>
          {copy.nicknameGreeting(session?.nickname)}
          {copy.subtitle}
        </p>
      </div>

      {step === 'paywall' && (
        <div className="card daily-fortune-paywall animate-fade-in-up">
          {!session?.isLoggedIn ? (
            <GuestLoginWall
              title={copy.paywallTitle}
              message={copy.paywallMessage}
              hint={copy.paywallHint}
              ctaLabel={copy.paywallCta}
              returnPath={returnPath}
            />
          ) : (
            <>
              <h2 className="daily-fortune-section-title">{copy.paywallTitle}</h2>
              <p className="daily-fortune-paywall-desc">{copy.paywallDesc}</p>
              {unlockProduct ? (
                <>
                  <p className="three-card-tier-name">{unlockProduct.name}</p>
                  <p className="three-card-tier-desc">{unlockProduct.desc}</p>
                  <p className="three-card-tier-price">{unlockProduct.priceDisplay}</p>
                </>
              ) : (
                <p className="three-card-tier-desc">{copy.paywallFallback}</p>
              )}
              <Button
                type="button"
                className="w-full mt-3"
                disabled={checkoutSku !== null}
                onClick={() => void handleUnlockCheckout()}
              >
                {checkoutSku ? copy.redirecting : copy.buyUnlock}
              </Button>
              <p className="destiny-slice-unlock-note">{copy.unlockForever}</p>
            </>
          )}
        </div>
      )}

      {step === 'intro' && session?.unlocked && (
        <div className="destiny-slice-intro animate-fade-in-up delay-200">
          <div className="card daily-fortune-panel">
            <p className="daily-fortune-panel-lead">{copy.introLead}</p>
            <label className="three-card-question-label" htmlFor="destiny-slice-question">
              {copy.questionLabel}
            </label>
            <textarea
              id="destiny-slice-question"
              className="three-card-question-input"
              rows={3}
              maxLength={500}
              placeholder={copy.questionPlaceholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <DestinySliceDeck
            disabled={question.trim().length < 4 || drawLoading}
            hint={copy.deckHint}
            pickLabel={copy.pickCard}
            onPick={(index) => void submitDraw(index)}
          />
        </div>
      )}

      {step === 'drawing' && (
        <div className="daily-fortune-draw card animate-fade-in-up">
          {drawLoading || !card ? (
            <MantoThinking message={copy.drawing} hint={copy.drawingHint} />
          ) : guidanceLoading ? (
            <>
              <SingleCardReveal
                card={card}
                revealed={revealed}
                orientationLabel={copy.orientation}
                hint={revealed ? copy.cardRevealed : copy.cardFlipping}
              />
              <MantoThinking message={copy.writingGuidance} hint={copy.writingGuidanceHint} />
            </>
          ) : null}
        </div>
      )}

      {step === 'result' && guidance && card && (
        <div className="destiny-slice-result animate-fade-in-up">
          <div className="card single-card-result-question">
            <p className="single-card-result-question-label">{copy.yourQuestion}</p>
            <p className="single-card-result-question-text">{question}</p>
          </div>

          <SingleCardReveal
            card={card}
            revealed
            orientationLabel={copy.orientation}
          />

          <div className="card destiny-slice-action">
            <p className="destiny-slice-action-label">{copy.actionLabel}</p>
            <p className="destiny-slice-action-text">{guidance.action}</p>
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">{copy.insightTitle}</h2>
            <p>{guidance.insight}</p>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3"
            onClick={() => {
              setReadingId(null);
              setCard(null);
              setGuidance(null);
              setRevealed(false);
              setStep('intro');
            }}
          >
            {copy.drawAgain}
          </Button>
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
