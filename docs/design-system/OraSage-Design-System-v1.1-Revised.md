# OraSage Design System v1.1 (Revised)

**版本说明**：本版本遵循“极致克制”原则，剔除所有非必要的色彩，仅以**黑、白、灰**构建视觉体系。通过细腻的灰度层级与考究的排版，传达“现代东方工具书”的安静与专业。

> **品牌识别层**（标志「玄璧」、朱砂印色、子品牌背书、App / 社交媒体 / 线下应用）见 [`OraSage-VI-v1.0.md`](./OraSage-VI-v1.0.md)。本文档负责界面层；朱砂印色的使用配额与禁区以 VI §3.2 为准。

---

## 1. 品牌色彩 (Monochrome System)

核心理念：**无色胜有色**。通过 5 种核心灰度定义所有界面元素。

| Token | Hex | 用途 |
| :--- | :--- | :--- |
| **Pure Black** | `#171717` | 品牌色、一级文字、主按钮背景、标题 |
| **Deep Gray** | `#6B7280` | 二级文字、占位符 (Placeholder)、图标 |
| **Light Gray** | `#E7E5E4` | 边框 (Border)、分割线、次级按钮边框 |
| **Soft Surface** | `#FAFAF8` | 全局背景 (Background)、输入框禁用背景 |
| **Pure White** | `#FFFFFF` | 卡片背景 (Surface)、输入框背景、按钮文字 |

---

## 2. 排版系统 (Typography)

强调**衬线体 (Serif)** 与 **无衬线体 (Sans)** 的碰撞，营造书卷气息。

*   **中文标题 (H1-H4)**: `Source Han Serif SC` (思源宋体) - 字重：Bold
*   **中文正文**: `PingFang SC` - 字重：Regular / Medium
*   **英文/数字**: `Inter`
*   **代码/数据**: `JetBrains Mono`

### 字号与行高

| 级别 | Size | Weight | Line Height | 间距 (Letter Spacing) |
| :--- | :--- | :--- | :--- | :--- |
| **H1** | 40px | Bold | 1.2 | -0.02em |
| **H2** | 32px | Bold | 1.3 | -0.01em |
| **H3** | 24px | Medium | 1.4 | 0 |
| **Body** | 16px | Regular | 1.6 | 0.02em |
| **Small** | 14px | Regular | 1.5 | 0.02em |
| **Caption** | 12px | Regular | 1.5 | 0.05em |

---

## 3. 基础组件 (Base Components)

### 3.1 按钮 (Buttons)
统一圆角：`12px` | 高度：`44px` (Large) / `36px` (Medium)

*   **Primary (主按钮)**:
    *   背景：`#171717` (Black)
    *   文字：`#FFFFFF` (White)
    *   Hover：背景 `#333333` | 动效：`translateY(-1px)`
*   **Secondary (次按钮)**:
    *   背景：`#FFFFFF`
    *   文字：`#171717`
    *   边框：`1px solid #E7E5E4`
    *   Hover：背景 `#FAFAF8`
*   **Ghost (幽灵按钮)**:
    *   背景：Transparent
    *   文字：`#6B7280`
    *   Hover：文字 `#171717`

### 3.2 输入框 (Inputs)
统一圆角：`12px` | 高度：`44px`

*   **Default (默认状态)**:
    *   背景：`#FFFFFF`
    *   边框：`1px solid #E7E5E4`
    *   文字：`#171717`
    *   **占位符 (Placeholder)**: `#A1A1AA` (淡灰色)
*   **Focus (聚焦状态)**:
    *   边框：`1px solid #171717` (黑边)
    *   阴影：无 (保持克制)
*   **Disabled (禁用状态)**:
    *   背景：`#FAFAF8`
    *   文字：`#D1D5DB`
    *   边框：`1px solid #F3F4F6`

---

## 4. 界面元素 (UI Elements)

### 4.1 卡片 (Card)
*   背景：`#FFFFFF`
*   圆角：`16px`
*   边框：`1px solid #E7E5E4`
*   阴影：`0 1px 2px rgba(0,0,0,0.04)` (极轻微)

### 4.2 分割线 (Divider)
*   颜色：`#E7E5E4`
*   厚度：`0.5px` (在高清屏上表现更细腻)

---

## 5. CSS Design Tokens

```css
:root {
  /* Colors */
  --color-black: #171717;
  --color-white: #FFFFFF;
  --color-gray-deep: #6B7280;
  --color-gray-light: #E7E5E4;
  --color-bg: #FAFAF8;
  --color-placeholder: #A1A1AA;

  /* Typography */
  --font-serif: "Source Han Serif SC", serif;
  --font-sans: "Inter", "PingFang SC", sans-serif;

  /* Components */
  --radius-btn: 12px;
  --radius-card: 16px;
  --input-height: 44px;
  
  /* Animation */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 200ms;
}
```

