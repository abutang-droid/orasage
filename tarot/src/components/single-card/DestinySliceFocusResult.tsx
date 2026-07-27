'use client';

import type { DestinySliceFocusPayload } from '@/lib/single-card/types';

type Props = {
  focus: DestinySliceFocusPayload;
  sectionTendency: string;
  sectionDeconstruction: string;
  sectionThreshold: string;
  coreTendencyLabel: string;
  energyProbabilityLabel: string;
  localizeTendency: (raw: string) => string;
};

export function DestinySliceFocusResult({
  focus,
  sectionTendency,
  sectionDeconstruction,
  sectionThreshold,
  coreTendencyLabel,
  energyProbabilityLabel,
  localizeTendency,
}: Props) {
  const tendency = localizeTendency(focus.tendency);
  const tone =
    /^(yes|sim|sí|si)$/i.test(focus.tendency.trim())
      ? 'yes'
      : /^(no|não|nao)$/i.test(focus.tendency.trim())
        ? 'no'
        : 'caution';

  return (
    <div className="destiny-slice-focus-result">
      <section className="destiny-slice-focus-hero" aria-labelledby="destiny-slice-tendency-title">
        <p id="destiny-slice-tendency-title" className="destiny-slice-focus-kicker">
          {sectionTendency}
        </p>
        <p className={`destiny-slice-focus-tendency destiny-slice-focus-tendency--${tone}`}>
          {tendency}
        </p>
        {focus.probability && focus.probability !== '—' ? (
          <p className="destiny-slice-focus-probability">
            <span className="destiny-slice-focus-probability-label">{energyProbabilityLabel}</span>
            <span className="destiny-slice-focus-probability-value">{focus.probability}</span>
          </p>
        ) : null}
        <p className="destiny-slice-focus-tendency-caption">{coreTendencyLabel}</p>
      </section>

      <section className="destiny-slice-focus-section" aria-labelledby="destiny-slice-decon-title">
        <h2 id="destiny-slice-decon-title" className="destiny-slice-focus-heading">
          {sectionDeconstruction}
        </h2>
        <p className="destiny-slice-focus-text">{focus.deconstruction}</p>
      </section>

      <section className="destiny-slice-focus-section" aria-labelledby="destiny-slice-threshold-title">
        <h2 id="destiny-slice-threshold-title" className="destiny-slice-focus-heading">
          {sectionThreshold}
        </h2>
        <p className="destiny-slice-focus-text">{focus.threshold}</p>
      </section>
    </div>
  );
}
