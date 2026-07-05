# 八字阶段 2 交接文档

> 更新：2026-07-03 · 分支 `cursor/bazi-phase2-preview-134d` · PR [#68](https://github.com/abutang-droid/orasage/pull/68)（draft）

供新对话继续优化八字计算器 UI / CMS / 部署。请先读 `docs/AGENT-RULES.md`（全站范围与导航规范）。

---

## 1. 当前状态摘要

| 项目 | 状态 |
|------|------|
| **阶段 1**（壳层：品牌、移动顶栏、PC 页脚） | 已验收，已合 `main` |
| **阶段 2**（计算器 UI + CMS 信息流 + Hero） | 功能已实现，**在预览分支上迭代**，尚未合 `main` |
| **生产站点** | VPS 当前跑的是 **预览分支** `cursor/bazi-phase2-preview-134d`，不是 `main` |
| **用户验收** | 清晰度、主站色板、占位符逻辑已基本 OK；Headless UI 状态分层（focus 浅底、hover 阴影）**未做** |

---

## 2. Git / PR / 部署

```bash
# 工作分支
git checkout cursor/bazi-phase2-preview-134d

# 仅部署八字
ORASAGE_REF=cursor/bazi-phase2-preview-134d bash deploy/remote-deploy-bazi.sh

# 部署 CMS（含迁移）
# 上传 deploy/cms/deploy-cms.sh 到 VPS 后：
sudo ORASAGE_REF=cursor/bazi-phase2-preview-134d bash /tmp/deploy-cms.sh

# 合入 main 后
ORASAGE_REF=main bash deploy/remote-deploy-bazi.sh
# + CMS deploy with ORASAGE_REF=main
```

- **PR**：https://github.com/abutang-droid/orasage/pull/68（draft）
- **预览 URL**：https://bazi.orasage.com
- **CMS 后台**：https://cms.orasage.com/admin

### 近期提交（从新到旧）

| Commit | 说明 |
|--------|------|
| `e385768` | 占位符约 20% 正文视觉权重 |
| `cd70331` | 出生时间/城市改为空值 + 极淡占位，去掉预填 1990/北京 |
| `5c9a37e` | 按钮/输入对比度、顶栏品牌/登录可读性 |
| `c082fcc` | 对齐主站纸感、CMS Hero、去计算器卡片底 |
| `074f0cd` | 修复 `BG_PAGE`；CMS `bazi_feed` locked-docs 迁移 |
| `ea3359c` | 阶段 2 首版：编辑风 UI + 滚动信息流 + CMS |

### 未提交本地改动（交接时）

`bazi/client/src/bazi-home.css` 可能有未 push 的 `.bazi-date-input::placeholder` 块，新对话请先 `git status` / `git diff`。

---

## 3. 阶段 2 需求与完成情况

### 原需求

| # | 内容 | 状态 |
|---|------|------|
| 5 | 计算器 UI 对齐主站编辑风（纸感、无紫色渐变） | 完成 |
| 6 | 计算器下方滚动信息流（订单 + 评价），CMS 可编辑 | 完成 |

### 后续 UI 迭代（用户反馈）

| 反馈 | 处理 |
|------|------|
| 与 main 风格/色板不一致 | 页面底 `#f7f3ea`，主色 jade `--primary`，去卡片壳 |
| 按钮/输入与背景混在一起 | 控件白底 `#fff` + 1.5px 描边 + 轻阴影 |
| 顶栏品牌/登录太淡 | `data-app="bazi"` 下品牌 ink-900，登录白底+翡翠绿字 |
| 占位符太深 | `--bazi-placeholder: rgb(var(--foreground) / 0.2)` |
| 不要预填 1990/北京 | `emptyForm()` 全空；DatePicker 显示极淡 `1900/01/01/00/00` |
| 城市占位「请输入出生城市」 | i18n `form.city.placeholder` |
| Headless UI 学习 | 见下文 §6，**尚未落地代码** |

---

## 4. 架构与关键文件

### Bazi 前端

| 路径 | 作用 |
|------|------|
| `bazi/client/src/pages/Home.tsx` | 主表单、提交校验、空默认值 |
| `bazi/client/src/bazi-home.css` | 计算器/Hero/信息流样式（**主战场**） |
| `bazi/client/src/components/BaziHomeHero.tsx` | CMS Hero 展示 |
| `bazi/client/src/components/BaziHomeFeed.tsx` | 滚动信息流 |
| `bazi/client/src/lib/cms-bazi-hero.ts` | 拉取 `globals/bazi-home-hero` |
| `bazi/client/src/lib/cms-bazi-feed.ts` | 拉取 `bazi-feed` 集合 |
| `bazi/client/src/components/WheelPicker.tsx` | `DatePicker`：空值时 `bazi-date-trigger--placeholder` |
| `bazi/client/src/lib/orasage-app-shell/AppShell.tsx` | `data-app={appId}` 用于八字顶栏样式 |
| `bazi/client/src/lib/orasage-app-shell/app-shell.css` | 壳层；light 主题 `--shell-bg: rgb(247,243,234)` |
| `bazi/client/src/index.css` | 全局 token；`ora-input` 等 |

### CMS

| 路径 | 作用 |
|------|------|
| `cms/src/globals/BaziHomeHero.ts` | Global：`bazi-home-hero`（同 main `home-hero` 字段） |
| `cms/src/collections/BaziFeed.ts` | 集合：`bazi-feed`（kind: order/review） |
| `cms/src/payload.config.ts` | 已注册上述 global + collection |
| `cms/src/migrations/20260703_180000_bazi_feed.ts` | bazi_feed 表 + 种子数据 |
| `cms/src/migrations/20260703_181000_bazi_feed_locked_docs_rels.ts` | payload_locked_documents_rels.bazi_feed_id |
| `cms/src/migrations/20260703_190000_bazi_home_hero_global.ts` | bazi_home_hero 表 + 种子 |
| `cms/src/migrations/20260703_191000_bazi_home_hero_locked_docs_rels.ts` | bazi_home_hero_id 外键 |

### API

```
GET https://cms.orasage.com/api/globals/bazi-home-hero?depth=1
GET https://cms.orasage.com/api/bazi-feed?where[enabled][equals]=true&where[locale][equals]=zh-CN&sort=sort
```

### 设计参考

- `docs/design-system/OraSage-Design-System-v1.1-Revised.md` — **唯一** UI 规范（DS v1.1 单色）
- `shared/design-tokens/orasage-tokens.css` — Token 实现
- `main/src/components/HomeSections.tsx` — Hero 结构参考（布局，非旧色板）

---

## 5. 表单逻辑要点

### 空表单默认值（`emptyForm()`）

```ts
year/month/day/hour/minute: ""
birthplace: { city: "", country: "" }
gender: ""
```

### 提交时回填（用户未填时）

- 姓名 → `访客`
- 时/分 → `08` / `00`
- 城市 → `北京`（仅计算用；界面不预显示）

### 校验

- 年月日、性别、城市必填（双人模式两人都要）
- 城市错误 key：`form.error.city` / `form.error.city_second`

### DatePicker 占位（未填时显示）

| 字段 | 占位显示 |
|------|----------|
| 年 | 1900 |
| 月日时分 | 01 / 01 / 00 / 00 |
| 样式类 | `.bazi-date-trigger--placeholder` → `var(--bazi-placeholder)` |

### 已知坑

- 曾出现 `BG_PAGE is not defined`（CitySearchInput 仍用 theme 常量时注意 import）
- CMS 新 collection 必须加 `payload_locked_documents_rels` 外键迁移，否则 admin 500
- 并发 deploy 可能锁 `.git/refs/...lock`，需 `rm -f` 后重跑 cms deploy
- `bazi/index.css` 里 `--background` 曾被覆盖为循环引用，新样式优先用 `rgb(var(--card))` / `rgb(var(--foreground))`

---

## 6. 待优化项（新对话建议）

### 用户已提、未实现

1. **Headless UI 状态分层**（参考 https://headlessui.tailwind.com/）
   - 输入 `data-hover` / `data-focus` 按 DS v1.1：聚焦黑边、无彩色底
   - 主按钮 `active` 使用 `--orasage-brand-primary-active`（`#262626`）
   - 可选：引入 `@headlessui/react` 的 `Field`/`Input`/`Button`（bazi 已有 `@orasage/ui` 依赖）

2. **占位符 20% 微调**
   - 当前 `--bazi-placeholder: rgb(var(--foreground) / 0.2)`
   - 用户原话：「正常显示 100，输入框里 20 就够」— 可按字段实测再调 0.15–0.25

3. **合 main + 生产切换**
   - 用户验收预览后合 PR #68 → `main` → `ORASAGE_REF=main` 全量部署

### 可选增强

- 将 `bazi/client/src/lib/orasage-app-shell/` 同步回 `shared/app-shell/`（当前八字壳层有 `data-app` 等仅 bazi 副本改动）
- `WheelPicker` 下拉层仍有旧深色硬编码色，结果页 `BaziResult.tsx` 未纳入阶段 2 风格统一
- CMS Hero 多语言：global 无 locale 字段，仅 feed 有 `locale`

---

## 7. 样式令牌速查（八字页 · DS v1.1）

```css
/* bazi-home-page 内 — 见 bazi-home.css */
--bazi-control-bg: var(--os-color-mono-white);
--bazi-control-border: var(--os-color-mono-gray-light);
--bazi-placeholder: var(--os-color-mono-gray-mid);

/* App shell 浅色 */
--shell-bg: #fafaf8;

/* 主按钮 / 选中分段 */
background: var(--os-color-mono-black);
color: var(--os-color-mono-white);
```

---

## 8. 导航规范（勿改错）

| 终端 | 八字页导航 |
|------|------------|
| PC | 顶栏：八字/紫微/塔罗/名人案例/道藏 + 登录 |
| 移动 | 底栏 5 键：首页·八字·祈福·商城·我的；顶栏仅品牌+登录 |
| 移动 main 首页 | 页脚隐藏（`hidden lg:block`）— 仅 main，八字有自己的 `PortalFooter` |

---

## 9. 新对话启动话术（可复制）

```
继续八字阶段 2 优化。请先读 docs/BAZI-PHASE2-HANDOFF.md 和 docs/AGENT-RULES.md。
分支 cursor/bazi-phase2-preview-134d，PR #68。
当前预览已部署 bazi.orasage.com。
任务：[填写具体优化项，例如 Headless UI focus/hover 状态、占位符微调、合 main 等]
```

---

## 10. 相关链接

- PR：https://github.com/abutang-droid/orasage/pull/68
- 预览：https://bazi.orasage.com
- CMS：https://cms.orasage.com/admin →「八字首页 Hero」「八字首页信息流」
- Headless UI 中文：https://headlessui.tailwind.org.cn/
