import { useEffect, useState } from 'react';
import {
  prefetchBaziRecommendSkus,
  resolveRecommendProductForElement,
  shopCheckoutUrlForProduct,
  type BaziChartRecommendContext,
  type BaziRecommendProduct,
} from '@/lib/shop-products';

const GOLD = '#C4A04E';
const HEADING_CLR = '#2E295B';
const BODY_CLR = '#4A4560';
const MUTED_CLR = '#7B7488';
const CARD_GRADIENT = 'linear-gradient(135deg, rgba(196,160,78,0.06) 0%, rgba(196,160,78,0.02) 100%)';
const SERIF_F = "'Noto Serif SC', serif";

/** 后台配置的五行推荐商品（基础版数字报告唯一购买入口） */
export function BaziConfiguredProductRecommend({
  element,
  chart,
}: {
  element: string;
  chart?: BaziChartRecommendContext;
}) {
  const [product, setProduct] = useState<BaziRecommendProduct | null>(null);
  const [shopUrl, setShopUrl] = useState<string | null>(null);

  useEffect(() => {
    prefetchBaziRecommendSkus();
    void resolveRecommendProductForElement(element, chart).then((p) => {
      setProduct(p);
      if (p) setShopUrl(shopCheckoutUrlForProduct(p));
    });
  }, [element, chart?.birthStr, chart?.gender, chart?.name, chart?.wuXing]);

  if (!product || !shopUrl) return null;

  return (
    <div className="rounded-xl overflow-hidden" style={{
      border: '1px solid rgba(196,160,78,0.2)',
      background: CARD_GRADIENT,
    }}>
      <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(196,160,78,0.1)' }}>
        <span className="text-sm font-bold" style={{ color: HEADING_CLR, fontFamily: SERIF_F }}>
          能量好物推荐
        </span>
      </div>
      <div className="px-4 py-3">
        <p className="text-base font-bold" style={{ color: GOLD, fontFamily: SERIF_F }}>
          {product.name}
        </p>
        {product.desc ? (
          <p className="text-xs mt-1 leading-relaxed" style={{ color: BODY_CLR }}>
            {product.desc}
          </p>
        ) : null}
        <p className="text-sm font-bold mt-2" style={{ color: GOLD }}>
          {product.priceDisplay}
        </p>
        <a
          href={shopUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: GOLD, color: '#1a1528' }}
        >
          前往购买
        </a>
        <p className="text-[10px] mt-2 text-center" style={{ color: MUTED_CLR }}>
          根据命盘五行「{element}」为您精选
        </p>
      </div>
    </div>
  );
}
