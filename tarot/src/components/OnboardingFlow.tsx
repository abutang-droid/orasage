'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GeoJourneyPicker } from '@/components/geo/GeoJourneyPicker';
import {
  GENDER_OPTIONS,
  OCCUPATION_OPTIONS,
  formatPrefillSummary,
  hasPrefillData,
  normalizeNickname,
  type GenderOption,
  type OccupationOption,
  type OnboardingDraft,
  type OnboardingPrefill,
} from '@/lib/onboarding-v2';
import { customFaithDisplayName, formatFaithLabel, isCustomFaithId } from '@/lib/faiths/religions';
import { useUser } from '@/lib/user';

const MANTO_PORTRAIT = '/images/manto-mentor.png';

type ChatLine = { role: 'mentor' | 'user'; text: string };

type Step =
  | 'intro'
  | 'nickname'
  | 'prefill_confirm'
  | 'birthday'
  | 'gender'
  | 'occupation'
  | 'geo_journey'
  | 'saving';

function MentorRow({ text }: { text: string }) {
  return (
    <div className="onboarding-row onboarding-row--mentor">
      <Image
        src={MANTO_PORTRAIT}
        alt=""
        width={36}
        height={36}
        className="onboarding-row-avatar"
        aria-hidden
      />
      <div className="onboarding-bubble onboarding-bubble--mentor">{text}</div>
    </div>
  );
}

function UserRow({ text }: { text: string }) {
  return (
    <div className="onboarding-row onboarding-row--user">
      <div className="onboarding-bubble onboarding-bubble--user">{text}</div>
    </div>
  );
}

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

  return <MentorRow text={shown} />;
}

function MantoHero() {
  return (
    <aside className="onboarding-hero">
      <Image
        src={MANTO_PORTRAIT}
        alt="Manto，你的塔罗引导者"
        width={320}
        height={427}
        className="onboarding-hero-portrait"
        priority
      />
      <div className="onboarding-hero-caption">
        <div className="onboarding-mentor-name">Manto</div>
        <div className="onboarding-mentor-role">你的塔罗引导者</div>
      </div>
    </aside>
  );
}

