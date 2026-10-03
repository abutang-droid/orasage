# OraSage / 海棠未眠 · 品牌设计规范

> **地位：全站唯一现行视觉规范。** 版本 **v2.1**（2026-10-03）。语言规则：中文 locale 用中文；其它语言不用汉字。  
> 旧文档 `OraSage-VI-v1.0.md`、`OraSage-Design-System-v1.1-Revised.md`、`ui-phase-1.md`、`ui-phase-2.md`、`ui-status-2026-07.md`、塔罗「暗金」指南、八字薰衣草金说明 **均已废止**，不得再作为设计依据。  
> 导出包：[`export/`](./export/)（PDF / HTML / ZIP）。

本文覆盖品牌识别、壳层界面、命理编辑层（Vibe）、资产与 Token。界面 chrome 与命理长文是**同一套规范里的两层**，不是两套品牌。

| 层 | 用在哪 | 主色 |
| :--- | :--- | :--- |
| **壳层 Chrome** | 顶栏、导航、页脚、按钮、表单、卡片壳 | 灰度宪法 + 朱砂钤印 |
| **编辑层 Vibe** | 八字报告、命理长文、付费解读内容区 | 赭石编辑风 |

全站导航形态仍遵守 [`docs/AGENT-RULES.md`](../AGENT-RULES.md)（PC 顶栏 / 移动折叠菜单，不另起视觉体系）。

---

## 1. 品牌核心

### 1.0 适用范围

本规范约束 **orasage.com 全站 8 应用**（main / shop / auth / admin / cms / bazi / ziwei / tarot）的视觉与品牌文案。判定语言以当前界面 **`locale`** 为准（`packages/i18n` 的 `normalizeLocale` / cookie `NEXT_LOCALE`），不以 IP 或系统语言单独决定。

**总则：中文版本用中文；其它语言版本不用中文。**

| 版本 | Locale（含归一化） | 品牌名 | 用户可见文案 |
| :--- | :--- | :--- | :--- |
| **中文** | `zh-CN`；以及 `zh` / `zh-Hans` / `zh-TW` / `zh-HK` / `zh-Hant` 归一后的中文 | **海棠未眠**（可并列 `海棠未眠 OraSage`） | 中文（简体或对应繁体） |
| **其它语言** | 现行 `en`、`pt-BR`；以及未来 `es` / `fr` / `de` / `ja` / `ko` / `vi` / `th` / `ar` 等 | **仅 OraSage** | 该语言（缺译回退英文） |

**中文版本必须用到中文**

- 导航、按钮、表单、空态、报告正文、法律页：中文。
- 品牌署名：页脚法律行、关于 / 品牌页、报告封面封底须出现 **海棠未眠**（可写成 `海棠未眠 OraSage`）。
- 顶栏字标：拉丁 `OraSage` 可保留作识别；须另有中文品牌名或中文导航，不得把中文版做成纯英文壳。
- 定位语「命理与能量」、子品牌中文（八字 / 紫微 / 塔罗 / 能量商城）仅出现在中文版本。

**其它语言版本不得出现中文**

- 禁止汉字，包括 **海棠未眠**、命理与能量、首页 / 商城 / 玄析 / 造物 / 测算、八字 / 紫微 等。
- 品牌只写 **OraSage**；法律行 `© {year} OraSage. All rights reserved.`
- 子品牌背书只写 `by OraSage`（BaZi / ZiWei / Manto / Energy 为拉丁专名，不是中文）。
- OG / 商店截图 / 邮件 / 启动屏：每种 locale 单独出图与文案；英文、葡语等物料上不得印海棠未眠。
- 用户自己输入的中文（命盘备注、提问）可原样展示，不属品牌文案。

**全语言共通（与 locale 无关）**

- 代码、域名、cookie、环境变量：`orasage`（小写拉丁）。
- 玄璧图形标无文字，各语言同一套 SVG。
- 视觉层（灰度壳层 + Vibe 报告）全站同一套，不随语言换配色。
- 运营后台 admin / cms 当前为中文界面，按**中文版本**执行。

### 1.1 名称

