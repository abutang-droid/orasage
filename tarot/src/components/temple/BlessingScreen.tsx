'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
import { Button } from '@orasage/ui/button';
import { TempleDonation } from '@/components/temple/TempleDonation';
import { useTempleCopy } from '@/lib/i18n/ui-strings';
import './temple.css';

type BlessingScreenProps = {
  deity: Sanctuary;
  duration: number;
  stage: number;
  meritEarned: number;
  blessingText?: string;
  alreadyCheckedIn?: boolean;
  levelUp?: boolean;
  streakDays?: number;
  onDone: () => void;
};

export function BlessingScreen({
  deity,
  stage,
  meritEarned,
  blessingText,
  alreadyCheckedIn,
  levelUp,
  streakDays,
  onDone,
}: BlessingScreenProps) {
  const temple = useTempleCopy();
  const fallbackLines = temple.blessingFallback.split('\n');

  return (
    <div className="temple-blessing">
      <div className="temple-blessing-portrait">
        <img src={deity.imageUrl} alt={deity.name} />
      </div>

      <div className="temple-blessing-peak">{temple.blessingPeak(stage)}</div>

      <p className="temple-blessing-lead">{temple.blessingLead(deity.name)}</p>

      <div className="temple-blessing-card">
        <div className="temple-blessing-card-label">{temple.blessingGuideLabel}</div>
        <div className="temple-blessing-card-text">
          {blessingText ?? deity.blessingText ?? (
            <>
              {fallbackLines.map((line, index) => (
                <span key={line}>
                  {line}
                  {index < fallbackLines.length - 1 ? <br /> : null}
                </span>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="temple-blessing-merit">
        {alreadyCheckedIn ? temple.blessingMeritRecorded : temple.blessingMeritGain(meritEarned)}
        {levelUp ? temple.blessingLevelUp : ''}
        {streakDays && streakDays > 1 ? temple.blessingStreak(streakDays) : ''}
      </div>

      <TempleDonation deityName={deity.name} />

      <div className="temple-blessing-actions">
        <Button asChild className="w-full">
          <Link href="/daily-fortune" className="flex justify-center no-underline">
            <Sparkles size={18} strokeWidth={1.75} aria-hidden />
            {temple.blessingFortuneCta}
          </Link>
        </Button>
        <button type="button" className="temple-blessing-back" onClick={onDone}>
          {temple.blessingBack}
        </button>
      </div>
    </div>
  );
}
