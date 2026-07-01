import { Link } from "wouter";
import { useT } from "@/lib/i18n";

const GOLD = "#C4A04E";
const HEADING = "#EDE8D8";
const BODY_CLR = "#ADA898";
const MUTED_CLR = "#6E6858";
const SERIF = "'Noto Serif SC', serif";
const SANS = "'Noto Sans SC', sans-serif";

// Inline SVG 社交图标（简化版，fill: currentColor 支持 hover 变色）
const WechatIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
    <path d="M8.5 2C4.4 2 1 5 1 8.7c0 2 1.1 3.8 2.8 5a.5.5 0 0 1 .2.6l-.3 1.2c0 .1 0 .2.1.2a.3.3 0 0 0 .1-.1l1.6-.9a.8.8 0 0 1 .6-.1c.7.2 1.5.3 2.4.3.2 0 .5 0 .7-.1C8.5 12.3 9.4 10.2 11 9c1.5-1.3 3.4-1.8 5.1-1.6C15.6 4.4 12.4 2 8.5 2zM6 5.8a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm5 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm5.5 2.5c-3.3 0-6 2.2-6 5s2.7 5 6 5c.7 0 1.4-.1 2-.3a.6.6 0 0 1 .5.1l1.3.8a.2.2 0 0 0 .3-.2l-.3-1a.4.4 0 0 1 .2-.5C21.3 16.5 22 15.2 22 13.8c0-3-2.7-5.5-5.5-5.5zm-2.8 3a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8zm5.6 0a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8z" />
  </svg>
);

const WeiboIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
    <path d="M10.1 20.3c-3.6.4-6.7-1.3-6.9-3.6-.2-2.4 2.5-4.6 6.1-4.9 3.6-.4 6.7 1.3 6.9 3.6.2 2.3-2.5 4.5-6.1 4.9zM9.2 17c-.3.6-1.1.8-1.7.5-.6-.2-.7-.9-.4-1.4.3-.5 1.1-.8 1.6-.5.6.2.8.9.5 1.4zm2.1-1.2c-.1.2-.4.3-.7.2-.2-.1-.3-.4-.2-.6.1-.2.4-.3.7-.2.2.1.3.4.2.6zm1.2-4.6c-1.9-.4-4.1.4-5 1.9-.9 1.5-.1 3.2 1.8 3.7 2 .6 4.4-.4 5.3-2 .8-1.7-.1-3.2-2.1-3.6zM21.8 11c0 6-4.9 10.9-10.9 10.9C4.9 21.9 0 17 0 11 0 5 4.9.1 10.9.1 16.9.1 21.8 5 21.8 11zm-8.1-4.2c-.1 0-.1 0-.1-.1.2-.4.2-.9 0-1.3-.4-.8-1.4-1.2-2.5-.9-1.1.3-1.7 1.2-1.5 2.1.1.4.3.7.6.9.1 0 .1.1 0 .2l-.2.3c-.1.1-.1.1-.2.1l-4.9 4.8c-.1.1-.1.1-.1.2 0 .1.1.1.1.1h.1l1.7-1 .1-.1c.1 0 .1 0 .1.1v.1l-.3 1.1v.2c0 .1.1.1.2.1.1 0 .1 0 .2-.1l1.7-1 .1-.1c.1 0 .1 0 .1.1v.1l-.3 1.1v.2c0 .1.1.1.2.1.1 0 .1 0 .2-.1l5.2-3.1c.1 0 .1-.1.1-.2 0-.1-.1-.1-.1-.1h-.1l-1.7 1-.1.1c-.1 0-.1 0-.1-.1v-.1l.3-1.1v-.2c0-.1-.1-.1-.2-.1-.1 0-.1 0-.2.1l-1.7 1-.1.1c-.1 0-.1 0-.1-.1v-.1l.3-1.1v-.2c0-.1-.1-.1-.2-.1-.1 0-.1 0-.2.1l-1.1.6c-.1 0-.1 0-.1-.1 0 0 0-.1.1-.1l2.9-2.8c.1-.1.1-.1.2-.1.1 0 .1.1.1.1v.1l-.3 1.1v.2c0 .1.1.1.2.1.1 0 .1 0 .2-.1l1.7-1 .1-.1c.1 0 .1 0 .1.1v.1l-.3 1.1v.2c0 .1.1.1.2.1.1 0 .1 0 .2-.1l1.7-1 .1-.1c.1 0 .1 0 .1.1v.1l-.3 1.1v.2c0 .1.1.1.2.1.1 0 .1 0 .2-.1l.9-.5c.1 0 .1-.1.1-.2 0-.1-.1-.1-.1-.1h-.1l-.5.3c-.1 0-.1 0-.1-.1 0 0 0-.1.1-.1l.9-.9c.1-.1.1-.1.1-.2 0-.1-.1-.1-.1-.1h-.1l-.5.3c-.1 0-.1 0-.1-.1 0 0 0-.1.1-.1l.5-.5c.1-.1.1-.1.1-.2 0-.1-.1-.1-.1-.1z" />
  </svg>
);

const DouyinIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
    <path d="M19.6 6.7a4.8 4.8 0 0 1-3.8-4.3V2h-3.4v13.7a2.9 2.9 0 0 1-2.9 2.5 2.9 2.9 0 0 1-2.9-2.9 2.9 2.9 0 0 1 2.9-2.9c.3 0 .5 0 .8.1V9a6.3 6.3 0 0 0-.8-.1 6.3 6.3 0 0 0-6.3 6.3 6.3 6.3 0 0 0 6.3 6.3 6.3 6.3 0 0 0 6.3-6.3V8.7a8.2 8.2 0 0 0 4.8 1.5V6.8a4.9 4.9 0 0 1-1-.1z" />
  </svg>
);

const EmailIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" aria-hidden="true">
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
  </svg>
);

function SocialLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="footer-social-btn"
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        color: HEADING,
        background: "rgba(15,12,32,0.72)",
        border: "1px solid rgba(217,209,228,0.9)",
        textDecoration: "none",
        transition: "color 0.25s ease, border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease",
      }}
    >
      {icon}
    </a>
  );
}

function FooterLink({ label, href, to }: { label: string; href?: string; to?: string }) {
  const style: React.CSSProperties = {
    display: "block",
    marginBottom: 11,
    color: BODY_CLR,
    fontSize: 14,
    lineHeight: 1.4,
    textDecoration: "none",
    transition: "color 0.2s ease",
  };

  if (to) {
    return (
      <Link href={to}>
        <span className="footer-nav-link" style={style}>{label}</span>
      </Link>
    );
  }

  return (
    <a href={href || "#"} className="footer-nav-link" style={style}>
      {label}
    </a>
  );
}

