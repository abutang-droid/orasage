import type { CharacterMood } from './dialogueScript';
import { useLipSync } from './useLipSync';

type Props = {
  mood: CharacterMood;
  /** TTS boundary 递增，驱动嘴型节拍 */
  lipPulse?: number;
  className?: string;
};

const MOUTH_SRC = [
  '/xuanyin/mouth/0.png',
  '/xuanyin/mouth/1.png',
  '/xuanyin/mouth/2.png',
  '/xuanyin/mouth/3.png',
] as const;

/**
 * 沈知微 — GIF 肖像 + 说话嘴型 sprite
 * idle: 呼吸漂浮 | listening: 倾身聆听 | thinking: 冒泡 | speaking: 讲述 + 口型
 */
export function XuanYinCharacter({ mood, lipPulse = 0, className = '' }: Props) {
  const thinking = mood === 'thinking';
  const speaking = mood === 'speaking';
  const listening = mood === 'listening';
  const lipFrame = useLipSync(speaking, lipPulse);

  return (
    <div
      className={`xy-character xy-character--${mood} ${className}`}
      data-mood={mood}
      data-lip={lipFrame}
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
        <img
          className={`xy-mouth xy-mouth--${lipFrame}${speaking ? ' xy-mouth--active' : ''}`}
          src={MOUTH_SRC[lipFrame]}
          alt=""
          width={120}
          height={64}
          draggable={false}
          aria-hidden
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