export function OnboardingFlow() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const prefillPushedRef = useRef(false);
  const [prefill, setPrefill] = useState<OnboardingPrefill | null>(null);
  const [hasExternal, setHasExternal] = useState(false);
  const [prefillLoaded, setPrefillLoaded] = useState(false);
  const [step, setStep] = useState<Step>('intro');
  const [draft, setDraft] = useState<OnboardingDraft>({
    nickname: '',
    birthdate: '',
    gender: '',
    occupation: '',
    faith: '',
    countryCode: '',
    continentCode: '',
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

    const localNickname = normalizeNickname(user?.nickname);
    if (localNickname) {
      setDraft((d) => ({ ...d, nickname: d.nickname || localNickname }));
    }

    void fetch('/api/onboarding/prefill', { credentials: 'include', cache: 'no-store' })
      .then((r) => r.json())
      .then((data: { prefill?: OnboardingPrefill; hasExternal?: boolean }) => {
        const p = data.prefill ?? null;
        setPrefill(p);
        setHasExternal(Boolean(data.hasExternal));
        if (p) {
          setDraft((d) => ({
            nickname: d.nickname || p.nickname,
            birthdate: p.birthdate,
            gender: p.gender,
            occupation: p.occupation,
            faith: p.faith,
            countryCode: p.countryCode,
            continentCode: p.continentCode,
          }));
        }
      })
      .catch(() => {})
      .finally(() => setPrefillLoaded(true));
  }, [userLoading, user?.onboardingCompleted, user?.nickname, router]);

  const introText = useMemo(() => {
    if (hasExternal && prefill?.sourceLabel) {
      return `你好，我是 Manto，你的塔罗引导者。\n\n我注意到你曾在【${prefill.sourceLabel}】留下过足迹。接下来我会先确认你的基本信息，好让之后的运势与占卜更贴近你。`;
    }
    return '你好，我是 Manto，你的塔罗引导者。\n\n在翻开第一张牌之前，我想先认识你一点点——不会很久，就像老朋友聊天那样。';
  }, [hasExternal, prefill?.sourceLabel]);

  const commitIntroToChat = useCallback(() => {
    pushMentor(introText);
    setIntroDone(true);
  }, [introText, pushMentor]);

  const goAfterIntro = useCallback(() => {
    setStep('nickname');
    pushMentor('首先，我该怎么称呼你？');
  }, [pushMentor]);

  const showPrefillConfirm = useCallback(
    (source: OnboardingPrefill) => {
      if (prefillPushedRef.current) return;
      prefillPushedRef.current = true;
      const summary = formatPrefillSummary(source);
      if (summary) pushMentor(summary);
      pushMentor('这是我目前了解到的你，确认一下好吗？');
      setStep('prefill_confirm');
    },
    [pushMentor],
  );

  const onNicknameNext = () => {
    const nickname = draft.nickname.trim();
    if (!nickname) return;
    pushUser(nickname);
    if (hasExternal && prefill && hasPrefillData(prefill)) {
      showPrefillConfirm(prefill);
      return;
    }
    setStep('birthday');
    pushMentor('很高兴认识你。你的生日是哪一天？我会据此调整运势解读的语气与节奏。');
  };

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
    if (!draft.faith || !draft.countryCode) {
      setStep('geo_journey');
      pushMentor('最后，在地图上找到你的心灵故乡，并选择一种精神归属。祈福与运势都会参考它。');
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
        body: JSON.stringify({
          ...finalDraft,
          nickname: finalDraft.nickname.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || '保存失败');
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败');
      setSaving(false);
      setStep('geo_journey');
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
    setStep('geo_journey');
    pushMentor('最后一步——在地图上找到你的国家，并选择信仰或精神归属。');
  };

  const onGeoJourneyComplete = (result: {
    continentCode: string;
    countryCode: string;
    faith: string;
  }) => {
    const next: OnboardingDraft = {
      ...draft,
      faith: result.faith,
      countryCode: result.countryCode,
      continentCode: result.continentCode,
    };
    setDraft(next);
    const label = isCustomFaithId(result.faith)
      ? customFaithDisplayName(result.faith)
      : formatFaithLabel(result.faith);
    pushUser(`${label} · ${result.countryCode}`);
    void finishOnboarding(next);
  };

  if (userLoading || !prefillLoaded) {
    return (
      <div className="onboarding-page">
        <div className="onboarding-loading">
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="onboarding-page">
      <div className="onboarding-layout">
        <MantoHero />

        <div className="onboarding-stage">
          <div className="onboarding-chat">
            {lines.map((line, i) =>
              line.role === 'mentor' ? (
                <MentorRow key={`${line.role}-${i}`} text={line.text} />
              ) : (
                <UserRow key={`${line.role}-${i}`} text={line.text} />
              ),
            )}

            {step === 'intro' && !introDone && (
              <TypewriterBubble text={introText} onDone={commitIntroToChat} />
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

            {step === 'nickname' && (
              <>
                <input
                  type="text"
                  className="onboarding-text-input"
                  placeholder="你的昵称"
                  value={draft.nickname}
                  maxLength={50}
                  autoFocus
                  onChange={(e) => setDraft((d) => ({ ...d, nickname: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.nickname.trim()) onNicknameNext();
                  }}
                />
                <div className="onboarding-actions">
                  <button
                    type="button"
                    className="onboarding-btn-primary"
                    disabled={!draft.nickname.trim()}
                    onClick={onNicknameNext}
                  >
                    继续
                  </button>
                </div>
              </>
            )}

            {step === 'prefill_confirm' && (
              <div className="onboarding-actions">
                <button type="button" className="onboarding-btn-primary" onClick={acceptPrefill}>
                  确认，继续
                </button>
                <button type="button" className="onboarding-btn-ghost" onClick={editPrefill}>
                  我要修改
                </button>
              </div>
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

            {step === 'geo_journey' && (
              <GeoJourneyPicker
                value={{
                  continentCode: draft.continentCode || undefined,
                  countryCode: draft.countryCode || undefined,
                  faith: draft.faith || undefined,
                }}
                onComplete={onGeoJourneyComplete}
                title=""
                subtitle=""
                faithConfirmLabel="确认并完成引导"
                fullscreen
              />
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
      </div>
    </div>
  );
}
