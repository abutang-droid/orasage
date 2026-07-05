'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FaithPicker } from '@/components/FaithPicker';
import {
  GENDER_OPTIONS,
  OCCUPATION_OPTIONS,
  hasPrefillData,
  type GenderOption,
  type OccupationOption,
  type OnboardingDraft,
  type OnboardingPrefill,
} from '@/lib/onboarding-v2';
import { useUser } from '@/lib/user';

type ChatLine = { role: 'mentor' | 'user'; text: string };

type Step =
  | 'intro'
  | 'prefill_confirm'
  | 'birthday'
  | 'gender'
  | 'occupation'
  | 'faith'
  | 'saving';

function TypewriterBubble({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState('');
  const doneRef = useRef(false);

  useEffect(() => {
    setShown('');
    doneRef.current = false;
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(timer);
        if (!doneRef.current) {
          doneRef.current = true;
          onDone?.();
        }
      }
    }, 22);
    return () => window.clearInterval(timer);
  }, [text, onDone]);

  return <div className="onboarding-bubble onboarding-bubble--mentor">{shown}</div>;
}

export function OnboardingFlow() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [prefill, setPrefill] = useState<OnboardingPrefill | null>(null);
  const [hasExternal, setHasExternal] = useState(false);
  const [step, setStep] = useState<Step>('intro');
  const [draft, setDraft] = useState<OnboardingDraft>({
    birthdate: '',
    gender: '',
    occupation: '',
    faith: '',
  });
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [introDone, setIntroDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const pushMentor = useCallback((text: string) => {
    setLines((prev) => [...prev, { role: 'mentor', text }]);
  }, []);

  const pushUser = useCallback((text: string) => {
    setLines((prev) => [...prev, { role: 'user', text }]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, step]);

  useEffect(() => {
    if (userLoading) return;
    if (user?.onboardingCompleted) {
      router.replace('/');
      return;
    }
    void fetch('/api/onboarding/prefill', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { prefill?: OnboardingPrefill; hasExternal?: boolean }) => {
        const p = data.prefill ?? null;
        setPrefill(p);
        setHasExternal(Boolean(data.hasExternal));
        if (p) {
          setDraft({
            birthdate: p.birthdate,
            gender: p.gender,
            occupation: p.occupation,
            faith: p.faith,
          });
        }
      })
      .catch(() => {});
  }, [userLoading, user?.onboardingCompleted, router]);

  const introText = useMemo(() => {
    if (hasExternal && prefill?.sourceLabel) {
      return `你好，我是 Manto，你的塔罗引导者。\n\n我注意到你曾在【${prefill.sourceLabel}】留下过足迹。接下来我会先确认你的基本信息，好让之后的运势与占卜更贴近你。`;
    }
    return '你好，我是 Manto，你的塔罗引导者。\n\n在翻开第一张牌之前，我想先认识你一点点——不会很久，就像老朋友聊天那样。';
  }, [hasExternal, prefill?.sourceLabel]);

  const goAfterIntro = useCallback(() => {
    if (hasExternal && prefill && hasPrefillData(prefill)) {
      setStep('prefill_confirm');
      pushMentor('这是我目前了解到的你，确认一下好吗？');
      return;
    }
    setStep('birthday');
    pushMentor('你的生日是哪一天？我会据此调整运势解读的语气与节奏。');
  }, [hasExternal, prefill, pushMentor]);

  const acceptPrefill = () => {
    pushUser('信息没错，继续吧');
    if (!draft.birthdate) {
      setStep('birthday');
      pushMentor('还差生日这一项——你的出生日期是？');
      return;
    }
    if (!draft.gender) {
      setStep('gender');
      pushMentor('那告诉我你的性别认同，我会用更合适的称呼与你对话。');
      return;
    }
    if (!draft.occupation) {
      setStep('occupation');
      pushMentor('你现在的工作状态是？这会影响事业与财运的解读角度。');
      return;
    }
    if (!draft.faith) {
      setStep('faith');
      pushMentor('最后，选择一种与你心灵相近的信仰或精神传统。祈福与运势都会参考它。');
      return;
    }
    void finishOnboarding(draft);
  };

  const editPrefill = () => {
    pushUser('我想自己填写');
    setStep('birthday');
    pushMentor('没问题，我们从生日开始。');
  };

  const finishOnboarding = async (finalDraft: OnboardingDraft) => {
    setStep('saving');
    setSaving(true);
    setError('');
    pushMentor('很好，我正在为你铺好今日的星途……');
    try {
      const res = await fetch('/api/onboarding/complete', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalDraft),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || '保存失败');
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
      setSaving(false);
      setStep('faith');
    }
  };

  const onBirthdayNext = () => {
    if (!draft.birthdate) return;
    pushUser(draft.birthdate);
    setStep('gender');
    pushMentor('收到。那你的性别认同是？');
  };

  const onGenderPick = (gender: GenderOption) => {
    setDraft((d) => ({ ...d, gender }));
    pushUser(gender);
    setStep('occupation');
    pushMentor('你现在的工作状态是？');
  };

  const onOccupationPick = (occupation: OccupationOption) => {
    setDraft((d) => ({ ...d, occupation }));
    pushUser(occupation);
    setStep('faith');
    pushMentor('最后一步——选择你的信仰或精神归属。');
  };

  const onFaithPick = (faith: string) => {
    const next = { ...draft, faith };
    setDraft(next);
    pushUser('已选择信仰');
    void finishOnboarding(next);
  };

  if (userLoading) {
    return (
      <div className="onboarding-screen" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div className="onboarding-screen">
      <div className="onboarding-mentor-head">
        <div className="onboarding-mentor-avatar" aria-hidden>✦</div>
        <div>
          <div className="onboarding-mentor-name">Manto</div>
          <div className="onboarding-mentor-role">你的塔罗引导者</div>
        </div>
      </div>

      <div className="onboarding-chat">
        {lines.map((line, i) => (
          <div
            key={`${line.role}-${i}`}
            className={`onboarding-bubble onboarding-bubble--${line.role}`}
          >
            {line.text}
          </div>
        ))}

        {step === 'intro' && !introDone && (
          <TypewriterBubble text={introText} onDone={() => setIntroDone(true)} />
        )}

        <div ref={chatEndRef} />
      </div>

      <div className="onboarding-panel">
        {step === 'intro' && introDone && (
          <div className="onboarding-actions">
            <button type="button" className="onboarding-btn-primary" onClick={goAfterIntro}>
              开始吧
            </button>
          </div>
        )}

        {step === 'prefill_confirm' && prefill && (
          <>
            <div className="onboarding-prefill-card">
              {prefill.birthdate ? <div>生日：{prefill.birthdate}</div> : null}
              {prefill.gender ? <div>性别：{prefill.gender}</div> : null}
              {prefill.occupation ? <div>工作状态：{prefill.occupation}</div> : null}
              {prefill.faith ? <div>信仰：{prefill.faith}</div> : null}
              {prefill.sourceLabel ? (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                  来源：{prefill.sourceLabel} 档案
                </div>
              ) : null}
            </div>
            <div className="onboarding-actions">
              <button type="button" className="onboarding-btn-primary" onClick={acceptPrefill}>
                确认，继续
              </button>
              <button type="button" className="onboarding-btn-ghost" onClick={editPrefill}>
                我要修改
              </button>
            </div>
          </>
        )}

        {step === 'birthday' && (
          <>
            <input
              type="date"
              className="onboarding-date"
              value={draft.birthdate}
              max={new Date().toISOString().slice(0, 10)}
              onChange={(e) => setDraft((d) => ({ ...d, birthdate: e.target.value }))}
            />
            <div className="onboarding-actions">
              <button
                type="button"
                className="onboarding-btn-primary"
                disabled={!draft.birthdate}
                onClick={onBirthdayNext}
              >
                继续
              </button>
            </div>
          </>
        )}

        {step === 'gender' && (
          <div className="onboarding-options">
            {GENDER_OPTIONS.map((g) => (
              <button
                key={g}
                type="button"
                className={`onboarding-option${draft.gender === g ? ' is-selected' : ''}`}
                onClick={() => onGenderPick(g)}
              >
                {g}
              </button>
            ))}
          </div>
        )}

        {step === 'occupation' && (
          <div className="onboarding-options">
            {OCCUPATION_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                className={`onboarding-option${draft.occupation === o ? ' is-selected' : ''}`}
                onClick={() => onOccupationPick(o)}
              >
                {o}
              </button>
            ))}
          </div>
        )}

        {step === 'faith' && (
          <div className="onboarding-faith-wrap">
            <FaithPicker
              value={draft.faith}
              onChange={onFaithPick}
              title=""
              subtitle=""
              confirmLabel="确认信仰"
            />
          </div>
        )}

        {step === 'saving' && (
          <div className="onboarding-actions">
            <button type="button" className="onboarding-btn-primary" disabled>
              {saving ? '正在保存…' : '完成'}
            </button>
          </div>
        )}

        {error ? (
          <p style={{ textAlign: 'center', color: '#b91c1c', fontSize: 13, marginTop: 10 }}>{error}</p>
        ) : null}
      </div>
    </div>
  );
}
