# OraSage UI Design System Phase 2 — 架构与并行分支策略

> 最后更新：2026-07-03  
> 前置文档：[ui-phase-1.md](./ui-phase-1.md)（Token 映射与 Phase 1 组件清单）  
> 关联包：`packages/ui`（`@orasage/ui`）、`packages/tokens`（`@orasage/tokens`）

Phase 1 完成了 **Token 运行时映射** 与 **首批 shadcn/Radix 组件落地**。Phase 2 解决的是：**组件应从哪里来、三条并行 UI 分支如何协作、最终如何安全合入 `main`**。

---

## 1. 目标架构（Target State）

```text
OraSage_Brand_Design_Tokens_v1.1.md   （品牌规范，设计源）
            │
            ▼
shared/design-tokens/orasage-tokens.css   （运行时 CSS 变量，全 App @import）
            │
            ├──────────────────┐
            ▼                  ▼
   packages/tokens        packages/ui (@orasage/ui)
   Tailwind preset        React 组件 + 静态 oui-* CSS
            │                  │
            └────────┬─────────┘
                     ▼
    ┌────────────────┼────────────────┐
    ▼                ▼                ▼
  main/shop       bazi/ziwei       auth-service
  Tailwind v3     Tailwind v4      静态 HTML + oui-*
  import @orasage/ui              sync:auth-ui-css
```

### 1.1 单一组件来源（架构决策）

| 层级 | 唯一源码位置 | 禁止做法 |
|------|-------------|----------|
| 设计 Token | `shared/design-tokens/orasage-tokens.css` | 各 App 硬编码 `#FAFAF8`、`#B8943F` |
| React 基础组件 | `packages/ui/src/**` → `@orasage/ui` | 在 `main/src/components/ui/`、`bazi/client/src/components/ui/` 维护第二套 shadcn |
| 静态 HTML 控件 | `packages/ui/src/styles/components.css` → sync 到 auth / fortune apps | 手写 `.btn-primary` 与 oui-* 并存 |
| 业务 UI | 各 App `components/` | 把命盘、牌阵、PaywallCard 放进 `@orasage/ui` |
| App Shell | `shared/app-shell/`（vendored 到各 App） | 各 App 独立实现底部导航 |

**结论**：Phase 2 结束时，任何 App 需要 Button/Input/Dialog 等基础控件时，**只从 `@orasage/ui` 导入**，或通过 `sync:*-ui-css` 使用同步后的静态类名。不再新增本地 shadcn 副本。

### 1.1.1 Phase 1 → Phase 2 的已知分歧（须消除）

Phase 1 在 `main/src/components/ui/` 放置了首批组件副本。`feat/shared-ui-foundation` 已将主站迁往 `@orasage/ui` 导入；`feat/main-ui-unification` 与 `feat/bazi-ui-unification` 仍基于 Phase 1 的**本地副本**模式。

**Phase 2 门禁**：`feat/main-ui-unification` 与 `feat/bazi-ui-unification` 在合入 `main` 前，必须 rebase 到已合并 foundation 的 `main`，并将本地 `components/ui/*` 替换为 `@orasage/ui` 导入。

### 1.2 控件尺寸规范（不变）

沿用 Phase 1 / `packages/ui/README.md`：

- 仅三档：`sm`（36px）、`md`（44px，默认）、`lg`（48px）
- 页面通过 `size="sm|md|lg"` 选择，**禁止**覆盖 height、radius、focus ring
- Checkbox / Radio / Switch 视觉可更小，但须保证 44px 可点区域（Label 或 padding）

### 1.3 Tailwind 版本策略

| App | Tailwind | 消费 `@orasage/ui` 方式 |
|-----|----------|-------------------------|
| main, shop, admin, ziwei, tarot | v3 | `transpilePackages` + `content` 扫描 `packages/ui/src` |
| bazi | v4 | 全局 CSS `@source "../../../packages/ui/src"`；Vite `server.fs.allow` 允许 monorepo 根 |
| auth-service | 无 React | 静态 `orasage-ui.css`，不引 Tailwind preset |

**禁止**：为绕过 Tailwind 版本差异而复制 `packages/ui` 源码到 App 目录。

