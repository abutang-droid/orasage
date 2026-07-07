# OraSage 平台六大工作项 — 分析与方案（2026-07）

> 基于 2026-07-07 对仓库全量调研（UI/i18n 现状、数据库全貌、shop 架构与对外能力）。
> 关联文档：`docs/design-system/ui-phase-2.md`、`docs/plans/design-unify-backlog.md`。

## 现状速览

| App | UI 技术栈 | i18n | 数据库 |
|-----|-----------|------|--------|
| main | TW3 + `@orasage/ui` + tokens + lucide | next-intl 12 语言 | 无 |
| shop | TW3 + tokens + 自定义 CSS，无 `@orasage/ui` | UI 硬编码中文（仅 locale/货币） | 无（经 auth-service） |
| admin | 纯 CSS + tokens | 硬编码中文 | 无（经 auth-service） |
| cms | Payload UI + tokens | Admin 仅中文，内容模型有 locale 字段 | PG `orasage_cms` |
| auth-service | 静态 CSS + 同步的 `oui-*` 类 | zh/en 二元 | PG `orasage_auth`（18 张表） |
| bazi | TW4 + `@orasage/ui` + lucide | 自研字典 4 语言 | MySQL `bazi_calculator`（4 张表，Drizzle） |
| ziwei | TW3（主题色硬编码未接 preset）+ 内联 SVG | 自研字典 4 语言 | 无 |
| tarot | TW4 + 900+ 行自定义 CSS + 内联 SVG | LangProvider 4 语言，内容多中文 | MySQL `tarot`（14 个 model，Prisma） |

关键事实：

- Token（`shared/design-tokens/orasage-tokens.css`）与 App Shell 已全站铺开；`@orasage/ui` React 组件仅 main + bazi 真正接入。
- 数据库实际是 **4 个库**：PG `orasage_auth` + PG `orasage_cms` + MySQL `bazi_calculator` + MySQL `tarot`。shop/admin/main/ziwei 不直连 DB。
- README 中 shop 用 PostgreSQL + BullMQ 的描述与代码不符（shop 无 DB、无队列）；Redis/ioredis 均为声明未使用。
- 三套用户标识并存：auth 整数 id / bazi `openId`（含 `orasage:{sub}` 桥接）/ tarot UUID + `externalId`。
- shop 目前是"生态内收银台"：内网 checkout 仅 127.0.0.1、cookie 绑 `.orasage.com`、无 CORS、无 partner 概念。

---

## 1. 全站统一 UI（符号、组件）

**目标架构不变**（`ui-phase-2.md` 已定）：`shared/design-tokens` → `@orasage/tokens` → `@orasage/ui` → 各 App，禁止第二套 shadcn。缺的是"铺开"。

### 工作项（按序）

1. **同步机制脚本化**：App Shell 目前靠手动 `cp`。补 `npm run sync:app-shell`（照 `sync:*-ui-css` 模式），CI 加 `tokens:check` + app-shell diff 检查，防漂移。
2. **ziwei 对齐 preset**：`ziwei/tailwind.config.ts` 硬编码 `#FAFAF9` / `#B8922A` 等，改接 `@orasage/tokens` 的 Tailwind preset。这是唯一"颜色源不一致"的 App，优先修。
3. **图标统一**：定 lucide-react 为唯一图标库。ziwei/tarot 的内联 SVG、shop 的 emoji 逐步替换；`shared/app-shell` 内导航图标固化为一套（可先抽成 `packages/ui/icons`）。
4. **`@orasage/ui` 接入剩余 App**：顺序 shop → tarot →（admin/cms/auth 走静态 `oui-*` CSS 类即可，不必上 React 包）。shop 的 `shop-home.css` 等自定义 CSS 逐页替换为 `@orasage/ui` 组件 + token 变量。
5. **Tailwind 版本收敛**：现状 v3（main/shop/ziwei）与 v4（bazi/tarot）混用。不必急着全升 v4，但 preset 必须双版本可用（`packages/tokens` 已有 v3 preset，补 v4 的 `@theme` 导出），长期收敛到 v4。
6. **tarot 900+ 行自定义 CSS 治理**：保留塔罗专属氛围样式，但所有色值/圆角/字号改引用 token 变量，专属类收敛进 app 级语义层（已有雏形）。

