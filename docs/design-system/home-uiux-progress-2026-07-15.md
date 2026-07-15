# 官网首页 UI/UX 修复进度（2026-07-15）

基线 HEAD：`b1d55ac`（与审计快照一致）  
分支：`cursor/home-uiux-fix-3d1a`  
任务书：`OraSage_首页_UIUX_修复执行说明_Claude_Code.md`

## 完成任务

| ID | 状态 |
|---|---|
| HOME-P1-01 | 完成 — 统一 `.live-chat-root` 固定定位 |
| HOME-P1-02 | 完成 — 始终唯一 H1（可见或 sr-only fallback `hero.title`） |
| HOME-P1-03 | 完成 — 16:9 占位 + width/height/sizes/decoding |
| HOME-P1-04 | 完成 — Radix Dialog `modal={false}` + Escape/焦点/44px 关闭 |
| HOME-P1-05 | 完成 — 语言/登录/分类/更多/聊天触控 ≥44px（桌面可回 36/32） |
| HOME-P1-06 | 完成 — `next/font/google` Inter / Noto Sans SC / Noto Serif SC → Token |
| HOME-P2-01 | 完成 — Skip Link → `#main-content` |
| HOME-P2-02 | 完成 — 语言 listbox 方向键/Home/End/Escape + `aria-selected` |
| HOME-P2-03 | 完成 — Header `aria-current`、分类 `aria-pressed`、BottomNav `aria-current`（共享权威源已同步） |
| HOME-P2-05 | 完成 — 商品描述 ≥12px；底栏标签 12px |
| HOME-P2-06 | 完成 — PortalChrome 改用 `--os-*` Token |
| HOME-P2-08 | 完成 — Footer → `/privacy` `/terms` |
| HOME-P2-09 | 部分 — 聊天 Emoji→Lucide；箭头 `aria-hidden`；不迁移 Tabler |
| HOME-P2-10 | 完成 — 发送失败 live region；disabled 样式 |
| HOME-P3-01 | 完成 — Reduced Motion 停视频 autoplay/loop |
| HOME-P3-02 | 完成 — eyebrow 改 `muted-foreground` |

## 未完成 / 仅记录

| ID | 说明 |
|---|---|
| HOME-P2-04 | 先测量再改；本环境无可靠 TTFB/LCP 基线，未拆 Suspense / 未改 `no-store` |
| HOME-P2-07 | pt-BR key/商品本地化 — 超出 `/zh-CN` 范围，另立 follow-up |
| HOME-P2-09 全量 | Lucide→Tabler 待负责人确认 |

## 共享影响

- `shared/app-shell/BottomNav.tsx`、`app-shell.css`：aria-current、字号、触控热区
- 已 `npm run app-shell:sync`；`npm run ui:check` PASS

## 验证

- `npm run ui:check`：PASS
- `cd main && npm run build`：PASS
- 五档视口 / 200% / 键盘 / Reduced Motion / CLS 数值：本环境未做浏览器实测 → **UNVERIFIED**（需预览环境补测）
