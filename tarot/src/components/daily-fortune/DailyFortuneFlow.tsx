'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { MantoThinking } from '@/components/MantoThinking';
import { TarotFlipCard } from '@/components/TarotFlipCard';
import { getCardById } from '@/lib/tarot/cards';
import { useCardName } from '@/lib/i18n/context';
import { useDailyFortuneCopy } from '@/lib/i18n/reading-copy';
import { shopUrlForSku } from '@/lib/shop-products';
import type {
  DailyFortuneAnswer,
  DailyFortuneFullReport,
  DailyFortuneQuestion,
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

type Step = 'loading' | 'start' | 'questions' | 'drawing' | 'report' | 'exhausted';

export function DailyFortuneFlow() {
  const copy = useDailyFortuneCopy();
  const cardNameFor = useCardName();
  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [questions, setQuestions] = useState<DailyFortuneQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<DailyFortuneAnswer[]>([]);
  const [record, setRecord] = useState<DailyFortuneRecordDto | null>(null);
  const [card, setCard] = useState<DrawCard | null>(null);
  const [brief, setBrief] = useState('');
  const [fullReport, setFullReport] = useState<DailyFortuneFullReport | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const [recommend, setRecommend] = useState<TarotBillingProduct | null>(null);
  const [error, setError] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);
  const [alreadyDrewToday, setAlreadyDrewToday] = useState(false);

  const loadSession = useCallback(async () => {
    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const recordIdParam = params?.get('recordId') ?? null;

    const res = await fetch('/api/daily-fortune/session', { credentials: 'include', cache: 'no-store' });
    const data = (await res.json()) as SessionPayload;
    setSession(data);
    setIsLoggedIn(data.isLoggedIn);

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

  const hydrateReport = (rec: DailyFortuneRecordDto, loggedIn: boolean) => {
    setRecord(rec);
    setBrief(rec.briefText ?? '');
    setFullReport(loggedIn ? rec.fullReport : null);
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
    }
    void loadRecommend();
  };

  const loadRecommend = async () => {
    try {
      const res = await fetch('/api/tarot/daily-recommend', {
        credentials: 'include',
        cache: 'no-store',
      });
      if (res.ok) {
        const data = await res.json();
        setRecommend(data.product ?? null);
      }
    } catch {
      /* optional */
    }
  };

  useEffect(() => {
    void loadSession().catch(() => setError(copy.loadFailed));
  }, [loadSession, copy.loadFailed]);

  const beginQuestions = async () => {
    setError('');
    setStep('questions');
    setQIndex(0);
    setAnswers([]);
    setQuestionsLoading(true);
    try {
      const res = await fetch('/api/daily-fortune/questions', {
        method: 'POST',
        credentials: 'include',
      });
      const data = await res.json();
      setQuestions(data.questions ?? []);
    } catch {
      setError(copy.questionsFailed);
      setStep('start');
    } finally {
      setQuestionsLoading(false);
    }
  };

  const pickAnswer = (answer: string) => {
    const q = questions[qIndex];
    if (!q) return;
    const nextAnswers = [
      ...answers,
      { questionId: q.id, question: q.text, answer },
    ];
    setAnswers(nextAnswers);
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      return;
    }
    void submitDraw(nextAnswers);
  };

  const submitDraw = async (finalAnswers: DailyFortuneAnswer[]) => {
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
        body: JSON.stringify({ answers: finalAnswers }),
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
      setTimeout(() => setFlipped(true), 500);
      setTimeout(() => {
        setStep('report');
        void loadRecommend();
      }, 1400);
    } catch (err) {
      setDrawLoading(false);
      setError(err instanceof Error ? err.message : copy.drawFailed);
      setStep('questions');
    }
  };

  const cardMeta = card ? getCardById(card.id) : null;
  const currentQ = questions[qIndex];

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
      <div className="page-header animate-fade-in-up">
        <span className="label">{copy.label}</span>
        <h1>{copy.title}</h1>
        <p>
          {copy.nicknameGreeting(session?.nickname)}
          {copy.dimsSubtitle}
        </p>
      </div>

      {session && step !== 'exhausted' && (
        <div className="daily-fortune-quota card animate-fade-in-up delay-100">
          <div className="daily-fortune-quota-row">
            <span>{copy.quotaAllowance}</span>
            <strong>{copy.times(session.quota.allowance)}</strong>
          </div>
          <div className="daily-fortune-quota-row">
            <span>{copy.quotaRemaining}</span>
            <strong>{copy.times(session.quota.remaining)}</strong>
          </div>
        </div>
      )}

      {step === 'start' && (
        <div className="daily-fortune-panel card animate-fade-in-up delay-200">
          <p className="daily-fortune-panel-lead">{copy.introLead}</p>
          <Button type="button" className="daily-fortune-panel-btn w-full" onClick={() => void beginQuestions()}>
            {copy.start}
          </Button>
        </div>
      )}

      {step === 'questions' && questionsLoading && (
        <MantoThinking message={copy.preparing} hint={copy.preparingHint} />
      )}

      {step === 'questions' && !questionsLoading && currentQ && (
        <div className="daily-fortune-panel card animate-fade-in-up">
          <div className="daily-fortune-q-progress">
            {copy.questionProgress(qIndex + 1, questions.length)}
          </div>
          <p className="daily-fortune-q-text">{currentQ.text}</p>
          <div className="daily-fortune-q-options">
            {currentQ.options.map((opt) => (
              <button
                key={opt}
                type="button"
                className="daily-fortune-q-option"
                onClick={() => pickAnswer(opt)}
              >
                {opt}
              </button>
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
                />
              </div>
            </>
          )}
        </div>
      )}

      {step === 'report' && card && cardMeta && (
        <div className="daily-fortune-report animate-fade-in-up">
          {alreadyDrewToday ? (
            <div className="card daily-fortune-already-drew animate-fade-in-up" role="status">
              <p>{copy.alreadyDrewToday}</p>
            </div>
          ) : null}
          <div className="card daily-fortune-draw" style={{ marginBottom: 16 }}>
            <div className="daily-fortune-draw-card">
              <TarotFlipCard
                card={cardMeta}
                flipped
                size="md"
                orientation={card.orientation}
                caption={`${cardMeta ? cardNameFor(cardMeta) : card.name} · ${copy.orientation(card.orientation)}`}
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

          {recommend && (
            <div className="card daily-fortune-recommend">
              <h2 className="daily-fortune-section-title">{copy.recommendTitle}</h2>
              <p className="daily-fortune-recommend-name">{recommend.name}</p>
              <p className="daily-fortune-recommend-desc">{recommend.desc}</p>
              <p className="daily-fortune-recommend-price">{recommend.priceDisplay}</p>
              <Button asChild variant="outline" className="w-full mt-3">
                <a href={shopUrlForSku(recommend.sku)} className="block text-center no-underline">
                  {copy.recommendCta}
                </a>
              </Button>
            </div>
          )}
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
