'use client';

import Link from 'next/link';
import type { Sanctuary } from '@/lib/cms/sanctuaries';

type BlessingScreenProps = {
  deity: Sanctuary;
  stage: number;
  meritEarned: number;
  blessingText?: string;
  alreadyCheckedIn?: boolean;
  levelUp?: boolean;
  streakDays?: number;
  fortuneBonusGranted?: boolean;
  onDone: () => void;
};

function shareToWhatsApp() {
  const shareUrl = 'https://tarot.orasage.com/temple';
  const text = encodeURIComponent('今天在 Manto 完成了每日祈福，获得运势加成 ✦ ');
  void fetch('/api/merit/share', { method: 'POST' });
  window.open(`https://wa.me/?text=${text}${encodeURIComponent(shareUrl)}`, '_blank', 'noopener,noreferrer');
}

export function BlessingScreen({
  deity,
  stage,
  meritEarned,
  blessingText,
  alreadyCheckedIn,
  levelUp,
  streakDays,
  fortuneBonusGranted,
  onDone,
}: BlessingScreenProps) {
  const peakLabel = stage === 3 ? '虔诚之巅' : stage === 2 ? '深度参拜' : '参拜完成';

  return (
    <div className="temple-blessing animate-fade-in-up">
      <div
        className="temple-blessing-avatar"
        style={{ boxShadow: `0 0 20px ${deity.color}33` }}
      >
        <img src={deity.imageUrl} alt={deity.name} />
      </div>

      <div className="temple-blessing-peak">{peakLabel}</div>

      <p className="temple-blessing-lead">
        {deity.name}已将你的心愿放在了最靠近星辰的地方。
      </p>

      <div className="temple-blessing-quote">
        <div className="temple-blessing-quote-label">── 今日指引 ──</div>
        <div className="temple-blessing-quote-text">
          {blessingText ?? deity.blessingText ?? (
            <>
              她看见你心里的那团火——<br />
              那是还没说出口的话。<br />
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

      {!alreadyCheckedIn && fortuneBonusGranted !== false ? (
        <p className="temple-blessing-bonus">✦ 每日运势额外 +1 次，快去抽取今日运势</p>
      ) : null}

      <div className="temple-blessing-actions">
        <Link href="/daily-fortune" className="btn-primary" style={{ display: 'flex', justifyContent: 'center' }}>
          ✦ 去抽今日运势
        </Link>
        <button type="button" className="btn-outline temple-blessing-share" onClick={shareToWhatsApp}>
          📤 分享到 WhatsApp
        </button>
        <button type="button" className="btn-ghost" onClick={onDone}>
          继续参拜其他圣地
        </button>
      </div>
    </div>
  );
}
