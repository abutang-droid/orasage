import type { CharacterMood } from './dialogueScript';

type Props = {
  mood: CharacterMood;
  className?: string;
};

/**
 * 沈知微 — 动画肖像角色（GIF）
 * idle: 呼吸漂浮 | listening: 倾身聆听 | thinking: 冒泡 | speaking: 讲述微振
 */
export function XuanYinCharacter({ mood, className = '' }: Props) {
  const thinking = mood === 'thinking';
  const speaking = mood === 'speaking';
  const listening = mood === 'listening';

  return (
    <div
      className={`xy-character xy-character--${mood} ${className}`}
      data-mood={mood}
      aria-live="polite"
    >
      {thinking ? (
        <div className="xy-think-bubble" aria-hidden>
          <span>…</span>
        </div>
      ) : null}

      <div className={`xy-halo ${listening ? 'xy-halo--pulse' : ''}`} aria-hidden />

      <div
        className={[
          'xy-figure',
          'xy-figure--float',
          listening ? 'xy-figure--lean' : '',
          speaking ? 'xy-figure--speak' : '',
          mood === 'idle' ? 'xy-figure--idle' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        <img
          className="xy-figure-img xy-figure-img--gif"
          src="/xuanyin/shenzhiwei.gif"
          alt="沈知微"
          width={240}
          height={320}
          decoding="async"
          draggable={false}
        />
        {speaking ? <span className="xy-speak-glow" aria-hidden /> : null}
      </div>

      {listening ? (
        <p className="xy-mood-label">聆听中</p>
      ) : thinking ? (
        <p className="xy-mood-label">思考中</p>
      ) : speaking ? (
        <p className="xy-mood-label">讲述中</p>
      ) : null}
    </div>
  );
}
