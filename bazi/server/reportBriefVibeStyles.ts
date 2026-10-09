/**
 * 免费简版静态页 CSS — 必须与 SPA `bazi/client/src/styles/bazi-report-vibe.css`
 * （OraSage Design Spec 赭石编辑风格）同色同字，禁止再退回 Vibe Camp 橙 (#f7663c)。
 */

export const BRIEF_VIBE_CSS = `
:root{
  --brand-500:#c96442;--brand-600:#c96442;--brand-700:#934828;
  --brand-light:#e0a892;--brand-faded:#f4e0d5;
  --background:#faf9f5;--muted:#f5f4ef;--card:#ffffff;--popover:#f5f4ef;
  --foreground:#3d3929;--muted-foreground:#6e6d68;--card-foreground:#3d3929;
  --primary:var(--brand-600);--primary-foreground:#ffffff;
  --accent:#f0ede4;--input:#e3e0d4;--border:#dad9d4;--secondary:#3d3929;--ring:var(--brand-500);
  --chart-1:#c96442;--chart-2:#9c87f5;--chart-3:#788c5d;--chart-4:#6e6d68;--chart-5:#d4872c;
  --radius:16px;--radius-sm:12px;--radius-md:16px;
  --shadow:0 1px 3px rgba(0,0,0,.06);--shadow-md:0 2px 8px rgba(0,0,0,.08);
  --font-display:"Newsreader","Noto Serif SC",Georgia,ui-serif,serif;
  --font-serif:"Lora","Noto Serif SC",Georgia,ui-serif,serif;
  --font-sans:"Poppins","Noto Sans SC",ui-sans-serif,system-ui,sans-serif;
  --font-mono:"Geist Mono","Roboto Mono",ui-monospace,monospace;
}
*{box-sizing:border-box}
html.brief-vibe,html.brief-vibe body{margin:0;background:var(--background);color:var(--foreground);font-family:var(--font-serif);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased}
.bv-main{margin:0 auto;max-width:480px;padding:24px 16px 40px}
.bv-header{margin-bottom:24px}
.bv-header-row{display:flex;align-items:center;justify-content:space-between;gap:12px}
.bv-brand{display:flex;align-items:center;gap:8px;min-width:0}
.bv-mark{display:inline-flex;height:32px;width:32px;align-items:center;justify-content:center;border-radius:var(--radius-sm);background:var(--primary);color:var(--primary-foreground);flex-shrink:0;box-shadow:0 4px 12px rgba(201,100,66,.3)}
.bv-mark svg{width:16px;height:16px}
.bv-eyebrow{font-family:var(--font-mono);font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted-foreground)}
.bv-badge{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:4px 12px;font-size:12px;color:var(--muted-foreground);white-space:nowrap;box-shadow:var(--shadow)}
.bv-h1{margin:16px 0 0;font-family:var(--font-display);font-size:28px;line-height:1.2;font-weight:500;color:var(--foreground)}
.bv-lead{margin:4px 0 0;font-size:14px;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-card{margin-top:20px;border:1px solid var(--border);background:var(--card);border-radius:var(--radius);padding:20px;box-shadow:var(--shadow)}
.bv-card:first-of-type{margin-top:0}
.bv-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.bv-card-head.left{justify-content:flex-start;gap:8px}
.bv-icon{width:16px;height:16px;color:var(--muted-foreground);flex-shrink:0;display:inline-flex}
.bv-icon svg,.bv-chip svg,.bv-mark svg{width:16px;height:16px}
.bv-icon.accent{color:var(--primary)}
.bv-hero{display:flex;align-items:center;gap:20px}
.bv-day-seal{position:relative;display:flex;height:96px;width:96px;flex-shrink:0;align-items:center;justify-content:center;border-radius:var(--radius);border:1.5px solid var(--primary);background:var(--brand-faded)}
.bv-day-char{font-family:var(--font-display);font-size:60px;line-height:1;color:var(--primary);font-weight:500}
.bv-day-tag{position:absolute;bottom:-6px;border-radius:999px;background:var(--primary);color:var(--primary-foreground);padding:2px 8px;font-size:9px;font-weight:500;font-family:var(--font-sans)}
.bv-hero-body{flex:1;min-width:0}
.bv-chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.bv-chip{display:inline-flex;align-items:center;gap:6px;border-radius:999px;padding:4px 10px;font-size:11px;font-family:var(--font-sans)}
.bv-chip.primary{background:var(--primary);color:var(--primary-foreground);font-weight:500;font-size:12px;padding:4px 10px}
.bv-chip.fav{border:1px solid var(--brand-light);background:var(--brand-faded);color:var(--brand-700);font-size:10px}
.bv-chip.unfav{border:1px solid var(--border);background:var(--muted);color:var(--muted-foreground);font-size:10px}
.bv-chip.insight{background:var(--primary);color:var(--primary-foreground);font-weight:500;font-size:12px;padding:4px 12px}
.bv-h2{margin:8px 0 0;font-family:var(--font-display);font-size:20px;line-height:1.25;font-weight:500}
.bv-meta{margin:4px 0 0;font-size:12px;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-pillars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;text-align:center;width:100%}
.bv-pillar{border:1px solid var(--border);background:var(--muted);border-radius:var(--radius-md);padding:12px 4px}
.bv-pillar.is-day{border-color:var(--primary);background:var(--brand-faded);box-shadow:0 0 0 1px var(--primary)}
.bv-pillar-label{font-size:10px;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-pillar.is-day .bv-pillar-label{color:var(--primary)}
.bv-pillar-gan{margin:4px 0 0;font-size:18px;font-weight:600;line-height:1.2;font-family:var(--font-serif)}
.bv-pillar.is-day .bv-pillar-gan,.bv-pillar.is-day .bv-pillar-zhi{color:var(--primary)}
.bv-pillar-zhi{margin:0;font-size:14px;color:var(--muted-foreground)}
.bv-wx-row{display:flex;align-items:center;gap:20px}
.bv-donut-wrap{position:relative;height:128px;width:128px;flex-shrink:0}
.bv-donut-wrap svg{width:100%;height:100%;transform:rotate(-90deg)}
.bv-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.bv-donut-kicker{font-size:10px;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-donut-name{font-size:20px;font-weight:600;line-height:1.1}
.bv-donut-pct{font-size:14px;font-weight:500;color:var(--chart-1);font-family:var(--font-sans)}
.bv-bars{flex:1;min-width:0;display:flex;flex-direction:column;gap:10px}
.bv-bar-head{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-family:var(--font-sans)}
.bv-bar-val{font-family:var(--font-mono);color:var(--muted-foreground)}
.bv-bar-track{margin-top:4px;height:8px;width:100%;overflow:hidden;border-radius:999px;background:var(--muted)}
.bv-bar-fill{height:100%;border-radius:999px}
.bv-wx-note{margin-top:16px;border:1px solid var(--brand-light);background:var(--brand-faded);border-radius:var(--radius-md);padding:12px}
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
.bv-gauge-pct{font-size:20px;font-weight:600;line-height:1;font-family:var(--font-sans)}
.bv-gauge-lbl{font-size:10px;color:var(--muted-foreground);margin-top:2px;font-family:var(--font-sans)}
.bv-energy p,.bv-insight p{margin:0;font-size:15px;line-height:1.7;color:var(--card-foreground)}
.bv-cta{margin-top:20px;border:1px solid var(--primary);background:linear-gradient(145deg,var(--brand-500),var(--brand-700));color:var(--primary-foreground);border-radius:var(--radius);padding:20px;text-align:center;box-shadow:0 4px 12px rgba(201,100,66,.3)}
.bv-cta-lock{margin:0 auto;display:flex;height:40px;width:40px;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,255,255,.2)}
.bv-cta-lock svg{width:20px;height:20px}
.bv-cta h3{margin:12px 0 0;font-size:20px;font-weight:500;font-family:var(--font-display)}
.bv-cta .sub{margin:4px 0 0;font-size:14px;opacity:.9;font-family:var(--font-sans)}
.bv-cta .paywall-cta{display:inline-block;margin-top:16px;border-radius:999px;background:var(--primary-foreground);color:var(--primary);padding:10px 24px;font-size:14px;font-weight:600;text-decoration:none;font-family:var(--font-sans)}
.bv-cta .paywall-cta:hover{opacity:.92}
.bv-cta .hint{margin:12px 0 0;font-size:10px;opacity:.75;font-family:var(--font-sans)}
.bv-cta .share-link{display:inline-block;margin-top:8px;font-size:12px;color:inherit;opacity:.85;text-decoration:underline;background:none;border:none;cursor:pointer;font-family:inherit}
.bv-footer{margin-top:40px;border-top:1px solid var(--border);padding-top:24px;text-align:center}
.bv-footer p{margin:0;font-size:12px;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-footer .tiny{margin-top:4px;font-size:10px}
.bv-footer a{color:inherit}
.bv-header-actions{display:flex;align-items:center;gap:8px}
.bv-share-btn{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:4px 12px;font-size:12px;color:var(--muted-foreground);cursor:pointer;font-family:var(--font-sans);box-shadow:var(--shadow)}
.fab-share{position:fixed;right:16px;bottom:20px;z-index:90;display:inline-flex;align-items:center;gap:8px;padding:12px 18px;background:var(--primary);color:var(--primary-foreground);font-family:var(--font-sans);font-size:13px;font-weight:600;border-radius:999px;border:none;cursor:pointer;box-shadow:0 8px 24px rgba(201,100,66,.35)}
.share-overlay{position:fixed;inset:0;z-index:200;background:rgba(61,57,41,.45);display:none;align-items:flex-end;justify-content:center;padding:16px;backdrop-filter:blur(4px)}
.share-overlay.open{display:flex}
.share-sheet{width:min(440px,100%);background:var(--card);border:1px solid var(--border);border-radius:var(--radius);padding:20px;max-height:86vh;overflow:auto;box-shadow:var(--shadow-md)}
.share-sheet-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
.share-sheet-title{margin:0;font-family:var(--font-display);font-size:20px;font-weight:500}
.share-sheet-sub{margin:4px 0 0;font-size:12px;color:var(--muted-foreground);font-family:var(--font-sans)}
.share-close{border:0;background:none;font-size:24px;line-height:1;cursor:pointer;color:var(--muted-foreground)}
.share-card{margin-top:16px;border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;background:var(--muted)}
.share-card-headline{font-family:var(--font-display);font-size:22px;margin:8px 0 0;font-weight:500}
.share-card-line,.share-card-meta,.share-card-issue{font-size:13px;color:var(--muted-foreground);font-family:var(--font-sans)}
.share-copy-box{margin-top:12px;white-space:pre-wrap;font-size:13px;line-height:1.6;background:var(--popover);border-radius:var(--radius-sm);padding:12px;font-family:var(--font-sans)}
.share-actions,.share-platforms{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
.share-btn,.share-platform{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:8px 12px;font-size:12px;cursor:pointer;font-family:var(--font-sans)}
.share-btn.primary{background:var(--primary);color:var(--primary-foreground);border-color:var(--primary)}
.share-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%) translateY(12px);background:var(--secondary);color:#fff;padding:8px 14px;border-radius:999px;font-size:12px;opacity:0;pointer-events:none;transition:opacity .2s;font-family:var(--font-sans)}
.share-toast.show{opacity:1;transform:translateX(-50%)}
.brand-lockup{display:inline-flex;align-items:baseline;gap:6px}
.brand-lockup-primary{font-family:var(--font-display);font-weight:500}
.brand-lockup-aux{font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--muted-foreground);font-family:var(--font-sans)}
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
