# OraSage 产品架构

8 个独立 App，nginx 统一分发。

| 路径 | App | 端口 | 技术栈 | 数据库 |
|------|-----|------|--------|--------|
| `/` | main | 3100 | Next.js + next-intl | PostgreSQL |
| `/auth` | auth | 3101 | Express + Drizzle | PostgreSQL |
| `/shop` | shop | 3102 | Next.js + Stripe | PostgreSQL |
| `/admin` | admin | 3103 | Next.js SPA | — |
| `/bazi` | bazi | 3110 | Vite + Express | MySQL |
| `/ziwei` | ziwei | 3111 | Next.js + iztro | MySQL |
| `/tarot` | tarot | 3112 | Next.js + Prisma | MySQL |
| `/cms` | cms | 3120 | Payload CMS | PostgreSQL |

## 决策记录

1. 保留现有 bazi/ziwei/tarot 代码，不做重写
2. App 内浮层购买，不跳转 /shop
3. recommendationContext 传递推荐理由
4. 共享 JWT cookie 跨路径认证
5. PostgreSQL + MySQL 双数据库
6. 应用间通过内网 127.0.0.1 API 调用通信
7. 独立 admin App
8. 命理 App API 只对内开放
9. Playwright E2E 核心链路测试
10. Loki + Grafana 日志监控
11. 各 App 独立 docker-compose 本地开发
12. VPS 新旧并行迁移
13. Payload CMS i18n 插件 12 语言
14. VPS 建议升至 16GB，CI/CD 脚本化

## 部署

VPS: 34.75.40.67 (GCP e2-standard-2)
基础设施: PostgreSQL 16 / Redis / Docker / Nginx / Loki + Grafana

## 历史文档

- `HANDOFF.md` - 原始交接文档
- `PRODUCT_PLAN_v2.md` - v2 方案（已废弃）
- `PRODUCT_PLAN_v3.md` - 当前产品方案
- `产品方案整理.md` - Codex 对话还原