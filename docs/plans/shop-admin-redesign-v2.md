# OraSage 商城后台重构方案 v2（待确认）

> 状态：**方案评审中** — 基于运营方 2026-07-09 提出的 8 条要求重新规划。
> 前置：`docs/plans/shop-redesign-v1.md`（Phase 0–2 已完成）、PR #236（结构化属性 Phase 1）。

## 〇、运营方 8 条要求（原文归纳）

| # | 要求 |
|---|------|
| R1 | 商城首先是**独立的商城**（不是各 App 配置的附属页） |
| R2 | 每个商品有**很多属性标签** |
| R3 | 每个商品有**基础属性**（名字/大小/重量等） |
| R4 | **DIY 也是一种商品** |
| R5 | 商品可**关联站内/站外网页**（用户或媒体的介绍页） |
| R6 | 紫微/八字/塔罗**付费调用商城商品**；这些商品前台不展示，后台配置；按 App 调用参数返回对应产品 |
| R7 | 全部 SKU **不超过 300 个** |
| R8 | **全面多语言**：所有不在语言字典里的文案都要能配置对应语言 |

规模判断（R7）：≤300 SKU 属小目录，**不需要**搜索引擎/分库分表/SKU 变体树；
后台商品列表可一次性加载 + 前端筛选；数据模型保持单层 SKU。

---

## 一、目标信息架构（admin 侧栏改版）

```
运营后台
├── 概览
├── 商城                        ← 新分组（R1：独立商城）
│   ├── 商品          /shop/products        目录 + 筛选（标签/分类/可见性/状态/库存）
│   ├── 标签          /shop/tags            标签分组与多语言标签管理（R2/R8）
│   ├── DIY 物料      /shop/diy             珠子目录 + 全局参数（R4，从 /beads 迁移）
│   ├── 商城页面      /shop/storefront      shop 首页 Banner/合集/排序（与 main 首页解耦）
│   ├── 订单          /shop/orders          筛选/批量发货/导出（从 /orders 迁移）
│   ├── 运费模板      /shop/shipping        国家区域 × 重量阶梯（替代代码写死）
│   ├── 评价管理      /shop/reviews         UGC 审核 + 精选（二期）
│   └── 促销          /shop/promotions      券/限时价（二期）
├── 应用计费                    ← 新分组（R6：从「商品」页拆出）
│   ├── 计费槽位      /billing/slots        app+scene → SKU 映射（统一三张旧表）
│   └── 推荐位        /billing/recommends   八字五行/紫微/塔罗推荐配置
├── 留言（不变）
└── CMS 子菜单（增加「商城内容」组：商品详情页/精选评价直达）
```

要点：

1. **商城独立成组**（R1）：商品/订单/DIY/运费/页面运营全部归入「商城」，
   与八字/紫微/塔罗计费配置**页面分离**。
2. **应用计费独立成组**（R6）：命理 App 的付费 SKU 属于「渠道配置」而非「商品目录」，
   单独维护，避免现在 `/products` 一页九区块的混杂。
3. 旧路由 `/products` `/beads` `/orders` 做 301 → 新路径，外链不失效。

---

## 二、数据模型（auth-service `products` 及周边）

### 2.1 商品主表扩展

```
products（现有字段保留）新增：
  kind          enum('standard','digital','service','diy')   -- R4：DIY 是一种商品
  visibility    enum('public','unlisted','app_only')          -- R6：前台不展示的计费品
  stock         integer NULL          -- NULL=不限库存；实体品可设
  lowStockAt    integer NULL          -- 低库存预警阈值
  slug          varchar NULL          -- SEO 友好 URL（可选，默认用 sku）
  seoTitleI18n  jsonb                 -- R8
  seoDescI18n   jsonb                 -- R8
```

- `category`（crystal/report/service）保留为**前台展示分组**；`kind` 表达**业务形态**。
- `visibility` 语义：
  - `public` — shop 首页/分类/搜索可见
  - `unlisted` — 前台目录不出现，但直链 PDP 可访问（如活动专属）
  - `app_only` — 仅供 App 计费调用，shop 前台完全不可见（R6）
- DIY：`diy-bracelet` 商品 `kind='diy'`；珠子（diy_beads）作为其**物料子目录**，
  在商城分组内维护，价格构成、库存与商品层打通。

### 2.2 标签体系（R2）

```
product_tag_groups: id, code, labelI18n jsonb, sort         -- 如 五行/功效/材质/场景/人群
product_tags:       id, groupId, code, labelI18n jsonb, sort, active
product_tag_links:  productId, tagId  (m2m)
```

- 标签全部多语言（R8）；前台可按标签筛选、PDP 展示标签胶囊、推荐可按标签匹配。
- 现有 `element`（五行）字段保留兼容，同时自动映射为「五行」组标签。

### 2.3 关联网页（R5）

```
product_links: id, sku, kind enum('internal','media','review','article'),
               title, titleI18n jsonb, url, sourceName（媒体名，可空）,
               locale（可空=全语言）, sort, active
```

