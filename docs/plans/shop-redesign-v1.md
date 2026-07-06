# OraSage 商店模块升级方案 v1（已确认）

> 状态：Phase 2 进行中（Stripe 生产暂缓，继续 mock 支付）  
> 关联测试：`docs/testing/shop-redesign-regression.md`

## 一、已确认决策

| # | 议题 | 决定 |
|---|------|------|
| 1 | 购物车与登录 | **加购免登录**；结账前登录。检测到邮箱未注册时，**询问是否同意用该邮箱直接注册**，降低跳出率 |
| 2 | 配送范围 | **一期全球配送**（UI/地址结构预留国家字段；运费规则可分期细化） |
| 3 | 商品图 | **CMS 管理**（Payload Media 关联 SKU 或商品扩展字段） |
| 4 | 情侣装 | **一单两人地址**；可切换为 **仅 1 人地址** |
| 5 | 支付 | **Stripe 生产暂缓**（未拿到支付方正式接口）；Phase 2 继续 **mock 支付**，禁止假地址捷径 |
| 6 | 节奏 | **同意 Phase 0 → 1 → 2** |
| 7 | 跨模块改动 | **每次牵涉其它模块的改动，必须执行全量回归测试**（见测试矩阵） |

## 二、分阶段路线

### Phase 0 — 基础修复（已完成）

- 修复首页购买断链：游客 → `/checkout?sku=`，邮箱注册/绑定低摩擦
- 实体商品禁止 mock 直付、禁止报告流注入假地址（数字品保留快路径）
- `?sku=` 深链滚动定位
- `/checkout` 移动子页返回导航
- 主站订单列表友好展示收货地址

### Phase 1 — 商店 MVP（已完成）

- PDP `/product/[sku]`
- 购物车（游客 localStorage + 登录同步待完善）
- 结账三步 UI（联系 / 配送 / 支付步骤条）
- 首页合集布局升级（精选 + 分类区块）
- CMS 商品主图 collection `shop-product-images` + 展示

### Phase 2 — 地址 · 物流（进行中）

- `user_addresses` 地址簿（`/account/addresses`）
- `order_shipments` + admin 发货录入
- 订单详情 `/orders/[orderNo]` + 物流时间线
- **全球配送**运费规则（国家字段 + 境内免邮/境外 flat rate）
- 情侣装：1 人 / 2 人地址切换（checkout UI）
- ~~Stripe 生产~~ → **暂缓**，保持 `PAYMENT_MODE=mock`

## 三、目标架构（摘要）

```
浏览（首页/合集/PDP）→ 购物车 → 结账（联系/配送/支付）→ 成功 → 订单详情/物流
         ↑
命理 App 深链（保留 shared/shop-checkout，数字品快路径）
```

数据扩展：`user_addresses`、`order_shipments`、`order_shipment_events`、`products.imageUrl`（CMS）等。

## 四、跨模块触点

| 模块 | 关联 |
|------|------|
| `auth-service` | 订单、商品、地址簿、发货记录 |
| `shop` | 前台主战场 |
| `shared/shop-checkout` | bazi/ziwei/tarot/main 代理结账 |
| `shared/shop-fulfillment` | 物流推断、地址 JSON、运费规则 |
| `main` | 首页商品区、profile/orders 物流链接 |
| `admin` | 商品、订单发货 |
| `cms` | Shop Hero、商品图 |
| `deploy/` | shop/main/auth 部署 |

## 五、文档维护

- 每 Phase 合入前更新本文件「当前 Phase」状态
- PR 描述必须链接测试矩阵执行结果
