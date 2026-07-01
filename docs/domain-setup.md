# OraSage 域名配置 — 方案 B（子域名）

> 使用 `orasage.com` 子域名架构，各 App 独立部署，无需 Next.js basePath。

## 域名映射

| 子域名 | App | 端口 | 说明 |
|--------|-----|------|------|
| `orasage.com` | main | 3100 | 主门户（12 语言） |
| `www.orasage.com` | — | — | 301 重定向到 `orasage.com` |
| `auth.orasage.com` | auth | 3101 | 统一认证中心 |
| `shop.orasage.com` | shop | 3102 | 商城 + Stripe |
| `admin.orasage.com` | admin | 3103 | 管理后台 SPA |
| `bazi.orasage.com` | bazi | 3110 | 八字排盘 |
| `ziwei.orasage.com` | ziwei | 3111 | 紫微斗数 |
| `tarot.orasage.com` | tarot | 3112 | 塔罗占卜 |
| `cms.orasage.com` | cms | 3120 | Payload CMS |

VPS：`34.75.40.67`（GCP e2-standard-2）

---

## 一、DNS 配置

在域名注册商（Cloudflare / Google Domains 等）添加以下记录：

```
类型    名称      值              TTL     说明
────────────────────────────────────────────────────
A       @         34.75.40.67     300     主门户
A       www       34.75.40.67     300     www 重定向
A       auth      34.75.40.67     300     认证中心
A       shop      34.75.40.67     300     商城
A       admin     34.75.40.67     300     管理后台
A       bazi      34.75.40.67     300     八字
A       ziwei     34.75.40.67     300     紫微
A       tarot     34.75.40.67     300     塔罗
A       cms       34.75.40.67     300     CMS
```

**通配符简化（可选）：**

```
A    *    34.75.40.67    # 一条覆盖所有子域，配合通配符 SSL
```

验证：

```bash
dig +short orasage.com
dig +short auth.orasage.com
dig +short bazi.orasage.com
# 均应返回 34.75.40.67
```

---

## 二、SSL 证书

### 方式一：逐个域名（certbot nginx 插件）

```bash
sudo certbot --nginx \
  -d orasage.com \
  -d www.orasage.com \
  -d auth.orasage.com \
  -d shop.orasage.com \
  -d admin.orasage.com \
  -d bazi.orasage.com \
  -d ziwei.orasage.com \
  -d tarot.orasage.com \
  -d cms.orasage.com
```

### 方式二：通配符证书（推荐，需 DNS challenge）

```bash
# Cloudflare 用户
sudo certbot certonly --dns-cloudflare \
  --dns-cloudflare-credentials /etc/letsencrypt/cloudflare.ini \
  -d orasage.com \
  -d '*.orasage.com'
```

证书路径：`/etc/letsencrypt/live/orasage.com/fullchain.pem`

自动续期：

```bash
sudo certbot renew --dry-run
```

---

## 三、Nginx 配置

完整配置见 [`deploy/nginx/orasage.conf`](../deploy/nginx/orasage.conf)。

核心结构：每个子域一个 `server` block，反向代理到对应本地端口。

```nginx
# 示例：bazi.orasage.com
server {
    listen 443 ssl http2;
    server_name bazi.orasage.com;

    ssl_certificate     /etc/letsencrypt/live/orasage.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/orasage.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3110;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

部署：

```bash
sudo cp deploy/nginx/orasage.conf /etc/nginx/sites-available/orasage
sudo ln -sf /etc/nginx/sites-available/orasage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 四、跨子域认证

### Cookie 配置（推荐方式）

auth 服务登录成功后设置：

```typescript
res.cookie('orasage_token', token, {
  domain: '.orasage.com',   // 点前缀，所有子域共享
  path: '/',
  httpOnly: true,
  secure: true,             // 生产 HTTPS 必须 true
  sameSite: 'lax',
  maxAge: 30 * 24 * 60 * 60 * 1000,
});
```

示例代码见 [`deploy/auth/cookie.example.ts`](../deploy/auth/cookie.example.ts)。

### 登录流程

```
1. 用户在 bazi.orasage.com 点「登录」
2. 302 → https://auth.orasage.com/login?redirect=https://bazi.orasage.com
3. 用户输入邮箱密码，auth 验证通过
4. 写入 orasage_token cookie（domain=.orasage.com）
5. 302 → https://bazi.orasage.com（redirect 参数）
6. bazi middleware 读 cookie → 调 auth /verify 或本地 jose 验签 → req.userId
```

### 各 App 登录跳转 URL

