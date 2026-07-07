import type { ProductPageSection } from '@/lib/cms-product-page';
import type { PdpAccordionItem } from '@/lib/pdp-content';
import { PdpRichText } from '@/components/PdpRichText';

function AccordionSection({
  section,
  accordionTitle,
}: {
  section: ProductPageSection;
  accordionTitle: string;
}) {
  if (section.type === 'richText' && section.body) {
    return <PdpRichText body={section.body} />;
  }

  if (section.type === 'guide' && (section.title || section.body)) {
    const showTitle = Boolean(section.title && section.title !== accordionTitle);
    return (
      <div className="shop-pdp-acc-guide">
        {showTitle ? <h3 className="shop-pdp-acc-subhead">{section.title}</h3> : null}
        {section.body ? <PdpRichText body={section.body} /> : null}
      </div>
    );
  }

  if (section.type === 'specList' && section.specItems?.length) {
    return (
      <dl className="shop-pdp-promise-list">
        {section.specItems.map((item) => (
          <div key={`${item.label}-${item.value}`} className="shop-pdp-promise-row">
            <dt>{item.label}</dt>
            <dd>{item.value}</dd>
          </div>
        ))}
      </dl>
    );
  }

  if (section.type === 'faq' && section.faqItems?.length) {
    return (
      <div className="shop-pdp-acc-faq">
        {section.faqItems.map((item) => (
          <div key={item.question} className="shop-pdp-acc-faq-item">
            <p className="shop-pdp-acc-faq-q">{item.question}</p>
            <p className="shop-pdp-acc-faq-a">{item.answer}</p>
          </div>
        ))}
      </div>
    );
  }

  return null;
}

export function ProductInfoAccordion({ items }: { items: PdpAccordionItem[] }) {
  if (!items.length) return null;

  return (
    <div className="shop-pdp-accordion">
      {items.map((item, index) => (
        <details key={item.id} className="shop-pdp-acc-item" open={index === 0}>
          <summary className="shop-pdp-acc-summary">{item.title}</summary>
          <div className="shop-pdp-acc-body">
            {item.sections.map((section, i) => (
              <AccordionSection key={i} section={section} accordionTitle={item.title} />
            ))}
          </div>
        </details>
      ))}
    </div>
  );
}
