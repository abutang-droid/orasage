/** Magazine-style report CSS — aligned with report-detail.html + ochre design-spec */

export const REPORT_PAGE_CSS = `
:root{
  --ivory:#FAF9F5;--ivory-dark:#F0EEE8;--ink-black:#28261B;--ink-soft:#3D3929;--ink-muted:#6E6D68;
  --terracotta:#C96442;--terracotta-light:#E0A892;--terracotta-dark:#934828;
  --border-light:#E3E0D4;--border-medium:#DAD9D4;--card:#FFFFFF;
  --font-display:'Newsreader','Noto Serif SC',Georgia,serif;
  --font-body:'Lora','Noto Serif SC',Georgia,serif;
  --font-ui:'Poppins','Noto Sans SC',system-ui,sans-serif;
  --max-width:920px;
  --wood:#5B8C5A;--fire:#C96442;--earth:#C4A35A;--metal:#8A887E;--water:#5B7C99;
}
*{box-sizing:border-box;margin:0;padding:0}
html{scroll-behavior:smooth}
body{font-family:var(--font-body);background:var(--ivory);color:var(--ink-black);line-height:1.75;font-size:17px;min-height:100vh}
a{color:inherit;text-decoration:none}
button{font:inherit;cursor:pointer;border:none;background:none}
.diamond-divider{display:inline-block;width:6px;height:6px;background:var(--terracotta);transform:rotate(45deg);margin:0 10px;vertical-align:middle;flex-shrink:0}

/* Nav */
.top-nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:14px 0;transition:all .3s ease;background:transparent}
.top-nav.scrolled{background:rgba(250,249,245,.9);backdrop-filter:blur(12px);border-bottom:1px solid var(--border-light);padding:10px 0}
.top-nav-inner{max-width:var(--max-width);margin:0 auto;padding:0 20px;display:flex;align-items:center;justify-content:space-between;gap:12px}
.nav-logo{display:flex;align-items:center;gap:10px}
.nav-logo-mark{width:26px;height:26px;position:relative}
.nav-logo-mark .diamond-shape{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);width:15px;height:15px;border:1.5px solid var(--terracotta)}
.nav-logo-mark .diamond-inner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);width:5px;height:5px;background:var(--terracotta)}
.nav-logo-wordmark{font-family:var(--font-display);font-size:1.25rem;font-weight:600;color:var(--ink-black);letter-spacing:-.01em}
.nav-section-label{font-family:var(--font-ui);font-size:11px;font-weight:500;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-muted)}
.nav-actions{display:flex;align-items:center;gap:10px}
.nav-share-btn{font-family:var(--font-ui);font-size:12px;font-weight:500;letter-spacing:.1em;text-transform:uppercase;color:var(--ink-soft);padding:8px 14px;border:1px solid var(--border-medium);border-radius:2px;transition:all .25s}
.nav-share-btn:hover{border-color:var(--terracotta);color:var(--terracotta)}

/* Hero */
.hero{position:relative;min-height:78vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:7rem 1.25rem 4rem;text-align:center;overflow:hidden;background:
  radial-gradient(ellipse 80% 55% at 50% 15%,rgba(201,100,66,.12) 0%,transparent 70%),
  linear-gradient(180deg,#FAF9F5 0%,#F5F4EF 55%,#F0EDE4 100%)}
.hero-issue{font-family:var(--font-ui);font-size:12px;letter-spacing:.22em;text-transform:uppercase;color:var(--terracotta);margin-bottom:1.5rem;display:inline-flex;align-items:center;gap:10px}
.hero-issue::before,.hero-issue::after{content:"";width:28px;height:1px;background:var(--terracotta-light)}
.hero-headline{font-family:var(--font-display);font-size:clamp(2rem,6vw,3.25rem);font-weight:500;color:var(--ink-black);letter-spacing:.02em;line-height:1.15;margin-bottom:.75rem}
.hero-subhead{font-family:var(--font-body);font-size:clamp(1rem,2.5vw,1.2rem);color:var(--ink-soft);margin-bottom:1.5rem}
.hero-person-row{display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:4px 0;font-family:var(--font-ui);font-size:12px;color:var(--ink-muted);letter-spacing:.04em;max-width:640px}
.hero-person-name{color:var(--terracotta);font-weight:600}
.hero-decoration{margin-top:2.5rem;opacity:.85}
.star-compass{position:relative;width:120px;height:120px;margin:0 auto;border:1px solid var(--border-medium);border-radius:50%}
.star-compass::before,.star-compass::after{content:"";position:absolute;inset:18%;border:1px solid rgba(201,100,66,.25);border-radius:50%}
.star-compass::after{inset:32%;border-color:rgba(201,100,66,.4)}
.compass-n,.compass-s,.compass-e,.compass-w{position:absolute;font-size:12px;color:var(--terracotta);font-family:var(--font-ui)}
.compass-n{top:6px;left:50%;transform:translateX(-50%)}
.compass-s{bottom:6px;left:50%;transform:translateX(-50%)}
.compass-e{right:8px;top:50%;transform:translateY(-50%)}
.compass-w{left:8px;top:50%;transform:translateY(-50%)}
.compass-center{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) rotate(45deg);width:10px;height:10px;background:var(--terracotta)}
.scroll-indicator{position:absolute;bottom:1.5rem;left:50%;transform:translateX(-50%);display:flex;flex-direction:column;align-items:center;gap:6px;font-family:var(--font-ui);font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:var(--ink-muted)}
.scroll-indicator-line{width:1px;height:36px;background:linear-gradient(180deg,var(--terracotta),transparent);animation:scrollPulse 1.8s ease-in-out infinite}
@keyframes scrollPulse{0%,100%{opacity:.35;transform:scaleY(.85)}50%{opacity:1;transform:scaleY(1)}}

/* TOC */
.toc{position:sticky;top:56px;z-index:50;background:rgba(250,249,245,.92);backdrop-filter:blur(10px);border-bottom:1px solid var(--border-light)}
.toc-list{max-width:var(--max-width);margin:0 auto;padding:0 12px;display:flex;gap:4px;overflow-x:auto;list-style:none;-webkit-overflow-scrolling:touch}
.toc-item a{display:flex;align-items:center;gap:6px;padding:12px 10px;font-family:var(--font-ui);font-size:12px;color:var(--ink-muted);white-space:nowrap;border-bottom:2px solid transparent;transition:color .2s,border-color .2s}
.toc-num{color:var(--terracotta);font-weight:600;letter-spacing:.08em}
.toc-item.active a,.toc-item a:hover{color:var(--ink-soft);border-bottom-color:var(--terracotta)}

/* Sections */
.section{max-width:var(--max-width);margin:0 auto;padding:4.5rem 1.25rem 3rem}
.section-header{margin-bottom:2rem}
.section-number{font-family:var(--font-ui);font-size:12px;letter-spacing:.2em;color:var(--terracotta);font-weight:600;margin-bottom:.5rem}
.section-title{font-family:var(--font-display);font-size:clamp(1.5rem,3.5vw,2rem);font-weight:500;color:var(--ink-black);margin-bottom:.4rem}
.section-subtitle{font-family:var(--font-ui);font-size:13px;color:var(--ink-muted);letter-spacing:.02em}
.pull-quote{margin:0 0 2rem;padding:1.5rem 1.25rem;border-left:3px solid var(--terracotta);background:linear-gradient(90deg,rgba(201,100,66,.06),transparent)}
.pull-quote-text{font-family:var(--font-display);font-size:1.25rem;line-height:1.55;color:var(--ink-soft);font-style:italic}
.pull-quote-attribution{margin-top:.75rem;font-family:var(--font-ui);font-size:12px;color:var(--ink-muted);letter-spacing:.08em}
.section-body{font-size:1.02rem;color:var(--ink-soft)}
.section-body p{margin-bottom:1rem}
.section-body h2,.section-body h3{font-family:var(--font-display);font-size:1.15rem;color:var(--ink-black);margin:1.25rem 0 .6rem}
.section-body ul{padding-left:1.25rem;margin:.5rem 0 1rem}
.section-body li{margin-bottom:.35rem}
.section-body strong{color:var(--ink-black)}
.kw-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 0 1.25rem}
.kw{font-family:var(--font-ui);font-size:.65rem;color:var(--terracotta-dark);padding:.15rem .55rem;border-radius:999px;background:#F4E0D5;border:1px solid var(--border-medium)}

.key-takeaway{margin-top:2rem}
.key-takeaway-box{padding:1.5rem 1.35rem;border:1px solid var(--border-medium);background:var(--card);border-radius:2px}
.key-takeaway-label{font-family:var(--font-ui);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--terracotta);margin-bottom:1rem;font-weight:600}
.key-takeaway-list{list-style:none;display:grid;gap:.75rem}
.key-takeaway-list li{font-size:.95rem;color:var(--ink-soft);padding-left:1rem;border-left:2px solid var(--terracotta-light)}

/* Elements */
.elements-list{display:grid;gap:1rem;margin-top:.5rem}
.element-item{display:grid;grid-template-columns:40px 1fr auto;gap:10px 12px;align-items:center;padding:12px 0;border-bottom:1px solid var(--border-light)}
.element-symbol{width:40px;height:40px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-family:var(--font-display);font-weight:600;color:#fff;font-size:1rem}
.element-symbol.wood{background:var(--wood)}.element-symbol.fire{background:var(--fire)}.element-symbol.earth{background:var(--earth)}.element-symbol.metal{background:var(--metal)}.element-symbol.water{background:var(--water)}
.element-name{font-family:var(--font-ui);font-size:13px;font-weight:500;color:var(--ink-soft);margin-bottom:6px}
.element-bar{height:6px;background:var(--border-light);border-radius:999px;overflow:hidden}
.element-bar-fill{height:100%;border-radius:999px}
.element-bar-fill.wood{background:var(--wood)}.element-bar-fill.fire{background:var(--fire)}.element-bar-fill.earth{background:var(--earth)}.element-bar-fill.metal{background:var(--metal)}.element-bar-fill.water{background:var(--water)}
.element-percent{font-family:var(--font-ui);font-size:14px;font-weight:600;color:var(--ink-soft);min-width:3rem;text-align:right}
.element-desc{grid-column:2 / -1;font-size:13px;color:var(--ink-muted);margin-top:-4px}

/* Product / paywall / footer */
.product-rec{max-width:var(--max-width);margin:0 auto 2rem;padding:1.25rem 1.5rem;border:1px solid var(--border-medium);background:linear-gradient(135deg,rgba(201,100,66,.08),rgba(201,100,66,.02))}
.product-rec-label{font-family:var(--font-ui);font-size:.65rem;color:var(--terracotta);letter-spacing:.2em;font-weight:700;margin-bottom:.5rem}
.product-rec-name{font-family:var(--font-display);font-size:1.1rem;color:var(--ink-black);font-weight:600;margin-bottom:.35rem}
.product-rec-desc{font-size:.9rem;color:var(--ink-muted);margin-bottom:.75rem}
.product-rec-price{font-size:1.1rem;color:var(--terracotta);font-weight:700;margin-bottom:1rem}
.product-rec-btn{display:inline-block;padding:.55rem 1.25rem;background:var(--terracotta);color:#fff;font-family:var(--font-ui);font-size:.85rem;font-weight:600;box-shadow:0 4px 12px rgba(201,100,66,.28)}

.paywall-section{position:relative;margin:2rem 0 0;padding:4rem 1.25rem;text-align:center;background:linear-gradient(180deg,#F5F4EF,#EDE9DE);overflow:hidden}
.paywall-pattern{position:absolute;inset:0;opacity:.35;background:
  radial-gradient(circle at 20% 30%,rgba(201,100,66,.12),transparent 40%),
  radial-gradient(circle at 80% 70%,rgba(201,100,66,.1),transparent 45%)}
.paywall-content{position:relative;max-width:520px;margin:0 auto}
.paywall-label{font-family:var(--font-ui);font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--terracotta);margin-bottom:.75rem}
.paywall-headline{font-family:var(--font-display);font-size:clamp(1.6rem,4vw,2.1rem);font-weight:500;margin-bottom:.5rem}
.paywall-subhead{color:var(--ink-muted);margin-bottom:1.5rem;font-size:.95rem}
.paywall-features{list-style:none;display:grid;gap:.55rem;text-align:left;margin:0 auto 1.75rem;max-width:320px}
.paywall-features li{font-family:var(--font-ui);font-size:13px;color:var(--ink-soft);padding-left:1.1rem;position:relative}
.paywall-features li::before{content:"";position:absolute;left:0;top:.55em;width:6px;height:6px;background:var(--terracotta);transform:rotate(45deg)}
.paywall-cta{display:inline-flex;align-items:center;gap:8px;padding:.85rem 1.6rem;background:var(--terracotta);color:#fff;font-family:var(--font-ui);font-size:14px;font-weight:600;letter-spacing:.04em;box-shadow:0 6px 18px rgba(201,100,66,.28);transition:transform .2s,background .2s}
.paywall-cta:hover{background:var(--terracotta-dark);transform:translateY(-1px)}
.paywall-secondary{display:inline-block;margin-top:1rem;font-family:var(--font-ui);font-size:13px;color:var(--terracotta);border-bottom:1px solid var(--terracotta-light);cursor:pointer}

.footer{padding:3rem 1.25rem 5.5rem;text-align:center;border-top:1px solid var(--border-light);background:var(--ivory)}
.footer-logo-wordmark{font-family:var(--font-display);font-size:1.4rem;font-weight:600;color:var(--ink-black)}
.footer-tagline{font-family:var(--font-ui);font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--ink-muted);margin:.5rem 0 1.25rem}
.footer-links{display:flex;flex-wrap:wrap;justify-content:center;gap:1rem;margin-bottom:1rem}
.footer-link{font-family:var(--font-ui);font-size:12px;color:var(--ink-muted)}
.footer-link:hover{color:var(--terracotta)}
.footer-copyright{font-family:var(--font-ui);font-size:11px;color:var(--ink-muted)}
.footer-note{margin-top:1rem;font-size:12px;color:var(--ink-muted);line-height:1.7;max-width:480px;margin-left:auto;margin-right:auto}

/* Floating share */
.fab-share{position:fixed;right:16px;bottom:20px;z-index:90;display:inline-flex;align-items:center;gap:8px;padding:12px 16px;background:var(--terracotta);color:#fff;font-family:var(--font-ui);font-size:13px;font-weight:600;letter-spacing:.06em;box-shadow:0 8px 24px rgba(201,100,66,.35);border-radius:999px}
.fab-share:hover{background:var(--terracotta-dark)}

/* Share modal */
.share-overlay{position:fixed;inset:0;z-index:200;background:rgba(40,38,27,.45);display:none;align-items:flex-end;justify-content:center;padding:16px;backdrop-filter:blur(4px)}
.share-overlay.open{display:flex}
.share-sheet{width:min(440px,100%);max-height:min(88vh,720px);overflow:auto;background:var(--ivory);border:1px solid var(--border-medium);box-shadow:0 20px 60px rgba(40,38,27,.2);padding:1.35rem 1.25rem 1.5rem;animation:sheetUp .28s ease}
@keyframes sheetUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}}
.share-sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:1rem}
.share-sheet-title{font-family:var(--font-display);font-size:1.35rem;font-weight:500;color:var(--ink-black)}
.share-sheet-sub{font-family:var(--font-ui);font-size:12px;color:var(--ink-muted);margin-top:4px;letter-spacing:.04em}
.share-close{width:36px;height:36px;border:1px solid var(--border-medium);color:var(--ink-muted);font-size:18px;line-height:1}
.share-close:hover{border-color:var(--terracotta);color:var(--terracotta)}
.share-card{position:relative;padding:1.35rem 1.2rem;margin-bottom:1rem;border:1px solid var(--border-medium);background:
  radial-gradient(ellipse 90% 70% at 80% 0%,rgba(201,100,66,.14),transparent 55%),
  linear-gradient(160deg,#FFFDF8 0%,#F5F4EF 100%);overflow:hidden}
.share-card::after{content:"";position:absolute;right:14px;top:14px;width:42px;height:42px;border:1px solid rgba(201,100,66,.35);transform:rotate(45deg)}
.share-card-brand{font-family:var(--font-display);font-size:1.1rem;font-weight:600;color:var(--ink-black);margin-bottom:.35rem}
.share-card-issue{font-family:var(--font-ui);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--terracotta);margin-bottom:.85rem}
.share-card-headline{font-family:var(--font-display);font-size:1.35rem;line-height:1.3;color:var(--ink-black);margin-bottom:.45rem}
.share-card-line{font-size:.92rem;color:var(--ink-soft);margin-bottom:.9rem}
.share-card-meta{font-family:var(--font-ui);font-size:11px;color:var(--ink-muted);letter-spacing:.04em}
.share-copy-box{padding:.85rem 1rem;background:var(--card);border:1px solid var(--border-light);font-size:.88rem;color:var(--ink-soft);line-height:1.55;margin-bottom:1rem}
.share-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1rem}
.share-btn{padding:.7rem .8rem;font-family:var(--font-ui);font-size:12px;font-weight:600;letter-spacing:.04em;border:1px solid var(--border-medium);color:var(--ink-soft);background:var(--card);transition:all .2s}
.share-btn:hover{border-color:var(--terracotta);color:var(--terracotta)}
.share-btn.primary{background:var(--terracotta);border-color:var(--terracotta);color:#fff}
.share-btn.primary:hover{background:var(--terracotta-dark)}
.share-platforms{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.share-platform{display:flex;flex-direction:column;align-items:center;gap:6px;padding:.75rem .4rem;border:1px solid var(--border-light);background:var(--card);font-family:var(--font-ui);font-size:11px;color:var(--ink-muted);transition:all .2s}
.share-platform:hover{border-color:var(--terracotta);color:var(--terracotta)}
.share-platform-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-medium);transform:rotate(45deg)}
.share-platform-icon span{transform:rotate(-45deg);font-size:11px;font-weight:700;color:var(--terracotta)}
.share-toast{position:fixed;left:50%;bottom:88px;transform:translateX(-50%) translateY(12px);background:var(--ink-black);color:#fff;font-family:var(--font-ui);font-size:12px;padding:10px 16px;opacity:0;pointer-events:none;transition:all .25s;z-index:220;letter-spacing:.04em}
.share-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}

@media(max-width:720px){
  .nav-section-label{display:none}
  .hero{min-height:70vh;padding:6rem 1rem 3.5rem}
  .section{padding:3.25rem 1rem 2.25rem}
  .share-platforms{grid-template-columns:repeat(3,1fr)}
}
@media(min-width:721px){
  .share-overlay{align-items:center}
}
`.trim();