| 项 | 规范 |
| :--- | :--- |
| 英文品牌名（唯一合法写法） | **OraSage**（O、S 大写，其余小写） |
| 中文品牌名（唯一合法写法） | **海棠未眠** |
| 英文释义 | Oracle + Sage —— 天启与智者 |
| 中文定位语 | 命理与能量 |
| 并列署名（中文正式场合） | **海棠未眠 OraSage** |
| 域名 / 代码 | 全小写 `orasage` |

**中文名寓意**：夜色里仍醒着的海棠——静观、不催、纸上一点暖色。与宣纸隐喻、赭石编辑色同调。禁止望文生义改成「海棠花未眠」「未眠海棠」等营销变体。

**使用场景（按 locale，详见 §1.0）**

| 场景 | 中文版本 | 其它语言版本 |
| :--- | :--- | :--- |
| 代码、URL、cookie、环境变量 | `orasage` | 同左 |
| 顶栏字标 | `OraSage`（可加中文副名海棠未眠） | 仅 `OraSage` |
| 品牌页 / 关于 / 报告封面封底 | `海棠未眠` 或 `海棠未眠 OraSage` | 仅 `OraSage` |
| 法律行 | `© {year} 海棠未眠 OraSage. All rights reserved.` | `© {year} OraSage. All rights reserved.` |
| 子品牌背书 | 可 `海棠未眠` | 仅 `by OraSage` |
| 导航与按钮 | 中文 | 该语言，无汉字 |

**禁止**

- `Orasage` / `ORASAGE` / `oraSage`
- `海棠未名` / `海堂未眠` / `海棠未眠花` / `未眠海棠`（作品牌名时）
- 把中文名写进域名或 CSS 变量名
- 在 `en` / `pt-BR` 及其它非中文 locale 出现任何汉字品牌或导航文案

### 1.2 性格与隐喻

静谧 · 秩序 · 人文 · 笃定。

品牌隐喻：**铺在木质桌面上的一张宣纸** —— 界面是纸，命理内容是墨，品牌是纸角的一方钤印；海棠是那点未眠的暖色。

---

## 2. 标志 · 玄璧 Aperture

图形标：带缺口的圆环 + 中心一点。缺口 = Oracle（东北 45°，紫气东来）；中心点 = Sage。圆环同时是字母 O。

字标：`OraSage`，思源宋体 SemiBold，字距 `0.08em`。中文名 `海棠未眠` 用同一套宋体，字距 `0.12em`。

**图形与字标默认分开**：顶栏只用字标；favicon / 图标 / 水印只用图形。组合锁定仅限邮件页脚、报告封面封底、包装等正式署名。中文版本的正式锁定可在字标下设一行 `海棠未眠`（深灰、字距 0.12em）；**非中文版本不得加这行汉字**。

### 2.1 几何（canonical）

画布 `viewBox="0 0 64 64"`，圆心 `(32,32)`。

| 元素 | 规格 |
| :--- | :--- |
| 圆环 | 半径 22，描边 4.5，round cap |
| 缺口 | 圆心角 38°，中心方位 45°；弧自 64° 逆时针至 26° |
| 中心点 | 半径 4.5 实心圆 |
| 最小尺寸 | 图形 ≥16px；组合宽 ≥88px；印刷直径 ≥6mm |

```svg
<svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M 41.645 12.226 A 22 22 0 1 0 51.774 22.355"
        stroke="#171717" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="32" cy="32" r="4.5" fill="#171717"/>
</svg>
```

**小尺寸光学修正**：≥48px 描边 4.5；32–47px → 5.5；24–31px → 6.5；16–23px → 8。

源文件：`shared/brand/logo/orasage-mark-{ink,paper,cinnabar}.svg`。勿手改路径数值。

### 2.2 颜色版本

| 版本 | 图形 | 底 | 用途 |
| :--- | :--- | :--- | :--- |
| 墨版 | `#171717` | 纸 / 白 | 默认 |
| 反白版 | `#FAFAF8` | 墨 | 墨底锁定 |
| 朱砂底版 | `#FAFAF8` | `#A63F33` | 节庆 / 封口 |
| 朱砂印版 | `#A63F33` | 纸 | 钤印，≤5% |