### 验收

- 全站无硬编码品牌色（可写 lint 脚本扫 `#[0-9a-f]{6}`）；
- 图标只来自 lucide（或统一的 icons 包）；
- `tokens:check`、app-shell 同步检查进 CI。

---

## 2. 数据库合一（保留 PostgreSQL）

**结论：保留 PostgreSQL 16，淘汰 MySQL。** 理由：PG 侧承载核心资产（用户/订单/商品/CMS），Payload 与 Drizzle pg-core 都是一等公民；MySQL 侧只有 bazi（4 表）+ tarot（14 model），且**均无原生 SQL、存储过程、全文索引**，迁移面干净。

### 目标形态

一个 PG 实例，按 schema/库隔离（推荐同实例多库维持现状边界，或单库多 schema）：

```
PostgreSQL 16（单实例）
├─ orasage_auth   （auth-service，Drizzle）
├─ orasage_cms    （Payload）
├─ orasage_bazi   （bazi，Drizzle pg-core）← 从 MySQL 迁入
└─ orasage_tarot  （tarot，Prisma postgresql）← 从 MySQL 迁入
```

不建议第一步就把四者合成一个 schema——各库 `users` 表同名不同义，强行合并会把"数据库合一"变成"用户体系重构"，拆开做风险小得多。

### bazi 迁移（Drizzle）

- `mysql-core` → `pg-core`；`mysqlEnum` → PG enum；`json` → `jsonb`。
- `onUpdateNow()` → 应用层 `updatedAt` 或 trigger；`onDuplicateKeyUpdate`（`server/db.ts` 用户 upsert）→ `onConflictDoUpdate`。
- 先修已知 schema 漂移（迁移 SQL `0002` 的 `sections` 列未在 `schema.ts` 声明）。
- 列名保持 camelCase 不动（Drizzle 支持显式列名映射，避免扩大改动面）。

### tarot 迁移（Prisma）

- `provider = "postgresql"`，重建 baseline migration；`Json` → `JsonB` 基本透明。
- UUID PK、复合 unique、`$transaction` 均 PG 兼容，无 `$queryRaw`，风险低。

### 数据迁移与切换

1. 测试环境用 pgloader（或导出/导入脚本）演练两次，校验行数 + JSON 字段抽样。
2. **tarot 先切**（无真实付费链路压力），观察一周。
3. **bazi 后切**（有 Manus OAuth + WooCommerce 真实付费用户）：选低峰期短停机窗口（数据量小，分钟级），切换后保留 MySQL 只读一个月作回滚保底。
4. 收尾：deploy 脚本去 MariaDB 依赖（`deploy/bazi/deploy-bazi.sh`、`deploy/tarot/deploy-tarot.sh` 的 MySQL URL 检查），更新 AGENTS.md/README，并修正 README 中 shop=PostgreSQL+BullMQ 的错误描述。

**用户体系统一（三套 ID 合并）单列为后续任务**，不与本次迁移捆绑——桥接（`orasage:{sub}`）目前工作正常，合并属于问题 5 的 API 化演进的一部分。

---

## 3. 全站多语言

### 策略：两级语言集 + 统一 locale 基座

- **T1（全站保证）**：zh-CN / zh-TW / en / pt-BR——bazi/ziwei/tarot 字典已是这 4 种，向其看齐成本最低。
- **T2（main 展示层）**：main 维持 12 语言；其余 App 收到 T2 语言时回退到 en。
- admin / cms 后台保持中文（内部工具），明确豁免。

### 基座工作

1. **建 `packages/i18n`（或 `shared/i18n`）**：统一 locale 清单、`zh-CN`/`zh` 归一化、检测优先级（URL `?lang=` > 跨子域 cookie `NEXT_LOCALE`（domain=`.orasage.com`）> Accept-Language）、命理术语表（八字/紫微/塔罗专名的 4 语对照，bazi 已有 `terms.ts` 可上收）。
2. **语言切换器进 `shared/app-shell`**：全站同一入口，写共享 cookie，各 App 各自消费。auth-service 的 `localeFromRedirect` 改读同一 cookie。

### 分 App 工作

