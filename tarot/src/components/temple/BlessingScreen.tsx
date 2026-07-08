'use client';

import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
import { Button } from '@orasage/ui/button';
import { TempleDonation } from '@/components/temple/TempleDonation';
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
  const peakLabel = stage === 3 ? '诚心礼成' : stage === 2 ? '深度参拜' : '参拜礼成';

  return (
    <div className="temple-blessing">
      <div className="temple-blessing-portrait">
        <img src={deity.imageUrl} alt={deity.name} />
      </div>

      <div className="temple-blessing-peak">{peakLabel}</div>

      <p className="temple-blessing-lead">
        {deity.name}已聆听你的心愿，愿护佑与你同行。
      </p>

      <div className="temple-blessing-card">
        <div className="temple-blessing-card-label">── 今日指引 ──</div>
        <div className="temple-blessing-card-text">
          {blessingText ?? deity.blessingText ?? (
            <>
              你的心意已被看见——
              <br />
              那些尚未说出口的话，
              <br />
              今日宜向前走一步。
            </>
          )}
        </div>
      </div>

      <div className="temple-blessing-merit">
        {alreadyCheckedIn ? '今日功德已记录' : `+${meritEarned} 功德`}
        {levelUp ? ' · 修行精进' : ''}
        {streakDays && streakDays > 1 ? ` · 连续 ${streakDays} 天` : ''}
      </div>

      <TempleDonation deityName={deity.name} />

      <div className="temple-blessing-actions">
        <Button asChild className="w-full">
          <Link href="/daily-fortune" className="flex justify-center no-underline">
            <Sparkles size={18} strokeWidth={1.75} aria-hidden />
            去抽今日运势
          </Link>
        </Button>
        <button type="button" className="temple-blessing-back" onClick={onDone}>
          返回
        </button>
      </div>
    </div>
  );
}
