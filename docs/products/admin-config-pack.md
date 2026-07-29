# Admin 配置后台规范（Config Pack）

> **状态**：已评审定稿（2026-07-28）· Phase A–D 已落地 · **Phase E（Module API v1 + 交付模板 + 审计）已落地**  
> **适用范围**：`admin.orasage.com`、相关 auth-service Admin API、内容控制面、合作方 Module API  
> **配套**：实施路线图见 [`docs/plans/admin-config-pack-roadmap.md`](../plans/admin-config-pack-roadmap.md) · Module API 契约 [`module-api-v1.md`](./module-api-v1.md)  
> **Agent**：改后台前必读本文 + [`docs/AGENT-RULES.md`](../AGENT-RULES.md)「Admin 配置包」专节

---

## 1. 目标

1. 按**模块**组织配置，支持模块独立运营。
2. 配置模型从第一天带 **`partnerId`**，便于开放 API / 交付第三方。
3. 第三方**不直接使用 Payload Admin**；内容经自研 UI + API 交付。
4. 资金（finance / wallets）与 L3 密钥对第三方**不开放**（密钥仅只读状态）。

---

## 2. 已锁定产品决策

| 项 | 定稿 |
|----|------|
| 平台自营 partner | slug 固定为 **`orasage`** |
| Admin 入口 | **同域** `admin.orasage.com`，按账号 `partnerId` 隔离；模型预留 Host→partner，第一期不做子域 |
| 命理模块 | **`app.bazi` / `app.ziwei` / `app.tarot`**，可扩展 `app.{id}` |
| App 页形态 | **深链概览**：摘要 + 链到 content/billing 过滤视图 + 本页 L2 功能开关 |
| Content | 第三方**禁止**进入 Payload；平台可用内部逃生舱 |
| Finance / wallets | **永不开放**给第三方或白标 |
| L3 密钥 | 后台**只读**「已配置？」状态，不自助填 Key |
| 店铺展示 | 归属 **`shop.storefront`**（非 content） |
| 多租户 | 所有新配置/API **day-1 带 `partnerId`** |

---

## 3. 配置分层

| 层 | 含义 | 谁可改 | 示例 |
|----|------|--------|------|
| **L1 业务配置** | 可进后台、可授第三方 | 按模块权限 | 商品、运费、券、Hero 文案、协议正文 |
| **L2 运营策略** | 可进后台，默认平台或授出 | 按权限 | 首页 layout、通知事件开关、App 功能开关 |
| **L3 密钥 / 基建** | 默认不出明文；仅状态 | 运维/密钥托管 | JWT、Stripe、Telegram、AI Key、DB URL |

---

## 4. 模块地图（Config Pack）

| 模块 ID | 可授第三方 | 说明 |
|---------|------------|------|
| `platform` | 部分（`integrations.read`）；`partners` 仅平台 | 概览、合作方、子账号、集成状态 |
| `shop` | ✓ | 目录、DIY、订单、运费、促销、UGC、**storefront** |
| `billing` | ✓ | `app` + `slotKey` → SKU |
| `content` | ✓（仅自研 UI/API） | 页面、媒体、商品内容、Hero、Feed、信仰地理 |
| `legal` | ✓ | 隐私/服务/商品协议 |
| `app.bazi` / `app.ziwei` / `app.tarot` | ✓ | App 概览壳；展示→content，计费→billing，开关在本页 |
| `ops` | ✓ | 留言、在线客服 |
| `analytics` | ✓ 只读 | 数据统计 |
| `finance` | ✗ | 对账、钱包 — 仅平台超管 |

### 4.1 shop vs content（防混）

| 归属 shop | 归属 content |
|-----------|----------------|
| 价格、库存、分类标签、履约、券 | PDP 长文、图集、精选评价 |
| UGC 评价审核 | CMS/内容侧精选评价 |
| **storefront**（layout、首页商品、水晶文案） | 各站 Hero（含商城 Hero 视觉） |

### 4.2 App 深链约定

```text
/apps/{appId}
  → /content/heroes?app={appId}
  → /content/feeds?app={appId}     # 若该 App 有 feed
  → /content/faith?app={appId}     # tarot 等
  → /billing?app={appId}
  → 本页 L2 功能开关
```

深链目标页必须强制按 `app` + `partnerId` 过滤；打开时除 content/billing 权限外，应校验对应 `app.{id}` 已开通。

---

## 5. 多租户不变量

```text
partners.slug = "orasage"          # 平台自营
所有业务配置行：partner_id NOT NULL
读写默认：WHERE partner_id = currentPartnerId
平台超管可切换 partner；合作方 Token 不可跨租户
finance / wallets：无合作方 API、不进合作方权限枚举
```

第一期 UI：同域账号隔离。数据与 API 契约仍带 `partnerId`。

**Phase D 实现要点**

