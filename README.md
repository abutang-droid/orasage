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

## 部署 — 全部 App 统一部署在同一台 VPS

- VPS: `34.75.40.67`（GCP e2-standard-2）
- 基础设施: PostgreSQL 16 / Redis / Docker / Nginx
- 域名配置: 见 [`docs/domain-setup.md`](docs/domain-setup.md)
- Nginx 配置（唯一可信源）: 见 [`deploy/nginx/orasage.conf`](deploy/nginx/orasage.conf)
- 所有 App 进程只监听 `127.0.0.1`，对外统一由 Nginx 反代到对应子域名

### main + auth + shop + admin（本地自托管，一键脚本）

```bash
# 在 VPS 本机执行（或通过 GitHub Actions "Deploy Core Apps" workflow 自动执行）
bash deploy/deploy-shop-on-vps.sh

# 或从本地/Cloud Agent 远程触发
SSH_KEY=~/.ssh/id_rsa bash deploy/deploy-shop.sh
```

### cms（Payload，本地自托管）

```bash
cd /opt/orasage/cms && cp .env.example .env   # 修改 DATABASE_URL / PAYLOAD_SECRET
npm install && npm run migrate && npm run build
sudo cp deploy/cms/orasage-cms.service /etc/systemd/system/ && sudo systemctl enable --now orasage-cms
```

### bazi / ziwei / tarot（迁移期反代，逐步自托管）

```bash
# bazi：反代到现有线上服务
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy bash deploy/remote-deploy-bazi.sh

# ziwei：反代到现有线上服务
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy bash deploy/remote-deploy-ziwei.sh

# tarot：需先确认真实上游地址，再反代（未确认前请勿猜测填写）
SSH_KEY=~/.ssh/id_rsa TAROT_UPSTREAM_URL=https://<真实地址> bash deploy/remote-deploy-tarot.sh

# 三者的 native（完全自托管）模式都需要提供对应 *_REPO_URL，
# 在拿到各产品线真实源码仓库地址前不要使用 native 模式
```

GitHub Actions：在仓库 Settings → Secrets 配置 `SSH_PRIVATE_KEY` 后，
`Deploy Core Apps` / `Deploy Bazi` / `Deploy Ziwei` / `Deploy Tarot` 四个
workflow 会在对应目录变更时自动触发（或手动 `workflow_dispatch`）。

## 目录结构

```
main/                    # 主门户 Next.js 应用（12 语言）
shop/                    # 能量商城 Next.js 应用
admin/                   # 管理后台骨架（role=admin 鉴权，功能待迭代）
cms/                     # Payload CMS 骨架（Users/Media/Pages）
auth-service/            # 统一认证 + 用户中心
docs/
  domain-setup.md        # 域名 / DNS / SSL / 认证完整指南
deploy/
  nginx/orasage.conf     # Nginx 子域名反向代理配置（唯一可信源）
  main/orasage-main.service
  shop/orasage-shop.service
  auth/orasage-auth.service
  admin/orasage-admin.service
  cms/orasage-cms.service
  bazi/ ziwei/ tarot/    # 迁移期反代脚本 + docker-compose
  deploy-shop.sh / deploy-shop-on-vps.sh  # main+auth+shop+admin 一键部署
  .env.example
```

## 已知遗留事项 / 后续优先级（按序执行）

1. **P0** — bazi / ziwei / tarot 的真实应用源码目前只在本机
   （`bazi-calculator` / `ziwei-doushu` / `tarot-app`），尚未推送到任何
   VPS/CI 可访问的 git 仓库；三者当前均以反代接入子域名。要实现完全自托管，
   需先将三个项目推送到 GitHub（或其他可访问的 git 远程），再在
   `deploy/<app>/.env.example` 中填入真实的 `*_REPO_URL` 并切到 `native` 模式。
2. **P0** — 在真实 VPS 上跑通 `deploy/deploy-shop-on-vps.sh`，验证 DNS/SSL/
   Nginx/systemd 全链路（当前仅在本地沙箱验证过各 App 单独构建与运行）。
3. **P1** — 三条命理产品线接入统一 JWT 登录（目前仅完成 auth 侧设计与
   cookie/JWT 约定，命理侧改造依赖上述源码接入）。
4. **P1** — admin 补充真实的用户/订单管理页面与操作 API（当前为鉴权骨架）。
5. **P2** — cms 按需拆分更细的内容模型，接入对象存储承载 Media。
6. **P2** — Playwright E2E 覆盖登录→测算→购买→支付回调核心链路。
7. **P2** — 接入 Loki + Grafana 做日志与可用性监控。
8. **P3** — c2.pub 旧站下线或转为备用收银台（见 `docs/domain-setup.md` 第八节）。

## 历史文档

- [`PRODUCT_PLAN_v3.md`](PRODUCT_PLAN_v3.md) — 产品方案总览
- `产品方案整理.md` — Codex 对话还原 + 技术评估
