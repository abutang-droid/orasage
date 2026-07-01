# OraSage

命理 + 电商融合平台。8 个独立 App，**方案 B：子域名架构**。

GitHub: `abutang-droid/orasage`

> 完整产品方案见 [`PRODUCT_PLAN_v3.md`](PRODUCT_PLAN_v3.md)

## 域名架构（方案 B）

```
orasage.com           → main    :3100   主门户
auth.orasage.com      → auth    :3101   统一认证
shop.orasage.com      → shop    :3102   商城 + Stripe
admin.orasage.com     → admin   :3103   管理后台
bazi.orasage.com      → bazi    :3110   八字排盘
ziwei.orasage.com     → ziwei   :3111   紫微斗数
tarot.orasage.com     → tarot   :3112   塔罗占卜
cms.orasage.com       → cms     :3120   Payload CMS
```

| 子域名 | App | 端口 | 技术栈 | 数据库 | 状态 |
|--------|-----|------|--------|--------|------|
| `orasage.com` | main | 3100 | Next.js 15 + next-intl | — | ✅ 已开发，部署至 VPS |
| `auth.orasage.com` | auth | 3101 | Express + Drizzle + Jose | PostgreSQL | ✅ 已搭建，部署至 VPS |
| `shop.orasage.com` | shop | 3102 | Next.js + Stripe + BullMQ | PostgreSQL | ✅ 已开发，部署至 VPS |
| `admin.orasage.com` | admin | 3103 | Next.js SPA | PostgreSQL | 🚧 骨架已建，部署至 VPS |
| `bazi.orasage.com` | bazi | 3110 | Node 反代 → 现有服务 | MySQL（外部） | ✅ 代理已部署（迁移中） |
| `ziwei.orasage.com` | ziwei | 3111 | Node 反代 → 现有服务 | MySQL（外部） | ✅ 代理已部署（迁移中） |
| `tarot.orasage.com` | tarot | 3112 | Node 反代 → 现有服务 | MySQL（外部） | ✅ 代理已部署（迁移中） |
| `cms.orasage.com` | cms | 3120 | Payload CMS | PostgreSQL | 🚧 骨架已建，部署至 VPS |

## 方案 B 要点

- 各 App **独立子域名**，无需 Next.js `basePath`
- 所有 8 个子域全部反代到同一台 VPS（`34.75.40.67`），命理三个 App 在源码迁移完成前先以反向代理方式接入现有线上服务
- **移动优先**：手机显示优先，再兼容 PC（见 [`docs/mobile-first.md`](docs/mobile-first.md)）
- 跨 App 登录：`Cookie domain=.orasage.com`，auth 统一签发 JWT
- App 间 API 走内网 `127.0.0.1`，不暴露公网
- 购买在 App 内浮层完成，后台调 `shop` 内网 API

## 决策记录

1. 保留现有 bazi/ziwei/tarot 代码，不做重写
2. **子域名架构**（非 nginx 路径分发），避免 basePath 坑
3. App 内浮层购买，不跳转 shop 页面
4. `recommendationContext` 传递推荐理由到订单
5. 共享 JWT cookie（`.orasage.com`）跨子域认证
6. PostgreSQL + MySQL 双数据库
7. 应用间通过 `127.0.0.1` 内网 API 通信
8. 独立 admin App
9. 命理 App 内网 API 不暴露公网
10. Playwright E2E 核心链路测试
11. Loki + Grafana 日志监控
12. 各 App 独立 docker-compose 本地开发
13. VPS 新旧并行迁移
14. VPS 建议升至 16GB，CI/CD 脚本化

## 部署

- VPS: `34.75.40.67`（GCP e2-standard-2）
- 基础设施: PostgreSQL 16 / Redis / Docker / Nginx / Loki + Grafana
- 域名配置: 见 [`docs/domain-setup.md`](docs/domain-setup.md)
- Nginx 配置: 见 [`deploy/nginx/orasage.conf`](deploy/nginx/orasage.conf)

### bazi 八字排盘

```bash
# 迁移阶段（proxy）：将 bazi.orasage.com 代理到现有线上服务
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy bash deploy/remote-deploy-bazi.sh

# 正式自托管（native）：需提供 BAZI_REPO_URL
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=native BAZI_REPO_URL=https://github.com/... bash deploy/remote-deploy-bazi.sh
```

GitHub Actions：在仓库 Settings → Secrets 配置 `SSH_PRIVATE_KEY` 后，手动触发 **Deploy Bazi** workflow。

## 目录结构

```
main/                    # 主门户 Next.js 应用
shop/                    # 能量商城 Next.js 应用
auth-service/            # 统一认证 + 用户中心
docs/
  domain-setup.md        # 域名 / DNS / SSL / 认证完整指南
deploy/
  nginx/orasage.conf     # Nginx 子域名反向代理配置
  main/orasage-main.service
  shop/orasage-shop.service
  auth/orasage-auth.service
  auth/cookie.example.ts
  .env.example
```

## 历史文档

- [`PRODUCT_PLAN_v3.md`](PRODUCT_PLAN_v3.md) — 产品方案（英文）
- `产品方案整理.md` — Codex 对话还原 + 技术评估
