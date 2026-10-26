# OraSage 本地完整开发环境

一键在本机跑齐 8 个 App + PostgreSQL + MariaDB。

## 前置条件

- Node.js ≥ 20
- `pnpm`（bazi 用，`corepack enable` 可启用）
- PostgreSQL 16、MariaDB（Ubuntu: `sudo apt install postgresql-16 mariadb-server`）
- `tmux`（多进程管理）

## 快速开始

```bash
# 1. 初始化（数据库、.env、依赖、schema）— 首次约 5–15 分钟
bash scripts/local-dev/setup.sh

# 2. 启动全部服务（tmux 开发模式）
bash scripts/local-dev/start.sh

# 3. 健康检查（CMS 首次编译约需 15–30 秒，可稍等重试）
bash scripts/local-dev/smoke.sh

# 停止
bash scripts/local-dev/stop.sh
```

## 访问地址

| 服务 | URL |
|------|-----|
| 主门户 | http://localhost:3100 |
| 认证 | http://localhost:3101 |
| 商城 | http://localhost:3102 |
| 运营后台 | http://localhost:3103 |
| 八字 | http://localhost:3110 |
| 紫微 | http://localhost:3111 |
| 塔罗 | http://localhost:3112 |
| CMS | http://localhost:3120/admin |

## 本地账号

### 平台用户（auth）

```bash
curl -s -X POST http://localhost:3101/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@local.test","password":"LocalTest2026!","nickname":"本地管理员"}'
```

设为 admin：

```bash
PGPASSWORD=orasage_local_dev psql postgresql://orasage@127.0.0.1:5432/orasage_auth \
  -c "UPDATE users SET role='admin' WHERE email='admin@local.test';"
```

登录：http://localhost:3101/login（Cookie `domain=localhost`，请用 **localhost** 而非 127.0.0.1 访问各站）

若 Cookie 不生效，从注册/登录 JSON 响应取 `token`，请求头加 `Authorization: Bearer <token>`。

### CMS 编辑

首次打开 http://localhost:3120/admin 创建 Payload 管理员（与 auth 账号独立）。

## 默认密钥（仅本地）

| 变量 | 值 |
|------|-----|
| `JWT_SECRET` | `orasage-local-dev-secret-key-32chars!` |
| `PAYLOAD_SECRET` | `orasage-local-payload-secret-32chars!!` |
| Postgres | `orasage` / `orasage_local_dev` |
| MySQL | `orasage` / `orasage_local_dev` |

## 支付测试

`PAYMENT_MODE=mock`（默认）：shop 结账后访问  
`http://localhost:3102/api/pay?order=<orderNo>`（需登录且订单属于当前用户）。

## 常见问题

| 问题 | 处理 |
|------|------|
| PostgreSQL 未启动 | `sudo pg_ctlcluster 16 main start` |
| MariaDB 未启动 | `sudo service mariadb start` |
| 端口占用 | `ss -tlnp \| grep 310` 查进程后 kill |
| CMS migrate 失败 | 确认 `orasage_cms` 库存在，重跑 setup |
| bazi 启动慢 | 首次 `pnpm dev` 会编译，等窗口日志出现 listening |

## tmux 操作

```bash
tmux -f /exec-daemon/tmux.portal.conf attach -t orasage-local
# Ctrl+B 然后按数字切换窗口
```