---

## 6. 最终设计目标 (Design Goal)

OraSage 的视觉应如同一张**铺在木质桌面上的宣纸**：
1.  **静谧**：不通过颜色抢夺注意力，让命理内容本身说话。
2.  **秩序**：通过严谨的对齐与栅格，体现“工具书”的逻辑感。
3.  **人文**：利用宋体的衬线细节，平衡科技带来的冰冷感。

---

## 7. PC 页脚 (Site Footer)

全站统一的桌面端页脚组件，**格式与样式必须一致**，不得在各 App 自行增删内容或改写布局。

### 7.1 展示范围

| 视口 | 行为 |
| :--- | :--- |
| **PC（≥1024px）** | 主站首页、`/profile` 及子页等指定路由底部展示页脚 |
| **移动端（<1024px）** | **隐藏**；导航与法律入口由底栏 / 页面内菜单承担 |

主站 `ConditionalFooter` 在门户首页与「我的」模块（`isOnProfile`）渲染同一 `Footer` 组件。

### 7.2 内容（仅此三项）

1. **版权信息** — i18n `footer.copyright`，例：`© 2026 OraSage. All rights reserved.`
2. **隐私政策** — i18n `footer.privacy`，链接至主站 `/{locale}/privacy`
3. **用户协议（服务条款）** — i18n `footer.terms`，链接至主站 `/{locale}/terms`

**禁止**在页脚展示登录用户名、邮箱或其他账户 PII。账户信息仅在顶栏登录芯片、「我的」账户卡片等专用区域展示。

### 7.3 布局与样式

```
┌──────────────────────────────────────────────────────────────┐
│  © 2026 OraSage …          隐私政策    服务条款              │
│  （左对齐版权）              （右对齐链接，gap 24–32px）      │
└──────────────────────────────────────────────────────────────┘
         max-width: 72rem (max-w-6xl) · padding: py-8 px-5/6
```

| 属性 | 规范 |
| :--- | :--- |
| 容器 | `safe-bottom mt-auto hidden lg:block` |
| 内层 | `max-w-6xl`，`flex`，`sm:flex-row sm:justify-between`，`gap-20px` |
| 版权文字 | `text-xs sm:text-sm`，`text-muted-foreground` |
| 链接 | `text-sm text-muted-foreground`，`min-height: 44px`，hover → `text-primary` |
| 链接间距 | 移动端 `gap-32px`，桌面 `gap-24px` |

### 7.4 实现引用

| App |  canonical 实现 |
| :--- | :--- |
| **main 门户** | `main/src/components/Footer.tsx` |
| **子应用**（八字 / 紫微 / 塔罗 / 商城） | `PortalFooter` + `shared/app-shell/app-shell.css` 中 `.orasage-portal-footer*`；链接指向主站 `/{locale}/privacy` 与 `/{locale}/terms` |

子应用页脚须在视觉上与 main `Footer` 等效（左右分栏、相同字号与灰度），不得引入额外栏目或用户信息。

### 7.5 门禁检查

- [ ] PC 页脚仅含版权 + 隐私 + 用户协议
- [ ] 移动端页脚隐藏
- [ ] 无登录态相关的用户名 / 邮箱展示
- [ ] 各 App 链接均指向主站统一法律页面

---

## 8. 「我的」模块 (Profile Module)

用户中心路由为 `/{locale}/profile` 及其子页。模块**不得**自建顶栏或页内返回条，全站壳层统一承担导航与登录态展示。

### 8.1 顶栏与登录态（与子应用一致）

| 视口 | 左 | 右 |
| :--- | :--- | :--- |
| **PC（≥1024px）** | `OraSage` 品牌 | 全站导航链接 + `OrasageAuthChip`（登录 / 用户名） |
| **移动（<1024px）** | `OraSage` 品牌 | `OrasageAuthChip`（登录 / 用户名） |

- 实现：`main/src/components/Header.tsx` + `shared/app-shell/OrasageAuthChip.tsx`
- **禁止**在 profile 布局内重复渲染标题栏、`PageTitle`「我的」或 `PortalBackToolbar` 返回条
- 当前页身份由底栏「我的」高亮 + 子页 `ProfileSection` 标题表达

### 8.2 未登录引导（Login Card）

统一组件 `ProfileLoginCard`（`main/src/components/profile/ProfileLoginCard.tsx`）：

| 元素 | 规范 |
| :--- | :--- |
| 容器 | `@orasage/ui` `Card`，内容区 `py-10` / `sm:py-12`，居中 |
| 标题 | 衬线 `text-heading-3`，i18n `profile.loginTitle` |
| 说明 | `text-sm text-muted-foreground`，hub 用 `guestDesc`，门禁页用 `loginRequired` |
| 主操作 | Primary `Button` `size="lg"` → 外链 auth 登录 |
| 次操作 | 仅 gate 变体：返回概览链接 |