禁止：拉伸、旋转缺口、投影 / 渐变、改缺口、与其它图形拼合、复杂照片上直接放墨版。

---

## 3. 色彩

### 3.1 壳层 · 灰度宪法 + 朱砂钤印

核心理念：**无色胜有色**。去掉朱砂后信息层级仍须完整。朱砂是钤印，不是第二品牌色。单页面积 ≤5%。**禁止**用于按钮、链接、导航、大面积底色、正文强调。

| Token | Hex | 用途 |
| :--- | :--- | :--- |
| 墨 Ink | `#171717` | 品牌、一级文字、主按钮 |
| 深灰 | `#6B7280` | 二级文字、图标 |
| 中灰 | `#A1A1AA` | 占位符 |
| 浅灰 | `#E7E5E4` | 边框 |
| 纸 Paper | `#FAFAF8` | 全局背景 |
| 宣白 | `#FFFFFF` | 卡片、输入 |
| 朱砂 600 | `#A63F33` | 钤印 |
| 朱砂 700 | `#8C3529` | hover |
| 朱砂 100 | `#F6E8E4` | 极少用浅底 |

功能色（仅校验 / 状态）：成功 `#16A34A` · 警告 `#D97706` · 错误 `#DC2626` · 信息 `#2563EB`。

### 3.2 编辑层 · Vibe 赭石（命理报告）

八字报告、命理长文、付费解读**内容区**使用本节。不替代壳层灰度；不把赭石铺到顶栏 / 底栏 / 全站按钮。

实现：`bazi/client/src/styles/bazi-report-vibe.css`（作用域 `.bazi-report-vibe`）。运行时 Token 见 `shared/design-tokens/orasage-tokens.css` 的 `--os-vibe-*`。

| Token | Hex | 用途 |
| :--- | :--- | :--- |
| `--os-vibe-brand` | `#C96442` | 赭石主色、价格、强调字、主 CTA |
| `--os-vibe-brand-light` | `#E0A892` | 浅赭 |
| `--os-vibe-brand-faded` | `#F4E0D5` | 芯片底、引用条、paywall 边 |
| `--os-vibe-brand-deep` | `#934828` | CTA hover、深强调 |
| `--os-vibe-background` | `#FAF9F5` | 报告背景（略暖于全站纸色） |
| `--os-vibe-surface` | `#FFFFFF` | 卡片 |
| `--os-vibe-card` | `#F5F4EF` | 软底、Tab 槽 |
| `--os-vibe-foreground` | `#3D3929` | 报告正文 |
| `--os-vibe-muted-foreground` | `#6E6D68` | 次级 |
| `--os-vibe-text-light` | `#9B988C` | 标签 |
| `--os-vibe-border` | `#DAD9D4` | 边框 |
| `--os-vibe-success` | `#788C5D` | 报告内成功 |
| `--os-vibe-error` | `#D64545` | 报告内错误 |
| `--os-vibe-warn` | `#D4872C` | 报告内警告 |
| `--os-vibe-purple` | `#9C87F5` | 图表点缀（非壳层品牌色） |

图表序列：`#C96442` / `#9C87F5` / `#788C5D` / `#6E6D68` / `#D4872C`。

---

## 4. 字体

| 角色 | 字体 | 用法 |
| :--- | :--- | :--- |
| 英文字标 | Source Han Serif SC / Noto Serif SC 600 | `OraSage`，字距 0.08em |
| 中文品牌名 | 同上 600 | `海棠未眠`，字距 0.12em |
| 壳层中文标题 | 思源宋体 Bold | H1 40 / H2 32 / H3 24 |
| 壳层中文正文 | PingFang SC / Noto Sans SC | 16px / 行高 1.6 |
| 壳层拉丁 / 数字 | Inter | 日期、价格、域名 |
| 干支 / 数据 | JetBrains Mono | 四柱、时间码 |
| **Vibe 展示** | Newsreader / Noto Serif SC | 报告大字、价格、首字下沉 |
| **Vibe 正文** | Lora / Noto Serif SC | 报告段落 |
| **Vibe UI 字** | Poppins / Noto Sans SC | 标签、Tab、按钮 |