---

## 2. 三条并行 UI 分支

当前 GitHub 上有三条**独立工作线**，均**未合入 `main`**，也**不是**已整合的最终版本：

| 分支 | 职责 | 相对 `f2439cf` 的增量 |
|------|------|----------------------|
| `feat/shared-ui-foundation` | `@orasage/ui` 包、Token 扩展、主站接入共享包 | +4 commits（含 packages/ui 全量组件） |
| `feat/main-ui-unification` | 主站 Header/Footer、首页、内容页视觉统一 | +5 commits（页面层） |
| `feat/bazi-ui-unification` | 八字主题、基础组件、Home/History 适配 | +1 commit（App 层） |

```text
ef1c284 ── … ── f2439cf (Phase 1 接入)
                          │
         ┌────────────────┼────────────────┐
         ▼                ▼                ▼
  shared-ui-foundation   main-ui-unification   bazi-ui-unification
  (packages/ui)          (main 页面)           (bazi 页面)
```

### 2.1 依赖关系

```text
feat/shared-ui-foundation
         │
         ├──────────────────────┐
         ▼                      ▼
feat/main-ui-unification   feat/bazi-ui-unification
（逻辑依赖，非 git 父子）    （逻辑依赖，非 git 父子）
```

- **main-ui** 与 **bazi-ui** 彼此**无依赖**，可并行开发页面。
- 两者均**逻辑依赖** foundation：合入 `main` 前须以 `@orasage/ui` 为组件源。
- **bazi-ui** 额外依赖 foundation 中的 Tailwind v4 接入说明。

### 2.2 文件重叠热点（合并冲突预警）

以下路径在多条分支上均有修改，合入或 rebase 时优先关注：

| 路径 | shared-ui | main-ui | bazi-ui |
|------|:---------:|:-------:|:-------:|
| `shared/design-tokens/orasage-tokens.css` | ✓ | ✓ | ✓ |
| `main/tailwind.config.ts` | ✓ | ✓ | ✓ |
| `main/package.json` | ✓ | ✓ | ✓ |
| `main/src/components/ui/*` | 删除/弃用 | ✓ 本地副本 | ✓ 本地副本 |
| `main/src/app/[locale]/ui-preview/*` | ✓ | ✓ | — |
| `docs/design-system/ui-phase-1.md` | — | ✓ | ✓ |

`main/` 上的重叠是因为 Phase 1 在 shared-ui 完成包迁移前，main-ui 与 bazi-ui 共用同一套脚手架变更。**合入顺序**（见 §4）可化解大部分冲突。

### 2.3 与 `main` 的漂移

截至 2026-07-03，`origin/main` 比 UI 分支基线超前约 **30 commits**（平台 E2E、tarot LLM、SKU、部署修复等）。UI 分支**不含**这些后端/平台变更。

**规则**：UI 工作线合入 `main` 之前，必须 `git rebase origin/main`（或 merge main），并跑相关 E2E（`scripts/e2e/profile-shop-flow.mjs`、`ziwei-shop-flow.mjs` 等）。

---

## 3. 协作规则（Agent / 开发者）

### 3.1 禁止事项

1. **不直接向 `main` 提交 UI 大改**（hotfix 除外，且不与三条 feat 分支冲突）
2. **不直接向三条 `feat/*` 分支 push** — 它们是受保护的工作线
3. **不复制** `packages/ui` 到 App 内作为长期方案
4. **不把业务组件**（PaywallCard、命盘、牌阵）放入 `@orasage/ui`

### 3.2 标准工作流

每次开工前同步远程：

```bash
git fetch origin main \
  feat/shared-ui-foundation \
  feat/main-ui-unification \
  feat/bazi-ui-unification
```

按任务所属轨道，从**对应远程分支**创建功能分支：

```bash
# 示例：主站 Profile 页 UI
git checkout -b cursor/main-profile-ui-e21e origin/feat/main-ui-unification

# 示例：@orasage/ui 新组件
git checkout -b cursor/ui-alert-variant-e21e origin/feat/shared-ui-foundation

# 示例：八字结果页
git checkout -b cursor/bazi-result-light-e21e origin/feat/bazi-ui-unification
```

