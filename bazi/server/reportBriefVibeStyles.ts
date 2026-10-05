/** 免费简版 Vibe Camp 卡片页（内联，不加载 Tailwind / lucide CDN） */

export const BRIEF_VIBE_CSS = `
:root{
  --brand-500:#f7663c;--brand-600:#f1481e;--brand-700:#d63a14;
  --background:#e3dfd9;--muted:#ece7e1;--card:#f3f0eb;--popover:#f7f4ef;
  --foreground:#211d1a;--muted-foreground:#5c5650;--card-foreground:#211d1a;
  --primary:var(--brand-600);--primary-foreground:#fff7f3;
  --accent:#ded7cf;--input:#d7d1c9;--border:#cbc3ba;--secondary:#1d1e20;--ring:var(--brand-500);
  --chart-1:#f7663c;--chart-2:#aea4fd;--chart-3:#13b15a;--chart-4:#84776e;--chart-5:#fe9a45;
  --radius:18px;--radius-sm:8px;--radius-md:12px;
  --font-sans:"Noto Sans SC",ui-sans-serif,system-ui,sans-serif;
  --font-serif:"Noto Serif SC","Playfair Display",ui-serif,serif;
  --font-mono:ui-monospace,SFMono-Regular,Menlo,monospace;
}
*{box-sizing:border-box}
html.brief-vibe,html.brief-vibe body{margin:0;background:var(--background);color:var(--foreground);font-family:var(--font-sans);-webkit-font-smoothing:antialiased}
.bv-main{margin:0 auto;max-width:480px;padding:24px 16px 40px}
.bv-header{margin-bottom:24px}
.bv-header-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.bv-brand{display:flex;align-items:center;gap:8px;min-width:0}
.bv-mark{display:inline-flex;height:32px;width:32px;align-items:center;justify-content:center;border-radius:var(--radius);background:var(--primary);color:var(--primary-foreground);flex-shrink:0}
.bv-mark svg{width:16px;height:16px}
.bv-eyebrow{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-foreground)}
.bv-badge{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:4px 12px;font-size:12px;color:var(--muted-foreground);white-space:nowrap}
.bv-h1{margin:16px 0 0;font-family:var(--font-serif);font-size:28px;line-height:1.2;font-weight:600}
.bv-lead{margin:4px 0 0;font-size:14px;color:var(--muted-foreground)}
.bv-card{margin-top:20px;border:1px solid var(--border);background:var(--card);border-radius:var(--radius);padding:20px}
.bv-card:first-of-type{margin-top:0}
.bv-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.bv-card-head.left{justify-content:flex-start;gap:8px}
.bv-icon{width:16px;height:16px;color:var(--muted-foreground);flex-shrink:0;display:inline-flex}
.bv-icon svg,.bv-chip svg,.bv-mark svg{width:16px;height:16px}
.bv-icon.accent{color:var(--primary)}
.bv-hero{display:flex;align-items:center;gap:20px}
.bv-day-seal{position:relative;display:flex;height:96px;width:96px;flex-shrink:0;align-items:center;justify-content:center;border-radius:var(--radius);border:1px solid var(--primary);background:color-mix(in srgb,var(--primary) 10%,transparent)}
.bv-day-char{font-family:var(--font-serif);font-size:60px;line-height:1;color:var(--primary)}
.bv-day-tag{position:absolute;bottom:-6px;border-radius:999px;background:var(--primary);color:var(--primary-foreground);padding:2px 8px;font-size:9px;font-weight:500}
.bv-hero-body{flex:1;min-width:0}
.bv-chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.bv-chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 10px;font-size:11px}
.bv-chip.primary{background:var(--primary);color:var(--primary-foreground);font-weight:500;font-size:12px;padding:4px 10px}
.bv-chip.fav{border:1px solid color-mix(in srgb,var(--primary) 30%,transparent);background:color-mix(in srgb,var(--primary) 10%,transparent);color:var(--primary);font-size:10px}
.bv-chip.unfav{border:1px solid var(--border);background:var(--muted);color:var(--muted-foreground);font-size:10px}
.bv-chip.insight{background:var(--primary);color:var(--primary-foreground);font-weight:500;font-size:12px;padding:4px 12px}
.bv-h2{margin:8px 0 0;font-family:var(--font-serif);font-size:20px;line-height:1.25;font-weight:600}
.bv-meta{margin:4px 0 0;font-size:12px;color:var(--muted-foreground)}
.bv-pillars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;text-align:center;width:100%}
.bv-pillar{border:1px solid var(--border);background:var(--muted);border-radius:var(--radius-md);padding:12px 4px}
.bv-pillar.is-day{border-color:var(--primary);background:color-mix(in srgb,var(--primary) 10%,transparent)}
.bv-pillar-label{font-size:10px;color:var(--muted-foreground)}
.bv-pillar.is-day .bv-pillar-label{color:var(--primary)}
.bv-pillar-gan{margin:4px 0 0;font-size:18px;font-weight:600;line-height:1.2}
.bv-pillar.is-day .bv-pillar-gan,.bv-pillar.is-day .bv-pillar-zhi{color:var(--primary)}
.bv-pillar-zhi{margin:0;font-size:14px;color:var(--muted-foreground)}
.bv-wx-row{display:flex;align-items:center;gap:20px}
.bv-donut-wrap{position:relative;height:128px;width:128px;flex-shrink:0}
.bv-donut-wrap svg{width:100%;height:100%;transform:rotate(-90deg)}
.bv-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.bv-donut-kicker{font-size:10px;color:var(--muted-foreground)}
.bv-donut-name{font-size:20px;font-weight:600;line-height:1.1}
.bv-donut-pct{font-size:14px;font-weight:500;color:var(--chart-1)}
.bv-bars{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
.bv-bar-head{display:flex;align-items:center;justify-content:space-between;font-size:12px}
.bv-bar-val{font-family:var(--font-mono);color:var(--muted-foreground)}
.bv-bar-track{margin-top:4px;height:8px;width:100%;overflow:hidden;border-radius:999px;background:var(--muted)}
.bv-bar-fill{height:100%;border-radius:999px}
.bv-wx-note{margin-top:16px;border:1px solid color-mix(in srgb,var(--primary) 30%,transparent);background:color-mix(in srgb,var(--primary) 10%,transparent);border-radius:var(--radius-md);padding:12px}
.bv-wx-note p{margin:0;font-size:14px}
.bv-wx-note .sub{margin-top:4px;font-size:12px;color:var(--muted-foreground)}
.bv-wx-strong{font-weight:500}
.bv-wx-hot{color:var(--primary)}
.bv-radar{margin-top:24px;display:flex;justify-content:center}
.bv-radar svg{width:100%;max-width:260px;height:auto}
.bv-energy{display:flex;align-items:center;gap:20px}
.bv-gauge{position:relative;height:96px;width:96px;flex-shrink:0}
.bv-gauge svg{width:100%;height:100%;transform:rotate(-90deg)}
.bv-gauge-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.bv-gauge-pct{font-size:20px;font-weight:600;line-height:1}
.bv-gauge-lbl{font-size:10px;color:var(--muted-foreground);margin-top:2px}
.bv-energy p,.bv-insight p{margin:0;font-size:15px;line-height:1.7;color:var(--card-foreground)}
.bv-cta{margin-top:20px;border:1px solid var(--primary);background:var(--primary);color:var(--primary-foreground);border-radius:var(--radius);padding:20px;text-align:center}
.bv-cta-lock{margin:0 auto;display:flex;height:40px;width:40px;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,247,243,.2)}
.bv-cta-lock svg{width:20px;height:20px}
.bv-cta h3{margin:12px 0 0;font-size:20px;font-weight:600}
.bv-cta .sub{margin:4px 0 0;font-size:14px;opacity:.9}
.bv-cta .paywall-cta{display:inline-block;margin-top:16px;border-radius:var(--radius);background:var(--primary-foreground);color:var(--primary);padding:10px 24px;font-size:14px;font-weight:600;text-decoration:none}
.bv-cta .paywall-cta:hover{opacity:.92}
.bv-cta .hint{margin:12px 0 0;font-size:10px;opacity:.75}
.bv-cta .share-link{display:inline-block;margin-top:8px;font-size:12px;color:inherit;opacity:.85;text-decoration:underline;background:none;border:none;cursor:pointer;font-family:inherit}
.bv-footer{margin-top:40px;border-top:1px solid var(--border);padding-top:24px;text-align:center}
.bv-footer p{margin:0;font-size:12px;color:var(--muted-foreground)}
.bv-footer .tiny{margin-top:4px;font-size:10px}
.bv-footer a{color:inherit}
.bv-header-actions{display:flex;align-items:center;gap:8px}
.bv-share-btn{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:4px 12px;font-size:12px;color:var(--muted-foreground);cursor:pointer;font-family:inherit}
.fab-share{position:fixed;right:16px;bottom:20px;z-index:90;display:inline-flex;align-items:center;gap:8px;padding:12px 18px;background:var(--primary);color:var(--primary-foreground);font-family:var(--font-sans);font-size:13px;font-weight:600;border-radius:999px;border:none;cursor:pointer;box-shadow:0 8px 24px color-mix(in srgb,var(--primary) 35%,transparent)}
.share-overlay{position:fixed;inset:0;z-index:200;background:rgba(33,29,26,.45);display:none;align-items:flex-end;justify-content:center;padding:16px;backdrop-filter:blur(4px)}
.share-overlay.open{display:flex}
.share-sheet{width:min(440px,100%);background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-height:86vh;overflow:auto}
.share-sheet-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.share-sheet-title{margin:0;font-family:var(--font-serif);font-size:20px}
.share-sheet-sub{margin:4px 0 0;font-size:12px;color:var(--muted-foreground)}
.share-close{border:0;background:none;font-size:24px;line-height:1;cursor:pointer;color:var(--muted-foreground)}
.share-card{margin-top:16px;border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;background:var(--muted)}
.share-card-headline{font-family:var(--font-serif);font-size:22px;margin:8px 0 0}
.share-card-line,.share-card-meta,.share-card-issue{font-size:13px;color:var(--muted-foreground)}
.share-copy-box{margin-top:12px;white-space:pre-wrap;font-size:13px;line-height:1.6;background:var(--popover);border-radius:var(--radius-sm);padding:12px}
.share-actions,.share-platforms{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.share-btn,.share-platform{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:8px 12px;font-size:12px;cursor:pointer;font-family:inherit}
.share-btn.primary{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary)}
.share-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(12px);background:var(--secondary);color:#fff;padding:8px 14px;border-radius:999px;font-size:12px;opacity:0;pointer-events:none;transition:opacity .2s}
.share-toast.show{opacity:1;transform:translateX(-50%)}
.brand-lockup{display:inline-flex;align-items:baseline;gap:6px}
.brand-lockup-primary{font-family:var(--font-serif);font-weight:600}
.brand-lockup-aux{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground)}
@media(min-width:721px){.share-overlay{align-items:center}}
@media(max-width:380px){
  .bv-hero{gap:12px}
  .bv-day-seal{height:80px;width:80px}
  .bv-day-char{font-size:48px}
  .bv-wx-row{flex-direction:column;align-items:stretch}
  .bv-donut-wrap{margin:0 auto}
  .bv-pillar-gan{font-size:16px}
}
`.trim();
