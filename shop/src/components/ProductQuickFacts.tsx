import type { QuickFact } from '@/lib/pdp-content';

export function ProductQuickFacts({ facts }: { facts: QuickFact[] }) {
  if (!facts.length) return null;

  return (
    <dl className="shop-pdp-facts" aria-label="商品基本属性">
      {facts.map((fact) => (
        <div key={fact.label} className="shop-pdp-fact">
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}
