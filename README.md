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
| `bazi.orasage.com` | bazi | 3110 | Vite + Express + tRPC + Drizzle | MySQL | ✅ 源码已接入，本地构建/运行验证通过 |
| `ziwei.orasage.com` | ziwei | 3111 | Next.js 15 + iztro | 无（纯计算+AI） | ✅ 源码已接入，本地构建/运行验证通过 |
| `tarot.orasage.com` | tarot | 3112 | Next.js 15 + Prisma | MySQL | ✅ 源码已接入，本地构建/运行验证通过 |
| `cms.orasage.com` | cms | 3120 | Payload CMS | PostgreSQL | 🚧 骨架已建，部署至 VPS |

## 方案 B 要点

- 各 App **独立子域名**，无需 Next.js `basePath`
- 所有 8 个 App 源码都在本仓库内（`main/` `auth-service/` `shop/` `admin/`
  `cms/` `bazi/` `ziwei/` `tarot/`），统一部署在同一台 VPS（`34.75.40.67`）
- **移动优先**：手机显示优先，再兼容 PC（见 [`docs/mobile-first.md`](docs/mobile-first.md)）
- 跨 App 登录：`Cookie domain=.orasage.com`，auth 统一签发 JWT；bazi/ziwei/tarot
  各自新增了桥接逻辑，识别到该 cookie 时自动映射为已登录状态，**同时完全保留
  各自原有的登录方式**（bazi 的 Manus OAuth、ziwei 的匿名模式、tarot 的访客
  JWT），不是替换关系
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

### 全部 App 一键部署（推荐）

```bash
# 在 VPS 本机（GCP 控制台 SSH）执行：
ORASAGE_REF=main bash /opt/orasage/deploy/bootstrap-all-on-vps.sh

# 从本地/Cloud Agent 远程触发（需 SSH 私钥）：
SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-all.sh

# 命理 App 尚无 .env 时先用 proxy 回滚模式：
FORTUNE_MODE=proxy bash deploy/remote-deploy-all.sh
```

GitHub Actions：手动触发 **Deploy All Apps** workflow（需配置 `SSH_PRIVATE_KEY`；
若 GitHub runner 连不上 22 端口，还需配置 `GCP_SA_KEY` + IAP 相关变量）。

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

### bazi / ziwei / tarot（源码已 vendor 进本仓库，native 自托管为默认模式）

```bash
# 均为 native 自托管（默认），从本地/Cloud Agent 远程触发：
SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-bazi.sh
SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-ziwei.sh
SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-tarot.sh

# 回滚到迁移期反代模式（proxy）：
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy bash deploy/remote-deploy-bazi.sh
SSH_KEY=~/.ssh/id_rsa DEPLOY_MODE=proxy bash deploy/remote-deploy-ziwei.sh
```

native 模式部署前需在 VPS 上为每个 App 准备 `.env`（参考各自目录下的
`.env.example`），bazi / tarot 需要 MySQL（`DATABASE_URL`），三者都需要与
auth-service 共享同一个 `JWT_SECRET`。

GitHub Actions：在仓库 Settings → Secrets 配置 `SSH_PRIVATE_KEY` 后，
`Deploy Core Apps` 会随 main/auth/shop/admin 变更自动触发；
`Deploy Bazi` / `Deploy Ziwei` / `Deploy Tarot` **只支持手动
`workflow_dispatch` 触发**（切换部署方式是需要人为确认的操作，尤其 bazi 目前
仍通过 Manus OAuth + WooCommerce 服务真实付费用户，不适合随 push 自动生效）。

## 目录结构

