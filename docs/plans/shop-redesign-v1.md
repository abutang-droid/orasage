# OraSage 商店模块升级方案 v1（已确认）

> 状态：决策已锁定 · 实施节奏 Phase 0 → 1 → 2  
> 关联测试：`docs/testing/shop-redesign-regression.md`

## 一、已确认决策

| # | 议题 | 决定 |
|---|------|------|
| 1 | 购物车与登录 | **加购免登录**；结账前登录。检测到邮箱未注册时，**询问是否同意用该邮箱直接注册**，降低跳出率 |
| 2 | 配送范围 | **一期全球配送**（UI/地址结构预留国家字段；运费规则可分期细化） |
| 3 | 商品图 | **CMS 管理**（Payload Media 关联 SKU 或商品扩展字段） |
| 4 | 情侣装 | **一单两人地址**；可切换为 **仅 1 人地址** |
| 5 | 支付 | **Stripe 生产与实体物流同 Phase（Phase 2）**；Phase 0–1 可继续 mock 但禁止假地址/假支付捷径 |
| 6 | 节奏 | **同意 Phase 0 → 1 → 2** |
| 7 | 跨模块改动 | **每次牵涉其它模块的改动，必须执行全量回归测试**（见测试矩阵） |

## 二、分阶段路线

### Phase 0 — 基础修复（当前）

- 修复首页购买断链：游客 → `/checkout?sku=`，邮箱注册/绑定低摩擦
- 实体商品禁止 mock 直付、禁止报告流注入假地址（数字品保留快路径）
- `?sku=` 深链滚动定位
- `/checkout` 移动子页返回导航
- 主站订单列表友好展示收货地址

**不涉及**：购物车、PDP、新表结构、Stripe 实体、CMS 商品图

### Phase 1 — 商店 MVP

- PDP `/product/[sku]`
- 购物车（游客 localStorage + 登录同步）
- 结账三步 UI
- 首页合集布局升级
- CMS 商品主图字段 + 展示

### Phase 2 — 地址 · 物流 · Stripe 实体

- `user_addresses` 地址簿
- `order_shipments` + admin 发货
- 订单详情 + 物流时间线
- **全球配送**运费规则
- **Stripe 生产**（实体 + 数字）
- 情侣装：1 人 / 2 人地址切换

## 三、目标架构（摘要）

```
浏览（首页/合集/PDP）→ 购物车 → 结账（联系/配送/支付）→ 成功 → 订单详情/物流
         ↑
命理 App 深链（保留 shared/shop-checkout，数字品快路径）
```

数据扩展见 Phase 1–2：`order_line_items`、`user_addresses`、`order_shipments`、`products.imageUrl`（CMS）等。

## 四、跨模块触点

| 模块 | 关联 |
|------|------|
| `auth-service` | 订单、商品、地址簿（P2）、用户注册 |
| `shop` | 前台主战场 |
| `shared/shop-checkout` | bazi/ziwei/tarot/main 代理结账 |
| `shared/shop-fulfillment` | 物流推断、地址 JSON |
| `main` | 首页商品区、profile/orders |
| `admin` | 商品、订单发货 |
| `cms` | Shop Hero、商品图（P1） |
| `deploy/` | shop/main/auth 部署 |

## 五、文档维护

- 每 Phase 合入前更新本文件「当前 Phase」状态
- PR 描述必须链接测试矩阵执行结果
