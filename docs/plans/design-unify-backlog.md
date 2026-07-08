# OraSage 设计统一 & 平台 UI — 待完成计划

> 最后更新：**2026-07-08**（PR #214 shop ShippingForm i18n；CMS 生产 redeploy；地址簿 i18n 进行中）  
> 关联：`docs/design-system/ui-phase-2.md`

---

## 2026-07 UI 统一（已合并 main）

- [x] PR #194 — App Shell 脚本化 sync、shop Button、ziwei token preset
- [x] PR #195 — VPS 构建前安装 `packages/ui` 依赖
- [x] PR #196 — tarot AppShell immersive/onboarding 属性
- [x] PR #198 — tarot `@orasage/ui`、lucide 图标、`packages/i18n`
- [x] 生产部署：main/auth/shop/admin/bazi/ziwei/tarot/cms ✅

## Phase 2 合入 main（2026-07-03 历史）

- [x] `@orasage/ui`、`tokens:sync`、Phase 2 架构文档
- [x] 主站 Header/Footer/内容页/Profile UI 统一
- [x] 八字主题 + `BaziResult` 浅色纸面

---

## 状态总览（2026-07-08）

| 模块 | 进度 | 说明 |
|------|------|------|
| 设计令牌 | ✅ | `tokens:sync` / `tokens:check` |
| App Shell | ✅ | `app-shell:sync` / `app-shell:check`；lucide 底栏 |
| @orasage/ui | 🟡 | main 全量；shop/tarot Button；bazi 少量 |
| 图标 lucide | 🟡 | Shell/main/shop/tarot 已统一；ziwei 内容层待清 |
| packages/i18n | 🟡 | 基座已建；shop next-intl 四语已落地 |
| PostgreSQL 合一 | ✅ | bazi/tarot 已迁移 |
| VPS 部署 | ✅ | cms 2026-07-08 redeploy |
| E2E smoke | ✅ | `npm run test:smoke-all` 生产全绿（PR #213） |

---

## P0 — 当前

- [x] cms `package-lock.json` 同步 lucide 后 redeploy（2026-07-08）
- [x] PR 门禁加入 `npm run ui:check`（`.github/workflows/ui-check.yml`）

## P1 — 短期

- [x] tarot feature CSS（`tarot-home` / `temple` / `geo-journey`）token 化
- [ ] ziwei 业务 emoji → lucide（保留 ChartBoard SVG）
- [x] shop 商品卡/布局 `@orasage/ui` Card
- [x] bazi/ziwei `detectLocale` → `@orasage/i18n`
- [x] app-shell 语言切换器 + 跨子域 cookie

## P2 — 中期

- [x] shop next-intl + 商品 `name_i18n`（PR #206–#207）
- [x] auth T1 四语静态页（PR #206）
- [x] 浏览器 E2E（`scripts/e2e/`）支付→报告链路（PR #213）
- [x] shop ShippingForm / 地址簿 i18n（PR #214 + 地址簿页）
- [ ] Tailwind v4 全站收敛（main/shop/ziwei/admin v3；bazi/tarot v4）

---

## 历史：platform-unify 已完成项

- [x] 全站浅色设计令牌
- [x] 底部导航 Bazi / Ziwei / Tarot
- [x] Ziwei 合盘 Tab、子页返回逻辑
- [x] Ziwei 付费墙 parity

（原 P0 E2E / PR #21 条目保留于 Git 历史，以当前 P0/P1 为准。）

---

## 关键命令速查

```bash
# UI 一致性校验
npm run ui:check

# E2E 生产冒烟
cd scripts/e2e && npm run test:smoke-all

# 本地构建
cd main && npm run build
cd shop && JWT_SECRET=... npm run build
cd tarot && JWT_SECRET=... npm run build
cd ziwei && npm run build
cd bazi && pnpm run build

# VPS 全量部署
ORASAGE_REF=main bash deploy/remote-deploy-all.sh

# 生产验证
curl -sI https://tarot.orasage.com
curl -sI https://shop.orasage.com/api/health
curl -sI https://cms.orasage.com
```