分支命名：`cursor/<简短描述>-e21e`（小写、连字符）。

完成后：

1. Push 到 `origin/cursor/...`
2. 开 PR，**base 指向对应的 `feat/*` 分支**（不是 `main`）
3. 由维护者合并进该 `feat/*` 工作线

### 3.3 有更新时拉取三条分支

当任一 `feat/*` 分支有新 push 时，其他轨道的在途工作应：

```bash
git fetch origin feat/shared-ui-foundation feat/main-ui-unification feat/bazi-ui-unification

# 在 cursor 功能分支上，按需 cherry-pick 或 rebase 对应 feat 最新 tip
git rebase origin/feat/<your-track>
```

跨轨道**不要** merge 另一条 feat 分支到 cursor 分支，除非维护者明确要求做集成预览。

### 3.4 可选：集成预览（冲突探测）

仅用于**只读探测**，不替代三条主线：

```bash
git fetch origin main feat/shared-ui-foundation feat/main-ui-unification feat/bazi-ui-unification
git checkout -b cursor/ui-integration-preview-e21e origin/main

# 依次尝试 merge，记录冲突文件，完成后 abort / 删除分支
git merge --no-commit origin/feat/shared-ui-foundation
git merge --abort

git merge --no-commit origin/feat/main-ui-unification
git merge --abort

git merge --no-commit origin/feat/bazi-ui-unification
git merge --abort
```

将冲突清单写入 PR 描述或 issue，**不要** push preview 分支覆盖 feat 线。

---

## 4. 合入 `main` 的顺序与门禁

三条 feat 分支是并行工作线；合入 `main` 时必须**串行**，避免 `main/` 与 token 文件三方冲突。

### 4.1 推荐顺序

| 步骤 | 分支 → `main` | 理由 |
|------|----------------|------|
| 1 | `feat/shared-ui-foundation` | 确立 `@orasage/ui` 与 Token 扩展；主站已迁共享包 |
| 2 | `feat/main-ui-unification` | 页面层统一；rebase 后删除 `main/src/components/ui` 副本 |
| 3 | `feat/bazi-ui-unification` | 八字 Tailwind v4 + `@orasage/ui`；与 main 页面无直接冲突 |

### 4.2 每步门禁（Definition of Done）

**Step 1 — foundation**

- [ ] `npm run build -w @orasage/ui` 通过
- [ ] `main` 中 `@orasage/ui` 导入，`main/src/components/ui/` 无新增文件
- [ ] `/zh-CN/ui-preview` 展示全部导出组件
- [ ] `npm run sync:auth-ui-css` 后 auth 登录页视觉正常

**Step 2 — main-ui**

- [ ] rebase 到 Step 1 合并后的 `main`
- [ ] Header / Footer / 首页 / 内容页 / Profile 与 ui-preview 视觉一致
- [ ] `main` build 通过；无本地 shadcn 残留 import
- [ ] 子页底栏：`scripts/e2e/verify-unify.mjs`（对 main 相关 path）通过

**Step 3 — bazi-ui**

- [ ] rebase 到 Step 2 合并后的 `main`
- [ ] `bazi` build 通过（Tailwind v4 + `@source packages/ui`）
- [ ] `BaziResult.tsx` 纸感背景；四柱区保留深色对比
- [ ] `scripts/e2e/profile-shop-flow.mjs` 通过（支付 → 报告回归）

**合入 `main` 后**

- [ ] VPS 分应用 redeploy（main → shop → bazi，按 deploy 脚本）
- [ ] 更新 `docs/plans/design-unify-backlog.md` 勾选状态

---

## 5. 各 App 迁移清单（Phase 2 范围）

