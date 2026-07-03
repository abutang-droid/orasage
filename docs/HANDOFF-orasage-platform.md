# OraSage 平台交接备忘录

> 写给下一任 Agent / 开发者。  
> 最后更新：**2026-07-03**  
> **最新会话交接（P0 安全 + E2E 冒烟）：** [`HANDOFF-e2e-p0-2026-07-03.md`](./HANDOFF-e2e-p0-2026-07-03.md) ← **优先读这个**  
> **塔罗功德后端 + 部署：** [`HANDOFF-agent-2026-07-03.md`](./HANDOFF-agent-2026-07-03.md)  
> **产品体验与测试用例：** [`docs/testing/platform-ux-evaluation-and-test-cases.md`](./testing/platform-ux-evaluation-and-test-cases.md)  
> 当前活跃分支：`main`（Phase 2 UI 三轨已合入）  
> 待办清单：[`docs/plans/design-unify-backlog.md`](./plans/design-unify-backlog.md)

**本轮新增（platform-unify）：**
- 合并 `design-unify` 后推进全站浅色设计（Main/Shop/Auth/Admin/Tarot）
- 语言切换仅 Main 门户首页；命理 App 依赖 URL / 用户中心
- Ziwei 合盘输入改为 Tab 切换；子页统一 App Shell 返回

---

## 1. 项目是什么

**OraSage** 是多命理 App 统一平台（monorepo），子应用通过共享 auth、shop、用户中心串联：

| 子域 | 端口 | 技术栈 | 职责 |
|------|------|--------|------|
| orasage.com | 3100 | Next.js | 主站 |
| auth.orasage.com | 3101 | Express | 统一登录、用户中心、readings/orders 内部 API |
| shop.orasage.com | 3102 | Next.js | 商品、结账、演示支付、Stripe webhook |
| admin.orasage.com | 3103 | Next.js | 管理后台 |
| bazi.orasage.com | 3110 | Vite + Express + tRPC | 八字排盘 |
| ziwei.orasage.com | 3111 | Next.js | 紫微斗数 |
| tarot.orasage.com | 3112 | Next.js | 塔罗 |
| cms.orasage.com | 3120 | Payload CMS | 内容 |

VPS：`34.75.40.67`（GCP，`ubuntu`），代码目录 `/opt/orasage`。

---

## 2. 本轮已完成（2026-07-02）

### Phase 5（已合入分支上下文，PR #20 背景）

- Auth migration `0006`：`user_readings.report_url`, `payload_json`
- Bazi `POST /internal/report-job` 管线
- Shop 演示支付 / webhook → `dispatchBaziReportJob`
- Profile「查看报告」、checkout `return=` 回跳修复

### 设计统一 + Ziwei parity（PR #21，`cursor/design-unify-ziwei-9ded`）

**共享层**

- `shared/design-tokens/orasage-tokens.css` — 浅色 `#FAFAF8`，金色 `#B8943F`
- `shared/app-shell/` — 子页「返回」、底部导航、标签文案；已 vendor 到 bazi/ziwei/tarot

**Ziwei**

- `/chart`：`PaywallCard`、`usePaymentFlow`、`CrystalShopCard`；Insight/Chat 付费后解锁
- 模式：单人排盘 / 双人合盘（`mode=heming`）
- SKU：`report-ziwei-basic/advanced/premium`
- **report-job 新增**：`ziwei/lib/reportJob.ts`、`reportGenerator.ts`、`/api/internal/report-job`
- `/heming` → 307 `/chart?mode=heming`
- 合盘 `payloadJson` 修复：`{ type:'couple', chartA, chartB }`

**Bazi 浅色主题（进行中，主体已落地）**

- `bazi/client/src/theme.ts`、`index.css` 及 Home/History/WheelPicker/PlanSelectionModal/Footer/PaywallCard
- `BaziResult.tsx` 页面级浅色化；四柱区仍用 `INK_DEEP`（`#0f0c20`）

**Shop**

- `dispatchReportJob()` 统一分发 bazi / ziwei SKU
- `ENV.ziweiInternalUrl` ← `ZIWEI_INTERNAL_URL`

**Deploy 修复**

- `deploy/bazi/deploy-bazi.sh`：`CI=true` + `pnpm install --force`（修复 VPS 交互卡死）

### VPS 部署状态（本轮结束时）

| 服务 | 分支 | 验证 |
|------|------|------|
| ziwei | design-unify | `/heming` → 307 `/chart?mode=heming` ✅ |
| bazi | design-unify | `https://bazi.orasage.com` 200 ✅ |
| shop | design-unify | `/api/health` 200 ✅ |

---

## 3. 架构要点（读代码前必知）

### 付费 → 报告 数据流

```
用户排盘 → syncReading (payloadJson) → auth user_readings
    ↓
PaywallCard → shop checkout → 演示支付 / Stripe
    ↓
shop dispatchReportJob(sku)
    ├─ report-bazi-*  → BAZI_INTERNAL_URL/internal/report-job
    └─ report-ziwei-* → ZIWEI_INTERNAL_URL/api/internal/report-job
    ↓
LLM 生成 Markdown → 写 public/reports/*.html → PATCH reading.report_url + order completed
```

