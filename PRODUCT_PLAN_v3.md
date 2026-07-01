# OraSage Product Plan v3

> 2026-07-01 · 8 Independent Apps · 方案 B：子域名架构
> GitHub: `abutang-droid/orasage`

命理占卜与能量水晶电商融合平台。核心思路：保留 bazi / ziwei / tarot 现有服务，
新增统一认证（auth）、能量商城（shop）、主门户（main），并逐步把三条命理产品线
从外部旧服务迁移到本仓库统一管理，最终 8 个 App 全部运行在同一台 VPS 上。

## 1. 架构总览

| 子域名 | App | 端口 | 说明 |
|--------|-----|------|------|
| `orasage.com` | main | 3100 | 12 语言主门户，Next.js 15 + next-intl |
| `auth.orasage.com` | auth | 3101 | 统一认证 + 用户中心，Express + Drizzle + PostgreSQL |
| `shop.orasage.com` | shop | 3102 | 能量水晶商城，Next.js + Stripe + 内网结账 API |
| `admin.orasage.com` | admin | 3103 | 运营管理后台，Next.js |
| `bazi.orasage.com` | bazi | 3110 | 八字排盘，Vite + Express + tRPC + Drizzle |
| `ziwei.orasage.com` | ziwei | 3111 | 紫微斗数，Next.js + iztro |
| `tarot.orasage.com` | tarot | 3112 | 塔罗占卜，Next.js + Prisma |
| `cms.orasage.com` | cms | 3120 | 内容管理，Payload CMS |

所有 8 个子域统一通过 `deploy/nginx/orasage.conf` 反代到同一台 VPS
（`34.75.40.67`），各 App 进程只监听 `127.0.0.1` 对应端口。

## 2. 关键决策

1. 保留现有 bazi/ziwei/tarot 应用代码，不做重写；三者源码已 vendor 进本仓库
   （`bazi/` `ziwei/` `tarot/`），登录态通过新增的桥接逻辑接入 orasage
   统一登录，不改动各自原有的登录/业务流程。
2. 子域名架构（非 nginx 路径分发），规避 Next.js `basePath` 的历史坑。
3. 跨 App 登录使用共享 Cookie（`domain=.orasage.com`），auth 统一签发 / 校验 JWT。
4. App 间内网调用走 `127.0.0.1`，不经过公网；对外只暴露各自子域名。
5. 购买行为在各 App 内以浮层完成，服务端调用 shop 的内网结账 API，不跳转整页。
6. `recommendationContext` 把命理测算的推荐理由带入订单，便于个性化推荐水晶。
7. PostgreSQL 承载 auth / shop / cms；命理三个 App 维持各自现有的 MySQL（迁移
   前无法改变，迁移后按各项目情况决定）。
8. 独立 admin App，不与 main 混在一起，方便单独做权限收紧。
9. 命理 App 与 shop/auth 之间的内网 API 通过 IP 校验 + Nginx 层白名单双重防护。
10. 后续补充 Playwright E2E 覆盖核心链路（登录 → 测算 → 购买 → 支付回调）。
11. 后续接入 Loki + Grafana 做日志与可用性监控。
12. 各 App 本地开发使用独立 docker-compose，互不干扰。
13. 老服务与新子域并行运行，验证稳定后再切换 DNS / 下线旧服务。
14. VPS 规格建议 ≥ 16GB，CI/CD 全部脚本化（GitHub Actions + SSH/IAP）。

## 3. 迁移路线图

| 阶段 | 内容 | 状态 |
|------|------|------|
| 1 | DNS + SSL + 部署 auth.orasage.com | 脚本/配置就绪，待在真实 VPS 上执行 |
| 2 | bazi/ziwei/tarot 源码接入本仓库，桥接统一登录 | 已完成（本地验证），待真实 VPS 部署 |
| 3 | shop.orasage.com 上线，各 App 接入内网结账 API | 代码就绪，待部署验证 |
| 4 | bazi/ziwei/tarot 切到 native 自托管，下线迁移期反代 | 部署脚本就绪，待在真实 VPS 上执行切换 |
| 5 | 旧服务（api1/api2.lilyfunnlove.com、c2.pub）下线或保留为备用 | 未开始，bazi 涉及真实付费用户需谨慎 |

## 4. 尚未开始 / 需要外部输入的事项

- 所有 App 均已在本地沙箱验证过构建/运行，但**尚未在真实 VPS 上部署验证**
  （DNS、SSL、MySQL/PostgreSQL 实例、systemd、Nginx 全链路）。
- admin、cms 目前是最小骨架，尚未接入真实业务逻辑与鉴权后台。
- bazi/ziwei/tarot 目前只完成了后端登录态桥接，前端尚未展示登录状态或提供
  跳转入口；用户体验依赖同域共享 cookie 自动生效，还需要各 App 前端配合展示。
- c2.pub 旧站下线计划（详见 `docs/domain-setup.md` 第八节）尚未执行，bazi 仍
  通过 WooCommerce/WordPress 服务真实付费用户，下线前需要单独评估。