- 后台商品编辑页新增「关联页面」区：可加站内文章（daozang/famous 等）与站外媒体报道、
  用户测评链接。
- 前台 PDP 新增「媒体与用户报道」区块，外链 `rel="noopener nofollow"`。

### 2.4 应用计费槽位（R6，统一三张旧表）

```
app_billing_slots:
  id, appSource enum('bazi','ziwei','tarot','main','shop'),
  slotKey varchar,           -- 如 report.basic / report.couple.premium /
                             --    chat.pack10 / daily.overage / recommend.element.木
  sku varchar,               -- 指向 products（通常 visibility=app_only）
  priceOverrideCents int NULL, priceOverrideUsdCents int NULL,
  active bool, sort int, updatedAt
UNIQUE(appSource, slotKey, sort)
```

- 统一 API：`GET /api/billing/slot?app=bazi&key=report.basic&locale=…`
  → 返回解析后的商品 + 价格（含 override）。**App 传参 → 后台配置的产品**（R6 原话）。
- 渐进迁移：`bazi_element_recommendations`、`tarot_billing_config`、
  `ziwei_product_recommendations` 三表读写先映射到新表，旧接口保持兼容一个版本后下线。
- 前台隔离：`GET /api/products` 默认过滤 `visibility='public'`；
  计费槽位走独立接口，天然满足「前台不展示」。

### 2.5 多语言（R8）

原则：**凡是运营可配置的展示文案，都有 `*_i18n` jsonb（zh-CN/zh-TW/en/pt-BR）**，
回退链 `请求语言 → zh-CN → en → 基础字段`（现有 `pickLocalized` 已实现）。

覆盖清单：

| 对象 | 字段 | 状态 |
|------|------|------|
| 商品 | name/description/material/color/packaging | ✅ 已有（PR #236） |
| 商品 | seoTitle/seoDesc、attachments[].name | 🆕 本方案 |
| 标签/标签组 | label | 🆕 |
| 关联链接 | title | 🆕 |
| 分类 | label | 🆕（现硬编码在 `CATEGORY_LABELS`，改为可配置表或 CMS global） |
| CMS 详情页 | 全部 sections/subtitle/SEO | 🆕 `locale` 字段从仅 zh-CN 扩到 4 语，一 SKU 多语言文档，缺失回退 zh-CN |
| CMS 精选评价 | body/author | 🆕 同上 |
| DIY 珠子 | name/material | 🆕 |
| 运费模板 | zone 名称 | 🆕 |

---

## 三、图片 / 视频存放方案（性能 + 功能评估）

### 3.1 现状与问题

| 项 | 现状 |
|----|------|
| 存储 | Payload CMS 本地磁盘 `/var/lib/orasage/cms-media`（单 VPS） |
| 分发 | nginx 直出 `admin.orasage.com/cms/api/media/file/…`，无 CDN |
| 图片处理 | 无缩放/裁剪，前台 next/image 远程加载原图 |
| 视频 | 仅存 URL 字段，无托管方案 |
| 风险 | 亚洲/巴西访客 RTT 150–250ms；视频吃 VPS 带宽；磁盘无冗余 |

### 3.2 容量估算（R7 上限 300 SKU）

- 图片：300 SKU ×（1 主图 + 8 详情图）× ~400KB ≈ **1.1 GB**
- 短视频：假设 150 个 SKU 配 1 条 20–40MB MP4 ≈ **4–6 GB**
- 结论：容量非常小，**瓶颈是分发时延与带宽，不是存储**。

### 3.3 推荐方案（分两步，最终形态 B）

**Step A（快速，1 次配置，不改代码）：Cloudflare 接管域名 → CDN 缓存静态媒体**

- `media/**` 路径加 Cache Rule（cache everything, edge TTL 30d）；
- 立即改善亚洲/巴西加载；VPS 带宽卸载 ~80%；
- 成本 0（免费版即可）；作为 Step B 之前的过渡。

**Step B（目标形态）：Cloudflare R2 对象存储 + Payload S3 适配器 + 自定义域 CDN**

```
上传：admin/CMS → Payload @payloadcms/storage-s3 → R2 bucket
分发：media.orasage.com（R2 custom domain，天然挂 Cloudflare CDN）
图片：Payload imageSizes 生成 thumbnail/card/gallery 三档，
      前台 next/image 按 sizes 取档
视频：≤1min 的 PDP 短视频直接 R2 + <video> mp4（该规模足够）；
      未来若需长视频/自适应码率，再上 Cloudflare Stream（$5/千分钟观看）
```

| 维度 | 收益 |
|------|------|
| 性能 | 全球边缘缓存，亚洲/巴西首字节 <50ms；直接服务 Item 3 多地域诉求 |
| 成本 | R2 存储 $0.015/GB/月（本规模 <$0.1/月），**出口流量 0 费用** |
| 可靠 | 对象存储 11 个 9，摆脱单 VPS 磁盘；VPS 迁移不再搬媒体 |
| 功能 | 现有「admin 上传 → CMS 关联 SKU」流程不变，仅换存储后端 |
| 兼容 | 旧文件一次性 `rclone` 迁移 + 旧 URL nginx 301 |

