# OraSage 全站 UI 状况审查（2026-07-08）

> 审查基准：`main` @ `29fa163`（PR #194–#198 已合并并部署）  
> 关联：`ui-phase-2.md`、`platform-roadmap-2026-07.md`

---

## 1. 架构落地情况

| 层级 | 权威源 | 同步机制 | 状态 |
|------|--------|----------|------|
| 设计 Token | `shared/design-tokens/orasage-tokens.css` | `npm run tokens:sync` / `tokens:check` | ✅ 已脚本化 |
| Tailwind preset | `packages/tokens/tailwind-preset` | 随 tokens 包 | ✅ main/shop/ziwei 使用 |
| React 组件 | `packages/ui` → `@orasage/ui` | `transpilePackages` + TW content/@source | ✅ 见 §2 |
| 静态 oui-* CSS | `packages/ui/src/styles/components.css` | `sync:auth-ui-css` / `sync:fortune-ui-css` | ✅ auth/bazi/ziwei |
| App Shell | `shared/app-shell/` | `npm run app-shell:sync` / `app-shell:check` | ✅ 8 应用 + auth 静态 |
| 多语言基座 | `packages/i18n` → `@orasage/i18n` | shop-locale、tarot bridge | 🟡 基础已建，未全站铺开 |
| 图标 | `lucide-react` | App Shell + 各 App 依赖 | 🟡 导航已统一，内容层仍有 emoji |

**CI 建议**：`npm run ui:check`（tokens + app-shell）应在 PR 门禁中运行。

---

## 2. 各 App `@orasage/ui` 接入矩阵

| App | React 包 | 静态 oui CSS | 按钮/表单 | 说明 |
|-----|:--------:|:------------:|-----------|------|
| **main** | ✅ 全量（~27 文件） | — | Button/Card/Input/… | 参考实现；`/ui-preview` 组件目录 |
| **shop** | ✅ 窄导入 `@orasage/ui/button`（8 文件） | — | Button 已迁移；布局仍用 `shop-home.css` | |
| **tarot** | ✅ `@orasage/ui/button`（12+ 文件） | — | 全部 `.btn-*` 已替换；feature CSS 待 token 化 | TW4 + semantic bridge |
| **bazi** | ✅ TooltipProvider + 2 页 | ✅ `orasage-ui.css` | 静态 oui-*；命盘等业务组件保留 | TW4 `@source packages/ui` |
| **ziwei** | ❌ | ✅ `orasage-ui.css` | TW preset 已接 token；控件未换 React 包 | 主题色已绑定 token |
| **admin** | ❌ | tokens only | 纯 CSS + App Shell | |
| **cms** | ❌ | tokens + Payload UI | Admin 中文；内容 locale 字段 | |
| **auth** | ❌ | ✅ sync oui CSS | 静态 HTML 登录/用户中心 | |

### 窄导入约定（shop / tarot）

避免拉入完整 Radix barrel，交互按钮使用：

```tsx
import { Button } from '@orasage/ui/button';
```

消费 App 须声明传递依赖：`@radix-ui/react-slot`、`clsx`、`tailwind-merge`、`class-variance-authority`，且 VPS 构建前须 `npm install` 于 `packages/ui`。

---

## 3. App Shell 与导航

| 能力 | 状态 |
|------|------|
| PC 顶栏 `SiteTopNav` | ✅ 全站同步 |
| 移动底栏 5 键 `FixedBottomNav` | ✅ lucide 图标（Home/LayoutGrid/Flame/ShoppingCart/User） |
| 子页返回 `ChevronLeft` | ✅ |
| shop 购物车 `headerExtra` 插槽 | ✅ |
| tarot onboarding `immersive` / `showMobileBar` | ✅ |
| 语言切换器（全站 cookie） | ❌ 待 `packages/i18n` + shell 集成 |

---

## 4. 图标（lucide-react）

| 区域 | 状态 | 备注 |
|------|------|------|
| App Shell 底栏/返回 | ✅ lucide | 修改 `shared/app-shell` 后须 `app-shell:sync` |
| main 首页工具卡 | ✅ SunMoon / Sparkles / Moon | |
| shop 购物车 | ✅ ShoppingCart | |
| tarot 按钮区 | ✅ 部分（Church/Sparkles 等） | |
| ziwei 业务页 | ❌ 仍有 ✦🔗 等 emoji/SVG | ChartBoard 宫位 SVG 保留 |
| tarot 内容/数据 | ❌ 信仰 emoji、水晶列表 emoji | 属内容非 chrome |
| bazi | ✅ lucide（NotFound/ErrorBoundary） | |

**规范**：UI chrome 只用 `lucide-react`；命理/宗教**内容数据**中的 emoji 可保留，但不得在导航/按钮重复混用 emoji。

---

## 5. 多语言（i18n）

| App | 机制 | T1 四语 | 与 `@orasage/i18n` 关系 |
|-----|------|---------|-------------------------|
| main | next-intl（12 语） | ✅ | 可复用 `EXTENDED_LOCALES` |
| shop | 硬编码中文 UI | ❌ | locale/currency 经 shop-locale → i18n |
| bazi/ziwei | 自研字典 4 语 | ✅ | 待 `detectLocaleFromBrowser` 统一 |
| tarot | LangProvider 4 语 | 🟡 大量中文硬编码 | `orasage-locale` 已接 bridge |
| auth | zh/en 二元 | ❌ | 待扩 T1 |
| admin/cms | 中文后台 | — | 豁免 |

---

## 6. Tailwind 版本

| App | TW | preset / @source |
|-----|-----|------------------|
| main, shop, admin, ziwei | v3 | `@orasage/tokens/tailwind-preset` 或内联 semantic |
| bazi, tarot | v4 | `@source packages/ui` + shared tokens CSS |

长期收敛 v4；短期 preset 须双版本可用。

---

## 7. 生产部署（2026-07-08）

| 服务 | HTTP | Git | 备注 |
|------|------|-----|------|
| orasage.com | 307 | main | |
| auth.orasage.com | 200 | | |
| shop.orasage.com | 200 | | Phase 1+2 Button |
| admin.orasage.com | 200 | | |
| bazi.orasage.com | 200 | | PG 已迁移 |
| ziwei.orasage.com | 307 | | token preset |
| tarot.orasage.com | 200 | | Phase 2 @orasage/ui |
| cms | ⚠️ | | `npm ci` 锁文件不同步（lucide 已加未 lock）— 见 hotfix |

---

## 8. 待办优先级

### P0
- [ ] cms `package-lock.json` 与 lucide 依赖同步后 redeploy
- [ ] PR 门禁：`npm run ui:check`

### P1
- [ ] tarot `tarot-home.css` / `temple.css` / `geo-journey.css` token 化
- [ ] ziwei 业务页 emoji → lucide（保留 ChartBoard SVG）
- [ ] shop 商品卡/布局逐步用 `@orasage/ui` Card
- [ ] bazi/ziwei `detectLocale` → `@orasage/i18n`

### P2
- [ ] app-shell 语言切换器 + `NEXT_LOCALE` 跨子域 cookie
- [ ] admin 运营页 oui 静态类或轻量 React 包
- [ ] Tailwind v4 全站收敛

---

## 9. 验证命令

```bash
npm run ui:check
cd main && npm run build
cd shop && JWT_SECRET=... npm run build
cd tarot && JWT_SECRET=... npm run build
cd ziwei && npm run build
cd bazi && pnpm run build
```
