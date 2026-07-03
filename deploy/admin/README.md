# Admin 商品/订单后台

管理地址：**https://admin.orasage.com**（需 `role=admin` 账号）

## 架构

- **商品数据源**：PostgreSQL `products` 表（auth-service）
- **公开 API**：`GET https://auth.orasage.com/api/products`
- **商城**：shop 从 auth 内网拉取商品，不再硬编码
- **推荐统一**：五行 → SKU 映射（`crystal-wood` 等），bazi / tarot / main 跳转 shop 同一商品

## VPS 部署

```bash
cd /opt/orasage
git pull origin main

# 1. 迁移 auth 数据库（products 表 + 种子数据）
cd auth-service && npm ci && npm run db:migrate

# 2. 重启服务
sudo systemctl restart orasage-auth orasage-shop orasage-admin

# 3. 验证
curl -s https://auth.orasage.com/api/products | head -c 200
curl -sI https://admin.orasage.com/products
```

## 管理员账号

在 PostgreSQL 中将用户设为 admin：

```bash
psql "$DATABASE_URL" -c "UPDATE users SET role='admin' WHERE email='你的邮箱';"
```

然后登录 https://auth.orasage.com/login?redirect=https://admin.orasage.com

## Admin 功能

| 页面 | 功能 |
|------|------|
| `/` | 用户/订单/测算/商品统计 |
| `/products` | 商品 CRUD（SKU、价格、上下架） |
| `/orders` | 订单列表与状态更新 |

## 统一推荐 SKU

| 五行 | SKU |
|------|-----|
| 木 | crystal-wood |
| 火 | crystal-fire |
| 土 | crystal-earth |
| 金 | crystal-metal |
| 水 | crystal-water |

bazi 测算推荐、tarot 水晶页、main 门户商品区均链接到 `shop.orasage.com?sku=...`。