拉丁展示衬线（壳层英文大标题）用 Source Serif 4。Playfair Display 已退役。

---

## 5. 子品牌

母品牌统领，四个子标**统一网格、无独立配色**。个性只通过内芯图形、文案语气、线描插画表达。

| 子品牌 | 中文 | 图形内芯 | 域 |
| :--- | :--- | :--- | :--- |
| BaZi | 八字命理 | 太极分形 + 点 | bazi.orasage.com |
| ZiWei | 紫微斗数 | 八角星 | ziwei.orasage.com |
| Manto | 塔罗占卜 | 竖牌 + 点 | tarot.orasage.com |
| Energy | 能量商城 | 能量袋 | shop.orasage.com |

外环半径 22、描边 3、**无缺口**（缺口为母品牌专属）。源：`shared/brand/subbrands/`。

已废止的子品牌独立体系：tarot 暗金（`#0D0D0D` / `#C9954A`）、bazi 薰衣草金（`#F7F4FA` / `#D9A441` / `#2E295B`）、ziwei 金渐变。

---

## 6. 壳层界面

### 6.1 按钮

圆角 12px；高 44px（Large）/ 36px（Medium）。

| 变体 | 规范 |
| :--- | :--- |
| Primary | 底 `#171717` / 字 `#FFFFFF`；hover `#333`，`translateY(-1px)` |
| Secondary | 白底、黑字、`1px #E7E5E4` |
| Ghost | 透明底，字 `#6B7280`，hover 字 `#171717` |

### 6.2 输入

高 44px，圆角 12px，白底，`1px #E7E5E4`；focus **黑边、无阴影**；placeholder `#A1A1AA`。

### 6.3 卡片 / 分割

卡片：白底，圆角 16px，边框 `1px #E7E5E4`，阴影 `0 1px 2px rgba(0,0,0,.04)`。分割线 `#E7E5E4`，0.5–1px。

### 6.4 图标与顶栏

lucide-react，导航 20px / stroke 1.6。chrome **禁止 emoji**。顶栏纯文字字标 `OraSage`，不加图形。

### 6.5 页脚（PC ≥1024px）

仅版权 + 隐私 + 服务条款。移动端隐藏。实现：`main/src/components/Footer.tsx`、子应用 `PortalFooter`。中文 locale 版权为 `海棠未眠 OraSage`；其它语言仅 `OraSage`（§1.0）。

### 6.6 「我的」与 Auth

profile 不得自建顶栏。Auth 表单：标签 14px、输入 44px、提交 48px 全宽黑底。实现：`auth-service/src/lib/site-chrome-html.ts`。

### 6.7 响应式与触控

导航形态以 [`docs/AGENT-RULES.md`](../AGENT-RULES.md) 为准：PC ≥1024px 顶栏水平菜单；移动 <1024px 品牌 + 折叠菜单，**无底部固定栏**。触控目标 ≥44px；使用 `env(safe-area-inset-*)`；禁止横向溢出。

---

## 7. Vibe 编辑层（命理报告）

作用域：`.bazi-report-vibe`。桌面内容栏最大宽 480px，圆角 1.5rem。

### 7.1 组件

| 类 | 规范 |
| :--- | :--- |
| `.vr-card` | 白底，边框 `#DAD9D4`，圆角 1.5rem，内边距 1.5rem，轻阴影 |
| `.vr-card--soft` | 底 `#F5F4EF` |
| `.vr-eyebrow` | Poppins 11px / 600 / 字距 0.12em / 大写 / 色 `#C96442` |
| `.vr-tabbar` | 双列胶囊槽；选中 Tab 赭石底白字 + `0 4px 12px rgba(201,100,66,.3)` |
| `.vr-chip-primary` | 赭石实心白字 |
| `.vr-chip-soft` | 浅赭底、深赭字 |
| `.vr-btn-primary` | 胶囊、赭石底、白字、字重 600；hover `#934828` |
| `.vr-btn-ghost` | 透明，字 `#934828`，hover 浅赭底 |
| `.vr-btn-secondary` | 白底描边胶囊 |
| `.vr-hero-char` | Newsreader 4.5rem / 300 / 赭石 |
| `.vr-price` | Newsreader 2.75rem / 500 / 赭石 |
| `.vr-quote-line` | 斜体衬线 + 左 2px 浅赭条 |
| `.vr-drop-cap::first-letter` | 3rem 斜体赭石首字 |
| `.vr-paywall` | 浅赭渐变底 + 浅赭边 |
| `.vr-diamond` | 两侧细赭线 + 旋转 45° 小方点 |
| `.vr-bar-fill` | 圆角进度条，填充用图表色 |

