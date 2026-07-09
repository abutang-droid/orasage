# OraSage 全站 UI 状况审查（2026-07-08）

> 审查基准：`main` @ PR #229（ziwei UI 扫尾完成）  
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
| 多语言基座 | `packages/i18n`（locale 清单/检测/cookie/**统一字典运行时** `@orasage/i18n/react`） | main/shop next-intl（locale 源自包）；bazi/ziwei/tarot `I18nProvider` 适配层 | ✅ 全站一套机制（2026-07-09） |
| 图标 | `lucide-react` | App Shell + 业务组件 | 🟡 内容数据 emoji 保留 |

**CI**：`npm run ui:check` 已在 `.github/workflows/ui-check.yml` 门禁运行。

---

## 2. 各 App 接入矩阵

| App | TW4 | Bridge | `@orasage/ui` | i18n | 说明 |
|-----|:---:|:------:|:-------------:|:----:|------|
| **main** | ✅ | 共享 | 全量 (~31 文件) | next-intl 12 语 | 参考实现 |
| **shop** | ✅ | 共享 | Button + Card | next-intl T1 四语 | 已移除 deprecated `.shop-btn-*` |
| **tarot** | ✅ | 共享 + `tarot-tailwind-v4-theme.css` | Button | `@orasage/i18n/react` 适配（短码 API 保留）+ `ui-strings` / `reading-copy` / `feature-copy` | 启动读共享 cookie 已修复；核心流程四语 |
| **ziwei** | ✅ | 共享 + `ziwei-tailwind-v4-theme.css` | **Button + Card + Badge + Input + Checkbox**（业务组件已全量接入） | `@orasage/i18n/react` 适配 4 语 | `card-glass` / `card-inner` 已定义 |
| **bazi** | ✅ | 共享 + `bazi-tailwind-v4-theme.css` | TooltipProvider + 少量 | `@orasage/i18n/react` 适配 4 语（切换免整页刷新） | 命盘业务 CSS 保留 |
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
| packages/ui | TW4 dev toolchain（postcss + bridge） |

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

- ziwei `@orasage/ui` 业务组件接入已完成（Button / Card / Input / Badge / Checkbox；含 InsightPanel、知识库、古籍章节、ShareModal、BirthForm、AppShell 语言切换与返回）
- 其余应用（main / shop / admin / cms / bazi / tarot）可按需逐步接入
