'use client';

import type { ThreeCardTrilogyPayload } from '@/lib/three-card/trilogy-types';

type Props = {
  trilogy: ThreeCardTrilogyPayload;
  sectionArchitecture: string;
  modeLabel: string;
  sectionNodes: string;
  sectionChain: string;
  sectionThreshold: string;
  positionLabel: (key: string) => string;
};

export function ThreeCardTrilogyResult({
  trilogy,
  sectionArchitecture,
  modeLabel,
  sectionNodes,
  sectionChain,
  sectionThreshold,
  positionLabel,
}: Props) {
  return (
    <div className="trilogy-result card">
      <section className="trilogy-result-section">
        <h2 className="trilogy-result-heading">{sectionArchitecture}</h2>
        <p className="trilogy-result-line">
          <span className="trilogy-result-key">{modeLabel}</span>
          <span className="trilogy-result-value">{trilogy.mode}</span>
        </p>
      </section>

      <section className="trilogy-result-section">
        <h2 className="trilogy-result-heading">{sectionNodes}</h2>
        <ul className="trilogy-result-nodes">
          {trilogy.nodes.map((node, i) => (
            <li key={`${node.position}-${i}`}>
              <span className="trilogy-result-node-index">
                节点 {String(i + 1).padStart(2, '0')}
              </span>
              <span className="trilogy-result-node-card">
                [{node.cardName}]
              </span>
              <span className="trilogy-result-node-pos">
                {positionLabel(node.position)}
              </span>
              <p className="trilogy-result-node-text">{node.mapping}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="trilogy-result-section">
        <h2 className="trilogy-result-heading">{sectionChain}</h2>
        <p className="trilogy-result-text">{trilogy.chainAnalysis}</p>
      </section>

      <section className="trilogy-result-section">
        <h2 className="trilogy-result-heading">{sectionThreshold}</h2>
        <p className="trilogy-result-text">{trilogy.actionThreshold}</p>
      </section>
    </div>
  );
}
