# OraSage / 海棠未眠 品牌资产（canonical）

> 规范：[`docs/design-system/OraSage-Brand-Spec.md`](../../docs/design-system/OraSage-Brand-Spec.md)
> **图形标与字标默认分开** —— 顶栏用纯文字 `OraSage`；符号位只用玄璧。中文品牌名 **海棠未眠** 用于署名、品牌页、报告封面，不替代顶栏拉丁字标。

## 目录

| 路径 | 内容 |
| :--- | :--- |
| `logo/orasage-mark-{ink,paper,cinnabar}.svg` | 玄璧图形标（墨 / 反白 / 朱砂），几何见规范 §2，勿手改路径 |
| `subbrands/{bazi,ziwei,manto,energy}.svg` | 四子品牌（统一网格） |
| `favicon/icon.svg` | 墨底圆角方 + 反白玄璧 |
| `favicon/favicon.ico` | 16 + 32 |
| `favicon/icon-180.png` | apple-touch-icon |
| `favicon/icon-192.png` / `icon-512.png` | PWA |
| `og/og-{main,bazi,ziwei,tarot,shop}.png` | 1200×630 分享图 |

## 同步方式

favicon / OG 为**复制接入**（非 import）：改动本目录后须重新复制到各应用——

- Next.js：`{app}/src/app/`（或 ziwei 的 `app/`）下的 `icon.svg`、`favicon.ico`、`apple-icon.png`；OG 在各应用 `public/og.png`
- bazi（Vite）：`bazi/client/public/` + `index.html` 内 `<link>`
- auth-service：`auth-service/public/assets/brand/` + `site-chrome-html.ts` 内 `<link>`

小尺寸描边遵循规范光学修正（16px 时描边 8），**不要**把 `logo/orasage-mark-ink.svg` 直接缩到 16px 作 favicon。
