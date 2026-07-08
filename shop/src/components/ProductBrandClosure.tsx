import Link from 'next/link';
import type { ProductCategory } from '@/lib/products';

type ProductBrandClosureProps = {
  element?: string | null;
  sku: string;
  category: ProductCategory;
};

const CRYSTAL_SKUS = new Set([
  'crystal-wood',
  'crystal-fire',
  'crystal-earth',
  'crystal-metal',
  'crystal-water',
]);

function closureCopy(sku: string, category: ProductCategory, element?: string | null) {
  if (CRYSTAL_SKUS.has(sku)) {
    return {
      title: '看见，然后携带',
      sub: 'See your map. Carry your clarity.',
      body: `命理解读让你「看见」自己的能量地图，水晶让你「携带」这份清醒。${
        element ? `若你的报告提示五行「${element}」需调和，这款水晶正是命理师常见的补能之选。` : ''
      }`,
      cta: '先做八字解读',
      href: 'https://bazi.orasage.com',
      note: '获取你的专属水晶推荐',
    };
  }

  if (category === 'report') {
    if (sku.includes('bazi')) {
      return {
        title: '读懂命盘，再携带能量',
        sub: 'Read your chart. Carry your remedy.',
        body: '八字报告帮你看见能量地图的轮廓；若需要进一步补能，可搭配五行水晶或升级礼盒版，让洞察落在日常。',
        cta: '前往八字解读',
        href: 'https://bazi.orasage.com',
        note: '在 App 内解锁完整报告',
      };
    }
    if (sku.includes('ziwei')) {
      return {
        title: '读懂星盘，再迈出一步',
        sub: 'Read your stars. Walk with intention.',
        body: '紫微报告描绘十二宫的人生面向；读懂之后，用 OraSage 对话深入追问，或搭配能量手串让平衡触手可及。',
        cta: '前往紫微斗数',
        href: 'https://ziwei.orasage.com',
        note: '在 App 内查看完整命盘解读',
      };
    }
    return {
      title: '看见当下，再选择行动',
      sub: 'See the pattern. Choose your step.',
      body: '塔罗解读不是预言，而是觉察的入口；牌面照亮当下，行动仍在你手中。每日运势与深度报告可组合使用。',
      cta: '前往塔罗',
      href: 'https://tarot.orasage.com',
      note: '在 App 内抽取与查看解读',
    };
  }

  if (sku === 'temple-donation') {
    return {
      title: '祈福即连接',
      sub: 'Blessing is connection.',
      body: '每一次祈福都是与更大善意的连接；乐捐支持 OraSage 祈福体系持续运营，让这份体验长久可用。',
      cta: '探索 OraSage',
      href: 'https://orasage.com',
      note: '感谢你的自愿支持',
    };
  }

  if (sku.includes('ziwei-chat')) {
    return {
      title: '对话即成长',
      sub: 'Ask deeper. Understand more.',
      body: '排盘之后的追问，往往是理解的关键。OraSage 对话让命盘从「看见」走向「懂得」。',
      cta: '前往紫微斗数',
      href: 'https://ziwei.orasage.com',
      note: '额度自动充值到账户',
    };
  }

  return {
    title: '理清困惑，迈出下一步',
    sub: 'Clarity first. Action follows.',
    body: '有时你需要的不是另一份报告，而是一个愿意认真听、能帮你理清的人。30 分钟咨询，聚焦你此刻最真实的问题。',
    cta: '了解 OraSage 命理体系',
    href: 'https://orasage.com',
    note: '付款后顾问将联系确认时段',
  };
}

export function ProductBrandClosure({ element, sku, category }: ProductBrandClosureProps) {
  const copy = closureCopy(sku, category, element);

  return (
    <section className="shop-pdp-closure" aria-labelledby="shop-pdp-closure-title">
      <p className="shop-pdp-closure-eyebrow">OraSage · Oracle + Sage</p>
      <h2 id="shop-pdp-closure-title" className="shop-pdp-closure-title">
        {copy.title}
      </h2>
      <p className="shop-pdp-closure-sub">{copy.sub}</p>
      <p className="shop-pdp-closure-body">{copy.body}</p>
      <Link href={copy.href} className="shop-pdp-closure-cta">
        {copy.cta}
      </Link>
      <p className="shop-pdp-closure-note">{copy.note}</p>
    </section>
  );
}
