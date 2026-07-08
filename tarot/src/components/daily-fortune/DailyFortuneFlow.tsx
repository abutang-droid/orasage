'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button } from '@orasage/ui/button';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { MantoThinking } from '@/components/MantoThinking';
import { TarotFlipCard } from '@/components/TarotFlipCard';
import { getCardById } from '@/lib/tarot/cards';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
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
  templeBonusGranted: boolean;
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

type Step = 'loading' | 'start' | 'questions' | 'drawing' | 'report' | 'paywall';

const DIM_LABELS: Record<keyof DailyFortuneFullReport, string> = {
  work: '工作',
  love: '爱情',
  career: '事业',
  wealth: '财运',
  summary: '综合',
};

export function DailyFortuneFlow() {
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
  const [paywallSku, setPaywallSku] = useState<string | null>(null);
  const [pendingOrderNo, setPendingOrderNo] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [drawLoading, setDrawLoading] = useState(false);

  const loadSession = useCallback(async () => {
    const params =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const orderParam = params?.get('order') ?? null;
    const recordIdParam = params?.get('recordId') ?? null;
    if (orderParam) setPendingOrderNo(orderParam);

    const res = await fetch('/api/daily-fortune/session', { credentials: 'include', cache: 'no-store' });
    const data = (await res.json()) as SessionPayload;
    setSession(data);
    setIsLoggedIn(data.isLoggedIn);

    const resumeRecord =
      (recordIdParam ? data.records.find((r) => r.id === recordIdParam) : null) ?? data.latest;

    if (resumeRecord) {
      hydrateReport(resumeRecord, data.isLoggedIn);
      setStep('report');
      return;
    }

    if (data.quota.remaining <= 0 && !orderParam) {
      setPaywallSku('tarot-daily-draw');
      setStep('paywall');
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
    void loadRecommend(rec.id);
  };

  const loadRecommend = async (seed: string) => {
    try {
      const res = await fetch(`/api/tarot/daily-recommend?seed=${encodeURIComponent(seed)}`);
      if (res.ok) {
        const data = await res.json();
        setRecommend(data.product ?? null);
      }
    } catch {
      /* optional */
    }
  };

  useEffect(() => {
    void loadSession().catch(() => setError('加载失败'));
  }, [loadSession]);

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
      setError('问题加载失败，请重试');
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
        body: JSON.stringify({
          answers: finalAnswers,
          orderNo: pendingOrderNo ?? undefined,
        }),
      });
      const data = await res.json();
      if (res.status === 402) {
        setPaywallSku(data.sku ?? 'tarot-daily-draw');
        setStep('paywall');
        return;
      }
      if (!res.ok) throw new Error(data.error || '抽取失败');

      setRecord(data.record);
      setCard(data.card);
      setBrief(data.brief);
      setFullReport(data.fullReport);
      setIsLoggedIn(data.isLoggedIn);
      setSession((s) =>
        s ? { ...s, quota: data.quota, isLoggedIn: data.isLoggedIn } : s,
      );
      setPendingOrderNo(null);
      setDrawLoading(false);
      setTimeout(() => setFlipped(true), 500);
      setTimeout(() => {
        setStep('report');
        void loadRecommend(data.record.id);
      }, 1400);
    } catch (err) {
      setDrawLoading(false);
      setError(err instanceof Error ? err.message : '抽取失败');
      setStep('questions');
    }
  };

  const handlePayCheckout = async () => {
    if (!paywallSku) return;
    try {
      const result = await startAppCheckout({
        sku: paywallSku,
        successUrl: `${window.location.origin}/daily-fortune?paid=1`,
        cancelUrl: `${window.location.origin}/daily-fortune`,
      });
      redirectAfterCheckout(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '结账失败');
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
        <span className="label">每日运势</span>
        <h1>今日四维运势</h1>
        <p>
          {session?.nickname && session.nickname !== '旅人'
            ? `${session.nickname}，`
            : ''}
          工作 · 爱情 · 事业 · 财运
        </p>
      </div>

      {session && step !== 'paywall' && (
        <div className="daily-fortune-quota card animate-fade-in-up delay-100">
          <div className="daily-fortune-quota-row">
            <span>今日可抽</span>
            <strong>{session.quota.allowance} 次</strong>
          </div>
          <div className="daily-fortune-quota-row">
            <span>剩余次数</span>
            <strong>{session.quota.remaining} 次</strong>
          </div>
        </div>
      )}

      {step === 'start' && (
        <div className="daily-fortune-panel card animate-fade-in-up delay-200">
          <p className="daily-fortune-panel-lead">
            Manto 会先问你几个小问题，再为你翻开今日主牌，并生成四维运势解读。
          </p>
          <Button type="button" className="daily-fortune-panel-btn w-full" onClick={() => void beginQuestions()}>
            开始今日运势
          </Button>
        </div>
      )}

      {step === 'questions' && questionsLoading && (
        <MantoThinking message="Manto 正在为你准备今日问题…" hint="AI 正在感知你的状态，请稍候" />
      )}

      {step === 'questions' && !questionsLoading && currentQ && (
        <div className="daily-fortune-panel card animate-fade-in-up">
          <div className="daily-fortune-q-progress">
            问题 {qIndex + 1} / {questions.length}
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
            <MantoThinking message="正在为你抽取今日主牌…" hint="牌阵能量汇聚中，马上揭晓" />
          ) : (
            <>
              <p className="daily-fortune-draw-hint">
                {flipped ? '今日主牌已翻开' : '正在翻开今日主牌…'}
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
          <div className="card daily-fortune-draw" style={{ marginBottom: 16 }}>
            <div className="daily-fortune-draw-card">
              <TarotFlipCard
                card={cardMeta}
                flipped
                size="md"
                orientation={card.orientation}
                caption={`${card.name} · ${card.orientation}`}
              />
            </div>
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">今日简报</h2>
            <p>{brief}</p>
          </div>

          <div className="card daily-fortune-dims">
            <h2 className="daily-fortune-section-title">四维运势</h2>
            {fullReport ? (
              <div className="daily-fortune-dim-grid">
                {(['work', 'love', 'career', 'wealth'] as const).map((key) => (
                  <div key={key} className="daily-fortune-dim">
                    <div className="daily-fortune-dim-head">
                      <span>{DIM_LABELS[key]}</span>
                      <span className="daily-fortune-dim-tag">{fullReport[key].tag}</span>
                    </div>
                    <p>{fullReport[key].text}</p>
                  </div>
                ))}
                <div className="daily-fortune-dim daily-fortune-dim--summary">
                  <div className="daily-fortune-dim-head">
                    <span>综合</span>
                  </div>
                  <p>{fullReport.summary}</p>
                </div>
              </div>
            ) : (
              <GuestLoginWall
                title="登录查看四维运势"
                message="登录后可查看爱情、事业、财运等完整解读，并同步保存到用户中心。"
                hint="访客仍可查看今日简报；登录后记录会出现在 auth.orasage.com 的占卜历史中。"
                ctaLabel="登录查看完整报告"
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
                          <span>{DIM_LABELS[key]}</span>
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
              <h2 className="daily-fortune-section-title">今日推荐</h2>
              <p className="daily-fortune-recommend-name">{recommend.name}</p>
              <p className="daily-fortune-recommend-desc">{recommend.desc}</p>
              <p className="daily-fortune-recommend-price">{recommend.priceDisplay}</p>
              <Button asChild variant="outline" className="w-full mt-3">
                <a href={shopUrlForSku(recommend.sku)} className="block text-center no-underline">
                  去看看 →
                </a>
              </Button>
            </div>
          )}

          {session && session.quota.remaining > 0 && (
            <Button
              type="button"
              variant="ghost"
              className="w-full mt-3"
              onClick={() => {
                setRecord(null);
                setCard(null);
                setFlipped(false);
                void beginQuestions();
              }}
            >
              再抽一次（剩余 {session.quota.remaining} 次）
            </Button>
          )}
        </div>
      )}

      {step === 'paywall' && (
        <div className="card daily-fortune-paywall animate-fade-in-up">
          <h2 className="daily-fortune-section-title">今日次数已用完</h2>
          <p className="daily-fortune-paywall-desc">
            每日免费 1 次，神庙祈福可额外 +1 次。如需继续抽取，可购买额外次数。
          </p>
          <Button asChild variant="outline" className="w-full mb-2.5">
            <Link href="/temple" className="block text-center no-underline">
              去神庙祈福 +1
            </Link>
          </Button>
          <Button type="button" className="w-full" onClick={() => void handlePayCheckout()}>
            购买额外抽取
          </Button>
        </div>
      )}

      {error ? (
        <p style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13, marginTop: 16 }}>{error}</p>
      ) : null}

      <Button asChild variant="ghost" className="daily-fortune-coming-back mt-5">
        <Link href="/">返回首页</Link>
      </Button>
    </div>
  );
}
