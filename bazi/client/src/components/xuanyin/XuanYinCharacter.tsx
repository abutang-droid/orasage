import type { CharacterMood } from './dialogueScript';

type Props = {
  mood: CharacterMood;
  className?: string;
};

/**
 * 玄隐先生 — 仙风道士写实肖像（水墨意境）
 * 神态叠层：idle 呼吸 | listening 倾身+光环 | thinking 冒泡 | speaking 唇部光晕
 */
export function XuanYinCharacter({ mood, className = '' }: Props) {
  const lean = mood === 'listening';
  const thinking = mood === 'thinking';
  const speaking = mood === 'speaking';

  return (
    <div
      className={`xy-character xy-character--${mood} ${className}`}
      data-mood={mood}
      aria-hidden="true"
    >
      {thinking ? (
        <div className="xy-think-bubble" aria-hidden>
          <span>…</span>
        </div>
      ) : null}

      <div className={`xy-halo ${mood === 'listening' ? 'xy-halo--pulse' : ''}`} />

      <div
        className={`xy-portrait-wrap ${lean ? 'xy-avatar--lean' : ''} ${mood === 'idle' ? 'xy-avatar--breathe' : ''}`}
      >
        <picture>
          <source srcSet="/xuanyin/immortal-portrait.webp" type="image/webp" />
          <img
            className="xy-portrait"
            src="/xuanyin/immortal-portrait.png"
            alt="玄隐先生"
            width={360}
            height={480}
            decoding="async"
            draggable={false}
          />
        </picture>
        {speaking ? <span className="xy-speak-glow" aria-hidden /> : null}
        {mood === 'listening' ? <span className="xy-listen-ring" aria-hidden /> : null}
      </div>

      {mood === 'listening' ? (
        <p className="xy-mood-label">聆听中</p>
      ) : mood === 'thinking' ? (
        <p className="xy-mood-label">思考中</p>
      ) : speaking ? (
        <p className="xy-mood-label">讲述中</p>
      ) : null}
    </div>
  );
}
