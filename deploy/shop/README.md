# Shop 部署

## VPS 部署步骤

```bash
# 1. 同步代码到 /opt/orasage/shop
cd /opt/orasage/shop && npm install && npm run build

# 2. 环境变量（/opt/orasage/.env 需包含）
# JWT_SECRET=<与 auth 相同>
# AUTH_INTERNAL_URL=http://127.0.0.1:3101
# SHOP_URL=https://shop.orasage.com
# STRIPE_SECRET_KEY=sk_...（可选，未配置则使用演示支付）

# 3. auth 数据库迁移（新增 shop app_source）
psql orasage_auth -f /opt/orasage/auth-service/drizzle/0002_add_shop_source.sql

# 4. 重启 auth + 启动 shop
sudo systemctl restart orasage-auth
sudo cp deploy/shop/orasage-shop.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now orasage-shop

# 5. 验证
curl -s http://127.0.0.1:3102/api/health
curl -sI https://shop.orasage.com
```

## 内网结账 API（供八字/紫微/塔罗调用）

```bash
POST http://127.0.0.1:3102/api/checkout
Content-Type: application/json

{
  "userId": 1,
  "items": [{ "sku": "crystal-wood", "quantity": 1 }],
  "appSource": "bazi",
  "successUrl": "https://bazi.orasage.com/success"
}
```

支付完成后订单自动同步到 `auth.orasage.com/center` → 我的订单。

## Stripe（生产）

1. 在 Stripe Dashboard 配置 Webhook：`https://shop.orasage.com/api/webhook`
2. 事件：`checkout.session.completed`
3. 设置 `STRIPE_SECRET_KEY` 和 `STRIPE_WEBHOOK_SECRET`
