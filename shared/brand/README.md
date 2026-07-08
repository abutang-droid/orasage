# OraSage 品牌资产（canonical）

> 规范：[`docs/design-system/OraSage-VI-v1.0.md`](../../docs/design-system/OraSage-VI-v1.0.md)
> 使用原则（VI §2.3）：**图形标与字标默认分开使用** —— 界面顶栏用纯文字字标，符号位（favicon / 图标 / 水印）只用图形；组合锁定仅限邮件页脚、报告封面封底、包装等正式署名场合。

## 目录

| 路径 | 内容 |
| :--- | :--- |
| `logo/orasage-mark-{ink,paper,cinnabar}.svg` | 玄璧图形标（墨 / 反白 / 朱砂），canonical 几何见 VI §2.2，勿手改路径数值 |
| `subbrands/{bazi,ziwei,manto,energy}.svg` | 四个子品牌图形（统一网格 VI §5.2） |
| `favicon/icon.svg` | 墨底圆角方 + 反白玄璧（现代浏览器 favicon 首选） |
| `favicon/favicon.ico` | 16 + 32 双尺寸（PNG 内嵌式） |
| `favicon/icon-180.png` | apple-touch-icon（方形无圆角，系统裁切） |
| `favicon/icon-192.png` / `icon-512.png` | PWA / manifest |
| `og/og-{main,bazi,ziwei,tarot,shop}.png` | 1200×630 静态分享图（VI §6.2 模板） |

## 同步方式

favicon / OG 为**复制接入**（非 import）：改动本目录后须重新复制到各应用——

- Next.js 应用：`{app}/src/app/`（或 ziwei 的 `app/`）下的 `icon.svg`、`favicon.ico`、`apple-icon.png`；OG 图在各应用 `public/og.png`
- bazi（Vite）：`bazi/client/public/` + `bazi/client/index.html` 内 `<link>` 标签
- auth-service（静态页）：`auth-service/public/assets/brand/` + `site-chrome-html.ts` 内 `<link>` 标签

小尺寸描边遵循 VI §2.2 光学修正（16px 时描边 8），因此**不要**直接用 `logo/orasage-mark-ink.svg` 缩到 16px 作 favicon。
