# OraSage 全站 UI 状况审查（2026-07-08）

> 审查基准：`main` @ PR #220+（TW4 全站收敛、UI 风险修复）  
> 关联：`ui-phase-2.md`、`design-unify-backlog.md`

---

## 1. 架构落地情况

| 层级 | 权威源 | 同步机制 | 状态 |
|------|--------|----------|------|
| 设计 Token | `shared/design-tokens/orasage-tokens.css` | `npm run tokens:sync` / `tokens:check` | ✅ |
| Tailwind v4 bridge | `packages/tokens/src/tailwind-v4-bridge.css` | 各 Next/Vite app `@import` | ✅ 全站 |
| App 专属 theme | `*-tailwind-v4-theme.css`（ziwei/tarot/bazi） | 随 app globals 引入 | ✅ |
| React 组件 | `packages/ui` → `@orasage/ui` | `transpilePackages` + `@source` | ✅ 见 §2 |
| 静态 oui-* CSS | `packages/ui/src/styles/components.css` | `sync:auth-ui-css` / `sync:fortune-ui-css` | ✅ rgb 通道兼容 |
| App Shell | `shared/app-shell/` | `npm run app-shell:sync` / `app-shell:check` | ✅ 8 应用 + auth |
| 多语言基座 | `packages/i18n` + tarot `ui-strings.ts` | main/shop next-intl；tarot LangProvider | 🟡 tarot 核心流程已外化 |
| 图标 | `lucide-react` | App Shell + 业务组件 | 🟡 内容数据 emoji 保留 |

**CI**：`npm run ui:check` 已在 `.github/workflows/ui-check.yml` 门禁运行。

---

## 2. 各 App 接入矩阵

| App | TW4 | Bridge | `@orasage/ui` | i18n | 说明 |
|-----|:---:|:------:|:-------------:|:----:|------|
| **main** | ✅ | 共享 | 全量 (~31 文件) | next-intl 12 语 | 参考实现 |
| **shop** | ✅ | 共享 | Button + Card | next-intl T1 四语 | 已移除 deprecated `.shop-btn-*` |
| **tarot** | ✅ | 共享 + `tarot-tailwind-v4-theme.css` | Button | LangProvider + `ui-strings` geo/temple/faith/**merit/crystal/wish** | geo/temple/功德/水晶/心愿四语 |
| **ziwei** | ✅ | 共享 + `ziwei-tailwind-v4-theme.css` | 静态 oui CSS | 自研 4 语 | `card-glass` / `card-inner` 已定义 |
| **bazi** | ✅ | 共享 + `bazi-tailwind-v4-theme.css` | TooltipProvider + 少量 | 自研 4 语 | 命盘业务 CSS 保留 |
| **admin** | ✅ | 共享 | **Button**（登录/表单提交） | 中文后台 | 运营页逐步迁移 |
| **cms** | — | Payload UI | ❌ | 中文 | 内容 locale 字段 |
| **auth** | — | tokens + oui CSS | ❌ | T1 四语静态页 | |

---

## 3. App Shell 与导航

| 能力 | 状态 |
|------|------|
| PC 顶栏 / 移动底栏 lucide | ✅ |
| shop 购物车插槽 | ✅ |
| tarot immersive 模式 | ✅ |
| **语言切换器 + 跨子域 cookie** | ✅ |

---

## 4. Tailwind v4 收敛

| 应用 | Bridge |
|------|--------|
| main / shop / admin / ziwei | `packages/tokens/tailwind-v4-bridge.css` |
| tarot | 共享 bridge + `tarot/tarot-tailwind-v4-theme.css` |
| bazi | 共享 bridge + `bazi/bazi-tailwind-v4-theme.css` |
| packages/ui | TW3 构建（组件库 devDependency） |

**全站 Next/Vite 前台应用均已 TW4。**

---

## 5. 验证命令

```bash
npm run ui:check
cd main && npm run build
cd shop && JWT_SECRET=dev-secret-key-at-least-32-chars-long npm run build
cd tarot && JWT_SECRET=dev-secret-key-at-least-32-chars-long npm run build
cd ziwei && npm run build
cd bazi && pnpm run build
cd admin && JWT_SECRET=dev-secret-key-at-least-32-chars-long npm run build
```

---

## 6. 剩余可选跟进

- tarot 三牌阵/历史页等其余业务文案 i18n
- ziwei 接入 `@orasage/ui` React 包（当前静态 oui）
- packages/ui 构建链升级 TW4