| App | 工作 |
|-----|------|
| shop | 接 next-intl（对齐 main 模式）；UI 文案抽字典；商品名/描述多语言——`products` 表加 `name_i18n`/`description_i18n` jsonb（admin 编辑），PDP 富内容走 CMS localization |
| cms | 开 Payload localization（内容模型已有 locale 字段，收敛为原生 localized fields），Hero/Feed API 带 locale 参数 |
| bazi/ziwei/tarot | 保留自研字典机制（换框架不值），改造点：locale 来源统一到共享 cookie；补齐领域内容翻译（tarot 牌义、ziwei 星曜/典籍——工作量大，可 AI 初翻 + 人工校订，按 en → pt-BR 分批） |
| auth-service | 登录/用户中心页从 zh/en 二元扩到 T1 四语（静态页字典即可） |

### 验收

- 在 main 切语言后跳转任意子域，语言跟随；
- T1 四语下核心链路（排盘 → 付费墙 → 结账 → 订单）无中文硬编码穿帮。

---

## 4. shop 独立分销给合作伙伴（App / 网站）

现状离 partner-ready 差距明确：无 API Key/OAuth、checkout 仅内网、cookie 绑域、无 CORS、无渠道归因、Stripe 单商户。建议**分两级交付，先 V1 后 V2**：

### V1 — 渠道化 Hosted Checkout（改动小，先跑通分销业务）

伙伴不需要拿到任何代码或直连 API，只需带渠道参数的链接：

1. **数据模型**：auth-service 加 `partners` 表（id、name、api_key、结算方式、回调 URL）；`user_orders` 加 `partner_id` + `channel` 列（扩展式迁移，只加不改）。
2. **归因链路**：`shop.orasage.com/checkout?sku=...&partner=xxx&psig=...`（签名防伪造），订单落库带 partner_id；也支持商品页 `?partner=` 落 cookie 归因。
3. **结算**：admin 加按 partner 维度的订单/佣金报表；V1 人工线下结算，收款仍走 OraSage Stripe。
4. **回调**：订单支付成功后向 partner 登记的 webhook URL POST 通知（HMAC 签名），伙伴 App/网站可据此发货/展示。

网站类伙伴到此已可分销；App 类伙伴可用 WebView 打开 hosted checkout。

### V2 — Partner API（伙伴自建收银体验时再做）

1. **鉴权**：API Key + HMAC 请求签名（server-to-server，不依赖 cookie），按 key 限流。
2. **接口集**（新增 `shop/src/app/api/partner/**` 或独立 gateway）：
   - `GET /partner/v1/products`——伙伴可见 SKU + 伙伴价；
   - `POST /partner/v1/orders`——创建订单，返回支付 URL（复用 hosted checkout 或 Stripe session）；
   - `GET /partner/v1/orders/:no`——查单；
   - webhook 事件：`order.paid` / `order.shipped`。
- **用户映射**：订单挂 `partner_user_ref`（伙伴侧用户 ID 字符串），不要求伙伴用户注册 OraSage 账号；如需报告类履约，静默创建影子账号（复用现有 checkout-register 逻辑，但走 server-to-server 而非无密码 bind）。
3. **配套**：sandbox 环境（PAYMENT_MODE=mock 正好可用）、OpenAPI 文档、rate limit。
4. **分账**（Stripe Connect）留到有真实多伙伴结算压力时再上。

**风险提示**：现有 `POST /auth/checkout-bind` 是无密码绑定，绝不能暴露给伙伴链路；partner 签名参数必须服务端校验。

---

## 5. 分版本接入第三方 APP（共用数据库、更新互不影响）

### 核心原则：不 fork 长期分支；隔离在"部署 + API 契约"层，不在代码层

长期维护一个 fork 分支会持续漂移，最终变成两套代码。推荐架构：

```
主干 main ── 持续开发 ──────────────────────────►
   │
   └─ release/v1（tag: v1.0, v1.1…）← 第三方接入版锁定在 tag
          ▲ 只 cherry-pick 修复，不接新功能

部署：
  第三方版：独立进程/端口/子域（或伙伴自己的域），部署 release tag
  主站版：  部署 main
  两者共用：同一个 PostgreSQL + auth-service API
```

### 共用数据库时如何保证更新不破坏旧版

