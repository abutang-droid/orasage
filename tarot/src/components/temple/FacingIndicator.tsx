'use client';

import type { WorshipFacing } from '@/lib/temple/facing';
import './temple.css';

type FacingIndicatorProps = {
  facing: WorshipFacing;
};

/** 朝拜朝向视觉示意（不要求 GPS） */
export function FacingIndicator({ facing }: FacingIndicatorProps) {
  return (
    <div className="temple-facing" role="note" aria-label={facing.labelZh}>
      <div className="temple-facing-compass" aria-hidden>
        <span className="temple-facing-compass-n">N</span>
        <div
          className="temple-facing-compass-arrow"
          style={{ transform: `rotate(${facing.bearing}deg)` }}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M12 2 L16 20 L12 16 L8 20 Z" />
          </svg>
        </div>
      </div>
      <div className="temple-facing-text">
        <div className="temple-facing-label">{facing.labelZh}</div>
        <div className="temple-facing-hint">视觉象征 · 无需开启定位</div>
      </div>
    </div>
  );
}
