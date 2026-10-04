/** Magazine detail CSS — ported from report-detail.html + share sheet */

export const REPORT_PAGE_CSS = `
/* ============================================================
           CSS Custom Properties — OraSage Brand Tokens
           ============================================================ */
        :root {
            --ivory: #FAF9F5;
            --ivory-dark: #F0EEE8;
            --ink-black: #28261B;
            --ink-soft: #3D3929;
            --ink-muted: #6E6D68;
            --terracotta: #C96442;
            --terracotta-light: #E0A892;
            --terracotta-dark: #934828;
            --bronze: #CD7F32;
            --bronze-light: #DDA15E;
            --bronze-muted: #B8860B;
            --border-light: #E3E0D4;
            --border-medium: #DAD9D4;

            --font-display: 'Newsreader', Georgia, 'Times New Roman', serif;
            --font-body: 'Lora', Georgia, 'Times New Roman', serif;
            --font-ui: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;

            --max-width: 1200px;
            --section-padding: 120px;
            --mobile-breakpoint: 768px;
        }

        /* ============================================================
           Reset & Base
           ============================================================ */
        *, *::before, *::after {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        html {
            scroll-behavior: smooth;
            font-size: 16px;
        }

        body {
            font-family: var(--font-body);
            background-color: var(--ivory);
            color: var(--ink-black);
            line-height: 1.7;
            font-size: 17px;
            overflow-x: hidden;
        }

        a {
            color: inherit;
            text-decoration: none;
        }

        img {
            max-width: 100%;
            display: block;
        }

        /* ============================================================
           Utility Classes
           ============================================================ */
        .container {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
        }

        .small-caps {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.15em;
            text-transform: uppercase;
        }

        .diamond-divider {
            display: inline-block;
            width: 6px;
            height: 6px;
            background: var(--terracotta);
            transform: rotate(45deg);
            margin: 0 16px;
            vertical-align: middle;
        }

        /* ============================================================
           Diamond Star Mark (CSS-drawn compass/diamond)
           ============================================================ */
        .diamond-mark {
            position: relative;
            width: 100%;
            height: 100%;
        }

        .diamond-mark::before,
        .diamond-mark::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            border-style: solid;
            border-color: transparent;
        }

        .diamond-mark::before {
            transform: translate(-50%, -50%);
            width: 0;
            height: 0;
            border-left-width: 0.5em;
            border-right-width: 0.5em;
            border-bottom-width: 0.8em;
            border-bottom-color: currentColor;
        }

        .diamond-mark::after {
            transform: translate(-50%, -50%) rotate(180deg);
            width: 0;
            height: 0;
            border-left-width: 0.5em;
            border-right-width: 0.5em;
            border-bottom-width: 0.8em;
            border-bottom-color: currentColor;
            top: 80%;
        }

        /* ============================================================
           Top Navigation
           ============================================================ */
        .top-nav {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 100;
            padding: 16px 0;
            transition: all 0.3s ease;
            background: rgba(250, 249, 245, 0);
            backdrop-filter: blur(0px);
        }

        .top-nav.scrolled {
            background: rgba(250, 249, 245, 0.85);
            backdrop-filter: blur(12px);
            border-bottom: 1px solid var(--border-light);
            padding: 12px 0;
        }

        .top-nav-inner {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .nav-logo {
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .nav-logo-mark {
            width: 28px;
            height: 28px;
            position: relative;
            color: var(--terracotta);
        }

        .nav-logo-mark .diamond-shape {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 16px;
            height: 16px;
            border: 1.5px solid var(--terracotta);
        }

        .nav-logo-mark .diamond-inner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 6px;
            height: 6px;
            background: var(--terracotta);
        }

        .nav-logo-wordmark {
            font-family: var(--font-display);
            font-size: 22px;
            font-weight: 600;
            letter-spacing: -0.01em;
            color: var(--ink-black);
        }

        .brand-lockup {
            display: inline-flex;
            align-items: baseline;
            gap: 0.4em;
            min-width: 0;
            font-family: 'Noto Serif SC', var(--font-display), serif;
            font-weight: 600;
            color: var(--ink-black);
            line-height: 1.15;
        }

        .brand-lockup-primary {
            font-size: 22px;
            letter-spacing: 0.08em;
        }

        .brand-lockup-primary[data-script='zh'] {
            letter-spacing: 0.12em;
        }

        .brand-lockup-aux {
            font-size: 0.62em;
            font-weight: 500;
            letter-spacing: 0.08em;
            color: var(--ink-muted);
        }

        .nav-section-label {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--ink-muted);
        }

        .nav-actions {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .nav-share-btn {
            font-family: var(--font-ui);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--ink-soft);
            padding: 8px 16px;
            border: 1px solid var(--border-medium);
            border-radius: 2px;
            transition: all 0.25s ease;
            cursor: pointer;
            background: transparent;
        }

        .nav-share-btn:hover {
            border-color: var(--terracotta);
            color: var(--terracotta);
        }

        .nav-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--bronze-light), var(--bronze));
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-ui);
            font-size: 13px;
            font-weight: 600;
            color: white;
            cursor: pointer;
        }

        /* ============================================================
           Hero Cover Section
           ============================================================ */
        .hero {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            justify-content: center;
            position: relative;
            padding: 120px 0 80px;
            overflow: hidden;
        }

        .hero-issue {
            position: absolute;
            top: 120px;
            left: 40px;
            font-family: var(--font-ui);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: var(--ink-muted);
        }

        .hero-issue::before {
            content: '';
            display: inline-block;
            width: 40px;
            height: 1px;
            background: var(--border-medium);
            margin-right: 12px;
            vertical-align: middle;
        }

        .hero-content {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            position: relative;
            z-index: 2;
        }

        .hero-headline {
            font-family: var(--font-display);
            font-size: clamp(48px, 8vw, 88px);
            font-weight: 400;
            line-height: 1.05;
            letter-spacing: -0.02em;
            color: var(--ink-black);
            margin-bottom: 32px;
            max-width: 900px;
        }

        .hero-subhead {
            font-family: var(--font-display);
            font-size: clamp(20px, 2.5vw, 28px);
            font-weight: 400;
            font-style: italic;
            color: var(--terracotta);
            margin-bottom: 48px;
            letter-spacing: 0.01em;
        }

        .hero-person-row {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: 4px;
            font-family: var(--font-ui);
            font-size: 13px;
            font-weight: 400;
            color: var(--ink-soft);
            margin-bottom: 80px;
        }

        .hero-person-name {
            font-weight: 600;
            color: var(--ink-black);
        }

        .hero-decoration {
            position: absolute;
            right: -100px;
            top: 50%;
            transform: translateY(-50%);
            width: 500px;
            height: 500px;
            opacity: 0.08;
            z-index: 1;
            pointer-events: none;
        }

        .hero-decoration .star-compass {
            width: 100%;
            height: 100%;
            position: relative;
        }

        .hero-decoration .star-compass::before,
        .hero-decoration .star-compass::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            border: 2px solid var(--bronze);
            border-radius: 50%;
        }

        .hero-decoration .star-compass::before {
            width: 80%;
            height: 80%;
        }

        .hero-decoration .star-compass::after {
            width: 50%;
            height: 50%;
        }

        .compass-n, .compass-s, .compass-e, .compass-w {
            position: absolute;
            color: var(--bronze);
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 300;
        }

        .compass-n { top: 5%; left: 50%; transform: translateX(-50%); }
        .compass-s { bottom: 5%; left: 50%; transform: translateX(-50%); }
        .compass-e { right: 5%; top: 50%; transform: translateY(-50%); }
        .compass-w { left: 5%; top: 50%; transform: translateY(-50%); }

        .compass-center {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 80px;
            height: 80px;
            border: 2px solid var(--bronze);
        }

        .compass-center-inner {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: var(--bronze);
            transform: translate(-50%, -50%) rotate(45deg);
        }

        .scroll-indicator {
            position: absolute;
            bottom: 40px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 12px;
            color: var(--ink-muted);
            font-family: var(--font-ui);
            font-size: 10px;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            animation: scrollBounce 2s ease-in-out infinite;
        }

        .scroll-indicator-line {
            width: 1px;
            height: 40px;
            background: var(--border-medium);
            position: relative;
            overflow: hidden;
        }

        .scroll-indicator-line::after {
            content: '';
            position: absolute;
            top: -100%;
            left: 0;
            width: 100%;
            height: 100%;
            background: var(--terracotta);
            animation: scrollLine 2s ease-in-out infinite;
        }

        @keyframes scrollBounce {
            0%, 100% { transform: translateX(-50%) translateY(0); }
            50% { transform: translateX(-50%) translateY(8px); }
        }

        @keyframes scrollLine {
            0% { top: -100%; }
            100% { top: 100%; }
        }

        /* ============================================================
           Table of Contents / Section Index
           ============================================================ */
        .toc {
            position: sticky;
            top: 60px;
            z-index: 90;
            background: var(--ivory);
            border-top: 1px solid var(--border-light);
            border-bottom: 1px solid var(--border-light);
            padding: 20px 0;
        }

        .toc-list {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            list-style: none;
            gap: 12px;
            overflow-x: auto;
        }

        .toc-item {
            flex-shrink: 0;
            position: relative;
            cursor: pointer;
            transition: color 0.25s ease;
        }

        .toc-item a {
            display: flex;
            align-items: baseline;
            gap: 6px;
            padding: 4px 0;
            font-family: var(--font-ui);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.05em;
            color: var(--ink-muted);
            transition: color 0.25s ease;
            white-space: nowrap;
        }

        .toc-item .toc-num {
            font-family: var(--font-display);
            font-size: 14px;
            font-weight: 500;
            font-style: italic;
            color: var(--terracotta);
            opacity: 0.6;
            transition: opacity 0.25s ease;
        }

        .toc-item:hover a,
        .toc-item.active a {
            color: var(--ink-black);
        }

        .toc-item:hover .toc-num,
        .toc-item.active .toc-num {
            opacity: 1;
        }

        .toc-item.active::after {
            content: '';
            position: absolute;
            bottom: -20px;
            left: 0;
            right: 0;
            height: 2px;
            background: var(--terracotta);
        }

        /* ============================================================
           Section Base Styles
           ============================================================ */
        .section {
            padding: var(--section-padding) 0;
            position: relative;
        }

        .section-header {
            max-width: var(--max-width);
            margin: 0 auto 60px;
            padding: 0 40px;
        }

        .section-number {
            font-family: var(--font-display);
            font-size: 120px;
            font-weight: 300;
            line-height: 0.8;
            color: var(--terracotta);
            opacity: 0.15;
            margin-bottom: -10px;
            font-style: italic;
        }

        .section-title {
            font-family: var(--font-display);
            font-size: clamp(36px, 5vw, 56px);
            font-weight: 500;
            letter-spacing: -0.01em;
            color: var(--ink-black);
            margin-bottom: 16px;
            position: relative;
        }

        .section-title::after {
            content: '';
            display: block;
            width: 60px;
            height: 2px;
            background: var(--terracotta);
            margin-top: 24px;
        }

        .section-subtitle {
            font-family: var(--font-body);
            font-size: 18px;
            font-style: italic;
            color: var(--ink-muted);
            max-width: 600px;
        }

        /* ============================================================
           Section 01 — Core Insight
           ============================================================ */
        #section-01 {
            padding-top: 80px;
        }

        .pull-quote {
            max-width: var(--max-width);
            margin: 0 auto 80px;
            padding: 0 40px;
            text-align: center;
        }

        .pull-quote-text {
            font-family: var(--font-display);
            font-size: clamp(28px, 4vw, 44px);
            font-weight: 400;
            font-style: italic;
            line-height: 1.3;
            color: var(--ink-black);
            margin-bottom: 24px;
            position: relative;
        }

        .pull-quote-text::before {
            content: '"';
            position: absolute;
            top: -40px;
            left: 50%;
            transform: translateX(-50%);
            font-family: var(--font-display);
            font-size: 120px;
            color: var(--terracotta);
            opacity: 0.15;
            line-height: 1;
            font-style: normal;
        }

        .pull-quote-attribution {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--ink-muted);
        }

        .core-insight-body {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            columns: 2;
            column-gap: 60px;
            column-rule: 1px solid var(--border-light);
        }

        .core-insight-body p {
            margin-bottom: 24px;
            color: var(--ink-soft);
            line-height: 1.8;
            text-align: justify;
        }

        .core-insight-body p:first-of-type::first-letter {
            font-family: var(--font-display);
            font-size: 72px;
            font-weight: 500;
            float: left;
            line-height: 0.85;
            padding: 8px 12px 0 0;
            color: var(--terracotta);
        }

        .key-takeaway {
            max-width: var(--max-width);
            margin: 60px auto 0;
            padding: 0 40px;
        }

        .key-takeaway-box {
            border-left: 3px solid var(--terracotta);
            padding: 32px 40px;
            background: var(--ivory-dark);
        }

        .key-takeaway-label {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--terracotta);
            margin-bottom: 16px;
        }

        .key-takeaway-list {
            list-style: none;
        }

        .key-takeaway-list li {
            padding: 8px 0;
            padding-left: 24px;
            position: relative;
            color: var(--ink-soft);
            font-size: 16px;
        }

        .key-takeaway-list li::before {
            content: '◆';
            position: absolute;
            left: 0;
            color: var(--terracotta);
            font-size: 8px;
            top: 14px;
        }

        /* ============================================================
           Section — Four Pillars board
           ============================================================ */
        .section-mingpan {
            background: var(--ivory);
        }

        .mingpan-board {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 16px;
        }

        .mp-pillar {
            background: var(--ivory-dark);
            border: 1px solid var(--border-light);
            border-radius: 4px;
            padding: 36px 16px 24px;
            text-align: center;
            position: relative;
        }

        .mp-pillar.is-day-master {
            background: var(--ivory);
            border-color: var(--terracotta);
            box-shadow: 0 0 0 1px var(--terracotta);
        }

        .mp-label {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--ink-muted);
            margin-bottom: 16px;
        }

        .mp-dm {
            position: absolute;
            top: 10px;
            right: 10px;
            font-family: var(--font-ui);
            font-size: 9px;
            font-weight: 600;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: var(--terracotta);
            border: 1px solid var(--terracotta);
            padding: 2px 6px;
            border-radius: 2px;
        }

        .mp-gan,
        .mp-zhi {
            font-family: 'Noto Serif SC', var(--font-display), serif;
            line-height: 1;
        }

        .mp-gan {
            font-size: 56px;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .mp-zhi {
            font-size: 40px;
            font-weight: 500;
            margin-bottom: 18px;
        }

        .mp-gan.wood, .mp-zhi.wood { color: #5B8C5A; }
        .mp-gan.fire, .mp-zhi.fire { color: #C96442; }
        .mp-gan.earth, .mp-zhi.earth { color: #CD7F32; }
        .mp-gan.metal, .mp-zhi.metal { color: #8A8A8A; }
        .mp-gan.water, .mp-zhi.water { color: #4A90B8; }

        .mp-meta {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
        }

        .mp-wx {
            font-family: 'Noto Serif SC', var(--font-display), serif;
            font-size: 13px;
            padding: 2px 8px;
            border-radius: 2px;
        }

        .mp-wx.wood { background: #E8F0E8; color: #5B8C5A; }
        .mp-wx.fire { background: #F8EBE4; color: #C96442; }
        .mp-wx.earth { background: #F5E6D3; color: #CD7F32; }
        .mp-wx.metal { background: #EDEDED; color: #8A8A8A; }
        .mp-wx.water { background: #E3EEF5; color: #4A90B8; }

        .mp-polar {
            font-family: var(--font-ui);
            font-size: 11px;
            letter-spacing: 0.08em;
            color: var(--ink-muted);
        }

        /* ============================================================
           Section — Five Elements
           ============================================================ */
        .section-elements {
            background: var(--ivory-dark);
        }

        .elements-grid {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
            align-items: center;
        }

        .elements-chart-wrapper {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 36px;
        }

        .wx-radar-wrap {
            width: 100%;
            max-width: 280px;
            text-align: center;
        }

        .wx-radar {
            width: 100%;
            height: auto;
            display: block;
        }

        .wx-radar-caption {
            font-family: var(--font-ui);
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: var(--ink-muted);
            margin-top: 8px;
        }

        .elements-donut {
            width: 320px;
            height: 320px;
            position: relative;
        }

        .donut-ring {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: conic-gradient(
                #5B8C5A 0deg 115.2deg,
                #D64545 115.2deg 216deg,
                #CD7F32 216deg 280.8deg,
                #B8B5A9 280.8deg 324deg,
                #4A90B8 324deg 360deg
            );
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .donut-inner {
            width: 220px;
            height: 220px;
            border-radius: 50%;
            background: var(--ivory-dark);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .donut-center-label {
            font-family: var(--font-ui);
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.2em;
            text-transform: uppercase;
            color: var(--ink-muted);
            margin-bottom: 8px;
        }

        .donut-center-value {
            font-family: var(--font-display);
            font-size: 48px;
            font-weight: 500;
            color: var(--ink-black);
            line-height: 1;
        }

        .donut-center-unit {
            font-family: var(--font-ui);
            font-size: 14px;
            color: var(--ink-muted);
            margin-top: 4px;
        }

        .elements-list {
            display: flex;
            flex-direction: column;
            gap: 24px;
        }

        .element-item {
            display: grid;
            grid-template-columns: 40px 1fr auto;
            align-items: center;
            gap: 16px;
        }

        .element-symbol {
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 22px;
            font-weight: 600;
            border-radius: 4px;
        }

        .element-symbol.wood { background: #E8F0E8; color: #5B8C5A; }
        .element-symbol.fire { background: #FCE8E8; color: #D64545; }
        .element-symbol.earth { background: #F5E6D3; color: #CD7F32; }
        .element-symbol.metal { background: #EDEDED; color: #8A8A8A; }
        .element-symbol.water { background: #E3EEF5; color: #4A90B8; }

        .element-info {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .element-name {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 500;
            color: var(--ink-black);
        }

        .element-bar {
            height: 4px;
            background: var(--border-light);
            border-radius: 2px;
            overflow: hidden;
        }

        .element-bar-fill {
            height: 100%;
            border-radius: 2px;
            transition: width 1s ease;
        }

        .element-bar-fill.wood { background: #5B8C5A; }
        .element-bar-fill.fire { background: #D64545; }
        .element-bar-fill.earth { background: #CD7F32; }
        .element-bar-fill.metal { background: #8A8A8A; }
        .element-bar-fill.water { background: #4A90B8; }

        .element-percent {
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 500;
            color: var(--ink-black);
            font-style: italic;
        }

        .element-desc {
            font-size: 14px;
            color: var(--ink-muted);
            line-height: 1.5;
            grid-column: 2 / 4;
        }

        .balance-section {
            max-width: var(--max-width);
            margin: 80px auto 0;
            padding: 0 40px;
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 60px;
            align-items: center;
        }

        .balance-gauge {
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .gauge-circle {
            width: 180px;
            height: 180px;
            position: relative;
        }

        .gauge-bg {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 8px solid var(--border-light);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .gauge-value {
            font-family: var(--font-display);
            font-size: 48px;
            font-weight: 500;
            color: var(--ink-black);
            line-height: 1;
        }

        .gauge-label {
            font-family: var(--font-ui);
            font-size: 10px;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--ink-muted);
            margin-top: 4px;
        }

        .gauge-fill {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border-radius: 50%;
            border: 8px solid transparent;
            border-top-color: var(--terracotta);
            border-right-color: var(--terracotta);
            transform: rotate(-45deg);
            clip-path: polygon(50% 50%, 100% 0%, 100% 100%, 0% 100%, 0% 0%);
        }

        .balance-insight h4 {
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 500;
            color: var(--ink-black);
            margin-bottom: 16px;
        }

        .balance-insight p {
            color: var(--ink-soft);
            line-height: 1.8;
        }

        /* ============================================================
           Section 03 — Daymaster Personality
           ============================================================ */
        .personality-grid {
            max-width: var(--max-width);
            margin: 0 auto 60px;
            padding: 0 40px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 80px;
        }

        .personality-text p {
            color: var(--ink-soft);
            line-height: 1.9;
            margin-bottom: 24px;
            text-align: justify;
        }

        .personality-text p:first-of-type::first-letter {
            font-family: var(--font-display);
            font-size: 80px;
            font-weight: 500;
            float: left;
            line-height: 0.8;
            padding: 8px 16px 0 0;
            color: var(--terracotta);
        }

        .personality-traits-list {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .trait-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 20px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            transition: all 0.3s ease;
        }

        .trait-item:hover {
            border-color: var(--terracotta-light);
            background: var(--ivory-dark);
        }

        .trait-badge {
            width: 40px;
            height: 40px;
            flex-shrink: 0;
            border-radius: 50%;
            background: var(--ivory-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 18px;
            color: var(--terracotta);
            border: 1px solid var(--border-light);
        }

        .trait-content h5 {
            font-family: var(--font-display);
            font-size: 18px;
            font-weight: 600;
            color: var(--ink-black);
            margin-bottom: 4px;
        }

        .trait-content p {
            font-size: 14px;
            color: var(--ink-muted);
            line-height: 1.6;
        }

        .trait-cards-grid {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }

        .trait-card {
            padding: 32px 28px;
            border: 1px solid var(--border-light);
            border-radius: 4px;
            position: relative;
            transition: all 0.3s ease;
            cursor: pointer;
        }

        .trait-card:hover {
            border-color: var(--terracotta);
            transform: translateY(-4px);
            box-shadow: 0 12px 32px rgba(201, 100, 66, 0.08);
        }

        .trait-card-num {
            font-family: var(--font-display);
            font-size: 14px;
            font-style: italic;
            color: var(--terracotta);
            margin-bottom: 20px;
            opacity: 0.6;
        }

        .trait-card-word {
            font-family: var(--font-display);
            font-size: 32px;
            font-weight: 500;
            color: var(--ink-black);
            margin-bottom: 12px;
            letter-spacing: -0.01em;
        }

        .trait-card-desc {
            font-size: 14px;
            color: var(--ink-muted);
            line-height: 1.7;
        }

        /* ============================================================
           Section 04 — Talent & Strengths
           ============================================================ */
        #section-04 {
            background: var(--ivory-dark);
        }

        .talent-cards {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 32px;
        }

        .talent-card {
            background: var(--ivory);
            padding: 48px 36px;
            border-radius: 4px;
            border: 1px solid var(--border-light);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }

        .talent-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: var(--terracotta);
            transform: scaleX(0);
            transform-origin: left;
            transition: transform 0.3s ease;
        }

        .talent-card:hover {
            transform: translateY(-6px);
            box-shadow: 0 20px 40px rgba(40, 38, 27, 0.08);
        }

        .talent-card:hover::before {
            transform: scaleX(1);
        }

        .talent-icon {
            width: 64px;
            height: 64px;
            border-radius: 50%;
            background: var(--ivory-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 600;
            color: var(--terracotta);
            margin-bottom: 28px;
            border: 1px solid var(--border-light);
        }

        .talent-card h4 {
            font-family: var(--font-display);
            font-size: 26px;
            font-weight: 500;
            color: var(--ink-black);
            margin-bottom: 16px;
            letter-spacing: -0.01em;
        }

        .talent-card p {
            font-size: 15px;
            color: var(--ink-soft);
            line-height: 1.75;
            margin-bottom: 24px;
        }

        .talent-tags {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .talent-tag-label {
            font-family: var(--font-ui);
            font-size: 10px;
            font-weight: 500;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--ink-muted);
            margin-bottom: 8px;
            width: 100%;
        }

        .talent-tag {
            font-family: var(--font-ui);
            font-size: 12px;
            padding: 4px 12px;
            background: var(--ivory-dark);
            border-radius: 20px;
            color: var(--ink-soft);
            border: 1px solid var(--border-light);
            transition: all 0.2s ease;
        }

        .talent-tag:hover {
            background: var(--terracotta);
            color: white;
            border-color: var(--terracotta);
        }

        /* ============================================================
           Section 05 — Cautions
           ============================================================ */
        .caution-callout {
            max-width: var(--max-width);
            margin: 0 auto 60px;
            padding: 0 40px;
        }

        .caution-box {
            border: 1px solid var(--terracotta);
            background: linear-gradient(135deg, rgba(201, 100, 66, 0.05), transparent);
            padding: 40px;
            border-radius: 4px;
            position: relative;
        }

        .caution-box::before {
            content: '!';
            position: absolute;
            top: -20px;
            left: 40px;
            width: 40px;
            height: 40px;
            background: var(--terracotta);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 600;
        }

        .caution-box-title {
            font-family: var(--font-display);
            font-size: 24px;
            font-weight: 500;
            color: var(--terracotta);
            margin-bottom: 12px;
            padding-left: 60px;
        }

        .caution-box-desc {
            font-size: 15px;
            color: var(--ink-soft);
            padding-left: 60px;
            line-height: 1.7;
        }

        .caution-items {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            flex-direction: column;
            gap: 32px;
            counter-reset: caution-counter;
        }

        .caution-item {
            display: grid;
            grid-template-columns: auto 1fr;
            gap: 28px;
            align-items: start;
            padding-bottom: 32px;
            border-bottom: 1px solid var(--border-light);
        }

        .caution-item:last-child {
            border-bottom: none;
            padding-bottom: 0;
        }

        .caution-num {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 2px solid var(--terracotta);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: var(--font-display);
            font-size: 20px;
            font-weight: 500;
            color: var(--terracotta);
            flex-shrink: 0;
        }

        .caution-content h5 {
            font-family: var(--font-display);
            font-size: 22px;
            font-weight: 500;
            color: var(--ink-black);
            margin-bottom: 8px;
        }

        .caution-content p {
            color: var(--ink-soft);
            line-height: 1.8;
            font-size: 15px;
        }

        /* ============================================================
           Section 06 — Weekly Action
           ============================================================ */
        .section-weekly {
            background: var(--ivory-dark);
        }

        .weekly-timeline {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            gap: 2px;
            background: var(--border-light);
            border-radius: 4px;
            overflow: hidden;
        }

        .day-card {
            background: var(--ivory);
            padding: 28px 20px;
            text-align: center;
            transition: all 0.3s ease;
            cursor: pointer;
            position: relative;
        }

        .day-card:hover {
            background: var(--ivory-dark);
        }

        .day-card.active {
            background: var(--terracotta);
            color: white;
        }

        .day-card.active .day-name,
        .day-card.active .day-date,
        .day-card.active .day-suggestion {
            color: white;
        }

        .day-card.active .day-icon {
            background: rgba(255, 255, 255, 0.2);
            color: white;
        }

        .day-name {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.15em;
            text-transform: uppercase;
            color: var(--ink-muted);
            margin-bottom: 4px;
        }

        .day-date {
            font-family: var(--font-display);
            font-size: 28px;
            font-weight: 500;
            color: var(--ink-black);
            margin-bottom: 16px;
        }

        .day-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: var(--ivory-dark);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 20px;
            color: var(--terracotta);
            transition: all 0.3s ease;
        }

        .day-suggestion {
            font-size: 13px;
            color: var(--ink-soft);
            line-height: 1.6;
        }

        /* ============================================================
           Paywall / Upgrade Section
           ============================================================ */
        .paywall-section {
            padding: 120px 0;
            position: relative;
            overflow: hidden;
        }

        .paywall-pattern {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            opacity: 0.03;
            background-image:
                linear-gradient(45deg, var(--ink-black) 25%, transparent 25%),
                linear-gradient(-45deg, var(--ink-black) 25%, transparent 25%),
                linear-gradient(45deg, transparent 75%, var(--ink-black) 75%),
                linear-gradient(-45deg, transparent 75%, var(--ink-black) 75%);
            background-size: 40px 40px;
            background-position: 0 0, 0 20px, 20px -20px, -20px 0px;
            pointer-events: none;
        }

        .paywall-content {
            max-width: 720px;
            margin: 0 auto;
            padding: 0 40px;
            text-align: center;
            position: relative;
            z-index: 2;
        }

        .paywall-label {
            font-family: var(--font-ui);
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 0.25em;
            text-transform: uppercase;
            color: var(--terracotta);
            margin-bottom: 24px;
        }

        .paywall-headline {
            font-family: var(--font-display);
            font-size: clamp(36px, 5vw, 56px);
            font-weight: 500;
            line-height: 1.15;
            letter-spacing: -0.01em;
            color: var(--ink-black);
            margin-bottom: 24px;
        }

        .paywall-subhead {
            font-family: var(--font-body);
            font-size: 18px;
            font-style: italic;
            color: var(--ink-muted);
            margin-bottom: 48px;
        }

        .paywall-features {
            list-style: none;
            text-align: left;
            margin-bottom: 48px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px 32px;
        }

        .paywall-features li {
            padding: 8px 0;
            padding-left: 28px;
            position: relative;
            color: var(--ink-soft);
            font-size: 15px;
        }

        .paywall-features li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: var(--terracotta);
            font-weight: 600;
            font-size: 14px;
        }

        .paywall-cta {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            padding: 18px 48px;
            background: var(--terracotta);
            color: white;
            font-family: var(--font-ui);
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            border: none;
            border-radius: 2px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-bottom: 20px;
        }

        .paywall-cta:hover {
            background: var(--terracotta-dark);
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(201, 100, 66, 0.3);
        }

        .paywall-secondary {
            display: block;
            font-family: var(--font-ui);
            font-size: 13px;
            color: var(--ink-muted);
            transition: color 0.2s ease;
            cursor: pointer;
        }

        .paywall-secondary:hover {
            color: var(--terracotta);
        }

        /* ============================================================
           Footer
           ============================================================ */
        .footer {
            padding: 80px 0 40px;
            border-top: 1px solid var(--border-light);
        }

        .footer-content {
            max-width: var(--max-width);
            margin: 0 auto;
            padding: 0 40px;
            display: flex;
            flex-direction: column;
            align-items: center;
            text-align: center;
        }

        .footer-logo {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
            margin-bottom: 24px;
        }

        .footer-logo-mark {
            width: 48px;
            height: 48px;
            position: relative;
            color: var(--terracotta);
        }

        .footer-logo-mark .diamond-outline {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 28px;
            height: 28px;
            border: 1.5px solid var(--terracotta);
        }

        .footer-logo-mark .diamond-dot {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(45deg);
            width: 10px;
            height: 10px;
            background: var(--terracotta);
        }

        .footer-logo-wordmark,
        .footer-brand .brand-lockup-primary {
            font-family: 'Noto Serif SC', var(--font-display), serif;
            font-size: 28px;
            font-weight: 600;
            letter-spacing: 0.08em;
            color: var(--ink-black);
        }

        .footer-brand .brand-lockup-primary[data-script='zh'] {
            letter-spacing: 0.12em;
        }

        .footer-brand .brand-lockup-aux {
            font-size: 0.55em;
        }

        .share-card-brand .brand-lockup-primary {
            font-size: 20px;
        }

        .footer-tagline {
            font-family: var(--font-display);
            font-size: 18px;
            font-style: italic;
            color: var(--ink-muted);
            margin-bottom: 40px;
        }

        .footer-links {
            display: flex;
            gap: 32px;
            margin-bottom: 32px;
            flex-wrap: wrap;
            justify-content: center;
        }

        .footer-link {
            font-family: var(--font-ui);
            font-size: 12px;
            font-weight: 500;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--ink-muted);
            transition: color 0.2s ease;
            cursor: pointer;
        }

        .footer-link:hover {
            color: var(--terracotta);
        }

        .footer-copyright {
            font-family: var(--font-ui);
            font-size: 12px;
            color: var(--ink-muted);
            opacity: 0.6;
        }

        /* ============================================================
           Responsive — Mobile
           ============================================================ */
        @media (max-width: 768px) {
            .container,
            .hero-content,
            .section-header,
            .pull-quote,
            .core-insight-body,
            .key-takeaway,
            .elements-grid,
            .mingpan-board,
            .balance-section,
            .personality-grid,
            .trait-cards-grid,
            .talent-cards,
            .caution-callout,
            .caution-items,
            .weekly-timeline,
            .paywall-content,
            .footer-content {
                padding-left: 24px;
                padding-right: 24px;
            }

            .top-nav-inner {
                padding: 0 24px;
            }

            .nav-section-label {
                display: none;
            }

            .hero {
                padding: 100px 0 60px;
                min-height: auto;
            }

            .hero-issue {
                top: 90px;
                left: 24px;
                font-size: 10px;
            }

            .hero-headline {
                font-size: 48px;
            }

            .hero-decoration {
                width: 300px;
                height: 300px;
                right: -150px;
                opacity: 0.05;
            }

            .toc {
                top: 56px;
                padding: 12px 0;
            }

            .toc-list {
                padding: 0 24px;
                gap: 20px;
            }

            .toc-item .toc-num {
                display: none;
            }

            .section {
                padding: 80px 0;
            }

            .section-header {
                margin-bottom: 40px;
            }

            .section-number {
                font-size: 80px;
            }

            .section-title {
                font-size: 36px;
            }

            .core-insight-body {
                columns: 1;
            }

            .mingpan-board {
                grid-template-columns: repeat(2, 1fr);
                gap: 12px;
            }

            .mp-gan {
                font-size: 44px;
            }

            .mp-zhi {
                font-size: 30px;
            }

            .mp-pillar {
                padding: 28px 12px 20px;
            }

            .elements-grid {
                grid-template-columns: 1fr;
                gap: 48px;
            }

            .elements-donut {
                width: 260px;
                height: 260px;
            }

            .donut-inner {
                width: 180px;
                height: 180px;
            }

            .balance-section {
                grid-template-columns: 1fr;
                gap: 32px;
                text-align: center;
            }

            .personality-grid {
                grid-template-columns: 1fr;
                gap: 48px;
            }

            .trait-cards-grid {
                grid-template-columns: 1fr;
            }

            .talent-cards {
                grid-template-columns: 1fr;
            }

            .caution-box {
                padding: 32px 24px 24px;
            }

            .caution-box::before {
                left: 50%;
                transform: translateX(-50%);
            }

            .caution-box-title,
            .caution-box-desc {
                padding-left: 0;
                text-align: center;
            }

            .caution-box-title {
                margin-top: 20px;
            }

            .weekly-timeline {
                grid-template-columns: 1fr;
                gap: 1px;
            }

            .day-card {
                display: grid;
                grid-template-columns: 60px 48px 1fr;
                align-items: center;
                text-align: left;
                padding: 16px 20px;
                gap: 12px;
            }

            .day-icon {
                margin: 0;
                width: 40px;
                height: 40px;
            }

            .day-date {
                margin-bottom: 0;
                text-align: center;
            }

            .paywall-section {
                padding: 80px 0;
            }

            .paywall-features {
                grid-template-columns: 1fr;
            }

            .key-takeaway-box {
                padding: 24px;
            }
        }

/* ===== Share sheet (design-spec) ===== */
.fab-share{position:fixed;right:16px;bottom:20px;z-index:90;display:inline-flex;align-items:center;gap:8px;padding:12px 18px;background:var(--terracotta);color:#fff;font-family:var(--font-ui);font-size:13px;font-weight:600;letter-spacing:.06em;box-shadow:0 8px 24px rgba(201,100,66,.35);border-radius:999px;border:none;cursor:pointer}
.fab-share:hover{background:var(--terracotta-dark,#934828)}
.share-overlay{position:fixed;inset:0;z-index:200;background:rgba(40,38,27,.45);display:none;align-items:flex-end;justify-content:center;padding:16px;backdrop-filter:blur(4px)}
.share-overlay.open{display:flex}
.share-sheet{width:min(440px,100%);max-height:min(88vh,720px);overflow:auto;background:var(--ivory);border:1px solid var(--border-medium);box-shadow:0 20px 60px rgba(40,38,27,.2);padding:1.35rem 1.25rem 1.5rem}
.share-sheet-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:1rem}
.share-sheet-title{font-family:var(--font-display);font-size:1.35rem;font-weight:500;color:var(--ink-black)}
.share-sheet-sub{font-family:var(--font-ui);font-size:12px;color:var(--ink-muted);margin-top:4px;letter-spacing:.04em}
.share-close{width:36px;height:36px;border:1px solid var(--border-medium);color:var(--ink-muted);font-size:18px;line-height:1;background:transparent;cursor:pointer}
.share-card{position:relative;padding:1.35rem 1.2rem;margin-bottom:1rem;border:1px solid var(--border-medium);background:radial-gradient(ellipse 90% 70% at 80% 0%,rgba(201,100,66,.14),transparent 55%),linear-gradient(160deg,#FFFDF8 0%,#F5F4EF 100%);overflow:hidden}
.share-card::after{content:"";position:absolute;right:14px;top:14px;width:42px;height:42px;border:1px solid rgba(201,100,66,.35);transform:rotate(45deg)}
.share-card-brand{font-family:var(--font-display);font-size:1.1rem;font-weight:600;color:var(--ink-black);margin-bottom:.35rem}
.share-card-issue{font-family:var(--font-ui);font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--terracotta);margin-bottom:.85rem}
.share-card-headline{font-family:var(--font-display);font-size:1.35rem;line-height:1.3;color:var(--ink-black);margin-bottom:.45rem}
.share-card-line{font-size:.92rem;color:var(--ink-soft);margin-bottom:.9rem}
.share-card-meta{font-family:var(--font-ui);font-size:11px;color:var(--ink-muted);letter-spacing:.04em}
.share-copy-box{padding:.85rem 1rem;background:#fff;border:1px solid var(--border-light);font-size:.88rem;color:var(--ink-soft);line-height:1.55;margin-bottom:1rem;white-space:pre-wrap}
.share-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:1rem}
.share-btn{padding:.7rem .8rem;font-family:var(--font-ui);font-size:12px;font-weight:600;letter-spacing:.04em;border:1px solid var(--border-medium);color:var(--ink-soft);background:#fff;cursor:pointer}
.share-btn.primary{background:var(--terracotta);border-color:var(--terracotta);color:#fff}
.share-platforms{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
.share-platform{display:flex;flex-direction:column;align-items:center;gap:6px;padding:.75rem .4rem;border:1px solid var(--border-light);background:#fff;font-family:var(--font-ui);font-size:11px;color:var(--ink-muted);cursor:pointer}
.share-platform-icon{width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:1px solid var(--border-medium);transform:rotate(45deg)}
.share-platform-icon span{transform:rotate(-45deg);font-size:11px;font-weight:700;color:var(--terracotta)}
.share-toast{position:fixed;left:50%;bottom:88px;transform:translateX(-50%) translateY(12px);background:var(--ink-black);color:#fff;font-family:var(--font-ui);font-size:12px;padding:10px 16px;opacity:0;pointer-events:none;transition:all .25s;z-index:220}
.share-toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
.kw-row{display:flex;flex-wrap:wrap;gap:.4rem;margin:0 40px 1.25rem;max-width:var(--max-width)}
.kw{font-family:var(--font-ui);font-size:.65rem;color:var(--terracotta-dark,#934828);padding:.15rem .55rem;border-radius:999px;background:#F4E0D5;border:1px solid var(--border-medium)}
.section-body{max-width:var(--max-width);margin:0 auto;padding:0 40px;color:var(--ink-soft)}
.section-body p{margin-bottom:1rem;line-height:1.8}
.section-body ul{padding-left:1.25rem;margin:.5rem 0 1rem}
.product-rec{max-width:var(--max-width);margin:0 auto 2rem;padding:1.25rem 1.5rem;border:1px solid var(--border-medium);background:linear-gradient(135deg,rgba(201,100,66,.08),rgba(201,100,66,.02))}
.product-rec-label{font-family:var(--font-ui);font-size:.65rem;color:var(--terracotta);letter-spacing:.2em;font-weight:700;margin-bottom:.5rem}
.product-rec-name{font-family:var(--font-display);font-size:1.1rem;margin-bottom:.35rem}
.product-rec-desc{font-size:.9rem;color:var(--ink-muted);margin-bottom:.75rem}
.product-rec-price{font-size:1.1rem;color:var(--terracotta);font-weight:700;margin-bottom:1rem}
.product-rec-btn{display:inline-block;padding:.55rem 1.25rem;background:var(--terracotta);color:#fff;font-family:var(--font-ui);font-size:.85rem;font-weight:600}
.footer-note{margin-top:1rem;font-size:12px;color:var(--ink-muted);line-height:1.7;max-width:480px;margin-left:auto;margin-right:auto}
@media(min-width:721px){.share-overlay{align-items:center}}
button{font:inherit}

`.trim();