| App | 登录跳转 |
|-----|---------|
| bazi | `https://auth.orasage.com/login?redirect=https://bazi.orasage.com` |
| ziwei | `https://auth.orasage.com/login?redirect=https://ziwei.orasage.com` |
| tarot | `https://auth.orasage.com/login?redirect=https://tarot.orasage.com` |
| shop | `https://auth.orasage.com/login?redirect=https://shop.orasage.com` |

### JWT 共享

所有 App 使用**同一个 `JWT_SECRET`**，由 auth 服务签发，各 App middleware 本地验签：

```env
JWT_SECRET=<同一个密钥，至少 32 字符>
JWT_COOKIE_NAME=orasage_token
JWT_COOKIE_DOMAIN=.orasage.com
```

### 登出

```typescript
// auth 服务 /auth/logout
res.clearCookie('orasage_token', {
  domain: '.orasage.com',
  path: '/',
});
```

---

## 五、服务间内网通信

对外只暴露各子域 HTTPS；App 间 API 走 `127.0.0.1`，不经过公网。

```
bazi 后端 → shop 结账:
  POST http://127.0.0.1:3102/api/checkout

bazi 后端 → auth 验签/查档案:
  GET  http://127.0.0.1:3101/verify
  GET  http://127.0.0.1:3101/auth/me

shop webhook 处理完 → 通知 bazi 生成报告:
  POST http://127.0.0.1:3110/internal/report-job
```

**安全建议：** shop、auth 的管理 API 只监听 `127.0.0.1`，Nginx 不对外暴露 `/internal/*` 路由。

---

## 六、支付与 Webhook

| 端点 | 公网 URL |
|------|---------|
| Stripe Webhook | `https://shop.orasage.com/api/webhook` |
| 商品列表 | `https://shop.orasage.com/api/products` |
| 创建结账 | 各 App 内网调 `http://127.0.0.1:3102/api/checkout` |

Stripe Dashboard 配置 Webhook URL 为 `https://shop.orasage.com/api/webhook`。

---

## 七、本地开发

### /etc/hosts

```
127.0.0.1  orasage.localhost
127.0.0.1  auth.orasage.localhost
127.0.0.1  bazi.orasage.localhost
127.0.0.1  ziwei.orasage.localhost
127.0.0.1  tarot.orasage.localhost
127.0.0.1  shop.orasage.localhost
```

### 开发环境变量

```env
NODE_ENV=development
JWT_COOKIE_DOMAIN=.orasage.localhost
AUTH_URL=http://auth.orasage.localhost:3101
SHOP_INTERNAL_URL=http://127.0.0.1:3102
```

开发时 Cookie `secure: false`，`domain: '.orasage.localhost'`。

---

## 八、从 c2.pub 迁移

当前 `c2.pub`（WordPress + WooCommerce）与 bazi 已打通。迁移建议：

| 阶段 | 动作 | 影响 |
|------|------|------|
| 1 | 配 DNS + SSL + 部署 auth.orasage.com | 无，并行 |
| 2 | bazi.orasage.com 新旧并行，改登录跳 auth | bazi 用户 |
| 3 | tarot / ziwei 同样并行迁移 | 各 App 用户 |
| 4 | 部署 shop.orasage.com，各 App 接 shop API | 支付链路 |
| 5 | c2.pub 设 301 到 orasage.com，或保留为备用收银台 | 主站流量 |

**新旧并行：** 旧地址继续跑，新子域验证通过后再切换 DNS 或下线旧服务。

---

## 九、配置检查清单

- [ ] DNS：9 条 A 记录（或通配符 `*`）指向 `34.75.40.67`
- [ ] SSL：`orasage.com` + `*.orasage.com` 证书有效
- [ ] Nginx：每个子域 server block + HTTP→HTTPS 重定向
- [ ] auth Cookie：`domain=.orasage.com`, `path=/`, `secure=true`
- [ ] 所有 App 共享同一 `JWT_SECRET`
- [ ] 各 App 删除 `basePath` 配置（tarot 重点检查）
- [ ] shop/auth 内网 API 只监听 `127.0.0.1`
- [ ] Stripe Webhook 指向 `shop.orasage.com`
- [ ] 登录 redirect 使用完整 `https://` URL

---

## 十、与方案 A 的差异

| 维度 | 方案 A（路径） | 方案 B（子域名，当前） |
|------|---------------|----------------------|
| 访问 | `orasage.com/bazi` | `bazi.orasage.com` |
| basePath | 需要 | **不需要** |
| Cookie | `.orasage.com` + `path=/` | `.orasage.com` + `path=/` |
| 登录 redirect | `?redirect=/bazi` | `?redirect=https://bazi.orasage.com` |
| 故障隔离 | 单 nginx 配置 | 各子域独立 server block |
| tarot 迁移 | 需删 basePath 或踩坑 | 直接部署，无 basePath 问题 |