### Reading payload 格式

**Bazi**（`bazi/client/src/lib/reading-sync.ts`）：

```json
{ "type": "single"|"couple", "lang": "zh-CN", "resultData": { ... } }
```

**Ziwei**（`ziwei/lib/reading-sync.ts`）：

```json
// 单人
{ "type": "single", "chart": { ... } }
// 合盘（2026-07-02 修复后）
{ "type": "couple", "chartA": { ... }, "chartB": { ... } }
```

### 内部 API 安全

- Bazi report-job：Express，`x-real-ip` 本机检查
- Ziwei report-job：Next route，`isLocalIp()` 同等逻辑
- Auth internal：`AUTH_INTERNAL_URL`，仅 127.0.0.1 / 内网

### 设计规范

参考：`uploads/OraSage-Design-System-Minimal-Refinement_1d35.md`（浅色纸感、克制金色、无五行色块泛滥）

---

## 4. 关键文件索引

| 用途 | 路径 |
|------|------|
| 设计令牌 | `shared/design-tokens/orasage-tokens.css` |
| App Shell | `shared/app-shell/{AppShell.tsx,config.ts,labels.ts,app-shell.css}` |
| Bazi 主题 | `bazi/client/src/theme.ts`, `index.css` |
| Bazi report-job | `bazi/server/reportJob.ts`, `reportGenerator.ts` |
| Ziwei 付费 | `ziwei/lib/usePaymentFlow.ts`, `components/PaywallCard.tsx`, `app/chart/page.tsx` |
| Ziwei report-job | `ziwei/lib/reportJob.ts`, `lib/reportGenerator.ts`, `app/api/internal/report-job/route.ts` |
| Shop 分发 | `shop/src/lib/reportJob.ts`, `shop/src/lib/env.ts` |
| E2E | `scripts/e2e/profile-shop-flow.mjs` |
| VPS 部署 | `deploy/remote-deploy-{ziwei,bazi}.sh`, `deploy/deploy-shop.sh`, `deploy/bootstrap-all-on-vps.sh` |

---

## 5. 已知问题 & 陷阱

| 问题 | 处理 |
|------|------|
| Shop 本地 `npm run build` 缺 `JWT_SECRET` | 生产 VPS 的 `shop/.env` 必须有；本地可 `JWT_SECRET=dev-...` |
| Bazi VPS `pnpm install` 交互确认 | 已用 `CI=true --force`；其他 pnpm 应用可能同样 |
| `git safe.directory` on VPS | `git config --global --add safe.directory /opt/orasage` |
| Playwright E2E 英文 UI | URL 加 `?lang=zh-CN` |
| PR #21 仍为 draft | E2E 后再转 ready |
| `deploy/VPS-DEPLOY.md` 状态过期 | 文档写 bazi 502，实际已 200 |
| BaziResult 仍有局部深色 | 非 bug，但与设计统一目标有差距，见 backlog P1 |

---

## 6. 你接手后建议的第一步

1. 读 [`docs/plans/design-unify-backlog.md`](./plans/design-unify-backlog.md) 的 **P0** 清单
2. checkout `cursor/design-unify-ziwei-9ded`（或 PR 合并后的 `main`）
3. 跑 / 扩展 `scripts/e2e/profile-shop-flow.mjs`，覆盖 Ziwei 付费+报告
4. SSH VPS 确认 `ZIWEI_INTERNAL_URL` 与 AI Key 已配置
5. E2E 通过 → PR #21 ready → merge → `main` redeploy

```bash
git fetch origin cursor/design-unify-ziwei-9ded
git checkout cursor/design-unify-ziwei-9ded

# E2E（需先 cd scripts/e2e && npm ci）
node scripts/e2e/profile-shop-flow.mjs

# 若需重部署
SSH_KEY=~/.ssh/deploy_key ORASAGE_REF=cursor/design-unify-ziwei-9ded bash deploy/remote-deploy-ziwei.sh
```

---

## 7. Git / PR 状态

```
分支: cursor/design-unify-ziwei-9ded
最近 commit:
  b9c33f9 fix(deploy): non-interactive pnpm install for bazi VPS build
  3c200bf feat: bazi light theme, ziwei report-job, heming redirect
  46cb0ab feat(design): unify tokens, app-shell back nav, ziwei paywall parity

PR: https://github.com/abutang-droid/orasage/pull/21 (draft)
基于: main + phase5 上下文
```

---

## 8. 联系人 / 资源

- 仓库：`https://github.com/abutang-droid/orasage`
- 设计稿 MD：工作区 `uploads/OraSage-Design-System-Minimal-Refinement_1d35.md`
- Tarot 独立交接（另一项目）：`tarot/HANDOFF.md`（Manto，非本 monorepo 主线）

---

*本文档随任务推进更新；完成 P0 后请勾选 backlog 并更新本节「Git / PR 状态」。*
