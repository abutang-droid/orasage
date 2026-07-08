'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@orasage/ui/button';
import { GeoJourneyPicker } from '@/components/geo/GeoJourneyPicker';
import {
  GENDER_OPTIONS,
  OCCUPATION_OPTIONS,
  hasPrefillData,
  normalizeNickname,
  type GenderOption,
  type OccupationOption,
  type OnboardingDraft,
  type OnboardingPrefill,
} from '@/lib/onboarding-v2';
import { useOnboardingCopy } from '@/lib/i18n/feature-copy';
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

function MantoHero({ alt, role }: { alt: string; role: string }) {
  return (
    <aside className="onboarding-hero">
      <Image
        src={MANTO_PORTRAIT}
        alt={alt}
        width={320}
        height={427}
        className="onboarding-hero-portrait"
        priority
      />
      <div className="onboarding-hero-caption">
        <div className="onboarding-mentor-name">Manto</div>
        <div className="onboarding-mentor-role">{role}</div>
      </div>
    </aside>
  );
}

export function OnboardingFlow() {
  const copy = useOnboardingCopy();
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

  const introText = useMemo(
    () => copy.introText(prefill?.sourceLabel),
    [copy, prefill?.sourceLabel],
  );

  const commitIntroToChat = useCallback(() => {
    pushMentor(introText);
    setIntroDone(true);
  }, [introText, pushMentor]);

  const goAfterIntro = useCallback(() => {
    setStep('nickname');
    pushMentor(copy.askNickname);
  }, [copy.askNickname, pushMentor]);

  const showPrefillConfirm = useCallback(
    (source: OnboardingPrefill) => {
      if (prefillPushedRef.current) return;
      prefillPushedRef.current = true;
      const summary = copy.formatPrefillSummary(source);
      if (summary) pushMentor(summary);
      pushMentor(copy.prefillConfirm);
      setStep('prefill_confirm');
    },
    [copy, pushMentor],
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
    pushMentor(copy.askBirthday);
  };

  const acceptPrefill = () => {
    pushUser(copy.prefillOk);
    if (!draft.birthdate) {
      setStep('birthday');
      pushMentor(copy.askBirthdayShort);
      return;
    }
    if (!draft.gender) {
      setStep('gender');
      pushMentor(copy.askGenderPrefill);
      return;
    }
    if (!draft.occupation) {
      setStep('occupation');
      pushMentor(copy.askOccupationDetail);
      return;
    }
    if (!draft.faith || !draft.countryCode) {
      setStep('geo_journey');
      pushMentor(copy.askGeo);
      return;
    }
    void finishOnboarding(draft);
  };

  const editPrefill = () => {
    pushUser(copy.editMyself);
    setStep('birthday');
    pushMentor(copy.editFromBirthday);
  };

  const finishOnboarding = async (finalDraft: OnboardingDraft) => {
    setStep('saving');
    setSaving(true);
    setError('');
    pushMentor(copy.saving);
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
      if (!res.ok) throw new Error((data as { error?: string }).error || copy.saveFailed);
      window.location.href = '/';
    } catch (err) {
      setError(err instanceof Error ? err.message : copy.saveFailed);
      setSaving(false);
      setStep('geo_journey');
    }
  };

  const onBirthdayNext = () => {
    if (!draft.birthdate) return;
    pushUser(draft.birthdate);
    setStep('gender');
    pushMentor(copy.askGender);
  };

  const onGenderPick = (gender: GenderOption) => {
    setDraft((d) => ({ ...d, gender }));
    pushUser(copy.genderLabel(gender));
    setStep('occupation');
    pushMentor(copy.askOccupation);
  };

  const onOccupationPick = (occupation: OccupationOption) => {
    setDraft((d) => ({ ...d, occupation }));
    pushUser(copy.occupationLabel(occupation));
    setStep('geo_journey');
    pushMentor(copy.askGeoShort);
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
        <MantoHero alt={copy.mentorAlt} role={copy.mentorRole} />

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
                <Button type="button" className="w-full" onClick={goAfterIntro}>
                  {copy.start}
                </Button>
              </div>
            )}

            {step === 'nickname' && (
              <>
                <input
                  type="text"
                  className="onboarding-text-input"
                  placeholder={copy.nicknamePlaceholder}
                  value={draft.nickname}
                  maxLength={50}
                  autoFocus
                  onChange={(e) => setDraft((d) => ({ ...d, nickname: e.target.value }))}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && draft.nickname.trim()) onNicknameNext();
                  }}
                />
                <div className="onboarding-actions">
                  <Button
                    type="button"
                    className="w-full"
                    disabled={!draft.nickname.trim()}
                    onClick={onNicknameNext}
                  >
                    {copy.continue}
                  </Button>
                </div>
              </>
            )}

            {step === 'prefill_confirm' && (
              <div className="onboarding-actions">
                <Button type="button" className="w-full" onClick={acceptPrefill}>
                  {copy.confirmContinue}
                </Button>
                <Button type="button" variant="ghost" className="w-full" onClick={editPrefill}>
                  {copy.editPrefill}
                </Button>
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
                  <Button
                    type="button"
                    className="w-full"
                    disabled={!draft.birthdate}
                    onClick={onBirthdayNext}
                  >
                    {copy.continue}
                  </Button>
                </div>
              </>
            )}

            {step === 'gender' && (
              <div className="onboarding-options">
                {copy.genderOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={`onboarding-option${draft.gender === key ? ' is-selected' : ''}`}
                    onClick={() => onGenderPick(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}

            {step === 'occupation' && (
              <div className="onboarding-options">
                {copy.occupationOptions.map(({ key, label }) => (
                  <button
                    key={key}
                    type="button"
                    className={`onboarding-option${draft.occupation === key ? ' is-selected' : ''}`}
                    onClick={() => onOccupationPick(key)}
                  >
                    {label}
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
                faithConfirmLabel={copy.faithConfirm}
                fullscreen
              />
            )}

            {step === 'saving' && (
              <div className="onboarding-actions">
                <Button type="button" className="w-full" disabled>
                  {saving ? copy.savingBtn : copy.done}
                </Button>
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