export function Footer() {
  const { t } = useT();
  const currentYear = new Date().getFullYear();

  const socialLinkItems = [
    { icon: <WechatIcon />, label: "OraSage " + t('footer.social.wechat'), href: "#" },
    { icon: <WeiboIcon />, label: "OraSage " + t('footer.social.weibo'), href: "#" },
    { icon: <DouyinIcon />, label: "OraSage " + t('footer.social.douyin'), href: "#" },
    { icon: <EmailIcon />, label: t('footer.social.email'), href: "mailto:hello@orasage.com" },
  ];

  const navLinks = [
    { label: t('footer.nav.calculator'), to: "/" },
    { label: t('footer.nav.history'), to: "/history" },
  ];

  const resourceLinkLabels = [
    t('footer.resource.example'),
    t('footer.resource.faq'),
    t('footer.resource.guide'),
    t('footer.resource.market'),
  ];

  const aboutLinkLabels = [
    t('footer.about.company'),
    t('footer.about.terms'),
    t('footer.about.privacy'),
    t('footer.about.contact'),
  ];

  const paymentMethodLabels = ["VISA", "Mastercard", "PayPal", "Alipay"];

  const legalLinkLabels = [
    t('footer.legal.service'),
    t('footer.legal.cookie'),
    t('footer.legal.privacy'),
  ];

  return (
    <footer
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        color: BODY_CLR,
        borderTop: "1px solid rgba(226,219,235,0.72)",
        background:
          "linear-gradient(90deg, rgba(252,250,255,0.97) 0%, rgba(248,246,252,0.95) 48%, rgba(244,239,250,0.9) 100%)",
        fontFamily: SANS,
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto", padding: "48px 28px 28px" }}>
        {/* 主内容网格 */}
        <div className="footer-grid">
          {/* 品牌区 */}
          <div className="footer-brand">
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${GOLD} 0%, #F0B354 100%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {/* 太极符号 */}
                <svg viewBox="0 0 24 24" fill="none" width="20" height="20" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="1.5" />
                  <path d="M12 3 C12 3 16.5 7.5 16.5 12 C16.5 16.5 12 21 12 21" fill="white" opacity="0.5" />
                  <circle cx="12" cy="7.5" r="2" fill="white" />
                  <circle cx="12" cy="16.5" r="2" fill="none" stroke="white" strokeWidth="1.5" />
                </svg>
              </div>
              <span
                style={{
                  fontFamily: SERIF,
                  fontSize: 20,
                  fontWeight: 700,
                  color: HEADING,
                  letterSpacing: "0.05em",
                }}
              >
                OraSage
              </span>
            </div>

            {/* 口号 */}
            <p
              style={{
                maxWidth: 280,
                margin: "0 0 22px",
                color: BODY_CLR,
                fontSize: 14,
                lineHeight: 1.9,
                letterSpacing: "0.02em",
              }}
            >
              {t('footer.tagline.line1')}
              <br />
              {t('footer.tagline.line2')}
            </p>

            {/* 社交图标 */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              {socialLinkItems.map((s) => (
                <SocialLink key={s.label} {...s} />
              ))}
            </div>
          </div>

          {/* 快速导航 */}
          <div className="footer-col">
            <h4
              style={{
                margin: "0 0 16px",
                color: HEADING,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.03em",
                fontFamily: SERIF,
              }}
            >
              {t('footer.heading.nav')}
            </h4>
            {navLinks.map((l) => (
              <FooterLink key={l.label} label={l.label} to={l.to} />
            ))}
          </div>

          {/* 资源 */}
          <div className="footer-col">
            <h4
              style={{
                margin: "0 0 16px",
                color: HEADING,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.03em",
                fontFamily: SERIF,
              }}
            >
              {t('footer.heading.resource')}
            </h4>
            {resourceLinkLabels.map((l) => (
              <FooterLink key={l} label={l} />
            ))}
          </div>

          {/* 关于 */}
          <div className="footer-col">
            <h4
              style={{
                margin: "0 0 16px",
                color: HEADING,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.03em",
                fontFamily: SERIF,
              }}
            >
              {t('footer.heading.about')}
            </h4>
            {aboutLinkLabels.map((l) => (
              <FooterLink key={l} label={l} />
            ))}
          </div>

          {/* 支持与合作伙伴 */}
          <div className="footer-support">
            <h4
              style={{
                margin: "0 0 16px",
                color: HEADING,
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: "0.03em",
                fontFamily: SERIF,
              }}
            >
              {t('footer.heading.support')}
            </h4>
            <p
              style={{
                maxWidth: 280,
                margin: "0 0 18px",
                color: BODY_CLR,
                fontSize: 14,
                lineHeight: 1.8,
              }}
            >
              {t('footer.support_desc')}
            </p>
            {/* 支付方式 */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {paymentMethodLabels.map((m) => (
                <span
                  key={m}
                  style={{
                    minWidth: 58,
                    height: 34,
                    padding: "0 12px",
                    borderRadius: 8,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: HEADING,
                    background: "rgba(15,12,32,0.74)",
                    border: "1px solid rgba(217,209,228,0.92)",
                    fontSize: 12,
                    fontWeight: 600,
                    boxShadow: "0 4px 12px rgba(46,41,91,0.04)",
                    letterSpacing: "0.02em",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 底部版权栏 */}
        <div
          style={{
            marginTop: 40,
            paddingTop: 22,
            borderTop: "1px solid rgba(217,209,228,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <p style={{ margin: 0, color: MUTED_CLR, fontSize: 13 }}>
            © {currentYear} OraSage. {t('footer.copyright')}
          </p>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            {legalLinkLabels.map((l) => (
              <a
                key={l}
                href="#"
                className="footer-legal-link"
                style={{
                  color: BODY_CLR,
                  fontSize: 13,
                  textDecoration: "none",
                  transition: "color 0.2s ease",
                }}
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* 响应式 + hover 样式 */}
      <style>{`
        .footer-grid {
          display: grid;
          grid-template-columns: 1.35fr 0.75fr 0.75fr 0.75fr 1.45fr;
          gap: 40px;
          align-items: flex-start;
        }
        .footer-brand {}
        .footer-col {}
        .footer-support {}

        .footer-social-btn:hover {
          color: ${GOLD} !important;
          border-color: ${GOLD} !important;
          transform: translateY(-2px) !important;
          box-shadow: 0 8px 18px rgba(196,160,78,0.14) !important;
        }
        .footer-nav-link:hover {
          color: ${GOLD} !important;
        }
        .footer-legal-link:hover {
          color: ${GOLD} !important;
        }

        @media (max-width: 1024px) {
          .footer-grid {
            grid-template-columns: 1.4fr 1fr 1fr;
            gap: 32px 24px;
          }
          .footer-brand,
          .footer-support {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 767px) {
          .footer-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 24px 14px;
          }
          .footer-brand,
          .footer-support {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 430px) {
          .footer-grid {
            gap: 20px 10px;
          }
        }
      `}</style>
    </footer>
  );
}
