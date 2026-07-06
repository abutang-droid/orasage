'use client';

import { useCallback, useRef, useState } from 'react';
import type { Sanctuary } from '@/lib/cms/sanctuaries';
import type { WorshipFacing } from '@/lib/temple/facing';
import { FacingIndicator } from './FacingIndicator';
import './temple.css';

type WorshipDeity = Pick<
  Sanctuary,
  'id' | 'name' | 'nameEN' | 'color' | 'imageUrl' | 'worshipFacing'
>;

function HaloRings({ stage, deityColor }: { stage: number; deityColor: string }) {
  const alpha = stage >= 3 ? 0.4 : stage >= 2 ? 0.25 : stage >= 1 ? 0.12 : 0.04;
  const radius1 = stage === 1 ? 90 : stage === 2 ? 130 : stage >= 3 ? 180 : 60;
  const radius2 = stage === 2 ? 180 : stage >= 3 ? 240 : 90;

  return (
    <>
      <div
        className="temple-halo-ring"
        style={{
          width: radius1 * 2,
          height: radius1 * 2,
          borderColor: deityColor,
          opacity: alpha,
        }}
      />
      {stage >= 2 && (
        <div
          className="temple-halo-ring"
          style={{
            width: radius2 * 2,
            height: radius2 * 2,
            borderColor: deityColor,
            opacity: alpha * 0.6,
            borderWidth: 0.5,
          }}
        />
      )}
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
          className="temple-particle"
          style={{
            width: p.size,
            height: p.size,
            opacity: p.opacity,
            transform: `translate(-50%, -50%) rotate(${p.angle}deg) translateY(-${p.distance}px)`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

type WorshipScreenProps = {
  deity: WorshipDeity;
  facing?: WorshipFacing | null;
  onComplete: (duration: number, stage: number) => void;
};

export function WorshipScreen({ deity, facing, onComplete }: WorshipScreenProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [stage, setStage] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [showShortToast, setShowShortToast] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const stageRef = useRef(0);

  const startHolding = useCallback(() => {
    setIsPressed(true);
    setShowShortToast(false);
    startTimeRef.current = Date.now();
    setElapsed(0);
    setStage(0);
    stageRef.current = 0;

    timerRef.current = setInterval(() => {
      const sec = (Date.now() - startTimeRef.current) / 1000;
      setElapsed(sec);
      let next = 0;
      if (sec >= 10) next = 3;
      else if (sec >= 7) next = 2;
      else if (sec >= 3) next = 1;
      stageRef.current = next;
      setStage(next);
    }, 100);
  }, []);

  const stopHolding = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsPressed(false);
    const duration = (Date.now() - startTimeRef.current) / 1000;
    const finalStage = stageRef.current;

    if (duration < 1) {
      setElapsed(0);
      setStage(0);
      setShowShortToast(true);
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

    onComplete(duration, finalStage >= 3 ? 3 : finalStage >= 2 ? 2 : 1);
  }, [onComplete]);

  const stageClass =
    stage >= 3 ? 'is-stage-3' : stage >= 2 ? 'is-stage-2' : stage >= 1 ? 'is-stage-1' : '';

  const progressLabel =
    !isPressed
      ? null
      : elapsed < 1
        ? '按住以持续参拜'
        : elapsed < 3
          ? '静心参拜中…'
          : elapsed < 7
            ? '心诚渐深…'
            : elapsed < 10
              ? '敬意渐浓…'
              : '圆满在即，可松手礼成';

  const hintText =
    isPressed && elapsed >= 3
      ? stage >= 3
        ? '礼成在即'
        : stage >= 2
          ? '心诚渐深…'
          : '静心参拜中…'
      : '轻按守护神像，静心参拜';

  return (
    <div className="temple-worship">
      <div
        className={`temple-worship-vignette${stage >= 1 ? ' is-active' : ''}${stage >= 3 ? ' is-peak' : ''}`}
        aria-hidden
      />

      <div className="temple-worship-inner">
        {facing ? <FacingIndicator facing={facing} /> : null}

        <div
          className={`temple-worship-stage${isPressed ? ' is-pressed' : ''} ${stageClass}`}
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
          onMouseLeave={() => {
            if (isPressed) stopHolding();
          }}
          role="button"
          tabIndex={0}
          aria-label={`参拜 ${deity.name}`}
        >
          <div className="temple-deity-wrap">
            <HaloRings stage={isPressed ? stage : 0} deityColor={deity.color} />
            <Particles stage={isPressed ? stage : 0} />
            <div className="temple-deity-portrait">
              <img src={deity.imageUrl} alt={deity.name} draggable={false} />
            </div>
          </div>

          <div className="temple-worship-name">{deity.name}</div>
          <div className="temple-worship-name-en">{deity.nameEN}</div>
          <p className="temple-worship-hint">{hintText}</p>

          {isPressed && (
            <div className="temple-worship-progress">
              <div className="temple-worship-progress-bar">
                <div
                  className="temple-worship-progress-fill"
                  style={{ width: `${Math.min(elapsed / 10 * 100, 100)}%` }}
                />
              </div>
              {progressLabel ? (
                <div className="temple-worship-progress-label">{progressLabel}</div>
              ) : null}
            </div>
          )}
        </div>

        {showShortToast && (
          <p className="temple-worship-toast">再按一会，{deity.name}正在聆听</p>
        )}
      </div>
    </div>
  );
}
