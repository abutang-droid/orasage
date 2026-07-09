# Agent 交接备忘录 — 2026-07-09

> 写给下一任 Cloud Agent / 开发者。  
> 覆盖 **2026-07-09 全天**：商城后台 Phase B/C/D 收尾 → 结账优惠码 → 第一期三语限定 → 商店返回去重。  
> 平台总览仍见 [`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md)；**2026-07-08 增量**见 [`HANDOFF-agent-2026-07-08.md`](./HANDOFF-agent-2026-07-08.md)。

**关联文档（按优先级）：**

| 文档 | 用途 |
|------|------|
| [`docs/AGENT-RULES.md`](./AGENT-RULES.md) | 最高宪法：关联分支穿透、全站范围、导航规范 |
| [`docs/plans/shop-admin-redesign-v2.md`](./plans/shop-admin-redesign-v2.md) | 商城后台 v2 分期（**文档内 Phase 状态表已滞后，以本文 §4 为准**） |
| [`docs/plans/platform-roadmap-2026-07.md`](./plans/platform-roadmap-2026-07.md) | 平台六大工作项长期路线 |
| [`docs/design-system/ui-status-2026-07.md`](./design-system/ui-status-2026-07.md) | 全站 UI / TW4 / `@orasage/ui` 矩阵 |

---

## 1. 用户意图脉络（本会话）

| 顺序 | 用户要求 | 结果 |
|------|----------|------|
| 1 | 继续 Phase B 收尾 | PR **#245** ✅ 合并 + 部署 |
| 2 | 继续 Phase C | PR **#246** ✅ 合并 + 部署 |
| 3 | 继续 Phase D | PR **#247** ✅ 合并 + 部署 |
| 4 | 继续结账优惠码接入 | PR **#248** ✅ 合并 + 部署 |
| 5 | 合并部署（优惠码 + main 构建权限修复） | VPS 已更新；迁移 0029 曾需手动补跑 |
| 6 | 第一期语言只上线 zh-CN / en / pt-BR | PR **#249** + 热修 **#250** ✅ 合并 + 部署 |
| 7 | 商店仍有两个返回菜单 | PR **#251** ✅ 合并 + 部署（用户已确认修复） |
| 8 | **写交接文档** | 本文 |

**仍有效的隐含约束：**

- Cloud Agent 分支：`cursor/<descriptive-name>-5c1f`，PR base 为 `main`。
- 改 `shared/app-shell/` 后执行 `npm run app-shell:sync`。
- 合入后习惯：`git pull` on VPS + `bash deploy/deploy-shop-on-vps.sh`（或 `deploy/deploy-shop.sh` 远程触发）。
- VPS：`34.75.40.67`，代码 `/opt/orasage`，SSH 经 `deploy/lib/ssh-setup.sh`。

---

## 2. 当前 `main` 与生产状态

**Git：** `main` @ **`bc43fc2`**（PR #251，2026-07-09）

| 服务 | URL | 今日是否重部署 | 备注 |
|------|-----|----------------|------|
| main | https://orasage.com | ✅ | 3 语路由；旧 `/zh-TW`、`/fr` 等 308 重定向 |
| auth | https://auth.orasage.com | ✅ | 0029 优惠码字段；Phase D 角色/评价/促销表 |
| shop | https://shop.orasage.com | ✅ | 结账优惠码 UI；返回去重；3 语 switcher |
| admin | https://admin.orasage.com | ✅ | Phase C/D 页面；商品 i18n 表单现为 3 语 Tab |
| bazi / ziwei / tarot | 各子域 | ✅（locale + back 相关） | bazi/ziwei 字典已去掉 zh-TW 条目以通过 build |

**部署踩坑（下一 agent 必读）：**

1. **`deploy/deploy-shop.sh`（tar 上传）**：VPS 上部分文件属主为 root，`tar xzf` 可能报 `Permission denied`；**可靠做法**是 VPS 上 `git fetch && git reset --hard origin/main` 再跑 `deploy-shop-on-vps.sh`。
2. **`main/.next` 属主 root**：普通用户 `rm -rf .next` 失败；需 `sudo rm -rf main/.next` 后重建（已在一次部署中手动处理）。
3. **迁移 0029**（`user_orders.coupon_code/subtotal_cents`）：首次全量 deploy 脚本未打出 `ALTER TABLE` 日志时需 **`sudo -u postgres psql orasage_auth -f auth-service/drizzle/0029_order_coupon.sql`** 手动确认。
4. **Phase D 角色 enum**：VPS 上 `ALTER TYPE user_role` 有时需 `sudo -u postgres psql`。
5. **核心 deploy 脚本**若 node_modules 属主为 root，文档建议 **sudo 运行** `deploy-shop-on-vps.sh`（见 07-08 handoff）。

---

## 3. 今日单独开 PR 并已合并（#243–#251）

| PR | 分支 | 标题摘要 | 要点 |
|----|------|----------|------|
| **#243** | `cursor/product-media-upload-5c1f` | 商品媒体真实上传 | admin 媒体上传与本地预览（会话更早段，已部署） |
| **#244** | `cursor/phase-b-back-buttons-5c1f` | 子应用双层返回 + Phase B 部分 | 返回 dedupe 初版；计费反查等 |
| **#245** | `cursor/phase-b-hero-sort-list-5c1f` | Phase B 收尾 | Hero 拖拽排序；商品列表批量/CSV/缺语言筛选 |
| **#246** | `cursor/phase-c-fulfillment-5c1f` | Phase C 履约 | `shipping_zones`（0027）；admin `/shop/orders`、`/shop/diy`、`/shop/shipping`；shop 运费估算 API |
| **#247** | `cursor/phase-d-growth-5c1f` | Phase D 增长 | 角色 `admin/shop_ops/content_ops`（0028）；UGC `product_reviews`；`coupons` + 促销 admin；CMS SSO content_ops |
| **#248** | `cursor/checkout-coupon-5c1f` | 结账优惠码 | 0029 订单字段；auth internal coupon API；shop `CheckoutCouponForm`；支付完成 increment `used_count` |
| **#249** | `cursor/phase1-locales-5c1f` | 第一期三语 | `PHASE_1_LOCALES`；main/shop/switcher 仅 zh-CN/en/pt-BR；admin/CMS 表单 3 语 Tab |
| **#250** | `cursor/phase1-locales-fix-5c1f` | bazi/ziwei 热修 | 字典类型去掉 zh-TW 以修复 VPS build |
| **#251** | `cursor/shop-back-dedupe-5c1f` | 商店返回去重 | `shouldShowAppShellPageBack()` + shop 前缀仅 cart/checkout/success；内容页单一「返回商城」 |

**Auth 迁移清单（今日相关，按序）：** 0027 shipping_zones → 0028 phase_d_growth → 0029 order_coupon。均在 `deploy/deploy-shop-on-vps.sh` 循环列表中。

---

## 4. 商城后台 v2 分期 — 实际进度（更新 roadmap 文档前以此为准）

| Phase | 计划文档状态 | **实际（2026-07-09）** |
|-------|----------------|------------------------|
| **A 基座** | ✅ #239 | 不变 |
| **B 内容与多语言** | 文档写「待做」 | ** largely done**：#241 PDP/CMS 4 语 + admin 原生内容编辑；#245 列表/轮播收尾。**未做：B′** |
| **B′ 媒体 R2/CDN** | 推迟 | **仍推迟**（用户明确与服务器迁移同期） |
| **C 履约运营** | 文档写「待做」 | **✅ #246** 订单筛选/批量/CSV、运费模板、路由迁移 |
| **D 增长** | 文档写「待做」 | **✅ #247** 权限、UGC 评价、促销/coupon admin；**#248** 结账侧消费 coupon |
| **结账优惠码** | — | **✅ #248**（mock 支付路径已通） |

建议下一 agent 将 `docs/plans/shop-admin-redesign-v2.md` §七状态表同步为上述 reality（非阻塞文档债）。

---

## 5. 未完成 / 待续工作

### 5.1 商城与结账（优先级中高）

| 项 | 说明 | 涉及 |
|----|------|------|
| **Stripe 结账 + 优惠码** | 当前 mock 支付用 DB `amountCents`（已含折扣）；`PAYMENT_MODE=stripe` 时是否同步 Stripe Checkout 金额/coupon **未做** | shop `/api/pay`、shared payments |
| **配送步骤显示优惠码** | 可选：仅在支付步有 `CheckoutCouponForm`；用户未要求但 conversation 曾列为 optional | shop checkout |
| **优惠码 E2E 生产抽检** | admin 建券 → 结账 apply → mock pay → 查 `coupons.used_count`；**未在本会话写自动化** | 手工 QA |
| **Phase B′ R2/CDN** | Cloudflare R2 + CDN；**明确推迟** | deploy、cms |

### 5.2 多语言第一期后续

| 项 | 说明 |
|----|------|
| **重新开放 zh-TW + T2** | `packages/i18n` 保留 `FUTURE_LOCALES`；message JSON 仍在仓库；恢复时扩 `PHASE_1_LOCALES`、main routing、admin Tab |
| **CMS BaziFeed/ZiweiFeed** | select 仍含 zh-TW enum 值；DB 旧数据保留，UI 已 3 语 |
| **platform-roadmap / ui-status** | 仍写「12 语 / 4 语 T1」，与第一期策略不一致，宜更新 |

### 5.3 导航 / App Shell

| 项 | 说明 |
|----|------|
| **tarot `/crystal/[sku]`** | `APP_SUBPAGE_PREFIXES.tarot` 含 `/crystal`，详情页有 `orasage-subpage-back-local`，**可能与 shop 修复前同类双层返回**；shop 已修，tarot 未专门改 |
| **deploy 脚本健壮性** | 建议 `deploy-shop-on-vps.sh` 构建前 `sudo rm -rf main/.next shop/.next`（属主问题） |

### 5.4 环境与通知（自 07-08 handoff，未验证今日是否已配）

| 变量 | 用途 |
|------|------|
| `TELEGRAM_BOT_TOKEN` / `TELEGRAM_CHAT_ID` | 订单 Telegram 通知（#235） |
| `RESEND_API_KEY` / `ORDER_NOTIFY_EMAIL_TO` | 订单邮件通知 |

### 5.5 仓库内其它 **Open/Draft PR**（非今日主线，勿误合并）

| PR | 状态 | 说明 |
|----|------|------|
| #240 | DRAFT | UI/UX Pro Max skill |
| #197 | DRAFT | shop DIY 静态原型 |
| #190 | DRAFT | ziwei 51 万样本 AI |
| #80 | OPEN | DS v1.1 文档清理 |
| #71 | OPEN | bazi DS v1.1 |
| #10 | OPEN | CMS DATABASE_URL deploy fix |
| 更早 #2–#139 等 | DRAFT | 历史分支，见 `gh pr list` |

---

## 6. 关键架构速查（今日变更相关）

### 6.1 结账优惠码（#248）

```
shop CheckoutCouponForm → POST/DELETE /api/orders/:orderNo/coupon
  → auth internal /internal/orders/:orderNo/coupon
  → user_orders.coupon_code, subtotal_cents, amount_cents
支付：shop /api/pay → PATCH internal order status=paid
  → finalizeCouponOnPaid → coupons.used_count++
```

- 仅 `appSource=shop`；命理数字报告结账不显示优惠码 UI。
- 迁移：`auth-service/drizzle/0029_order_coupon.sql`

### 6.2 第一期语言（#249）

- 单一真相：`packages/i18n/src/locales.ts` → `PHASE_1_LOCALES = ['zh-CN','en','pt-BR']`
- `normalizeLocale` / `toCoreLocale`：zh-TW→zh-CN，其它 T2→en
- main：`main/src/middleware.ts` 对废弃 locale 路径 308

### 6.3 商店返回（#251）

- `shouldShowAppShellPageBack()` 读 `APP_SUBPAGE_PREFIXES`
- shop 前缀：**`/cart`、`/checkout`、`/success` only**
- 商品/DIY/地址/订单：**页面内**「返回商城」，无 AppShell 顶栏返回

---

## 7. 本地验证命令

```bash
# auth-service
cd auth-service && npm run build

# shop / admin / main（需 JWT_SECRET）
cd shop && JWT_SECRET='dev-test-secret-min-32-characters-long' npm run build
cd admin && JWT_SECRET='...' npm run build
cd main && npm run build

# app-shell 同步
npm run app-shell:sync

# bazi / ziwei（改 i18n 后）
cd bazi/client && pnpm run build
cd ziwei && npm run build
```

无 repo 级自动化测试套件；合入前至少跑受影响 app 的 `build` / `tsc`。

---

## 8. 建议下一 Agent 起手任务（按优先级）

1. **更新** `docs/plans/shop-admin-redesign-v2.md` Phase 状态表 + 第一期语言说明。
2. **Stripe + 优惠码**（若用户要上真实支付）：核对 webhook 与 `amount_cents` 一致性。
3. **生产抽检清单**：优惠码 used_count、三语 switcher、商店 PDP/DIY 单返回、admin 促销/评价 CRUD。
4. **tarot crystal 页返回**是否与 shop 同类问题（快速 grep `orasage-subpage-back-local` + `/crystal`）。
5. **deploy 脚本** `.next` 权限与 tar 部署失败 fallback 文档化或修脚本。
6. **B′ R2/CDN**：等用户/server 迁移窗口，勿提前做。

---

## 9. 今日合并 commit 锚点（便于 bisect）

```
bc43fc2  Merge #251  shop back dedupe
a887970  Merge #250  bazi/ziwei locale fix
07d5a93  Merge #249  phase 1 locales
74cdf8e  Merge #248  checkout coupon
5d119f1  Merge #247  phase D
adc2ba4  Merge #246  phase C
d42c519  Merge #245  phase B wrap-up
```

---

*文档生成：2026-07-09 Cloud Agent 会话收尾。*