```
main/                    # 主门户 Next.js 应用（12 语言）
shop/                    # 能量商城 Next.js 应用
admin/                   # 管理后台骨架（role=admin 鉴权，功能待迭代）
cms/                     # Payload CMS 骨架（Users/Media/Pages）
auth-service/            # 统一认证 + 用户中心
bazi/                    # 八字排盘（对应 abutang-droid/bazi-calculator）
ziwei/                   # 紫微斗数（对应 abutang-droid/ziwei-doushu）
tarot/                   # 塔罗占卜（对应 abutang-droid/tarot-mind）
docs/
  domain-setup.md        # 域名 / DNS / SSL / 认证完整指南
deploy/
  nginx/orasage.conf     # Nginx 子域名反向代理配置（唯一可信源）
  main/ shop/ auth/ admin/ cms/   # 各 App 的 systemd unit
  bazi/ ziwei/ tarot/     # native 部署脚本 + systemd unit + proxy 回滚方案
  deploy-shop.sh / deploy-shop-on-vps.sh  # main+auth+shop+admin 一键部署
  .env.example
```

## 各命理 App 的桥接说明

- **bazi**：新增 `authenticateViaOrasageBridge`（`server/_core/sdk.ts`），
  当 Manus OAuth 会话缺失时识别共享 `orasage_token`，映射为
  `openId = "orasage:<sub>"` 的本地用户，与原有 OAuth 用户体系互不干扰。
  同时修复了 `buyPlan` 从不校验 `wooOrderId` 就写 `status: completed`、
  未鉴权的 `/api/push-to-wordpress`（已确认无人调用，直接移除）、
  `JWT_SECRET` 缺失时以空字符串签名会话等问题。
- **ziwei**：新增 `lib/auth.ts` + `/api/auth/me`，识别到 `orasage_token`
  时返回登录态，未配置时保持完全匿名（该 App 本身无用户表/DB）。同时修复了
  `/api/interpret`（AI 解读代理）完全无鉴权无限流的问题，以及 `InsightPanel`
  两处把请求字段错发成 `chart` 而不是 API 实际读取的 `chartData`、导致 AI 从
  未真正拿到命盘上下文的功能性 bug。
- **tarot**：`src/lib/auth.ts` 新增 `getParentBridgedUser`，通过已有的
  `User.externalId` 字段（其设计文档里本就预留了这个用途）桥接父应用登录态，
  完全保留原有的访客自动创建逻辑。同时修复了 `JWT_SECRET` 缺失时的公开硬编码
  兜底值、JWT payload 未校验类型就直接类型断言、以及仓库里一个因误操作产生的
  乱码文件名（`.gitignore` 相关）。

以上均已在本地起服务用真实签名的 JWT 验证过：正确识别合法 token、拒绝伪造/
错误密钥签名的 token、且不影响各自原有的独立登录方式。

## 已知遗留事项 / 后续优先级（按序执行）

1. **P0** — 在真实 VPS 上跑通全部 native 部署脚本，验证 DNS/SSL/Nginx/
   systemd/MySQL 全链路（当前仅在本地沙箱验证过各 App 单独构建、运行与
   JWT 桥接逻辑，未在真实 VPS 环境跑过）。
2. **P0** — bazi 涉及真实付费用户与 WooCommerce 支付，从 proxy 切到 native
   前建议先在测试环境完整跑一遍下单流程，确认 WordPress 集成不受影响。
3. **P1** — admin 补充真实的用户/订单管理页面与操作 API（当前为鉴权骨架）。
4. **P1** — 三条命理产品线的登录 UI（目前只有后端桥接，各 App 前端尚未展示
   "已通过 orasage 登录" 状态或提供入口，用户体验上依赖同域 cookie 自动生效）。
5. **P2** — cms 按需拆分更细的内容模型，接入对象存储承载 Media。
6. **P2** — Playwright E2E 覆盖登录→测算→购买→支付回调核心链路。
7. **P2** — 接入 Loki + Grafana 做日志与可用性监控。
8. **P3** — c2.pub 旧站下线或转为备用收银台（见 `docs/domain-setup.md` 第八节）。

## 历史文档

- [`PRODUCT_PLAN_v3.md`](PRODUCT_PLAN_v3.md) — 产品方案总览
- `产品方案整理.md` — Codex 对话还原 + 技术评估