关键洞察：**本仓库架构里 shop/admin/main/ziwei 本来就不直连 DB，全部经 auth-service API 持久化**。这正是隔离点——第三方版本也必须只经 API 访问数据，绝不直连 PG。这样"共用数据库"的兼容问题就降级为"API 兼容"问题，可控得多：

1. **API 版本化**：auth-service 的对外/内部接口冻结为 `/v1/**`（现有路由挂别名即可），第三方版只调 `/v1`；破坏性变更开 `/v2`，`/v1` 维持到第三方版下线。
2. **数据库变更走 expand-contract**：只加列/表（带默认值），不删列、不改语义；删除动作需确认所有还在线的版本都不再读写该列。把这条写进 `docs/AGENT-RULES.md` 作为迁移纪律。
3. **契约测试进 CI**：对 `/v1` 关键接口（verify、internal/orders、products、readings）做快照/schema 测试，主干任何 PR 破坏 v1 契约即红灯。
4. **配置化白标**：第三方版的品牌、域名、支付模式全部走环境变量（现有 `PAYMENT_MODE`、`AUTH_URL` 等模式延续），避免为伙伴改代码。

### 与问题 4 的关系

问题 5 的"第三方 APP 版本"消费的正是问题 4 V2 的 Partner API + 版本化 auth API。两者共用一套地基：**先把 API 层版本化并稳定，再谈多版本共存**。

---

## 6. 代码安全

先校准概念，再给措施：

- **前端 JS 无法真正加密**。浏览器要执行就必须可读，混淆只是提高阅读成本。Next.js 生产构建已做 minify，这层现状够用，专门上 obfuscator 性价比低且伤性能/调试，不推荐。
- **真正要保护的是三样**：服务端算法与业务逻辑、密钥、基础设施访问权。

### 措施清单（按性价比排序）

1. **机密不落前端、不进 git**：
   - CI 加 gitleaks（或开 GitHub secret scanning + push protection）扫历史与增量；
   - VPS 上 `.env` 权限 600、属主为服务用户；`JWT_SECRET`/`STRIPE_SECRET_KEY` 泄露即全站沦陷，定期轮换。
2. **核心算法留在服务端**：审计各 App client bundle——bazi 的排盘/AI 解读在 server（tRPC）没问题；ziwei 用 iztro 前端排盘（开源库，无所谓），但**自研解读/prompt 逻辑必须只在 API 侧**；tarot 同理检查 `src/lib` 中牌义解读是否被打进客户端 bundle，是则移到 route handler。
3. **VPS 加固**：SSH 仅密钥登录 + fail2ban；对外只开 80/443/22（App 全部 127.0.0.1 监听已达标）；systemd 服务以非 root 专用用户运行并加 `ProtectSystem=strict` 等沙箱指令；自动安全更新。
4. **仓库与供应链**：repo 保持 private；main 分支保护 + PR review；`npm audit`/Dependabot 定期跑；部署脚本用只读 deploy key。
5. **对第三方"不给源码"**：这是最有效的代码安全。问题 4/5 的方案本身就是答案——伙伴只拿到 API 和 hosted 页面；若必须交付可部署物，给 **Docker 镜像 / Next.js standalone 构建产物**（无源码、无 .env），加许可协议约束。

---

## 总体排期建议（依赖关系排序，非日历时间）

```
Phase 0  决策确认：保留 PG、T1 四语、分销先 V1、第三方版走 release tag
Phase 1  数据库合一（问题 2）—— 地基，越晚数据越多越难迁
         └ 同步修 README/AGENTS.md 与代码不符处
Phase 2  UI 统一（问题 1）∥ i18n 基座 + shop 多语言（问题 3）—— 可并行
Phase 3  分销 V1：渠道归因 + hosted checkout + partner 报表 + webhook（问题 4）
Phase 4  API 版本化（/v1 冻结 + 契约测试）→ Partner API V2 → 第三方 APP 版本
         按 release tag 独立部署（问题 5）
贯穿     安全措施（问题 6）：gitleaks/CI、VPS 加固、bundle 审计随各 Phase 落地
```

排序理由：数据库是所有后续工作的读写面，先合一避免"迁移 + 新功能"叠加；分销 V1 不依赖 UI/i18n 可提前插队（若商务紧急）；问题 5 依赖问题 4 的 API 层，放最后。
