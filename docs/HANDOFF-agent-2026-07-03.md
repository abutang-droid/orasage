# Agent 交接备忘录 — 2026-07-03

> 写给下一任 Cloud Agent / 开发者。  
> 覆盖本轮对话主线：**门户 UX → 支付 mock → 塔罗信仰/圣地 CMS → UI 脚手架 → 功德成长后端（非 UI）→ 合并部署**。  
> 平台总览仍见 [`HANDOFF-orasage-platform.md`](./HANDOFF-orasage-platform.md)（部分章节已过期，以本文为准）。  
> **改动前必读铁规：** [`AGENT-RULES.md`](./AGENT-RULES.md)（不擅自改布局、不主动增删功能）。

---

## 1. 用户意图脉络（按时间）

| 阶段 | 用户要求 | 结果 |
|------|----------|------|
| 早期 | 门户 footer、道藏、公开浏览、profile hub 修复 | PR #28 ✅ merged + deployed |
| 支付 | 开发/生产默认 mock 支付 | PR #30 ✅ |
| 塔罗信仰 | 世界宗教选择器（Top10 + 更多） | PR #31 ✅ |
| CMS 圣地 | Payload 管理圣地，按信仰匹配 | PR #32+#33 ✅ deployed |
| FaithPicker | 从 CMS `/api/faiths` 拉取 | PR #35 ✅ |
| UI 基础 | `@orasage/tokens` + `@orasage/ui` 脚手架 | PR #29 ✅ |
| 塔罗成长 | 合并 UI PR + 推进八字/紫微 UI 统一、塔罗 onboarding/功德 | PR #36（UI+MVP）✅ |
| **最新** | **「除去 UI 部分，其它都可以推进」** | PR #37（纯后端）✅ merged + VPS deployed |
| 部署 | 「合并 PR 并在 VPS 上跑部署脚本」 | #37 merged；tarot + shop 已部署 |

**明确 OUT OF SCOPE（用户多次强调，勿擅自重启）：**

- `@orasage/ui` 在 bazi / ziwei 的全面铺开
- PaywallCard 抽取、Tailwind v3/v4 对齐
- Day 1–7 onboarding **视觉向导**改版
- `profile/edit`、`profile/orders` 等页面 UI

---

## 2. 当前生产状态（VPS `34.75.40.67`）

| 服务 | URL | 分支 | 本轮变更 | 验证 |
|------|-----|------|----------|------|
| tarot | https://tarot.orasage.com | `main` @ `1570953` | MeritLog、onboarding API、internal offer | `GET /api/onboarding` → 200 |
| shop | https://shop.orasage.com | `main` @ `1570953` | pay/webhook → tarot merit 回调 | `GET /api/health` → mock 模式 |
| cms | https://cms.orasage.com | main（早前部署） | faiths + sanctuaries | FaithPicker 数据源 |
| auth/main/admin/bazi/ziwei | 各子域 | 未在本轮重部署 | — | — |

**Tarot DB（MySQL `tarot`）：** 已 `prisma db push --accept-data-loss`（2026-07-03），新增 `MeritLog` 表及 `User` 扩展字段。

**环境变量（供养回调）：**

- `TAROT_INTERNAL_SECRET`：未单独配置时，shop 与 tarot **均回退 `JWT_SECRET`**
- `TAROT_INTERNAL_URL`：shop 默认 `http://127.0.0.1:3112`
- 若要显式隔离，在 `/opt/orasage/shop/.env` 与 `/opt/orasage/tarot/.env` 设相同值

---

## 3. 本轮合入 main 的 PR（#28–#37）

```
#37 feat(tarot): onboarding + merit growth backend (non-UI)     ← 本轮重点
#36 feat: @orasage/ui bazi/ziwei sync + tarot merit MVP
#35 feat(tarot): FaithPicker from CMS /api/faiths
#34 fix(deploy): tarot npm ci --include=dev
#33 fix(cms): idempotent faiths/sanctuaries migration
#32 feat(cms): sanctuaries in Payload CMS
#31 feat(tarot): world faith picker
#30 feat(payments): PAYMENT_MODE=mock default
#29 feat(ui): @orasage/ui scaffold
#28 fix(portal): footer, daozang, public browse, profile hub
```

`main` 最新 merge commit：**`1570953`**（Merge PR #37）

---