**结论：管理入口维持 CMS 媒体库（运营心智不变），物理存储迁 R2，分发走 CDN。**
需要你提供/授权：Cloudflare 账号接管 `orasage.com` DNS（或已有则开 R2）。

---

## 四、商品编辑页（单 SKU 工作台）

`/shop/products/[sku]` 单页分区（左侧锚点导航，替代现在的 Tab）：

```
① 基础信息   sku/名称/kind/分类/价格/库存/可见性/上下架/排序/slug
② 属性规格   材质/颜色/尺寸/重量/包装（公制存储，前台按语言换算展示）
③ 标签       多选标签胶囊（按组分区），可即时新建标签
④ 多语言     名称/描述/属性/SEO 四语并排编辑 + 「缺失语言」提示徽标
⑤ 媒体       主图 + 详情多图（拖拽排序）+ 视频 URL —— 内嵌上传直达 R2
⑥ 详情内容   区块编辑（richText/spec/guide/faq/quote）—— 内嵌 CMS 文档 iframe
             或 admin 原生表单写 CMS API（评审点，见 §6-Q2）
⑦ 关联页面   站内/站外链接列表（R5）
⑧ 附件       数字附件（报告 PDF 等）+ 前台 PDP 下载区展示（补齐现状缺口）
⑨ 渠道       该 SKU 被哪些计费槽位引用（只读反查，防误下架）
```

商品列表页：

- 筛选器：分类 / kind / 标签 / 可见性 / 上下架 / 库存状态 / 缺语言
- 列：主图、SKU、名称、标签、价格、库存、可见性、详情页状态、更新时间
- 批量操作：上/下架、改标签、导出 CSV

---

## 五、订单 / 运费 / 评价 / 促销 / 权限（运营维度补全）

| 模块 | 方案 |
|------|------|
| 订单 | 状态/来源/日期/SKU/关键词筛选；分页；批量标发货；CSV 导出；订单详情页（含物流时间线编辑） |
| 运费模板 | `shipping_zones`（国家分组 zone，多语言名）+ `shipping_rates`（zone × 重量阶梯 × 价格）；`estimateShippingFeeCents` 改读库，保留现规则为默认 seed |
| 评价 | 二期：`product_reviews`（用户 UGC，状态 pending/approved/rejected/featured）；现有 CMS 精选评价继续作为「运营精选」层 |
| 促销 | 二期：`coupons` + 商品级 `salePriceCents/saleStartsAt/saleEndsAt` |
| 权限 | 依赖 Backlog Item 7：JWT role 细分 `admin / shop_ops / content_ops`；「商城」组菜单按角色显隐 |

---

## 六、待你确认的评审点

| # | 问题 | 我的默认建议 |
|---|------|--------------|
| Q1 | 媒体最终形态 Step B 需 Cloudflare R2（涉及 DNS/账号）。是否批准？无账号时先做 Step A？ | 批准 B；**2026-07-09 决策：推迟到服务器迁移时一并做**（届时再接入 Cloudflare DNS + R2；当前继续 VPS 本地媒体） |
| Q2 | 详情长内容编辑：a) admin 内嵌 CMS iframe；b) admin 原生表单直写 CMS API（体验最好，开发量大）；c) 维持外链跳 CMS | **b**，分两步先做 a |
| Q3 | 分类是否也改为可配置表（现枚举 crystal/report/service）？ | 是，顺带多语言 |
| Q4 | 旧三张计费表迁 `app_billing_slots` 的兼容窗口 | 保留旧 API 一个发布周期 |
| Q5 | DIY 珠子是否需要多语言名称（前台目前中文为主） | 需要（R8 全覆盖） |
| Q6 | UGC 评价与促销排期：与权限（Item 7）谁先？ | 权限先行，评价/促销随后 |

## 七、实施分期（待批准后执行）

| Phase | 内容 | 涉及 | 状态 |
|-------|------|------|------|
| **A 基座** | visibility/kind/库存/slug + 标签体系 + 关联链接 + `app_billing_slots` + 新侧栏 IA（商城/应用计费分组） | auth-service 迁移、admin 大改版、shop 目录过滤 | ✅ PR #239 已上线（2026-07-09） |
| **B 内容与多语言** | CMS 详情页/评价 4 语；admin 原生详情内容编辑（Q2-b）；PDP 附件下载区、关联页面区块前台展示 | cms、shop、admin | 待做 |
| **B′ 媒体基建** | Cloudflare CDN + R2 迁移 | deploy、cms | **推迟：与服务器迁移同期执行** |
| **C 履约运营** | 订单筛选/批量/导出、运费模板落库、DIY 并入商城组 | auth-service、admin、shared/shop-fulfillment | 待做 |
| **D 增长** | UGC 评价、促销、权限角色化 | 全栈 | 待做（权限先行） |

每 Phase 合入前按 AGENT-RULES 做关联分支穿透 + 全量回归。
