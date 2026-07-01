# OraSage Shop Service

命理融合电商平台的商城服务，运行于 `shop.orasage.com`（端口 3102）。

## 架构

```
┌─────────────────────────────────────────────────────────────┐
│  shop.orasage.com :3102 (Next.js 15)                        │
├─────────────────────────────────────────────────────────────┤
│  公网 API                                                    │
│    GET  /api/products          商品列表                       │
│    POST /api/checkout          用户结账（需 JWT）              │
│    POST /api/webhook           Stripe Webhook                │
│    GET  /api/orders            用户订单（需 JWT）              │
├─────────────────────────────────────────────────────────────┤
│  内网 API（仅 127.0.0.1）                                     │
│    POST /api/internal/checkout  命理 App 发起结账              │
├─────────────────────────────────────────────────────────────┤
│  BullMQ Worker                                               │
│    fulfill-order → 发放权益 + 回调 bazi/ziwei/tarot          │
└─────────────────────────────────────────────────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
   PostgreSQL            Redis              Stripe API
   (orasage_shop)       (BullMQ)
```

## 数据模型

| 表 | 说明 |
|----|------|
| `products` | 商品（数字报告、会员、周边） |
| `orders` | 订单，含 `recommendationContext` |
| `order_items` | 订单明细 + 商品快照 |
| `entitlements` | 用户权益（购买后发放） |
| `stripe_events` | Webhook 幂等记录 |

## 快速开始

```bash
cd shop-service
cp .env.example .env

# 启动 PostgreSQL + Redis
docker compose up -d

# 安装依赖
npm install

# 推送 schema + 种子数据
npm run db:push
npm run db:seed

# 开发（端口 3102）
npm run dev

# 另开终端：启动 fulfillment worker
npm run worker
```

本地 hosts 参考根目录 `docs/domain-setup.md`。

## 内网结账示例（bazi 后端调用）

```bash
curl -X POST http://127.0.0.1:3102/api/internal/checkout \
  -H 'Content-Type: application/json' \
  -d '{
    "userId": 1,
    "sourceApp": "bazi",
    "items": [{ "productId": 1, "quantity": 1 }],
    "recommendationContext": {
      "reason": "命盘显示财运旺盛",
      "chartId": "abc123"
    }
  }'
```

## 生产部署

```bash
npm run build
npm run start          # 监听 127.0.0.1:3102
npm run worker         # 独立进程
```

Nginx 反向代理见 `deploy/nginx/orasage.conf`。

Stripe Webhook URL：`https://shop.orasage.com/api/webhook`

## 环境变量

见 `.env.example`。`JWT_SECRET` 必须与 `auth-service` 一致。

未配置 `STRIPE_SECRET_KEY` 时，结账进入 mock 模式（开发用）。
