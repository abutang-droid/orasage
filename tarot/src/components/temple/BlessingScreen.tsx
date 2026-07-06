'use client';

import Link from 'next/link';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
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
  const peakLabel = stage === 3 ? '虔诚之巅' : stage === 2 ? '深度参拜' : '参拜完成';

  return (
    <div className="temple-blessing">
      <div className="temple-blessing-portrait">
        <img src={deity.imageUrl} alt={deity.name} />
      </div>

      <div className="temple-blessing-peak">{peakLabel}</div>

      <p className="temple-blessing-lead">
        {deity.name}已将你的心愿放在了最靠近星辰的地方。
      </p>

      <div className="temple-blessing-card">
        <div className="temple-blessing-card-label">── 今日指引 ──</div>
        <div className="temple-blessing-card-text">
          {blessingText ?? deity.blessingText ?? (
            <>
              她看见你心里的那团火——
              <br />
              那是还没说出口的话。
              <br />
              今天，向前走一步。
            </>
          )}
        </div>
      </div>

      <div className="temple-blessing-merit">
        {alreadyCheckedIn ? '今日功德已记录' : `+${meritEarned} 功德`}
        {levelUp ? ' · 升阶！' : ''}
        {streakDays && streakDays > 1 ? ` · 连续 ${streakDays} 天` : ''}
      </div>

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
