# Agent 交接备忘录 — 2026-07-08

> 写给下一任 Cloud Agent / 开发者（含「未来的自己」）。  
> 覆盖本轮多轮对话主线：**塔罗 i18n 补全 → ziwei `@orasage/ui` 三批 + 扫尾 → 合并部署**。  
> 平台总览仍见 [`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md)（§2 部分已过期，**以本文 + `ui-status-2026-07.md` 为准**）。

**关联文档（按优先级）：**

| 文档 | 用途 |
|------|------|
| [`docs/AGENT-RULES.md`](./AGENT-RULES.md) | **最高宪法**：关联分支穿透、全站范围、导航规范 |
| [`docs/design-system/ui-status-2026-07.md`](./design-system/ui-status-2026-07.md) | 全站 UI / TW4 / `@orasage/ui` 接入矩阵（最新） |
| [`docs/plans/platform-roadmap-2026-07.md`](./plans/platform-roadmap-2026-07.md) | 六大工作项长期路线（DB 合一、i18n 基座等） |
| [`docs/plans/design-unify-backlog.md`](./plans/design-unify-backlog.md) | 设计统一待办（部分已完成，读前核对日期） |
| [`docs/HANDOFF-tarot.md`](./HANDOFF-tarot.md) | 塔罗专项（P4–P7、功德、CMS 圣地等） |

---

## 1. 用户意图脉络（本轮会话）

| 顺序 | 用户要求 | 结果 |
|------|----------|------|
| 1 | tarot onboarding / dream / angel-card i18n | PR **#225** ✅ merged + deployed |
| 2 | 合并并部署 | #225 合入 + tarot 上线 |
| 3 | ziwei：更多业务组件逐步接入 `@orasage/ui` | PR **#226** ✅ merged + deployed |
| 4 | 合并并部署 ziwei；继续 library、chart TopBar、TimeNav | PR **#227** ✅ merged + deployed |
| 5 | StarDetailPanel、ScrollIntro、AnnouncementModal 等继续接入 | PR **#228** ✅ merged + deployed |
| 6 | **继续扫尾** | PR **#229** ✅ merged + deployed |
| 7 | **写整体交接文档** | 本文 |

**隐含约束（从多轮对话归纳，未书面撤销前仍有效）：**

- 改动 ziwei / `shared/app-shell` 时，评估是否需 `app-shell:sync` 到其它 8 个应用副本。
- 保留各 App 既有视觉语义类（如 ziwei 的 `card-glass`、`ziwei-calc-submit`），通过 `className` 叠在 `@orasage/ui` 上，不要裸换肤。
- 合入后用户习惯：**merge → `ORASAGE_REF=main bash deploy/remote-deploy-<app>.sh`**。
- Cloud Agent 分支命名：`cursor/<descriptive-name>-2e83`，PR base 为 `main`。

---

## 2. 当前 `main` 与生产状态

**Git：** `main` @ **`f69878f`**（PR #241 商城 Phase B，2026-07-09）

**2026-07-09 傍晚增量（PR #241 商城 Phase B，已合并 + 全量部署 + 生产实测）：**
- **CMS 4 语**：shop-product-pages / shop-product-testimonials locale 扩 zh-CN/zh-TW/en/pt-BR（Payload 迁移 `20260709_120000` 为枚举 ADD VALUE；部署时自动 migrate 未生效，已在 VPS 手动 `npm run migrate` + 重启 cms，生产枚举已确认 4 语）。
- **shop PDP**：按访客语言取 CMS 内容（缺失回退 zh-CN）；新增「资料下载」（attachments）与「媒体与用户报道」（product_links）区块，4 语 `pdp` 命名空间文案。
- **admin 原生内容编辑（Q2-b）**：`/products/[sku]/content?locale=` 语言 Tab ×4；状态/副标题/SEO/视频、轮播图上传/排序/删除、区块编辑器（PdpSectionsEditor 序列化 JSON）、精选评价 CRUD；写操作全部走 CMS REST + admin JWT（orasage SSO）。商品列表「编辑详情与评价」不再外跳 CMS。
- 媒体 R2/CDN（Phase B′）按用户决策推迟到服务器迁移期。

**2026-07-09 下午增量（PR #236 / #237 / #238 / #239，均已合并 + 全量部署 + 生产实测）：**
- **PR #236 商品结构化属性**：`products` 增 material/color/weight/尺寸/packaging/attachments（迁移 0024）；admin Tab 编辑器 + `/products/[sku]/edit`；`shared/product-units` 公制存储按 locale 换算；PDP 无 CMS specList 时自动注入规格面板。部署时发现部署脚本迁移清单缺 0023/0024 致 auth 502，已手动补迁移 + hotfix `1d49dfe` 更新清单。
- **PR #237**：修复 ProductEditTabs render-prop 跨 Server/Client 边界报错（digest 3039512283），改传 `panels` ReactNode。
- **PR #238**：商城后台重构方案 v2 文档（8 条运营要求 + 6 评审点，全部获用户确认：R2 批准 Cloudflare R2、详情编辑直接做 admin 原生表单、分类可配置、计费旧表不留兼容直接切、DIY 多语言、权限先行）。
- **PR #239 商城 Phase A（基座）**：`app_billing_slots` 统一取代三张旧计费表（数据搬迁后 DROP，旧 API `/api/products/recommend/*`、`/api/tarot/billing/*` 删除）；新 API `GET /api/billing/slot|slots`；bazi/tarot/ziwei 调用点全部反向改造。`products` 增 kind/visibility/stock/lowStockAt/slug/SEO i18n（迁移 0025）；计费 SKU 置 `app_only`，商城目录不再展示（单 SKU fetch 保留供结账深链）。新表 product_categories（可配置分类+i18n）/product_tag_groups/product_tags/product_tag_links/product_links。admin 侧栏拆「商城」「应用计费」分组；`/billing` 槽位管理、`/shop/tags`、`/shop/categories` 新页面；商品列表筛选器。注意：生产 tarot_billing_config/tarot_daily_recommend_products 两表 owner 为 postgres 致迁移内 DROP 未生效，部署后已手动 DROP。
- 生产验证（Phase A）：billing slot/slots 解析、目录隐藏 app_only（8 公开 SKU 无泄漏）、app_only 单品可取、ziwei 轮换推荐、tag 筛选、shop PDP/checkout 深链 200、admin /billing 307 登录跳转，全部通过。

**2026-07-09 上午增量（PR #233 / #234 / #235）：**
- **PR #233 全站统一多语言体系**：`packages/i18n` 升级为唯一 i18n 基座（新增消息运行时 + `@orasage/i18n/react` 的 `I18nProvider`/`useI18n`/`useT`，cookie 契约上收）；bazi/ziwei/tarot 三套自研 Provider 删除改为薄适配层（字典内容留在各应用）；main 12 语清单、auth 重复 locale 逻辑收敛到共享包。修复：tarot 启动不读共享 cookie（恒中文）、bazi 切语言整页刷新、auth 登录/注册页 `?lang`/cookie 被硬编码 zh-CN 兜底 redirect 压住。admin/cms 新增 `@orasage/i18n` 依赖（app-shell 副本需要），后台维持中文豁免。
- **PR #234 切换器 + 商城按钮**：`.orasage-app-lang-menu` 加 `z-index: 80` + 不透明底色 `--shell-menu-bg`（原来无 z-index 被内容盖住、半透明透字）；切换按钮/菜单项用双类选择器锁定 36px 全站一致（原来 @orasage/ui Button 默认高度导致 44px「变形」）。shop 商品卡改单行「购买 + 购物车图标按钮」；PDP 窄屏定制按钮独占一行；PDP 按钮文案接入 next-intl 四语。
- **PR #235 订单提醒**：auth-service `order-notify.ts` — 新订单/支付成功 fire-and-forget 推 Telegram + Resend 邮件（env 开关，未配置通道静默跳过）；挂点 `POST/PATCH /internal/orders`。admin 侧栏「订单」红色角标（`GET /api/admin/orders/new-count` + 60s 轮询，进订单页已读清零）。上线需在 VPS `auth-service/.env` 配 `TELEGRAM_BOT_TOKEN`/`TELEGRAM_CHAT_ID`/`RESEND_API_KEY`/`ORDER_NOTIFY_EMAIL_TO` 后重启 auth。
- 生产验证：三命理 App cookie 启动语言跟随、切换无刷新；auth `?lang=en/pt/zh-TW` + cookie 正确；语言菜单 hit-test 全命中；shop 卡片/PDP 360px 不换行；admin 订单角标本地全链路通过。

**2026-07-08 历史：** `main` @ `0f5d51e`（PR #232「我的」菜单重构）

**2026-07-08 晚间增量：**
- PR #231（分应用 bug 修复）已合并部署：bazi 报告持久化 `REPORTS_DIR=/var/lib/orasage/bazi-reports`（dist 不再存业务产物）、部署脚本弃用嵌套 sudo 下错误的 `SUDO_USER`、auth `tsc --noEmit` 清零、cms seed 跳过无模板 SKU
- PR #232（「我的」菜单重构）已合并部署：全局语言切换器进 main 顶栏（设置页语言卡移除）、祈福偏好迁入 `/profile/merit`、设置页更名「账户与设置」为唯一账户入口、法律页 `.legal-article` 归一化、**联系表单全链路**（`contact_messages` 表 + drizzle 0023 + internal/admin API + main `/api/contact` + admin `/messages` 工单页）
- 生产已验证：联系表单游客提交落库、admin /messages 门禁 307、顶栏切换器渲染；测试留言 id=1 已标记 resolved
- 注意：核心应用部署 `deploy-shop-on-vps.sh` 须以 sudo 运行（node_modules 属主为 root）

| 服务 | URL | 本轮是否重部署 | 验证 |
|------|-----|----------------|------|
| **全部 8 应用** | 各子域 | ✅ PR #223 合入后 `remote-deploy-all.sh` 全量部署两轮（第二轮含 middleware 修复） | favicon `/icon.svg`、OG `/og.png` 全子域 200；玄璧底栏图形上线（门户非锚点页）；`products` 表与 CMS PDP「OraSage 对话」文案已数据订正 |
| **ziwei** | https://ziwei.orasage.com | ✅（此前 #226–#229 亦部署） | `curl -sI` → 307/200 |
| **tarot** | https://tarot.orasage.com | ✅ | onboarding/dream/angel 四语；Playfair 已退役 |

已知非阻塞项：cms.orasage.com 301 → admin 为 nginx 有意配置；auth `tsc --noEmit` rootDir 报错为预存问题；cms `seed:shop-pages-all` 遇 `diy-bracelet` 抛 `unsupported product`（预存，不影响其余 SKU upsert）。

**VPS：** `34.75.40.67`（GCP `ubuntu`），代码 `/opt/orasage`，SSH 密钥由 `deploy/remote-deploy-*.sh` 加载。

---

## 3. 本轮合入 PR 一览（#222–#229）

```
#229 feat(ziwei): complete @orasage/ui sweep          ← 扫尾（Card/Checkbox/Badge/AppShell）
#228 feat(ziwei): StarDetailPanel, ScrollIntro, AnnouncementModal, BirthForm, insight
#227 feat(ziwei): library, chart toolbar, TimeNav
#226 feat(ziwei): PaywallCard, ChartSummary, ChatPanel, ShareModal, …
#225 feat(tarot): i18n onboarding / dream / angel-card
#224 feat(tarot): reading i18n（前序）
#222 feat(tarot): secondary pages i18n（前序）
```

更早背景（同系列但未在本轮重复部署）：#216 ziwei lucide、#217–#218 shop TW4、#220+ TW4 全站收敛与 UI 风险修复（见 `ui-status-2026-07.md`）。

---

## 4. 已完成工作详情

### 4.1 Tarot i18n（#222 / #224 / #225）

**机制：** `tarot/src/lib/i18n/` — `LangProvider` + 分域 copy 文件。

| 文件 | 职责 |
|------|------|
| `ui-strings.ts` | 通用 UI 文案 |
| `reading-copy.ts` | 三牌阵、每日运势、历史等 |
| `feature-copy.ts` | **#225 新增** onboarding / dream / angel-card hooks |
| `crystal-copy.ts` | 水晶相关 |
| `context.tsx` | Provider + `useT` |

**四语：** zh-CN、zh-TW、en、pt-BR（部分 API 返回字段如情绪/意图仍中文，属数据层未外化）。

**#225 接线：**

- `OnboardingFlow.tsx` → `useOnboardingCopy()`
- `dream/page.tsx` → `useDreamCopy()`
- `angel-card/page.tsx` → `useAngelCopy()`

### 4.2 Ziwei `@orasage/ui`（#226–#229，现已视为 **完成**）

**包 exports（`packages/ui/package.json`）：**

```json
"./button", "./card", "./input", "./badge", "./checkbox"
```

**接入矩阵（按批次）：**

| 批次 | PR | 主要文件 |
|------|-----|----------|
| 1 | #226 | `PaywallCard`, `CrystalShopCard`, `PatternsCard`, `ChartSummary`, `ShareModal`（按钮）, `ZiweiChatPaywall`, `ZiweiRecommendCard`, `ChatPanel`, `InsightPanel`（按钮/输入）, `ZiweiOrasageChat` |
| 2 | #227 | `LibrarySearch`, `library/*`, `chart/page` 工具栏, `TimeNav`；`chart/TopBar.tsx` 去重为 re-export |
| 3 | #228 | `StarDetailPanel`, `ScrollIntro`, `AnnouncementModal`, `BirthForm`（分段+姓名）, `insight/InsightPanel`, `preview/page` |
| 扫尾 | #229 | 两路 `InsightPanel` / `ZiweiBriefInsight` / `ShareModal` **Card**；knowledge + library 章节 **Card**；`ZiweiHomeFeed` **Badge**；`BirthForm` **Checkbox**；`AppShell` 返回 + `LocaleSwitcher` **Button**（`shared/app-shell` 同步） |

**验收：** `ziwei` 组件树内已无原生 `<button>` / `<input>`（`select` 等表单控件保留）。

**样式约定：**

```tsx
import { Button } from '@orasage/ui/button';
import { Card } from '@orasage/ui/card';

<Card className="card-glass rounded-xl border-0 shadow-none" />
<Button className="ziwei-calc-submit w-full" />
<Card variant="interactive" asChild><Link href="..." /></Card>
```

App Shell 按钮需压掉默认样式，保留 `orasage-app-*` / `orasage-page-back` 类：

```tsx
<Button variant="ghost" className="orasage-app-lang-btn h-auto min-h-0 border-0 bg-transparent p-0 shadow-none hover:bg-transparent" />
```

### 4.3 设计系统 / TW4（背景，非本轮主 diff）

- 全站 Next/Vite 前台 **均已 Tailwind v4** + `packages/tokens` bridge。
- `npm run ui:check` 在 CI（`.github/workflows/ui-check.yml`）。
- `shared/app-shell/` 为权威源；ziwei 内为 `ziwei/lib/orasage-app-shell/` 副本，改 shell 后跑 `npm run app-shell:sync` 并检查其它应用。

---

## 5. 关键文件索引

| 用途 | 路径 |
|------|------|
| Agent 规则 | `docs/AGENT-RULES.md` |
| UI 现状审查 | `docs/design-system/ui-status-2026-07.md` |
| `@orasage/ui` 组件 | `packages/ui/src/components/*.tsx` |
| UI exports | `packages/ui/package.json` → `exports` |
| Tarot i18n | `tarot/src/lib/i18n/` |
| Ziwei i18n | `ziwei/lib/i18n/` |
| Ziwei 命盘页 | `ziwei/app/chart/page.tsx` |
| Ziwei 付费流 | `ziwei/lib/usePaymentFlow.ts`, `components/PaywallCard.tsx` |
| App Shell 源 | `shared/app-shell/` |
| Ziwei shell 副本 | `ziwei/lib/orasage-app-shell/` |
| 部署脚本 | `deploy/remote-deploy-{ziwei,tarot,bazi,shop}.sh` |
| 仓库 runnable 说明 | 根目录 `AGENTS.md` |

---

## 6. 常用命令

### 本地验证

```bash
npm run ui:check
cd ziwei && npm run build
cd tarot && JWT_SECRET=dev-secret-key-at-least-32-chars-long npm run build
```

### 部署（本轮用过的）

```bash
ORASAGE_REF=main bash deploy/remote-deploy-ziwei.sh
ORASAGE_REF=main bash deploy/remote-deploy-tarot.sh
```

### App Shell 同步（改 `shared/app-shell` 后）

```bash
npm run app-shell:sync
npm run app-shell:check
```

### 本地起服务（见 `AGENTS.md`）

- Postgres：`sudo pg_ctlcluster 16 main start`
- auth-service：`DATABASE_URL=... JWT_SECRET=... npm run build && npm start`（3101）
- ziwei：`npm run build && npm start`（3111）

---

## 7. 已知陷阱

| 问题 | 处理 |
|------|------|
| 改 `BirthForm` 后类型报错 | 确认 `import type { BirthplaceValue } from '@orasage/city'` 仍在 |
| 新增 `@orasage/ui` 子路径 | 须在 `packages/ui/package.json` `exports` 声明（#226 的 `./input` 教训） |
| `Card` 迁移 JSX 未闭合 | 对照 `ChartSummary.tsx` / `ShareModal.tsx` 模式；改完 `npm run build` |
| 本地 cookie 登录 | `orasage_token` 为 `secure` + `.orasage.com`；本地用 JSON `token` → `Authorization: Bearer` |
| `shared/app-shell` vs ziwei 副本漂移 | 本轮 #229 两边都改了；以后优先改 `shared/` 再 sync |
| `package-lock.json` 噪音 | 提交时只 add  intentional 文件，勿把无关 lock 变更合入 |
| deploy 脚本 | 仅在 VPS 执行，sandbox 内用于 review 编辑，不要指望本地跑通 SSH |

---

## 8. 建议的下一步（未接单，按优先级）

1. **Tarot i18n 余量**：CMS/API 中文内容字段、剩余硬编码页面（对照 `ui-status` §2 tarot 行）。
2. **其它 App 的 `@orasage/ui`**：shop / bazi / admin 按需接入（ziwei 已完成，可作参考）。
3. **`app-shell:sync` 门禁**：改 shell 后 CI 检查各应用副本 diff（见 `platform-roadmap` §1）。
4. **Bazi UI**：`BAZI-PHASE2-HANDOFF.md`、`design-unify-backlog` P1。
5. **长期**：DB 合一（MySQL → PG）、`packages/i18n` 全站基座 — 见 `platform-roadmap-2026-07.md`，**大工程，勿与小型 UI PR 混做**。

---

## 9. Cloud Agent 工作流备忘

1. 读 `docs/AGENT-RULES.md` + 本文 + 任务相关 HANDOFF。
2. `git checkout main && git pull`
3. `git checkout -b cursor/<name>-2e83`
4. 实现 → `npm run build`（受影响 app）→ commit → push
5. 创建 PR（`base: main`）→ 用户若说「合并并部署」则 merge + `deploy/remote-deploy-*.sh`
6. 更新相关 HANDOFF / `ui-status`（若有架构变化）

**本轮活跃过分支（均已 merge，勿重复开）：**

- `cursor/tarot-feature-i18n-2e83`
- `cursor/ziwei-orasage-ui-2e83` / `phase2` / `phase3` / `sweep`

---

## 10. 快速状态一句话

> **2026-07-08：`main` 上 tarot 核心用户流程四语 i18n 已铺完一轮；ziwei 业务组件 `@orasage/ui`（Button/Card/Input/Badge/Checkbox）已全部接入且无原生 button/input；ziwei + tarot 生产已部署。下一任优先读 `ui-status-2026-07.md` 挑 tarot/shop/bazi 余量或平台级任务。**

---

*完成新一轮合入部署后，请更新本文 §2–§3 的 commit/PR 表，并在 `HANDOFF-orasage-platform.md` 顶部保持指向最新 HANDOFF。*