## 4. 塔罗功德成长系统（PR #37 架构）

### 4.1 数据模型（`tarot/prisma/schema.prisma`）

**User 新增字段：**

- `onboardingStep`（默认 `"welcome"`）
- `referralCode`（唯一，懒生成）
- `referredByUserId`
- `totalSpentCents`、`freeReadingsRemaining`

**MeritLog：**

- `path`: `time` | `share` | `offer`
- `amount`, `reason`, `idempotencyKey`（唯一，防重复发放）

### 4.2 核心库

| 文件 | 职责 |
|------|------|
| `tarot/src/lib/merit.ts` | 等级表、拜神基础功德、初一/十五×2、分享/供养常量、onboarding 步骤、推荐奖励表 |
| `tarot/src/lib/merit-service.ts` | `awardMerit`、`recordWorship`、`recordShareClick`、`recordOfferMerit`、`bindReferralCode`、`advanceOnboarding`、`ensureReferralCode` |
| `tarot/src/lib/referral.ts` | 8 位推荐码生成 |
| `tarot/src/lib/temple/blessing.ts` | 模板祝福文案（非 LLM） |

**类型守卫：** `isMeritAwarded(result)` — 区分 `AwardMeritResult` 的 duplicate vs awarded 分支（修过 TS 构建错误）。

### 4.3 API 一览

| 方法 | 路径 | 说明 |
|------|------|------|
| GET/POST | `/api/onboarding` | 步骤机：welcome→reading→faith→deity→worship→done |
| POST | `/api/merit/share` | 分享 +1，日 cap 5 |
| POST | `/api/merit/offer` | 用户侧供养（paid_reading / crystal_purchase / crystal_gift） |
| GET/POST | `/api/merit/referral` | 自己的码 / 绑定 `?ref=` |
| POST | `/api/internal/merit/offer` | shop 回调，需 `x-tarot-internal-key` |
| GET | `/api/history?type=temple` | 拜神历史 |
| GET | `/api/merit` | 既有功德摘要（PR #36） |

**Onboarding 步骤与建议跳转：**

```
welcome → /reading
reading → /temple
faith/deity/worship → /temple
done → /
```

### 4.4 Shop → Tarot 供养链路

```
tarot checkout 嵌入 recommendationContext: "tarotUser:{userId}|..."
    ↓
shop mock pay / Stripe webhook（appSource=tarot）
    ↓
shop/src/lib/tarot-merit.ts → notifyTarotOfferMerit()
    ↓
POST tarot/api/internal/merit/offer
    ↓
recordOfferMerit() + 消费里程碑奖励
```

相关文件：

- `shop/src/lib/tarot-merit.ts`
- `shop/src/app/api/pay/route.ts`
- `shop/src/app/api/webhook/route.ts`
- `tarot/src/app/api/checkout/route.ts`（嵌入 `tarotUser:`）

### 4.5 最小客户端接线（非视觉改版）

- `tarot/src/app/temple/page.tsx` — onboarding POST、share → `/api/merit/share`、blessingText
- `tarot/src/app/reading/page.tsx` — 翻牌后 POST `step: reading`
- `tarot/src/lib/user.tsx` — 加载时自动 `POST /api/merit/referral` 绑定 `?ref=`

---

## 5. 部署备忘 & 陷阱

### Tarot 部署

```bash
ORASAGE_REF=main bash deploy/remote-deploy-tarot.sh
```

**已知问题：** `prisma db push` 在无 TTY 时会因 `referralCode` unique 警告卡住。

- **临时处理（本轮已手动）：** SSH 上跑 `npx prisma db push --accept-data-loss`
- **本地未合入修复：** 分支 `cursor/deploy-prisma-flag-e21e` 改了 `deploy/tarot/deploy-tarot.sh` 一行；**未开 PR**（Cloud Agent 无 create PR 权限时报错）

**权限问题：** VPS 上 `ubuntu` 跑 `prisma generate` 可能 EACCES（`node_modules/.prisma` 属主问题）；`npm run build` 仍可成功。若 prisma client 过期，需 `sudo chown -R ubuntu:ubuntu /opt/orasage/tarot/node_modules` 或以正确用户跑 `npm ci`。

### Shop 部署（仅 shop 变更时）