### 8.3 内容区

- 容器：`ProfileShell`（`max-w-3xl`，无 back toolbar）
- 子页标题：`ProfileSection` 内单一 `h1` + 可选描述
- 已登录账户编辑：`ProfileAccountCard`（昵称、退出等）

### 8.4 PC 页脚

「我的」模块各页须展示 §7 统一 `Footer`（`ConditionalFooter` + `isOnProfile`），不得另写页脚变体。

### 8.5 门禁检查

- [ ] profile 布局无 `PageTitle` / `PortalBackToolbar`
- [ ] 移动顶栏仅品牌 + `OrasageAuthChip`
- [ ] 未登录 hub / 门禁页使用 `ProfileLoginCard`
- [ ] PC 底栏展示 §7 标准页脚

### 8.6 Auth 登录 / 注册页（`auth.orasage.com`）

静态页与「我的」模块遵循同一壳层规范：

| 元素 | 实现 |
| :--- | :--- |
| PC 顶栏 | `topNavHtml` — 品牌 + 全站导航 + `OrasageAuthChip` |
| 移动顶栏 | `mobileNavHtml` — 品牌 + `OrasageAuthChip`（`data-hydrate-auth`） |
| 内容 | `auth-card` 分区：标题区（白底）+ 表单区（`#FAFAF8` 底） |
| PC 页脚 | `footerHtml` — §7 版权 / 隐私 / 用户协议 |
| 禁止 | 页内 `page-header` 重复品牌条 |

**表单区（`auth-*` 类，DS §3.1 / §3.2）**

| 元素 | 规范 |
| :--- | :--- |
| 标签 | `auth-label` — 14px Medium `#171717`，与输入框间距 8px |
| 输入框 | `auth-input` — 高 44px，白底，`1px #E7E5E4` 边框，圆角 12px；focus 黑边 |
| 主按钮 | `auth-submit` — 高 48px，全宽，`#171717` 底 / 白字，圆角 12px |
| 字段间距 | 相邻 `auth-field` 间距 20px；按钮上方 24px |
| 切换链接 | `auth-card-footer` 顶部分割线，与表单区隔开 |

静态页须使用显式 hex 色值（`auth-*`），不可依赖 `rgb(var(--token))` 未解析的 `oui-*` 类。

实现：`auth-service/src/lib/site-chrome-html.ts`、`auth-service/src/routes/pages.ts`、`auth-service/public/assets/style.css`

---

## 9. 图标（Icons）

**规范（2026-07-08）**：全站 UI chrome（导航、按钮、工具栏）统一使用 [`lucide-react`](https://lucide.dev)。

| 场景 | 图标示例 | 说明 |
| :--- | :--- | :--- |
| 底栏首页 | `Home` | `shared/app-shell/BottomNav` |
| 底栏探索/应用 | `LayoutGrid` | 第二键动态品牌 |
| 底栏祈福 | `Flame` | 链向神庙/祈福 |
| 底栏商城 | `ShoppingCart` | |
| 底栏我的 | `User` | |
| 子页返回 | `ChevronLeft` | `AppShell` 工具条 |
| 门户工具卡 | `SunMoon` / `Sparkles` / `Moon` | 八字 / 紫微 / 塔罗 |

- 尺寸：导航 20px、`strokeWidth` 1.6；按钮内 18px 常见。
- **禁止**在导航/主按钮使用 emoji（🛒✦🌙）替代图标。
- 命理内容数据（信仰符号、水晶五行 emoji）可保留，但不得与 chrome 混用同一语义。

修改 App Shell 图标后执行 `npm run app-shell:sync`；各 App 须声明 `lucide-react` 依赖。

---

## 10. 多语言与 Locale（i18n）

**基座包**：`packages/i18n`（`@orasage/i18n`）

| 级别 | 语言 | 用途 |
| :--- | :--- | :--- |
| T1 核心 | zh-CN、zh-TW、en、pt-BR | 命理 App + 全站保证 |
| T2 扩展 | + es/fr/de/ja/ko/vi/th/ar | main 门户展示 |

检测优先级：`?lang=` → cookie `NEXT_LOCALE` → `Accept-Language` → 默认 `zh-CN`。

- main：next-intl + `messages/*.json`
- shop：locale/货币经 `shared/shop-locale`（委托 i18n）
- bazi/ziwei/tarot：自研字典；locale 来源待统一为共享 cookie
- admin/cms/auth 后台：中文豁免

全站语言切换器（待实现）应写入 `.orasage.com` cookie，各子域读取同一 `normalizeLocale` 结果。

详见 `packages/i18n/README.md`、`docs/design-system/ui-status-2026-07.md`。
