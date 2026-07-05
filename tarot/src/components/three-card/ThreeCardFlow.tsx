'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import TarotCard from '@/components/TarotCard';
import { GuestLoginWall } from '@/components/auth/GuestLoginWall';
import { buildLoginUrl } from '@/lib/login-url';
import { getCardById } from '@/lib/tarot/cards';
import { startAppCheckout, redirectAfterCheckout } from '@/lib/shop-checkout';
import type { TarotBillingProduct } from '@/lib/tarot-billing-config';
import type {
  ThreeCardAnswer,
  ThreeCardBriefPayload,
  ThreeCardFullReport,
  ThreeCardQuestion,
  ThreeCardRecordDto,
  ThreeCardStoredCard,
} from '@/lib/three-card/types';

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

type Step = 'loading' | 'intro' | 'questions' | 'revealing' | 'brief' | 'paywall' | 'full_report';

const POSITION_ORDER = ['过去', '现在', '未来'];

export function ThreeCardFlow() {
  const [step, setStep] = useState<Step>('loading');
  const [session, setSession] = useState<SessionPayload | null>(null);
  const [question, setQuestion] = useState('');
  const [questions, setQuestions] = useState<ThreeCardQuestion[]>([]);
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState<ThreeCardAnswer[]>([]);
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

  const sortedCards = [...cards].sort(
    (a, b) => POSITION_ORDER.indexOf(a.positionLabel) - POSITION_ORDER.indexOf(b.positionLabel),
  );

  const hydrateRecord = useCallback((rec: ThreeCardRecordDto, loggedIn: boolean) => {
    setReadingId(rec.id);
    setQuestion(rec.question);
    setCards(rec.cards);
    setAnswers(rec.qaAnswers ?? []);
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
      body: JSON.stringify({ readingId: id, orderNo: orderNo ?? undefined }),
    });
    const data = await res.json();
    if (res.status === 401) {
      setStep('paywall');
      return;
    }
    if (res.status === 402) {
      setStep('paywall');
      return;
    }
    if (!res.ok) throw new Error(data.error || '详读加载失败');
    setFullReport(data.fullReport);
    setPaidTier(data.tier);
    setStep('full_report');
    setPendingOrderNo(null);
  }, []);

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
    void loadSession().catch(() => setError('加载失败'));
  }, [loadSession]);

  const beginQuestions = async () => {
    setError('');
    setStep('questions');
    setQIndex(0);
    setAnswers([]);
    const res = await fetch('/api/three-card/questions', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim() || undefined }),
    });
    const data = await res.json();
    setQuestions(data.questions ?? []);
  };

  const pickAnswer = (answer: string) => {
    const q = questions[qIndex];
    if (!q) return;
    const nextAnswers = [...answers, { questionId: q.id, question: q.text, answer }];
    setAnswers(nextAnswers);
    if (qIndex + 1 < questions.length) {
      setQIndex(qIndex + 1);
      return;
    }
    void submitStart(nextAnswers);
  };

  const submitStart = async (finalAnswers: ThreeCardAnswer[]) => {
    setStep('revealing');
    setRevealedCount(0);
    setError('');
    try {
      const res = await fetch('/api/three-card/start', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: question.trim() || undefined,
          answers: finalAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '抽牌失败');
      setReadingId(data.readingId);
      setCards(data.cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : '抽牌失败');
      setStep('questions');
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
        body: JSON.stringify({ readingId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '简读生成失败');
      setBrief(data.brief);
      setStep('brief');
    } catch (err) {
      setError(err instanceof Error ? err.message : '简读生成失败');
    } finally {
      setBriefLoading(false);
    }
  };

  const goToPaywall = () => {
    setStep('paywall');
  };

  const handleCheckout = async (sku: string) => {
    if (!isLoggedIn) {
      setError('请先登录后再购买完整报告');
      return;
    }
    if (!readingId) return;
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
      setError(err instanceof Error ? err.message : '结账失败');
    } finally {
      setCheckoutSku(null);
    }
  };

  const currentQ = questions[qIndex];
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
    <div className="three-card-page">
      <div className="page-header animate-fade-in-up">
        <span className="label">三牌阵</span>
        <h1>过去 · 现在 · 未来</h1>
        <p>
          {session?.nickname && session.nickname !== '旅人' ? `${session.nickname}，` : ''}
          简读免费，完整详读需解锁
        </p>
      </div>

      {step === 'intro' && (
        <div className="daily-fortune-panel card animate-fade-in-up delay-100">
          <p className="daily-fortune-panel-lead">
            写下你想问的事（可留空做一般指引）。Manto 会先问你几个小问题，再为你翻开三张牌。
          </p>
          <label className="three-card-question-label" htmlFor="three-card-question">
            你的问题
          </label>
          <textarea
            id="three-card-question"
            className="three-card-question-input"
            rows={3}
            maxLength={500}
            placeholder="例如：这段感情会走向哪里？"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button
            type="button"
            className="btn-primary daily-fortune-panel-btn"
            onClick={() => void beginQuestions()}
          >
            开始三牌占卜
          </button>
        </div>
      )}

      {step === 'questions' && currentQ && (
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

      {step === 'revealing' && sortedCards.length > 0 && (
        <div className="three-card-reveal animate-fade-in-up">
          <p className="daily-fortune-draw-hint">
            {revealedCount < cards.length
              ? `轻触翻开第 ${revealedCount + 1} 张牌`
              : briefLoading
                ? '正在生成简读…'
                : '三张牌已全部翻开'}
          </p>
          <div className="three-card-grid">
            {sortedCards.map((c, i) => {
              const meta = getCardById(c.cardId);
              const isRevealed = i < revealedCount;
              return (
                <div key={c.positionLabel} className="three-card-slot">
                  <span className="three-card-position">{c.positionLabel}</span>
                  <button
                    type="button"
                    className="three-card-tap"
                    disabled={!isRevealed && i !== revealedCount}
                    onClick={() => {
                      if (i === revealedCount) revealNext();
                    }}
                    aria-label={isRevealed ? `${c.cardName} ${c.orientation}` : `翻开${c.positionLabel}`}
                  >
                    {meta ? (
                      <TarotCard
                        name={meta.name}
                        nameEn={meta.nameEn}
                        arcana={meta.arcana}
                        suit={meta.suit}
                        number={meta.number}
                        symbol={meta.symbol}
                        orientation={c.orientation}
                        keywords={meta.keywords.join(' · ')}
                        flipped={isRevealed}
                        glowing={i === revealedCount && !isRevealed}
                        size="sm"
                      />
                    ) : null}
                  </button>
                  {isRevealed && (
                    <p className="three-card-caption">
                      {c.cardName} · {c.orientation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          {briefLoading && (
            <div className="daily-fortune-quota-loading">
              <div className="spinner" />
            </div>
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
                    <TarotCard
                      name={meta.name}
                      nameEn={meta.nameEn}
                      arcana={meta.arcana}
                      suit={meta.suit}
                      number={meta.number}
                      symbol={meta.symbol}
                      orientation={c.orientation}
                      keywords={meta.keywords.join(' · ')}
                      flipped
                      size="sm"
                    />
                  ) : null}
                  <p className="three-card-caption">
                    {c.positionLabel} · {c.cardName}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="card daily-fortune-brief">
            <h2 className="daily-fortune-section-title">免费简读</h2>
            {brief.perCard.map((item) => (
              <div key={item.position} className="three-card-brief-item">
                <strong>{item.position}</strong>
                <p>{item.text}</p>
              </div>
            ))}
            <div className="three-card-brief-synthesis">
              <strong>综合</strong>
              <p>{brief.synthesis}</p>
            </div>
          </div>

          <div className="card three-card-unlock-cta">
            <p>完整详读包含逐牌深度解读、行动建议与肯定语，登录后可购买解锁并保存到用户中心。</p>
            {!isLoggedIn ? (
              <Link href={loginHref} className="btn-primary" style={{ display: 'block', textAlign: 'center' }}>
                登录解锁完整报告
              </Link>
            ) : (
              <button type="button" className="btn-primary" style={{ width: '100%' }} onClick={goToPaywall}>
                查看完整报告方案
              </button>
            )}
          </div>
        </div>
      )}

      {step === 'paywall' && (
        <div className="three-card-paywall animate-fade-in-up">
          {!isLoggedIn ? (
            <GuestLoginWall
              title="登录后购买完整报告"
              message="访客可免费完成问答、抽牌与简读。完整详读与支付需先登录账号。"
              hint="登录后将自动回到本页，已抽的牌与简读不会丢失。"
              ctaLabel="去登录"
              returnPath={readingReturnPath}
            />
          ) : (
            <>
              <div className="card three-card-tier">
                <h2 className="daily-fortune-section-title">方案一 · 完整报告</h2>
                {reportProduct ? (
                  <>
                    <p className="three-card-tier-name">{reportProduct.name}</p>
                    <p className="three-card-tier-desc">{reportProduct.desc}</p>
                    <p className="three-card-tier-price">{reportProduct.priceDisplay}</p>
                  </>
                ) : (
                  <p className="three-card-tier-desc">三牌阵完整详读报告</p>
                )}
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: 12 }}
                  disabled={checkoutSku !== null}
                  onClick={() =>
                    void handleCheckout(
                      reportProduct?.sku ?? session?.billing.skus.threeCardReportSku ?? 'report-tarot',
                    )
                  }
                >
                  {checkoutSku === (reportProduct?.sku ?? session?.billing.skus.threeCardReportSku)
                    ? '跳转中…'
                    : '购买完整报告'}
                </button>
              </div>

              <div className="card three-card-tier three-card-tier--bundle">
                <h2 className="daily-fortune-section-title">方案二 · 报告 + 开运物</h2>
                {bundleProduct ? (
                  <>
                    <p className="three-card-tier-name">{bundleProduct.name}</p>
                    <p className="three-card-tier-desc">{bundleProduct.desc}</p>
                    <p className="three-card-tier-price">{bundleProduct.priceDisplay}</p>
                  </>
                ) : (
                  <p className="three-card-tier-desc">完整报告 + 专属开运物品组合</p>
                )}
                <button
                  type="button"
                  className="btn-outline"
                  style={{ width: '100%', marginTop: 12 }}
                  disabled={checkoutSku !== null}
                  onClick={() =>
                    void handleCheckout(
                      bundleProduct?.sku ?? session?.billing.skus.threeCardBundleSku ?? 'report-tarot-bundle',
                    )
                  }
                >
                  {checkoutSku === (bundleProduct?.sku ?? session?.billing.skus.threeCardBundleSku)
                    ? '跳转中…'
                    : '购买报告套装'}
                </button>
              </div>

              {pendingOrderNo && readingId && (
                <button
                  type="button"
                  className="btn-ghost"
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => void fetchFullReport(readingId, pendingOrderNo)}
                >
                  我已付款，查看完整报告
                </button>
              )}
            </>
          )}

          {brief && (
            <button
              type="button"
              className="btn-ghost"
              style={{ width: '100%', marginTop: 12 }}
              onClick={() => setStep('brief')}
            >
              返回简读
            </button>
          )}
        </div>
      )}

      {step === 'full_report' && fullReport && (
        <div className="three-card-full animate-fade-in-up">
          <div className="three-card-grid three-card-grid--compact">
            {sortedCards.map((c, i) => {
              const meta = getCardById(c.cardId);
              const cardReport = fullReport.cards[i];
              return (
                <div key={c.positionLabel} className="three-card-full-card card">
                  {meta ? (
                    <div className="three-card-full-card-visual">
                      <TarotCard
                        name={meta.name}
                        nameEn={meta.nameEn}
                        arcana={meta.arcana}
                        suit={meta.suit}
                        number={meta.number}
                        symbol={meta.symbol}
                        orientation={c.orientation}
                        keywords={meta.keywords.join(' · ')}
                        flipped
                        size="sm"
                      />
                    </div>
                  ) : null}
                  <p className="three-card-caption">
                    {c.positionLabel} · {c.cardName} · {c.orientation}
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
            <h2 className="daily-fortune-section-title">综合解读</h2>
            <p>{fullReport.synthesis}</p>
          </div>

          <div className="card three-card-suggestions">
            <h2 className="daily-fortune-section-title">行动建议</h2>
            <ul>
              {fullReport.suggestions.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>

          <div className="card three-card-affirmation">
            <p>{fullReport.affirmation}</p>
          </div>

          {paidTier === 'bundle' && bundleProduct?.requiresShipping && (
            <div className="card three-card-bundle-note">
              <p>你购买的是报告+开运物套装，物品将按订单地址寄送。</p>
              <a
                href="https://shop.orasage.com/account/orders"
                className="btn-outline"
                style={{ display: 'block', textAlign: 'center', marginTop: 10 }}
              >
                查看订单 →
              </a>
            </div>
          )}

          <button
            type="button"
            className="btn-ghost"
            style={{ width: '100%', marginTop: 12 }}
            onClick={() => {
              setQuestion('');
              setQuestions([]);
              setAnswers([]);
              setReadingId(null);
              setCards([]);
              setBrief(null);
              setFullReport(null);
              setRevealedCount(0);
              setStep('intro');
            }}
          >
            再占一次
          </button>
        </div>
      )}

      {error ? (
        <p style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13, marginTop: 16 }}>{error}</p>
      ) : null}

      <Link href="/" className="btn-ghost daily-fortune-coming-back" style={{ marginTop: 20 }}>
        返回首页
      </Link>
    </div>
  );
}
