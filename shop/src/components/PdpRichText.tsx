import { parseRichTextBody } from '@/lib/pdp-content-parser';

export function PdpRichText({ body }: { body: string }) {
  const blocks = parseRichTextBody(body);
  if (!blocks.length) return null;

  return (
    <div className="shop-pdp-rich">
      {blocks.map((block, index) => {
        if (block.type === 'banner') {
          return (
            <h3 key={index} className="shop-pdp-rich-banner">
              {block.title}
            </h3>
          );
        }

        if (block.type === 'feature') {
          return (
            <div key={index} className="shop-pdp-feature">
              <h3 className="shop-pdp-feature-title">{block.heading}</h3>
              {block.bullets.length ? (
                <ul className="shop-pdp-feature-list">
                  {block.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
              {block.paragraphs.map((para) => (
                <p key={para} className="shop-pdp-feature-para">
                  {para}
                </p>
              ))}
            </div>
          );
        }

        if (block.type === 'timing') {
          return (
            <ul key={index} className="shop-pdp-timing-list">
              {block.items.map((item) => (
                <li key={`${item.scene}-${item.effect}`} className="shop-pdp-timing-item">
                  <span className="shop-pdp-timing-icon" aria-hidden>
                    {item.icon}
                  </span>
                  <span className="shop-pdp-timing-scene">{item.scene}</span>
                  <span className="shop-pdp-timing-effect">{item.effect}</span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === 'pairing') {
          return (
            <div key={index} className="shop-pdp-pairing">
              {block.intro ? <p className="shop-pdp-pairing-intro">{block.intro}</p> : null}
              <ul className="shop-pdp-pairing-list">
                {block.items.map((item) => (
                  <li key={item.combo} className="shop-pdp-pairing-item">
                    <span className="shop-pdp-pairing-combo">{item.combo}</span>
                    <span className="shop-pdp-pairing-effect">{item.effect}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        return (
          <p key={index} className="shop-pdp-rich-paragraph">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