```bash
# SSH 到 VPS 后
cd /opt/orasage && git fetch origin main && git reset --hard origin/main
source .env; source auth-service/.env  # 取 JWT_SECRET
cd shop && npm install && npm run build
sudo systemctl restart orasage-shop
```

或全量：`SSH_KEY=... bash deploy/deploy-shop.sh`（会 rsync + deploy-shop-on-vps，较重）。

### 本地构建

- tarot / shop 均需 `JWT_SECRET`（≥32 字符）才能 `next build` collect page data
- tarot 需 MySQL + `DATABASE_URL` 才能 `prisma db push`
- 无 repo 级 ESLint；检查方式：`npm run build` 或 `npx tsc --noEmit`

---

## 6. 待办 / 下一任可推进项

按优先级（**后端/逻辑优先，UI 后置**）：

| 优先级 | 项 | 说明 |
|--------|-----|------|
| P0 | 合并 `deploy/tarot/deploy-tarot.sh` 的 `--accept-data-loss` | 分支 `cursor/deploy-prisma-flag-e21e` 已 push |
| P1 | E2E 验证供养回调 | mock 支付 tarot 订单 → 查 MeritLog / meritOffer 增量 |
| P1 | 推荐首付费阅读 +50、水晶 +100 | 常量已在 `merit.ts`，需在 shop 回调区分 SKU 或 tarot 侧补逻辑 |
| P2 | `freeReadingsRemaining` 扣减逻辑 | schema 已有字段，业务未接 |
| P2 | Push 通知（连续拜神提醒） | 未开始 |
| P2 | LLM 祝福文案 | 当前为 `blessing.ts` 模板 |
| P3 | 功德排行榜 | 未开始 |
| — | bazi/ziwei UI 统一 | **用户明确跳过** |

产品规格参考：`tarot/MANTO_PRODUCT.md`（功德 §C2–C3、onboarding 章节）。

---

## 7. Git 本地状态（写文档时）

```
当前本地分支: cursor/deploy-prisma-flag-e21e（仅 deploy 脚本 1 行改动）
main: 与 origin/main 同步 @ 1570953
未提交: 无（deploy 修复已 commit 在 cursor/deploy-prisma-flag-e21e）
```

活跃远程分支（可清理）：`cursor/tarot-growth-backend-e21e`（已 merge）、`cursor/ui-tarot-growth-e21e` 等。

---

## 8. 快速验证命令

```bash
# 生产 smoke（无需登录）
curl -s https://tarot.orasage.com/api/onboarding
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://tarot.orasage.com/api/merit/share   # 期望 401
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://tarot.orasage.com/api/internal/merit/offer -d '{}'  # 期望 403
curl -s https://shop.orasage.com/api/health

# SSH 部署
SSH_PRIVATE_KEY=... ORASAGE_REF=main bash deploy/remote-deploy-tarot.sh
```

---

## 9. 关键文件索引（本轮新增/改动）

```
tarot/prisma/schema.prisma
tarot/src/lib/merit.ts
tarot/src/lib/merit-service.ts
tarot/src/lib/referral.ts
tarot/src/lib/temple/blessing.ts
tarot/src/app/api/onboarding/route.ts
tarot/src/app/api/merit/{share,offer,referral}/route.ts
tarot/src/app/api/internal/merit/offer/route.ts
tarot/src/app/api/history/route.ts          # type=temple
tarot/src/app/api/checkout/route.ts         # tarotUser: 上下文
shop/src/lib/tarot-merit.ts
shop/src/app/api/{pay,webhook}/route.ts
deploy/tarot/deploy-tarot.sh                # 待合入 --accept-data-loss
tarot/.env.example / shop/.env.example      # TAROT_INTERNAL_*
```

---

## 10. 与旧文档的关系

| 文档 | 状态 |
|------|------|
| `docs/HANDOFF-orasage-platform.md` | 2026-07-02，design-unify 时代；架构大方向仍对，PR/部署状态过期 |
| `tarot/HANDOFF.md` | 独立 tarot-mind 上游记忆，**非** monorepo `tarot/` 现状；功德系统以本文 §4 为准 |
| `docs/plans/design-unify-backlog.md` | UI 统一 backlog；用户当前不想推进 |

---

*下一任接手：先读本文 §6 待办，确认用户是否仍跳过 UI；任何 tarot schema 变更后 VPS 必须 `prisma db push`。*
