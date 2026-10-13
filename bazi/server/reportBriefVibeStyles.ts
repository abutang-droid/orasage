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
html.brief-vibe,html.brief-vibe body{margin:0;background:var(--background);color:var(--foreground);font-family:var(--font-serif);font-size:15px;line-height:1.55;-webkit-font-smoothing:antialiased}
.bv-main{margin:0 auto;max-width:480px;padding:16px 14px 28px}
.bv-header{margin-bottom:14px}
.bv-header-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
.bv-brand{display:flex;align-items:center;gap:8px;min-width:0}
.bv-mark{display:inline-flex;height:30px;width:30px;align-items:center;justify-content:center;border-radius:var(--radius-sm);background:var(--primary);color:var(--primary-foreground);flex-shrink:0;box-shadow:0 3px 10px rgba(201,100,66,.28)}
.bv-mark svg{width:15px;height:15px}
.bv-eyebrow{font-family:var(--font-mono);font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted-foreground)}
.bv-badge{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:4px 10px;font-size:11px;color:var(--muted-foreground);white-space:nowrap;box-shadow:var(--shadow)}
.bv-h1{margin:10px 0 0;font-family:var(--font-display);font-size:26px;line-height:1.2;font-weight:500;color:var(--foreground);text-wrap:pretty;word-break:keep-all}
.bv-lead{margin:4px 0 0;font-size:13px;line-height:1.45;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-card{margin-top:12px;border:1px solid var(--border);background:var(--card);border-radius:14px;padding:14px;box-shadow:var(--shadow)}
.bv-card:first-of-type{margin-top:0}
.bv-card-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.bv-card-head.left{justify-content:flex-start;gap:8px}
.bv-icon{width:16px;height:16px;color:var(--muted-foreground);flex-shrink:0;display:inline-flex}
.bv-icon svg,.bv-chip svg,.bv-mark svg{width:16px;height:16px}
.bv-icon.accent{color:var(--primary)}
.bv-hero{display:flex;align-items:center;gap:14px}
.bv-day-seal{position:relative;display:flex;height:84px;width:84px;flex-shrink:0;align-items:center;justify-content:center;border-radius:14px;border:1.5px solid var(--primary);background:var(--brand-faded)}
.bv-day-char{font-family:var(--font-display);font-size:52px;line-height:1;color:var(--primary);font-weight:500}
.bv-day-tag{position:absolute;bottom:-6px;border-radius:999px;background:var(--primary);color:var(--primary-foreground);padding:2px 8px;font-size:9px;font-weight:500;font-family:var(--font-sans)}
.bv-hero-body{flex:1;min-width:0}
.bv-chip-row{display:flex;flex-wrap:wrap;gap:6px;margin-top:6px}
.bv-chip{display:inline-flex;align-items:center;gap:5px;border-radius:999px;padding:3px 9px;font-size:11px;font-family:var(--font-sans)}
.bv-chip.primary{background:var(--primary);color:var(--primary-foreground);font-weight:500;font-size:12px;padding:4px 10px}
.bv-chip.fav{border:1px solid var(--brand-light);background:var(--brand-faded);color:var(--brand-700);font-size:10px}
.bv-chip.unfav{border:1px solid var(--border);background:var(--muted);color:var(--muted-foreground);font-size:10px}
.bv-chip.insight{background:var(--primary);color:var(--primary-foreground);font-weight:500;font-size:12px;padding:4px 12px}
.bv-h2{margin:6px 0 0;font-family:var(--font-display);font-size:18px;line-height:1.25;font-weight:500;text-wrap:pretty;word-break:keep-all}
.bv-meta{margin:4px 0 0;font-size:11px;line-height:1.45;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-pillars{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:5px;text-align:center;width:100%}
.bv-pillar{border:1px solid var(--border);background:var(--muted);border-radius:12px;padding:10px 2px;min-width:0}
.bv-pillar.is-day{border-color:var(--primary);background:var(--brand-faded);box-shadow:0 0 0 1px var(--primary)}
.bv-pillar-label{font-size:9px;letter-spacing:.02em;color:var(--muted-foreground);font-family:var(--font-sans);line-height:1.25;word-break:keep-all}
.bv-pillar.is-day .bv-pillar-label{color:var(--primary)}
.bv-pillar-gan{margin:4px 0 0;font-size:17px;font-weight:600;line-height:1.15;font-family:var(--font-serif)}
.bv-pillar.is-day .bv-pillar-gan,.bv-pillar.is-day .bv-pillar-zhi{color:var(--primary)}
.bv-pillar-zhi{margin:0;font-size:13px;color:var(--muted-foreground)}
.bv-wx-row{display:flex;align-items:center;gap:14px}
.bv-donut-wrap{position:relative;height:112px;width:112px;flex-shrink:0}
.bv-donut-wrap svg{width:100%;height:100%;transform:rotate(-90deg)}
.bv-donut-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none}
.bv-donut-kicker{font-size:10px;color:var(--muted-foreground);font-family:var(--font-sans)}
.bv-donut-name{font-size:20px;font-weight:600;line-height:1.1}
.bv-donut-pct{font-size:14px;font-weight:500;color:var(--chart-1);font-family:var(--font-sans)}
.bv-bars{flex:1;min-width:0;display:flex;flex-direction:column;gap:8px}
.bv-bar-head{display:flex;align-items:center;justify-content:space-between;font-size:12px;font-family:var(--font-sans)}
.bv-bar-val{font-family:var(--font-mono);color:var(--muted-foreground)}
.bv-bar-track{margin-top:3px;height:7px;width:100%;overflow:hidden;border-radius:999px;background:var(--muted)}
.bv-bar-fill{height:100%;border-radius:999px}
.bv-wx-note{margin-top:12px;border:1px solid var(--brand-light);background:var(--brand-faded);border-radius:12px;padding:10px 12px}
.bv-wx-note p{margin:0;font-size:13px;line-height:1.5}
.bv-wx-note .sub{margin-top:4px;font-size:11px;color:var(--muted-foreground)}
.bv-wx-strong{font-weight:500}
.bv-wx-hot{color:var(--primary)}
.bv-radar{margin-top:16px;display:flex;justify-content:center}
.bv-radar svg{width:100%;max-width:240px;height:auto}
.bv-energy{display:flex;align-items:center;gap:14px}
.bv-gauge{position:relative;height:88px;width:88px;flex-shrink:0}
.bv-gauge svg{width:100%;height:100%;transform:rotate(-90deg)}
.bv-gauge-center{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.bv-gauge-pct{font-size:18px;font-weight:600;line-height:1;font-family:var(--font-sans)}
.bv-gauge-lbl{font-size:10px;color:var(--muted-foreground);margin-top:2px;font-family:var(--font-sans)}
.bv-energy p,.bv-insight p{margin:0;font-size:14px;line-height:1.65;color:var(--card-foreground);text-wrap:pretty;word-break:keep-all}
.bv-cta{margin-top:12px;border:1px solid var(--primary);background:linear-gradient(145deg,var(--brand-500),var(--brand-700));color:var(--primary-foreground);border-radius:14px;padding:16px;text-align:center;box-shadow:0 4px 12px rgba(201,100,66,.28)}
.bv-cta-lock{margin:0 auto;display:flex;height:36px;width:36px;align-items:center;justify-content:center;border-radius:999px;background:rgba(255,255,255,.2)}
.bv-cta-lock svg{width:18px;height:18px}
.bv-cta h3{margin:10px 0 0;font-size:18px;font-weight:500;font-family:var(--font-display)}
.bv-cta .sub{margin:4px 0 0;font-size:13px;opacity:.9;font-family:var(--font-sans)}
.bv-cta .paywall-cta{display:inline-block;margin-top:12px;border-radius:999px;background:var(--primary-foreground);color:var(--primary);padding:10px 22px;font-size:14px;font-weight:600;text-decoration:none;font-family:var(--font-sans)}
.bv-cta .paywall-cta:hover{opacity:.92}
.bv-cta .hint{margin:10px 0 0;font-size:10px;opacity:.75;font-family:var(--font-sans)}
.bv-cta .share-link{display:inline-block;margin-top:8px;font-size:12px;color:inherit;opacity:.85;text-decoration:underline;background:none;border:none;cursor:pointer;font-family:inherit}
.bv-footer{margin-top:28px;border-top:1px solid var(--border);padding:16px 12px 72px;text-align:center}
.bv-footer p{margin:0;font-size:11px;color:var(--muted-foreground);font-family:var(--font-sans);line-height:1.55}
.bv-footer .tiny{margin-top:4px;font-size:10px}
.bv-footer a{color:inherit}
.bv-header-actions{display:flex;align-items:center;gap:6px}
.bv-share-btn{border:1px solid var(--border);background:var(--card);border-radius:999px;padding:4px 10px;font-size:11px;color:var(--muted-foreground);cursor:pointer;font-family:var(--font-sans);box-shadow:var(--shadow)}
.fab-share{position:fixed;right:12px;bottom:14px;z-index:90;display:inline-flex;align-items:center;justify-content:center;gap:0;width:46px;height:46px;padding:0;background:var(--primary);color:var(--primary-foreground);font-family:var(--font-sans);font-size:12px;font-weight:600;border-radius:999px;border:none;cursor:pointer;box-shadow:0 6px 18px rgba(201,100,66,.32)}
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
/* Phone narrow: stack energy row, keep pillars dense */
@media(max-width:380px){
  .bv-main{padding:14px 12px 24px}
  .bv-hero{gap:10px}
  .bv-day-seal{height:72px;width:72px}
  .bv-day-char{font-size:44px}
  .bv-wx-row{flex-direction:column;align-items:stretch;gap:12px}
  .bv-donut-wrap{margin:0 auto}
  .bv-pillars{gap:4px}
  .bv-pillar{padding:8px 1px}
  .bv-pillar-gan{font-size:15px}
  .bv-pillar-zhi{font-size:12px}
  .bv-pillar-label{font-size:8px}
}
/* Tablet / large phone: fill width, less empty side gutters */
@media(min-width:640px){
  .bv-main{max-width:640px;padding:24px 28px 40px}
  .bv-header{margin-bottom:18px}
  .bv-h1{font-size:30px}
  .bv-lead{font-size:14px}
  .bv-card{margin-top:14px;padding:18px 20px;border-radius:16px}
  .bv-hero{gap:20px}
  .bv-day-seal{height:104px;width:104px;border-radius:16px}
  .bv-day-char{font-size:64px}
  .bv-h2{font-size:22px}
  .bv-pillars{gap:10px}
  .bv-pillar{padding:14px 6px;border-radius:14px}
  .bv-pillar-label{font-size:11px}
  .bv-pillar-gan{font-size:22px}
  .bv-pillar-zhi{font-size:15px}
  .bv-wx-row{gap:22px}
  .bv-donut-wrap{height:140px;width:140px}
  .bv-radar svg{max-width:280px}
  .bv-energy p,.bv-insight p{font-size:15px;line-height:1.7}
  .bv-cta{padding:20px;margin-top:16px}
  .bv-cta h3{font-size:20px}
  .fab-share{right:20px;bottom:22px;width:auto;height:auto;padding:12px 18px;gap:8px;font-size:13px}
  .bv-footer{padding-bottom:40px}
}
@media(min-width:900px){
  .bv-main{max-width:720px;padding:28px 32px 48px}
  .bv-pillars{gap:12px}
  .bv-pillar-gan{font-size:24px}
}
`.trim();