| 项 | 说明 |
|----|------|
| 表 | `partners` / `partner_modules`；员工 `users.partner_id`；配置表 `partner_id` 默认 `orasage` |
| 种子 | `orasage`（全模块）+ `demo-partner`（缩略模块，隔离测试） |
| Admin API | 列表/写操作按 `scopedPartnerId` 过滤；超管可用 `?partner=` |
| 有效权限 | 非 orasage 非超管 = 角色权限 ∩ 启用模块 ∩ `PARTNER_ASSIGNABLE` |
| L3 集成 | 仅平台租户返回真实通道状态；合作方恒为未配置 |

**Phase E 实现要点**

| 项 | 说明 |
|----|------|
| 契约 | [`module-api-v1.md`](./module-api-v1.md)：`/v1/partners/{partnerSlug}/…`，Bearer / `X-Api-Key` |
| Key | 表 `partner_api_keys`；明文仅创建时返回；scopes ∩ `partner_modules` |
| 模板 | `shop-only` / `tarot-only` / `full-apps`（`shared/partners` · `DELIVERY_TEMPLATES`） |
| 审计 | 表 `config_audit_logs`；Admin 与 Module API 写配置均落库 |
| 禁止 | finance / wallets / L3 / Payload；路径 slug 必须与 Key 的 `partner_id` 一致 |
| Admin UI | `/partners`：超管可套模板、签发/吊销 Key、查看审计 |

---

## 6. 目标侧栏信息架构

```text
平台
  概览 / 合作方 / 子账号与权限 / 集成状态 / 更新日志
商城
  商品 · 分类 · 标签 · DIY · 订单 · 运费 · 促销 · 评价审核 · 店铺展示
应用计费
  计费槽位（按 app 分组）
内容（自研，不链 Payload 给合作方）
  页面 · 媒体 · 商品内容 · Hero · 信息流 · 信仰与圣地
合规
  协议管理
应用
  八字 / 紫微 / 塔罗（可扩展）
客服
  留言 · 在线客服
数据
  数据统计
资金（仅平台）
  资金对账 · 用户钱包
```

旧 `/cms/admin…` 主导航对合作方移除；平台超管可保留折叠「内部 CMS」。

**Phase C**：`/content/*` 为自研控制面（仍写 CMS DB）；Payload Admin UI（`Users.access.admin`）仅 `staffRole === admin`。

---

## 7. 权限枚举（Phase B 已落地）

实现：`shared/staff-permissions/index.ts`（含旧名别名与角色默认）。

```text
platform.partners | platform.staff | platform.integrations.read
ops.overview | ops.tickets | ops.im | analytics.read
shop.catalog | shop.storefront | shop.orders | shop.diy | shop.shipping | shop.promotions | shop.reviews
billing.slots
content.pages | content.media | content.product | content.heroes | content.feed | content.faith
legal.agreements
app.bazi | app.ziwei | app.tarot
```

| 旧名（JWT/grant 仍兼容） | Canonical |
|--------------------------|-----------|
| `shop.products` | `shop.catalog` + `shop.storefront` |
| `ops.messages` | `ops.tickets` |
| `staff.manage` | `platform.staff` |
| `content.cms.*` | `content.*`（`shop`→`product`） |
| `content.cms` | 全部 `content.*` |

- **finance / wallets**：仅超管角色，永不进入 `ASSIGNABLE_EXTRA_PERMISSIONS` / `PARTNER_ASSIGNABLE_PERMISSIONS`。
- 合作方有效权限（Phase D）= `partner_modules` ∩ `PARTNER_ASSIGNABLE_PERMISSIONS`。
- 冒烟：`npx tsx scripts/test-staff-permissions.mjs`。

---

## 8. 新增后台功能时的强制流程

1. **读本文**，选定模块 ID 与配置层（L1/L2/L3）。
2. **禁止**把新能力塞进错误分类（例：把转化向店铺配置放进 content）。
3. 若需新模块 / 新权限：先更新本文 + `AGENT-RULES` + 路线图，再写代码。
4. 实现后：
   - 更新本文「模块地图 / 权限 / 菜单」中受影响小节；
   - 用更新日志脚本追加一条（见 §9）；
   - 若增删改了**全局规则**（AGENT-RULES / 本规范的不变量），必须在该条日志的 `rulesImpact` 中说明。
5. 按路线图**分步实施**；每步完成后做约定的全量测试，再进入下一步。

---

## 9. 更新日志（Changelog）

| 项 | 约定 |
|----|------|
| 数据源 | `shared/admin-backend/changelog.json` |
| 后台页 | `/changelog`（全体已登录员工可见） |
| 追加方式 | `node scripts/admin-changelog-append.mjs …`（见脚本 `--help`） |
| 何时追加 | **每次**合并/交付会改变后台行为、规范或全局规则的更新**必须**追加一条 |
| 全局规则 | 字段 `rulesImpact.added|changed|removed` 必填说明（无则写空数组并在 summary 声明「无规则变更」） |

---

## 10. 与实现路线图的关系

代码改造按 [`admin-config-pack-roadmap.md`](../plans/admin-config-pack-roadmap.md) 分 Phase 执行。  
**未列入当前 Phase 的菜单/权限重命名，不得借机大范围改动。**
