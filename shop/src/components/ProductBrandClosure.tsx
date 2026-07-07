import Link from 'next/link';

type ProductBrandClosureProps = {
  element?: string | null;
  sku: string;
};

const CRYSTAL_SKUS = new Set([
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
]);

export function ProductBrandClosure({ element, sku }: ProductBrandClosureProps) {
  if (!CRYSTAL_SKUS.has(sku)) return null;

  const elementHint = element ? `五行·${element}` : '能量';

  return (
    <section className="shop-pdp-section shop-pdp-brand-closure" aria-labelledby="shop-pdp-brand-closure-title">
      <div className="shop-pdp-brand-closure-inner">
        <p className="shop-pdp-brand-closure-eyebrow">OraSage · Oracle + Sage</p>
        <h2 id="shop-pdp-brand-closure-title" className="shop-pdp-brand-closure-title">
          看见，然后携带
        </h2>
        <p className="shop-pdp-brand-closure-sub">
          See your map. Carry your clarity.
        </p>
        <p className="shop-pdp-brand-closure-body">
          命理解读让你「看见」自己的能量地图，水晶让你「携带」这份清醒。
          {element ? ` 若你的报告提示${elementHint}需调和，这款水晶正是命理师常见的补能之选。` : ''}
        </p>
        <div className="shop-pdp-brand-closure-actions">
          <Link href="https://bazi.orasage.com" className="shop-btn-primary shop-pdp-brand-closure-cta">
            先做八字解读
          </Link>
          <p className="shop-pdp-brand-closure-note">获取你的专属水晶推荐</p>
        </div>
      </div>
    </section>
  );
}
