# 命理 App 源码接入指南

将 `bazi-calculator`、`ziwei-doushu`、`tarot-mind` 三个独立仓库接入 OraSage 平台。

## 仓库地址

| App | 仓库 | 端口 |
|-----|------|------|
| bazi | https://github.com/abutang-droid/bazi-calculator | 3110 |
| ziwei | https://github.com/abutang-droid/ziwei-doushu | 3111 |
| tarot | https://github.com/abutang-droid/tarot-mind | 3112 |

## 1. 同步源码到 monorepo

```bash
bash scripts/sync-fortune-repos.sh
# 或单独同步
bash scripts/sync-fortune-repos.sh bazi
```

同步后目录结构：

```
bazi/          # Vite + Express + tRPC
ziwei/         # Next.js + iztro
tarot/         # Next.js + Prisma
packages/orasage-auth/   # 共享 JWT 库
```

## 2. 代码审查清单

接入时重点检查：

### 结构

- [ ] 删除或禁用独立登录/注册页面，改跳 `auth.orasage.com`
- [ ] 移除 `basePath`（子域名架构不需要）
- [ ] 提供 `GET /health` 返回 200
- [ ] 生产环境监听 `127.0.0.1:<port>`（由 Nginx 反代）

### 安全

- [ ] `/internal/*` 路由仅允许 `127.0.0.1`
- [ ] 不在前端暴露 `JWT_SECRET`
- [ ] SQL/Prisma 查询参数化，无字符串拼接
- [ ] 登录 redirect 白名单校验（参考 `deploy/auth/cookie.example.ts`）

### 正确性

- [ ] 用户 ID 与 auth-service `users.id` 对齐（JWT `sub` 字段）
- [ ] 旧用户迁移策略（如有本地用户表，需映射或合并）
- [ ] 时区/历法计算回归测试（bazi/ziwei 核心逻辑）

## 3. 统一 JWT 登录

### 共享环境变量

```env
JWT_SECRET=<与 auth-service 相同>
JWT_COOKIE_NAME=orasage_token
JWT_COOKIE_DOMAIN=.orasage.com
AUTH_URL=https://auth.orasage.com
AUTH_INTERNAL_URL=http://127.0.0.1:3101
```

### 接入 @orasage/auth

在各 App `package.json`：

```json
"@orasage/auth": "file:../packages/orasage-auth"
```

**Express（bazi）**：见 `packages/orasage-auth/README.md`

**Next.js（ziwei / tarot）**：

```typescript
import { getOrasageUser, loginUrl } from '@orasage/auth/next';
```

### 登录按钮

```typescript
// bazi
href="https://auth.orasage.com/login?redirect=https://bazi.orasage.com"

// ziwei
href="https://auth.orasage.com/login?redirect=https://ziwei.orasage.com"

// tarot
href="https://auth.orasage.com/login?redirect=https://tarot.orasage.com"
```

### 用户数据迁移

auth-service 的 `users` 表是权威来源。命理 App 本地用户表应：

1. 废弃独立密码字段
2. 用 `user_id`（auth users.id）作外键
3. 测算记录 `readings` 通过 auth `/internal/readings` 或本地表 + `user_id` 关联

## 4. Native 自托管部署

默认已从 `proxy` 切到 `native` + `systemd`（与 main/shop 一致）。

### VPS 一键部署

```bash
# bazi
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=native bash deploy/remote-deploy-bazi.sh

# ziwei
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=native bash deploy/remote-deploy-ziwei.sh

# tarot
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=native bash deploy/remote-deploy-tarot.sh
```

### GitHub Actions

在仓库 Secrets 配置：

- `SSH_PRIVATE_KEY` — VPS SSH 私钥
- `BAZI_REPO_URL` / `ZIWEI_REPO_URL` / `TAROT_REPO_URL`（可选，脚本已有默认值）
- `JWT_SECRET` — 与 VPS `/opt/orasage/.env` 一致

手动触发 `Deploy Bazi` / `Deploy Ziwei` / `Deploy Tarot` workflow，`deploy_mode=native`。

### Docker 回退

若某 App 仅有 Dockerfile 无 npm start：

```bash
NATIVE_RUNTIME=docker DEPLOY_MODE=native bash deploy/remote-deploy-bazi.sh
```

## 5. 端到端验证

```bash
# 健康检查
curl -s https://bazi.orasage.com/health
curl -s https://ziwei.orasage.com/health
curl -s https://tarot.orasage.com/health

# 登录流（浏览器）
# 1. 访问 bazi.orasage.com → 点登录 → auth.orasage.com
# 2. 注册/登录 → 跳回 bazi，cookie domain=.orasage.com
# 3. shop.orasage.com 应识别同一用户

# JWT 验签
curl -s http://127.0.0.1:3101/verify -H "Cookie: orasage_token=<token>"
```

## 6. 已知阻塞项

- 三个 GitHub 仓库需对 VPS/CI 可读（私有库需 deploy key 或 token）
- tarot proxy 模式仍需确认 `TAROT_UPSTREAM_URL`（native 模式不需要）
- MySQL 实例需在 VPS 就绪，各 App `.env` 配置 `DATABASE_URL`