| App | 轨道 | Phase 2 任务 | Phase 3+（未开分支） |
|-----|------|-------------|---------------------|
| **packages/ui** | shared-ui | 组件 API 稳定、README、静态 CSS sync | PaywallCard 抽取到 `shared/`（非 ui 包） |
| **main** | main-ui | 页面统一、Profile、删本地 ui/* | — |
| **shop** | shared-ui 预备 | workspace dep + 1 页试点 | 全站结账 UI |
| **admin** | shared-ui 预备 | 同 shop | 部署修复 502 |
| **bazi** | bazi-ui | 主题、@orasage/ui、BaziResult | 删 53 个本地 shadcn |
| **auth** | shared-ui | sync CSS | — |
| **ziwei** | — | 仅 token + app-shell（已在 main） | 控件换 oui / @orasage/ui |
| **tarot** | — | 保持 Manto 深色产品识别 | 仅 shell/token 对齐，不做全面改版 |
| **cms** | — | — | Payload admin 表单 |

---

## 6. Token 双源同步（待实现）

当前存在两处 Token 定义：

```text
shared/design-tokens/orasage-tokens.css   ← 各 App 直接 @import
packages/tokens/                        ← @orasage/tokens Tailwind preset
```

**Phase 2 目标**：`shared/design-tokens/` 为**权威运行时源**；`packages/tokens` 由脚本从该文件生成或双向校验。

建议脚本（foundation 轨道实现）：

```bash
# 伪代码 — 待纳入 package.json
npm run tokens:sync   # shared/design-tokens → packages/tokens
npm run tokens:check  # CI 校验二者一致
```

在脚本落地前，修改 Token **只改** `shared/design-tokens/orasage-tokens.css`，并手动同步 `packages/tokens`。

---

## 7. 业务组件边界（PaywallCard 等）

PaywallCard、CrystalShopCard、AppBrandMark 等**含业务语义**的组件：

- **归属**：`shared/payments/` 或各 App `components/`（按现有模式）
- **视觉**：内部**使用** `@orasage/ui` 的 Button、Card、Badge
- **不进** `@orasage/ui` 包

Ziwei / Bazi / Tarot 的 PaywallCard 已各自实现但模式一致；Phase 2 不要求抽取，Phase 3 可考虑 `shared/paywall/`。

---

## 8. 文档索引

| 文档 | 内容 |
|------|------|
| [ui-phase-1.md](./ui-phase-1.md) | Token 映射、首批组件、ui-preview |
| **ui-phase-2.md**（本文） | 架构决策、三轨分支、合入顺序 |
| [packages/ui/README.md](../../packages/ui/README.md) | 组件 API、Tailwind 接入、迁移顺序 |
| [docs/mobile-first.md](../mobile-first.md) | 移动优先布局 |
| [docs/plans/design-unify-backlog.md](../plans/design-unify-backlog.md) | 平台 E2E、部署、非 UI 项 |

---

## 9. 决策记录（ADR 摘要）

| ID | 决策 | 状态 |
|----|------|------|
| ADR-UI-001 | React 基础组件唯一源码：`packages/ui`（`@orasage/ui`） | **已采纳** |
| ADR-UI-002 | 三条 `feat/*` 并行，cursor 分支从对应 feat 拉出 | **已采纳** |
| ADR-UI-003 | 合入 main 顺序：foundation → main-ui → bazi-ui | **已采纳** |
| ADR-UI-004 | bazi Tailwind v4 用 `@source`，不复制组件 | **已采纳** |
| ADR-UI-005 | tarot 保留 Manto 深色体系，仅 shell/token 对齐 | **已采纳** |
| ADR-UI-006 | Token 权威源：`shared/design-tokens/orasage-tokens.css` | **已采纳** |
| ADR-UI-007 | `main/src/components/ui` 本地副本为过渡态，Phase 2 结束前删除 | **待执行** |

---

## 10. 下一步（Phase 2 首批任务）

按优先级，从对应 **feat 远程分支** 开 `cursor/*` 分支执行：

1. **foundation**：`tokens:sync` / `tokens:check` 脚本 + CI
2. **main-ui**：Profile 子页 UI 统一（`/profile/orders`、`/profile/readings`）
3. **bazi-ui**：`BaziResult.tsx` 浅色纸感清理
4. **foundation**：shop 结账页 1 个 `@orasage/ui` 试点
5. **集成预览**：对当前三条 feat tip 跑冲突探测，更新本文 §2.2 表格

完成上述后，三条 feat 线分别提 PR → 维护者按 §4 顺序合入 `main`。
