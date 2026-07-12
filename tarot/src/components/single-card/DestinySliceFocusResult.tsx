'use client';

import type { DestinySliceFocusPayload } from '@/lib/single-card/types';

type Props = {
  focus: DestinySliceFocusPayload;
  sectionTendency: string;
  sectionDeconstruction: string;
  sectionThreshold: string;
  coreTendencyLabel: string;
  energyProbabilityLabel: string;
};

export function DestinySliceFocusResult({
  focus,
  sectionTendency,
  sectionDeconstruction,
  sectionThreshold,
  coreTendencyLabel,
  energyProbabilityLabel,
}: Props) {
  return (
    <div className="destiny-slice-focus-result card">
      <section className="destiny-slice-focus-section">
        <h2 className="destiny-slice-focus-heading">{sectionTendency}</h2>
        <ul className="destiny-slice-focus-list">
          <li>
            <span className="destiny-slice-focus-key">{coreTendencyLabel}</span>
            <span className="destiny-slice-focus-value destiny-slice-focus-value--tendency">{focus.tendency}</span>
          </li>
          <li>
            <span className="destiny-slice-focus-key">{energyProbabilityLabel}</span>
            <span className="destiny-slice-focus-value">{focus.probability}</span>
          </li>
        </ul>
      </section>

      <section className="destiny-slice-focus-section">
        <h2 className="destiny-slice-focus-heading">{sectionDeconstruction}</h2>
        <p className="destiny-slice-focus-text">{focus.deconstruction}</p>
      </section>

      <section className="destiny-slice-focus-section">
        <h2 className="destiny-slice-focus-heading">{sectionThreshold}</h2>
        <p className="destiny-slice-focus-text">{focus.threshold}</p>
      </section>
    </div>
  );
}
