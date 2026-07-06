'use client';

import Link from 'next/link';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
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
        <Link href="/daily-fortune" className="btn-primary" style={{ display: 'flex', justifyContent: 'center', textDecoration: 'none' }}>
          ✦ 去抽今日运势
        </Link>
        <button type="button" className="temple-blessing-back" onClick={onDone}>
          返回
        </button>
      </div>
    </div>
  );
}
