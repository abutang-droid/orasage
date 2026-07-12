'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { MantoThinking } from '@/components/MantoThinking';
import { SingleCardReveal } from '@/components/single-card/SingleCardReveal';
import { useSingleCardCopy } from '@/lib/i18n/reading-copy';
import type {
  SingleCardBriefPayload,
  SingleCardRecordDto,
  SingleCardStoredCard,
  SingleCardVerdictKind,
  SingleCardVerdictPayload,
} from '@/lib/single-card/types';
import { isSingleCardVerdict } from '@/lib/single-card/types';

type Quota = {
  dateKey: string;
  allowance: number;
  remaining: number;
  drawsUsed: number;
  templeBonusGranted: boolean;
  templeFreeReportAvailable: boolean;
};

type SessionPayload = {
  isLoggedIn: boolean;
  nickname: string | null;
  quota: Quota;
  record: SingleCardRecordDto | null;
};

type Step = 'loading' | 'intro' | 'drawing' | 'result' | 'quota_exhausted';

function langBody(lang: string) {
  if (lang === 'en') return { language: 'en' };
  if (lang === 'pt') return { language: 'pt-BR' };
  if (lang === 'es') return { language: 'en' };
  return { language: 'zh-CN' };
}

function normalizeVerdict(
  brief: SingleCardBriefPayload | null,
  copy: ReturnType<typeof useSingleCardCopy>,
): SingleCardVerdictPayload | null {
  if (!brief) return null;
  if (isSingleCardVerdict(brief)) return brief;
  return {
    verdict: 'unclear',
    headline: copy.legacyHeadline,
    explanation: brief.text,
    guidance: '',
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
  const [verdict, setVerdict] = useState<SingleCardVerdictPayload | null>(null);
  const [error, setError] = useState('');
  const [verdictLoading, setVerdictLoading] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);

  const loadVerdict = useCallback(async (id: string) => {
    setVerdictLoading(true);
    setError('');
    try {
      const res = await fetch('/api/single-card/brief', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ readingId: id, ...langBody(copy.lang) }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || copy.verdictFailed);
      const payload = data.brief as SingleCardBriefPayload;
      setVerdict(normalizeVerdict(payload, copy));
      setStep('result');
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.verdictFailed);
    } finally {
      setVerdictLoading(false);
    }
  }, [copy]);

  const hydrateRecord = useCallback((rec: SingleCardRecordDto) => {
    setReadingId(rec.id);
    setQuestion(rec.question);
    setCard(rec.card);
    setRevealed(true);
    const v = normalizeVerdict(rec.briefText, copy);
    if (v) {
      setVerdict(v);
      setStep('result');
    } else {
      setStep('drawing');
      void loadVerdict(rec.id);
    }
  }, [copy, loadVerdict]);

  const loadSession = useCallback(async () => {
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const readingParam = params?.get('readingId');

    const qs = readingParam ? `?readingId=${encodeURIComponent(readingParam)}` : '';
    const res = await fetch(`/api/single-card/session${qs}`, { credentials: 'include', cache: 'no-store' });
    const data = (await res.json()) as SessionPayload;
    setSession(data);

    if (data.record) {
      hydrateRecord(data.record);
      return;
    }

    if (data.quota.remaining <= 0) {
      setStep('quota_exhausted');
      return;
    }

    setStep('intro');
  }, [hydrateRecord]);

  useEffect(() => {
    void loadSession().catch(() => setError(copy.loadFailed));
  }, [loadSession, copy.loadFailed]);

  const submitDraw = async () => {
    const trimmed = question.trim();
    if (trimmed.length < 4) {
      setError(copy.questionTooShort);
      return;
    }

    setStep('drawing');
    setRevealed(false);
    setCard(null);
    setVerdict(null);
    setDrawLoading(true);
    setError('');
    try {
      const res = await fetch('/api/single-card/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
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
      setTimeout(() => setRevealed(true), 500);
      setTimeout(() => void loadVerdict(data.readingId), 1200);
    } catch (err) {
      setDrawLoading(false);
      setError(err instanceof Error ? err.message : copy.drawFailed);
      setStep('intro');
    }
  };

  const verdictClass = (kind: SingleCardVerdictKind) => {
    if (kind === 'yes' || kind === 'lean_yes') return 'single-card-verdict--yes';
    if (kind === 'no' || kind === 'lean_no') return 'single-card-verdict--no';
    return 'single-card-verdict--unclear';
  };

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

      {session && step !== 'quota_exhausted' && (
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
          <Button
            type="button"
            className="daily-fortune-panel-btn w-full"
            disabled={question.trim().length < 4}
            onClick={() => void submitDraw()}
          >
            {copy.start}
          </Button>
        </div>
      )}

      {step === 'drawing' && (
        <div className="daily-fortune-draw card animate-fade-in-up">
          {drawLoading || !card ? (
            <MantoThinking message={copy.drawing} hint={copy.drawingHint} />
          ) : verdictLoading ? (
            <>
              <SingleCardReveal
                card={card}
                revealed={revealed}
                orientationLabel={copy.orientation}
                hint={revealed ? copy.cardRevealed : copy.cardFlipping}
              />
              <MantoThinking message={copy.writingVerdict} hint={copy.writingVerdictHint} />
            </>
          ) : null}
        </div>
      )}

      {step === 'result' && verdict && card && (
        <div className="single-card-result animate-fade-in-up">
          <div className="card single-card-result-question">
            <p className="single-card-result-question-label">{copy.yourQuestion}</p>
            <p className="single-card-result-question-text">{question}</p>
          </div>

          <SingleCardReveal
            card={card}
            revealed
            orientationLabel={copy.orientation}
          />

          <div className={`card single-card-verdict ${verdictClass(verdict.verdict)}`}>
            <p className="single-card-verdict-label">{copy.verdictLabel}</p>
            <p className="single-card-verdict-headline">{verdict.headline}</p>
            <p className="single-card-verdict-kind">{copy.verdictKind(verdict.verdict)}</p>
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">{copy.explanationTitle}</h2>
            <p>{verdict.explanation}</p>
            {verdict.guidance ? (
              <div className="single-card-guidance">
                <strong>{copy.guidanceTitle}</strong>
                <p>{verdict.guidance}</p>
              </div>
            ) : null}
          </div>

          {session && session.quota.remaining > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-3"
              onClick={() => {
                setReadingId(null);
                setCard(null);
                setVerdict(null);
                setRevealed(false);
                setStep('intro');
              }}
            >
              {copy.drawAgain(session.quota.remaining)}
            </Button>
          )}
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
