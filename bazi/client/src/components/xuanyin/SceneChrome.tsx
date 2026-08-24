import { useEffect, useState } from 'react';

/** 淡紫雾感浮尘光点（克制 opacity/transform） */
export function SceneAtmosphere() {
  const [dots] = useState(() =>
    Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${(i * 17 + 7) % 100}%`,
      top: `${(i * 23 + 11) % 90}%`,
      size: 2 + (i % 4),
      delay: `${(i % 8) * 0.7}s`,
      duration: `${8 + (i % 5) * 1.4}s`,
    })),
  );

  return (
    <div className="xy-atmosphere" aria-hidden="true">
      <div className="xy-mist xy-mist--a" />
      <div className="xy-mist xy-mist--b" />
      <div className="xy-paper-grain" />
      {dots.map((d) => (
        <span
          key={d.id}
          className="xy-dust"
          style={{
            left: d.left,
            top: d.top,
            width: d.size,
            height: d.size,
            animationDelay: d.delay,
            animationDuration: d.duration,
          }}
        />
      ))}
    </div>
  );
}

/** 简易语音波形（玄隐金 / 用户紫） */
export function Waveform({ variant, active }: { variant: 'xuan' | 'user'; active: boolean }) {
  const bars = [0.4, 0.7, 1, 0.55, 0.85, 0.45, 0.75];
  return (
    <div
      className={`xy-wave xy-wave--${variant} ${active ? 'xy-wave--active' : ''}`}
      aria-hidden={!active}
    >
      {bars.map((h, i) => (
        <span key={i} style={{ ['--h' as string]: h, animationDelay: `${i * 0.08}s` }} />
      ))}
    </div>
  );
}

/** 打字机逐字 */
export function useTypewriter(text: string, enabled: boolean, msPerChar = 30) {
  const [shown, setShown] = useState('');
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setShown(text);
      setDone(true);
      return;
    }
    setShown('');
    setDone(false);
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        window.clearInterval(id);
        setDone(true);
      }
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [text, enabled, msPerChar]);

  return { shown, done };
}
