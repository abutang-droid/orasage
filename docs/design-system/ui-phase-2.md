# OraSage UI Design System Phase 2 — 架构与落地状态

> **最后更新：2026-07-08**（PR #194–#198 合入 `main` 并生产部署）  
> 前置：[ui-phase-1.md](./ui-phase-1.md) · 全站审查：[ui-status-2026-07.md](./ui-status-2026-07.md)  
> 关联包：`@orasage/ui`、`@orasage/tokens`、`@orasage/i18n`

Phase 1 完成 Token 映射与首批组件。Phase 2 解决**组件单一来源、App Shell 同步、多 App 铺开、图标与 i18n 基座**。

---

## 1. 目标架构（Current State）

```text
OraSage-Design-System-v1.1-Revised.md  （品牌规范）
            │
            ▼
shared/design-tokens/orasage-tokens.css   ← 权威运行时 CSS 变量
            │ npm run tokens:sync
            ▼
packages/tokens (@orasage/tokens)
   ├── ./css
   └── ./tailwind-preset
            │
            ├──────────────────┐
            ▼                  ▼
   packages/ui            packages/i18n
   (@orasage/ui)          (locale 检测/归一化)
            │                  │
            └────────┬─────────┘
                     ▼
    main / shop / tarot ── React + transpilePackages
    bazi / ziwei ──────── 静态 orasage-ui.css + TW4 @source
    auth ────────────────  sync:auth-ui-css
    shared/app-shell ──── npm run app-shell:sync → 8 apps
```

### 1.1 单一组件来源

| 层级 | 唯一源码 | 禁止 |
|------|----------|------|
| Token | `shared/design-tokens/orasage-tokens.css` | App 内硬编码 `#171717` / `#B8943F` |
| React 基础组件 | `packages/ui` | 第二套 shadcn 副本 |
| 静态 HTML 控件 | `packages/ui/src/styles/components.css` | 与 oui-* 并存的 `.btn-primary` |
| App Shell | `shared/app-shell/` | 各 App 独立底栏 |
| 业务 UI | 各 App `components/` | PaywallCard/命盘进 `@orasage/ui` |

### 1.2 窄导入（shop / tarot）

```tsx
import { Button } from '@orasage/ui/button';
```

完整 barrel `import { Button } from '@orasage/ui'` 仅 **main** 等已声明全部 Radix peer 的 App 使用。

### 1.3 控件尺寸（不变）

- `sm` 36px · `md` 44px（默认）· `lg` 48px
- 禁止覆盖 height / radius / focus ring

### 1.4 Tailwind 策略

| App | TW | 消费 `@orasage/ui` |
|-----|-----|-------------------|
| main, shop, admin, ziwei | v3 | `transpilePackages` + preset / semantic colors |
| bazi, tarot | v4 | `@source "../../../packages/ui/src/**/*.{ts,tsx}"` |
| auth | 无 React | `sync:auth-ui-css` |

### 1.5 图标

- **唯一 UI 图标库**：`lucide-react`
- App Shell 底栏/返回已迁移；修改后须 `app-shell:sync`
- 各消费 App 须在 `package.json` 声明 `lucide-react`（含 admin/cms）

### 1.6 多语言基座

- `packages/i18n`：`normalizeLocale`、`detectLocale`、`CORE_LOCALES` / `EXTENDED_LOCALES`
- `shared/shop-locale` 委托 i18n 做检测
- 各 App **文案字典仍本地化**；基座只统一 locale 来源与命名

---

## 2. 同步脚本（已实现）

| 脚本 | 作用 |
|------|------|
| `npm run tokens:sync` / `tokens:check` | shared tokens ↔ packages/tokens |
| `npm run app-shell:sync` / `app-shell:check` | shared/app-shell → 8 apps + auth CSS |
| `npm run ui:check` | tokens + app-shell 一并校验 |
| `npm run sync:auth-ui-css` | oui-* → auth-service |
| `npm run sync:fortune-ui-css` | oui-* → bazi/ziwei assets |

**修改 App Shell 或 Token 后**：先改 `shared/`，再跑 sync，再 `ui:check`，再提交所有副本。

---

## 3. 各 App 迁移状态（2026-07-08）

| App | @orasage/ui | App Shell | lucide | i18n | 下一步 |
|-----|:-----------:|:---------:|:------:|:----:|--------|
| main | ✅ 全量 | ✅ | ✅ | next-intl 12 | — |
| shop | ✅ Button | ✅ | ✅ | 硬编码中文 | Card/布局 CSS |
| tarot | ✅ Button | ✅ | ✅ | bridge | feature CSS token 化 |
| bazi | ✅ 少量 React | ✅ | ✅ | 自研 4 语 | detect → i18n |
| ziwei | 静态 oui | ✅ | ✅ | 自研 4 语 | React 控件试点 |
| admin | — | ✅ | ✅ | 中文 | oui 静态 |
| cms | — | ✅ | ✅ | 中文 | lockfile + redeploy |
| auth | 静态 oui | CSS | — | zh/en | 扩 T1 |

---

## 4. VPS 构建注意

引用 `file:../packages/ui` 的 App 在 `npm run build` 前须安装共享包依赖：

```bash
for pkg in packages/ui packages/tokens packages/i18n; do
  (cd "$pkg" && npm install --no-audit --no-fund)
done
```

已写入 `deploy/deploy-shop-on-vps.sh`、`deploy/tarot/deploy-tarot.sh`。

shop/tarot 须 `preserveSymlinks: true`（`tsconfig.json`，与 main 一致）。

---

## 5. 决策记录（ADR）

| ID | 决策 | 状态 |
|----|------|------|
| ADR-UI-001 | React 基础组件唯一源码：`packages/ui` | ✅ |
| ADR-UI-002 | Token 权威源：`shared/design-tokens/` | ✅ |
| ADR-UI-003 | App Shell 脚本化 sync + check | ✅ |
| ADR-UI-004 | 图标：lucide-react（chrome） | 🟡 进行中 |
| ADR-UI-005 | i18n 基座：`packages/i18n` | 🟡 基础已建 |
| ADR-UI-006 | tarot 保留浅色品牌 + 专属 feature CSS | ✅ Button 已统一 |
| ADR-UI-007 | shop/tarot 使用 `@orasage/ui/button` 窄导入 | ✅ |

---

## 6. 文档索引

| 文档 | 内容 |
|------|------|
| [ui-phase-1.md](./ui-phase-1.md) | Token 映射、首批组件 |
| [ui-status-2026-07.md](./ui-status-2026-07.md) | **全站 UI 审查快照** |
| [OraSage-Design-System-v1.1-Revised.md](./OraSage-Design-System-v1.1-Revised.md) | 品牌色、排版、组件视觉 |
| [packages/ui/README.md](../../packages/ui/README.md) | 组件 API、接入方式 |
| [shared/app-shell/README.md](../../shared/app-shell/README.md) | 导航同步 |
| [packages/i18n/README.md](../../packages/i18n/README.md) | locale 基座 |