动效：`vibe-fade-in` 350ms ease，位移 6px。尊重 `prefers-reduced-motion`。

### 7.2 边界

- Vibe 主按钮可以是赭石（报告 CTA / 解锁）；**全站壳层主按钮仍为墨色**。
- 不得把 `--os-vibe-purple` 或赭石用到 App Shell。
- 报告内状态色用 Vibe 表，不用壳层绿/红抢视觉。

---

## 8. 数字、印刷与图像

- **Favicon / OG**：`shared/brand/favicon/`、`shared/brand/og/`，同步到各 App。OG：纸底 + 左上字标 + 大标题 + 右上淡玄璧水印。
- **邮件**：页眉仅字标；页脚墨底反白锁定。
- **插画**：单色墨线描，至多一处朱砂或赭石点睛；禁止面性扁平 / 3D。
- **摄影**：纸色背景、自然侧光、留白 ≥40%。
- **印刷**：未涂布自然白；墨四色黑或单黑；朱砂近似 C0 M62 Y69 K35。工艺白名单：单色、朱砂专色、压凹、局部 UV。禁止烫金、镭射、渐变堆叠。
- 完整应用细则（App 图标、社媒画幅、包装分层）沿用原 VI 已确认口径，冲突时以**本文**为准。

---

## 9. Token 与实现地图

| 层级 | 唯一源 | 禁止 |
| :--- | :--- | :--- |
| 本规范 | `docs/design-system/OraSage-Brand-Spec.md` | 第二套品牌 / UI 说明书 |
| 运行时 Token | `shared/design-tokens/orasage-tokens.css` | App 内再发明品牌色 |
| 包副本 | `npm run tokens:sync` → `@orasage/tokens` | 手改 `packages/tokens/src/orasage-tokens.css` |
| React 基础组件 | `packages/ui` | 第二套 shadcn |
| App Shell | `shared/app-shell/` + `app-shell:sync` | 各 App 独立底栏视觉 |
| Vibe 报告皮肤 | `bazi/client/src/styles/bazi-report-vibe.css` | 把 Vibe 类打到壳层 |

门禁：`npm run tokens:check`、`npm run ui:check`。

---

## 10. 门禁检查

- [ ] 中文 locale 用户可见中文，且署名含 `海棠未眠`；非中文 locale 无汉字、品牌仅 `OraSage`（§1.0）
- [ ] 壳层无灰度与朱砂之外的品牌用色
- [ ] 朱砂面积 ≤5%，移除后层级完整
- [ ] 标志未拉伸 / 旋转 / 改缺口
- [ ] 图形与字标未在 chrome 中强行锁定
- [ ] 命理报告内容区走 Vibe，顶栏 / 导航仍走壳层
- [ ] 无暗金、薰衣草金、五行色块泛滥

---

## 附录 A · 玄璧几何

缺口中心 45°，圆心角 38° ⇒ 端点 64° 与 26°。  
`P₁ = (41.645, 12.226)`，`P₂ = (51.774, 22.355)`。  
路径：`M P₁ A 22 22 0 1 0 P₂`。

## 附录 B · 版本

| 版本 | 日期 | 变更 |
| :--- | :--- | :--- |
| v1.0 | 2026-07-08 | VI：玄璧、朱砂、子品牌 |
| v1.1 | 2026-07-08 | DS：灰度壳层、组件、页脚 |
| v2.0 | 2026-10-03 | 唯一规范：中文名海棠未眠；Vibe 赭石并入；废止并行说明书 |
| **v2.1** | **2026-10-03** | **语言范围**：中文版本用中文（海棠未眠）；其它语言不用汉字，仅 OraSage |
