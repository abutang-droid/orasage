'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { MantoThinking } from '@/components/MantoThinking';
import { DestinySliceDeck } from '@/components/single-card/DestinySliceDeck';
import { DestinySliceFocusResult } from '@/components/single-card/DestinySliceFocusResult';
import { SingleCardReveal } from '@/components/single-card/SingleCardReveal';
import { aiLangBody as langBody } from '@/lib/i18n/ai-lang-body';
import { useSingleCardCopy } from '@/lib/i18n/reading-copy';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import type { TarotBillingProduct } from '@/lib/tarot-billing-config';
import type {
  DestinySliceFocusPayload,
  SingleCardBriefPayload,
  SingleCardRecordDto,
  SingleCardStoredCard,
} from '@/lib/single-card/types';
import {
  isDestinySliceFocus,
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

type Step = 'loading' | 'intro' | 'drawing' | 'result';

function normalizeFocus(
  brief: SingleCardBriefPayload | null,
): DestinySliceFocusPayload | null {
  if (!brief) return null;
  if (isDestinySliceFocus(brief)) return brief;
  if (isDestinySliceGuidance(brief)) {
    return {
      tendency: 'Caution',
      probability: '—',
      deconstruction: brief.insight,
      threshold: brief.action,
      llm: brief.llm,
    };
  }
  if (isSingleCardVerdict(brief)) {
    const tendencyMap = {
      yes: 'Yes',
      no: 'No',
      lean_yes: 'Yes',
      lean_no: 'No',
      unclear: 'Caution',
    } as const;
    return {
      tendency: tendencyMap[brief.verdict],
      probability: '—',
      deconstruction: brief.explanation,
      threshold: brief.guidance,
      llm: brief.llm,
    };
  }
  if ('text' in brief) {
    return {
      tendency: 'Caution',
      probability: '—',
      deconstruction: brief.text,
      threshold: '—',
      llm: brief.llm,
    };
  }
  return null;
}

function PaywallPanel({
  copy,
  session,
  unlockProduct,
  checkoutSku,
  onCheckout,
  returnPath,
}: {
  copy: ReturnType<typeof useSingleCardCopy>;
  session: SessionPayload | null;
  unlockProduct: TarotBillingProduct | null;
  checkoutSku: string | null;
  onCheckout: () => void;
  returnPath: string;
}) {
  if (!session?.isLoggedIn) {
    return (
      <div className="paywall-actions">
        <GuestLoginWall
          title={copy.paywallTitle}
          message={copy.paywallMessage}
          hint={copy.paywallHint}
          ctaLabel={copy.paywallCta}
          returnPath={returnPath}
        />
      </div>
    );
  }

  return (
    <div className="paywall-actions">
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
        onClick={onCheckout}
      >
        {checkoutSku ? copy.redirecting : copy.buyUnlock}
      </Button>
      <p className="destiny-slice-unlock-note">{copy.unlockForever}</p>
    </div>
  );
}

export function SingleCardFlow() {
  const copy = useSingleCardCopy();
  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [question, setQuestion] = useState('');
  const [readingId, setReadingId] = useState<string | null>(null);
  const [card, setCard] = useState<SingleCardStoredCard | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [focus, setFocus] = useState<DestinySliceFocusPayload | null>(null);
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
      if (res.status === 402) {
        setFocus(null);
        setStep('result');
        return;
      }
      if (!res.ok) throw new Error(data.error || copy.guidanceFailed);
      setFocus(normalizeFocus(data.brief as SingleCardBriefPayload));
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.guidanceFailed);
    } finally {
      setGuidanceLoading(false);
    }
  }, [copy]);

  const hydrateRecord = useCallback((rec: SingleCardRecordDto, unlocked: boolean) => {
    setReadingId(rec.id);
    setCard(rec.card);
    setRevealed(true);

    if (!unlocked) {
      setFocus(null);
      setStep('result');
      return;
    }

    const f = normalizeFocus(rec.briefText);
    if (f) {
      setFocus(f);
      setStep('result');
    } else {
      setStep('drawing');
      void loadGuidance(rec.id);
    }
  }, [loadGuidance]);

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
      hydrateRecord(data.record, data.unlocked);
      return;
    }

    setStep('intro');
  }, [hydrateRecord]);

  useEffect(() => {
    void loadSession().catch(() => setError(copy.loadFailed));
  }, [loadSession, copy.loadFailed]);

  const submitDraw = async (pickIndex: number) => {
    setStep('drawing');
    setRevealed(false);
    setCard(null);
    setFocus(null);
    setDrawLoading(true);
    setError('');
    try {
      const trimmed = question.trim();
      const res = await fetch('/api/single-card/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pickIndex,
          ...(trimmed ? { question: trimmed } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || copy.drawFailed);
      setReadingId(data.readingId);
      setCard(data.card);
      setDrawLoading(false);
      setTimeout(() => setRevealed(true), 600);

      const unlocked = session?.unlocked ?? false;
      if (unlocked) {
        setTimeout(() => void loadGuidance(data.readingId), 1300);
      } else {
        setTimeout(() => setStep('result'), 1300);
      }
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
    if (!readingId) {
      setError(copy.checkoutFailed);
      return;
    }
    const sku =
      session.billing.destinySliceUnlock?.sku
      ?? session.billing.skus.destinySliceUnlockSku
      ?? 'tarot-destiny-slice';
    setCheckoutSku(sku);
    setError('');
    try {
      const successQs = new URLSearchParams();
      if (readingId) successQs.set('readingId', readingId);
      successQs.set('unlocked', '1');
      const successUrl = `${window.location.origin}/single-card?${successQs.toString()}`;
      const cancelQs = readingId ? `?readingId=${encodeURIComponent(readingId)}` : '';
      const result = await startAppCheckout({
        sku,
        readingId: readingId ?? undefined,
        successUrl,
        cancelUrl: `${window.location.origin}/single-card${cancelQs}`,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.checkoutFailed);
    } finally {
      setCheckoutSku(null);
    }
  };

  const unlockProduct = session?.billing.destinySliceUnlock;
  const returnPath = readingId
    ? `/single-card?readingId=${encodeURIComponent(readingId)}`
    : '/single-card';
  const showFocus = Boolean(focus && session?.unlocked);

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
      <header className="destiny-slice-header animate-fade-in-up">
        <h1 className="destiny-slice-title">{copy.title}</h1>
        <p className="destiny-slice-status">{copy.statusBadge}</p>
        {step === 'intro' ? (
          (() => {
            const greeting = copy.nicknameGreeting(session?.nickname);
            return greeting ? <p className="destiny-slice-greeting">{greeting}</p> : null;
          })()
        ) : null}
      </header>

      {step === 'intro' && (
        <div className="destiny-slice-intro animate-fade-in-up delay-200">
          <div className="card daily-fortune-panel">
            <p className="daily-fortune-panel-lead destiny-slice-intro-lead">
              {copy.introLead.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < copy.introLead.split('\n').length - 1 ? <br /> : null}
                </span>
              ))}
            </p>
            <label className="three-card-question-label" htmlFor="destiny-slice-question">
              {copy.questionLabel}
            </label>
            <textarea
              id="destiny-slice-question"
              className="three-card-question-input destiny-slice-question-input"
              rows={2}
              maxLength={500}
              placeholder={copy.questionPlaceholder}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>

          <DestinySliceDeck
            disabled={drawLoading}
            hint={copy.deckHint}
            pickLabel={copy.pickCard}
            onPick={(index) => void submitDraw(index)}
          />
        </div>
      )}

      {step === 'drawing' && (
        <div className="destiny-slice-drawing card animate-fade-in-up">
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

      {step === 'result' && card && (
        <div className="destiny-slice-result animate-fade-in-up">
          <div className="destiny-slice-result-stage card">
            <SingleCardReveal
              card={card}
              revealed
              orientationLabel={copy.orientation}
            />
          </div>

          {showFocus && focus ? (
            <>
              <DestinySliceFocusResult
                focus={focus}
                sectionTendency={copy.sectionTendency}
                sectionDeconstruction={copy.sectionDeconstruction}
                sectionThreshold={copy.sectionThreshold}
                coreTendencyLabel={copy.coreTendencyLabel}
                energyProbabilityLabel={copy.energyProbabilityLabel}
                localizeTendency={copy.localizeTendency}
              />

              <Button
                type="button"
                variant="ghost"
                className="w-full mt-1"
                onClick={() => {
                  setReadingId(null);
                  setCard(null);
                  setFocus(null);
                  setRevealed(false);
                  setQuestion('');
                  setStep('intro');
                }}
              >
                {copy.drawAgain}
              </Button>
            </>
          ) : (
            <div className="card destiny-slice-locked">
              <p className="destiny-slice-locked-hint">{copy.resultLockedHint}</p>
              {error ? <p className="paywall-error">{error}</p> : null}
              <div className="destiny-slice-locked-preview" aria-hidden>
                <p className="destiny-slice-focus-heading">{copy.sectionTendency}</p>
                <p className="destiny-slice-locked-blur">······</p>
                <p className="destiny-slice-focus-heading" style={{ marginTop: 12 }}>{copy.sectionDeconstruction}</p>
                <p className="destiny-slice-locked-blur">······ ······</p>
                <p className="destiny-slice-focus-heading" style={{ marginTop: 12 }}>{copy.sectionThreshold}</p>
                <p className="destiny-slice-locked-blur">······ ······</p>
              </div>
              <PaywallPanel
                copy={copy}
                session={session}
                unlockProduct={unlockProduct ?? null}
                checkoutSku={checkoutSku}
                onCheckout={() => void handleUnlockCheckout()}
                returnPath={returnPath}
              />
            </div>
          )}
        </div>
      )}

      {error && step !== 'result' ? (
        <p className="destiny-slice-error">{error}</p>
      ) : null}

      <Button asChild variant="ghost" className="daily-fortune-coming-back mt-5 orasage-subpage-back-local">
        <Link href="/">{copy.backHome}</Link>
      </Button>
    </div>
  );
}
