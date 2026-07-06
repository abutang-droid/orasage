'use client';

import { useCallback, useRef, useState } from 'react';
import type { Deity } from '@/lib/faiths/deities';

function HaloRings({ stage, deityColor }: { stage: number; deityColor: string }) {
  const alpha = stage >= 3 ? 0.4 : stage >= 2 ? 0.25 : stage >= 1 ? 0.12 : 0.04;
  const radius1 = stage === 1 ? 90 : stage === 2 ? 130 : stage >= 3 ? 180 : 60;
  const radius2 = stage === 2 ? 180 : stage >= 3 ? 240 : 90;

  return (
    <>
      <div
        className="temple-worship-halo"
        style={{
          width: radius1 * 2,
          height: radius1 * 2,
          border: `1px solid ${deityColor}`,
          opacity: alpha,
        }}
      />
      {stage >= 2 ? (
        <div
          className="temple-worship-halo"
          style={{
            width: radius2 * 2,
            height: radius2 * 2,
            border: `0.5px solid ${deityColor}`,
            opacity: alpha * 0.6,
          }}
        />
      ) : null}
    </>
  );
}

function Particles({ stage }: { stage: number }) {
  const count = stage === 1 ? 15 : stage === 2 ? 35 : stage >= 3 ? 70 : 0;
  const particles = Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (i / count) * 360 + Math.random() * 30,
    distance: 40 + Math.random() * 100,
    delay: Math.random() * 0.5,
    size: 2 + Math.random() * 3,
    opacity: 0.3 + Math.random() * 0.5,
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="temple-worship-particle"
          style={{
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `translate(-50%,-50%) rotate(${p.angle}deg) translateY(-${p.distance}px)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

type WorshipScreenProps = {
  deity: Deity;
  saving?: boolean;
  onBack: () => void;
  onComplete: (duration: number, stage: number) => void;
};

export function WorshipScreen({ deity, saving, onBack, onComplete }: WorshipScreenProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const startHolding = useCallback(() => {
    if (saving) return;
    setIsPressed(true);
    startTimeRef.current = Date.now();
    setElapsed(0);
    setStage(0);

    timerRef.current = setInterval(() => {
      const sec = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(sec);
      if (sec >= 10) setStage(3);
      else if (sec >= 7) setStage(2);
      else if (sec >= 3) setStage(1);
    }, 100);
  }, [saving]);

  const stopHolding = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPressed(false);
    const duration = (Date.now() - startTimeRef.current) / 1000;

    if (duration < 1) {
      setElapsed(0);
      setStage(0);
      return;
    }
    if (duration < 3) {
      setStage(1);
      setTimeout(() => {
        setStage(0);
        setElapsed(0);
      }, 500);
      return;
    }

    onComplete(duration, stage >= 3 ? 3 : stage >= 2 ? 2 : 1);
  }, [onComplete, stage]);

  const progressLabel =
    elapsed < 1
      ? '按住以持续参拜'
      : elapsed < 3
        ? `${Math.round(elapsed)}s · 光环渐起`
        : elapsed < 7
          ? `${Math.round(elapsed)}s · 光环扩散`
          : elapsed < 10
            ? `${Math.round(elapsed)}s · 圣光展开`
            : '虔诚之巅 · 松手完成参拜';

  return (
    <div className="temple-worship">
      {stage >= 3 ? <div className="temple-worship-vignette" aria-hidden /> : null}

      <div className="temple-worship-toolbar">
        <button type="button" className="btn-ghost" style={{ fontSize: 13 }} onClick={onBack} disabled={saving}>
          ← 更换圣地
        </button>
      </div>

      <div className="temple-worship-stage">
        <HaloRings stage={stage} deityColor={deity.color} />
        <Particles stage={isPressed ? stage : 0} />
        <div
          className="temple-worship-avatar"
          style={{
            boxShadow: stage >= 2 ? `0 0 40px ${deity.color}44` : 'var(--shadow-sm)',
            transform: stage >= 3 ? 'scale(1.05)' : 'scale(1)',
            borderColor: stage >= 2 ? 'rgba(184, 148, 63, 0.35)' : 'rgba(255, 255, 255, 0.6)',
          }}
        >
          <img src={deity.imageUrl} alt={deity.name} />
        </div>
      </div>

      <div className="temple-worship-name">{deity.name}</div>
      <div className="temple-worship-name-en">{deity.nameEN}</div>

      {!isPressed || elapsed < 3 ? (
        <p className="temple-worship-hint">把手指放在神像上，感受临在</p>
      ) : null}

      <div
        className={`temple-worship-touch${isPressed ? ' is-pressed' : ''}`}
        onTouchStart={(e) => {
          e.preventDefault();
          startHolding();
        }}
        onTouchEnd={(e) => {
          e.preventDefault();
          stopHolding();
        }}
        onMouseDown={startHolding}
        onMouseUp={stopHolding}
        onMouseLeave={stopHolding}
        role="button"
        tabIndex={0}
        aria-label="按住参拜"
      >
        <div className="temple-worship-touch-label">
          {isPressed
            ? stage >= 3
              ? '虔诚之巅 ✦'
              : stage >= 2
                ? '圣光展开中...'
                : stage >= 1
                  ? '光环渐起...'
                  : '继续按住...'
            : '手指按住这里\n感受临在'}
        </div>
      </div>

      {isPressed ? (
        <div className="temple-worship-progress">
          <div className="temple-worship-progress-bar">
            <div
              className="temple-worship-progress-fill"
              style={{ width: `${Math.min((elapsed / 10) * 100, 100)}%` }}
            />
          </div>
          <div className="temple-worship-progress-text">{progressLabel}</div>
        </div>
      ) : null}

      {!isPressed && elapsed > 0 && elapsed < 1 ? (
        <p className="temple-worship-hint" style={{ marginTop: 16 }}>
          再按一会，{deity.name}正在聆听
        </p>
      ) : null}

      {saving ? (
        <div className="temple-worship-saving" role="status" aria-live="polite">
          <div className="temple-worship-saving-inner">
            <div className="spinner" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>记录今日祈福…</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
