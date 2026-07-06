# 商店升级 — 全量回归测试矩阵

> **规则（决策 #7）**：凡改动牵涉下表「受影响模块」列中出现的项，合入前必须跑完对应 **必跑** 用例；仅改 `shop/` 且未改 `shared/` 时，至少跑 **Shop 必跑** + **Smoke**。

## 执行入口

```bash
cd scripts/e2e
npm install
npm run test:smoke-all    # 全量 smoke（推荐每次跨模块 PR）
```

分项：

| 命令 | 覆盖 |
|------|------|
| `npm run test:shop-flow` | 主站 Profile + bazi 购买 |
| `npm run test:shop-crystal` | 水晶实体流 |
| `npm run test:platform-report` | 跨 App checkout API |
| `npm run test:ziwei-flow` | 紫微购买 |
| `npm run test:shop-security` | 结账安全 |
| `npm run test:temple-flow` | 祈福（若动 tarot 结账/功德） |

构建检查：

```bash
cd shop && npm run build
cd main && npm run build
cd auth-service && npm run build
cd tarot && npx tsc --noEmit   # 若改 shared/shop-checkout
```

## 按 Phase 必跑

### Phase 0

| ID | 场景 | 类型 |
|----|------|------|
| P0-01 | 游客首页点购买 → `/checkout?sku=` → 邮箱注册/已存在绑定 | 手动 + shop-crystal |
| P0-02 | 登录用户购买水晶 → 真实 ShippingForm → mock 支付 | shop-crystal |
| P0-03 | bazi 报告购买 → 自动解锁（无实体） | shop-flow / platform-report（使用 `*-basic` 数字 SKU） |
| P0-04 | bazi 含实体 SKU → 必须真实地址（非假地址） | 手动 |
| P0-05 | main profile 订单列表地址可读 | 手动 |
| P0-06 | `?sku=` 首页滚动定位 | 手动 |
| P0-07 | shop `/checkout` 移动端返回栏 | 手动 |
| P0-08 | tarot 乐捐 checkout | platform-report |
| P0-09 | 全站 smoke | test:smoke-all |

### Phase 1（预留）

P0 全部 + 购物车增删改、PDP、CMS 商品图加载、main 首页链 PDP

### Phase 2

P1 全部 + 地址簿、发货录入、物流时间线、情侣装 1/2 人切换（Stripe 生产暂缓）

## 受影响模块 → 必跑映射

| 改动路径 | 必跑 |
|----------|------|
| `shop/**` | shop-crystal, shop-flow, smoke-all |
| `shared/shop-checkout/**` | platform-report, shop-flow, ziwei-flow, tarot checkout |
| `shared/shop-fulfillment/**` | shop-crystal, shop-flow, admin 订单页抽检 |
| `auth-service` 订单/商品/用户 | platform-report, shop-flow, smoke-all |
| `main` profile/首页商品 | shop-flow, 手动首页 |
| `bazi/**` checkout | shop-flow, platform-report |
| `ziwei/**` checkout | ziwei-flow |
| `tarot/**` checkout/乐捐 | platform-report, temple-flow |
| `cms` 商品图 | shop build + 手动 PDP |
| `shared/app-shell/**` | 各 App 顶栏/底栏抽检 + smoke |

## PR 检查清单（复制到 PR）

- [ ] 已列出受影响模块
- [ ] 已跑构建（见上表）
- [ ] 已跑对应 E2E / 手动用例
- [ ] 未在范围外的全站能力回归（导航、登录、祈福、Hero）
