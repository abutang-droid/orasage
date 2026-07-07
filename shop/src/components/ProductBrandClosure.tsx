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

  return (
    <section className="shop-pdp-closure" aria-labelledby="shop-pdp-closure-title">
      <p className="shop-pdp-closure-eyebrow">OraSage · Oracle + Sage</p>
      <h2 id="shop-pdp-closure-title" className="shop-pdp-closure-title">
        看见，然后携带
      </h2>
      <p className="shop-pdp-closure-sub">See your map. Carry your clarity.</p>
      <p className="shop-pdp-closure-body">
        命理解读让你「看见」自己的能量地图，水晶让你「携带」这份清醒。
        {element ? `若你的报告提示五行「${element}」需调和，这款水晶正是命理师常见的补能之选。` : ''}
      </p>
      <Link href="https://bazi.orasage.com" className="shop-pdp-closure-cta">
        先做八字解读
      </Link>
      <p className="shop-pdp-closure-note">获取你的专属水晶推荐</p>
    </section>
  );
}
