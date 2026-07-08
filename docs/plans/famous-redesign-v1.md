# 名人案例内容优化 · 页面设计方案 v1

> 状态：**P1 详情页 + P2 列表页已实施（P3 待启动）**
> 范围：main 门户 `/{locale}/famous`（列表页）与 `/{locale}/famous/[slug]`（详情页）
> 设计基线：`docs/design-system/OraSage-Design-System-v1.1-Revised.md`（黑白灰单色系）

---

## 一、现状盘点（2026-07-08 生产 CMS 实测）

### 1.1 内容库存

| 维度 | 事实 |
|------|------|
| 总量 | 110 篇（`appSource=famous`，`wpStatus=publish`） |
| 语言分布 | zh-CN 104 · en 2 · pt 2 · zh-HK 2 |
| 标题格式 | 几乎全部为「XX八字解读」（如 乔丹/戴安娜/爱因斯坦/蒋介石…） |
| 正文模板 | **高度统一**：封面（太极 SVG + 人名 + 四柱 + 生辰）→ 一、基本信息与排盘 → 二、十五步排盘流程 → 三、四家投票法 → 四、大运流年详批 → 五、典籍依据附录 |
| 模板覆盖率 | 104 篇 zh-CN 中：封面 `<h1>` 102 篇、`p.birth` 生辰行 100 篇、格局判定 104 篇 |
| 重复内容 | 黄兴出现 4 个变体（报告/解读/解读-2/zh-HK 版）、齐白石 2 个 |

### 1.2 现有页面问题

**列表页（`main/src/app/[locale]/famous/page.tsx`）**

1. 纯标题卡片流水，110 个「XX八字解读」视觉上完全同质，无法浏览与发现；
2. `sort=title` 按 Unicode 排序，无人物分类（政治/商业/文艺/体育…）、无检索；
3. 摘要用共享的 `stripHtml(legacyHtml)` 前 140 字，对这批文章截出来的是排盘干支噪音（「乔丹 八字命理全盘解读 · 四家投票法 年柱 癸 食神 卯 绝 乙…」），信息量为零；
4. locale 硬过滤：zh-TW 界面查 `locale=zh-TW`，而 CMS 只有 `zh-HK` → **繁体用户看到空列表**；en/pt 各只有 2 篇，其余 T2 语言全空。

**详情页（`main/src/app/[locale]/famous/[...slug]/page.tsx`）**

1. 正文经 `LegacyHtmlArticle` 仅套用 `prose-sage` 通用排版；文章自带的
   `cover` / `tai-ji` / `four-pillars` / `wuxing-bars`（内联高度柱状图）/
   `step-flow` / `school-card`（四家投票）/ `tl-item`（大运时间线）/
   `classic-card`（典籍引用）等 class 在 main 中**无任何样式定义**，
   全部退化为裸文本竖排堆叠，柱状图不可见、封面太极 SVG 撑满整宽；
2. 无目录导航（正文约 1 万字 5 大章节）、无上一位/下一位、无相关人物；
3. 无免责声明（名人生辰为文献估算值——ziwei App 的名人卡已有此声明，主站反而没有）；
4. 无转化出口（读完乔丹的八字，没有「排我自己的八字」入口）。

---

## 二、设计目标

1. **可发现**：110 位人物按身份分类可浏览、可筛选，卡片一眼可读（人名 + 身份 + 生辰 + 格局）。
2. **可阅读**：详情页把模板化正文渲染为符合 DS v1.1 的结构化版式（四柱表、五行图、步骤流、时间线），移动优先。
3. **可转化**：每篇文末与侧栏提供「排你自己的八字」CTA → `bazi.orasage.com`。
4. **零 CMS 改库**：全部元数据（人名/生辰/格局/分类）由 main 服务端从 legacyHtml 解析（模板覆盖率 ≥96%，解析可靠），不改 CMS collection、不重灌内容。
5. **不伤及道藏**：`LegacyHtmlArticle` / `stripHtml` / `prose-sage` 为 famous 与 daozang 共享，本方案所有新样式与解析逻辑**限定 famous 作用域**。

---

## 三、列表页设计（`/{locale}/famous`）

### 3.1 结构（移动优先，单列 → PC 双列卡片）

```
┌────────────────────────────────────────────┐
│ ← 返回（PortalBackToolbar，现有）           │
│                                            │
│ 名人案例                        ← PageTitle │
│ 110 位历史人物的八字命盘实证研究  ← PageLead │
│                                            │
│ [全部] [政坛] [军事] [商界] [文艺] [体育]   │  ← 分类 Tab（横向滚动）
│ [科学] [其他]                               │
│                                            │
│ ┌──────────────────────────────────────┐   │
│ │ 乔丹            [正财格]             │   │  ← 人物卡
│ │ NBA 传奇球星 · 男命                   │   │
│ │ 1963年2月17日 · 巳时 · 辛金日主       │   │
│ │ 癸卯 甲寅 辛卯 癸巳      阅读全文 →   │   │  ← 四柱等宽字（JetBrains Mono）
│ └──────────────────────────────────────┘   │
│ ┌──────────────────────────────────────┐   │
│ │ 戴安娜          [七杀格]             │   │
│ │ …                                    │   │
│ └──────────────────────────────────────┘   │
│                                            │
│ ‹ 上一页      2 / 4      下一页 ›          │  ← 现有分页保留
└────────────────────────────────────────────┘
```

- PC ≥640px：卡片 `grid-cols-2`；≥1024px 保持 2 列（阅读宽度 `max-w-5xl` 不变）。
- 分类 Tab 用 `@orasage/ui` `Badge`/`buttonVariants(ghost)` 实现的链接（`?cat=business`），
  **服务端过滤 + URL 可分享**，不引入客户端状态库。

### 3.2 人物卡（FamousPersonCard，main 门户版）

| 元素 | 来源 | 样式（DS v1.1） |
|------|------|-----------------|
| 人名 | 封面 `<h1>`（回退：标题去掉「八字解读/八字报告」后缀） | 衬线 `text-heading-3`，`#171717` |
| 格局徽章 | 正文「格局简判」表 `tag-gold` 单元（正财格/七杀格…） | `Badge variant="muted"`，灰底黑字（**去金色**） |
| 身份一句话 | 人物索引表（见 §5.2）；缺省隐藏 | `text-sm text-muted-foreground` |
| 生辰行 | `p.birth`（「1963年2月17日 · 巳时 · 乾造（男命）」） | `text-sm text-muted-foreground` |
| 四柱 | 封面 `four-pillars` 的天干地支（8 字） | `font-mono text-sm tracking-wide` |
| 整卡 | — | 现有 `Card variant="interactive"`，整卡可点 |

摘要不再使用共享 `stripHtml`——famous 卡片以结构化字段替代摘要，
**不改动** `main/src/lib/cms.ts` 中 daozang 仍在用的 `stripHtml`。

### 3.3 分类

CMS 无分类字段，新增 main 侧静态人物索引（`main/src/lib/famous-index.ts`）：
`slug 前缀（wpId）→ { category, description }`，104 条一次性人工标注
（政坛 / 军事 / 商界 / 文艺 / 体育 / 科学 / 其他）。
索引未命中的文章归入「其他」，保证 CMS 后续新增内容不白屏、不漏显。

### 3.4 语言回退

`fetchCmsPages` 增加 famous 专用回退链（不影响 daozang 调用方）：

| 界面 locale | 查询顺序 |
|-------------|----------|
| zh-CN | zh-CN |
| zh-TW | **zh-HK → zh-CN**（修复现状空列表） |
| en | en → zh-CN（en 仅 2 篇时列表尾部追加中文条目，卡片标注「中文」Badge） |
| 其余 | zh-CN（页首提示该栏目暂以中文提供） |

### 3.5 排序与去重

- 默认排序改为 `-updatedAt`（新内容在前）；分类 Tab 内按人名拼音（索引表内预存拼音键）。
- 黄兴/齐白石多版本：索引表标记 canonical slug，列表只显示 canonical，
  其余版本仍可直链访问（不动 CMS 数据、不 404 旧链接）。

---

## 四、详情页设计（`/{locale}/famous/[slug]`）

### 4.1 策略：**作用域 CSS 优先，不重写正文**

104 篇正文共享同一套模板 class，且结构干净（section/card/table）。方案：

- 新增 `famous-article` 作用域样式（追加到 `main/src/app/[locale]/globals.css`，
  全部选择器以 `.famous-article` 前缀），把模板 class 映射到 DS v1.1；
- 详情页把 `LegacyHtmlArticle` 的 `className` 换成 `famous-article portal-subpage-body`；
- **不**做 HTML→React 重写（110 篇 × 1 万字的解析重写风险高、收益低）；
  仅封面区做轻量增强（见 4.3）。

daozang 详情页继续用现有 `prose-sage`，完全不受影响。

### 4.2 模板 class → DS v1.1 映射（核心条目）

| 模板 class | 现状 | 目标样式 |
|------------|------|----------|
| `section` / `card` | 裸 div | 白底卡片：`16px` 圆角、`1px #E7E5E4` 边框、`p-5`，卡间距 `mt-4` |
| `gold-hr` | 裸 hr | `0.5px #E7E5E4` 分割线（**去金**） |
| `four-pillars` / `pillar` | 竖排堆叠 | 4 列 grid；干支 `font-mono` 大号居中，`pos`/`ss-l` 为 Caption 灰字 |
| `wuxing-bars` / `bar` | 高度失效不可见 | flex 底对齐柱状图；五行柱统一灰阶（`#171717` 至 `#D4D4D4` 五级），保留内联 height |
| `step-flow` / `step-num` | 数字裸排 | 左侧 28px 圆形序号（黑底白字）+ 竖向连接线，`step-body` 缩进 |
| `school-card`（四家投票） | 裸文本 | 2 列卡片（移动 1 列）；`school-name` 衬线小标题，`school-row` 表格化 |
| `tl-item`（大运时间线） | 裸文本 | 左侧年份列（`font-mono`）+ 竖线时间轴 |
| `classic-card`（典籍） | 裸文本 | 引用块：左 2px 黑边、`classic-source` Caption 灰字 |
| `tag` / `tag-gold` / `tag-red` | 裸 span | 统一灰阶 Badge（黑字浅灰底）；`tag-red` 改深灰加粗（单色系不引入红色） |
| `cover` / `tai-ji` | SVG 撑满整宽 | 见 4.3 |
| `table-wrap` `table` | 已有 prose-sage 兜底 | 补 famous 作用域：表头 `#FAFAF8` 底、单元格 `py-2 px-3`、`0.5px` 内分割线 |

### 4.3 页面骨架

```
┌────────────────────────────────────────────┐
│ ← 返回（现有 toolbar）                       │
│                                            │
│ ┌─ 封面卡（模板 cover 区，重设样式）───────┐ │
│ │        ◐ 太极（限宽 56px，透明度 0.15）  │ │
│ │        乔丹                    ← 衬线 H1 │ │
│ │   八字命理全盘解读 · 四家投票法          │ │
│ │   ┌────┬────┬────┬────┐               │ │
│ │   │年柱│月柱│日柱│时柱│  ← 四柱 grid    │ │
│ │   │癸卯│甲寅│辛卯│癸巳│                │ │
│ │   └────┴────┴────┴────┘               │ │
│ │   1963年2月17日 · 巳时 · 乾造           │ │
│ └──────────────────────────────────────┘ │
│                                            │
│ [一、排盘] [二、流程] [三、投票] [四、大运]  │ ← 章节锚点条（sticky，
│                                            │    由 h2 服务端提取生成）
│ §一、基本信息与排盘（卡片化正文…）           │
│ …                                          │
│                                            │
│ ⚠ 生辰依据公开文献估算，解读为命理学演绎，   │ ← 免责声明（统一新增）
│   仅供文化研究参考，与本人无关。            │
│                                            │
│ ┌─ CTA 卡 ─────────────────────────────┐  │
│ │ 想知道你自己的八字格局？                │  │
│ │ [ 免费排盘 → bazi.orasage.com ]（主按钮）│  │
│ └──────────────────────────────────────┘  │
│                                            │
│ ← 上一位：梅艳芳        下一位：邓丽君 →     │ ← 同分类相邻人物
│ 相关人物：张国荣 · 陈百强 · 梅兰芳          │ ← 同分类推荐 3 位
└────────────────────────────────────────────┘
```

- 章节锚点条：服务端用正则从 legacyHtml 提取 `<h2>` 注入 `id`，
  移动端横向滚动、PC 顶部 sticky（`top-0`，白底 + 底部 0.5px 分割线）。
- 免责声明文案与 ziwei `FamousPersonCard` 对齐，进 i18n `famous.disclaimer`。
- 原文的「继续阅读 scrolldown」提示、原站二维码等推广物已由
  `sanitizeLegacyHtml` 清理，保持不变。

---

## 五、数据与代码改动清单（实施阶段用）

### 5.1 新增

| 文件 | 职责 |
|------|------|
| `main/src/lib/famous-meta.ts` | 从 legacyHtml 解析 `{ name, birthLine, pillars[8], geju, dayMaster }`（正则，全部字段可缺省）；`extractH2Anchors()` 生成目录 |
| `main/src/lib/famous-index.ts` | 静态人物索引：分类、一句话身份、拼音排序键、canonical 标记 |
| `main/src/components/famous/FamousPersonCard.tsx` | 列表人物卡 |
| `main/src/components/famous/FamousCategoryTabs.tsx` | 分类 Tab（服务端组件 + Link） |
| `main/src/components/famous/FamousArticleCta.tsx` | 文末 CTA + 免责声明 + 相邻/相关人物 |

### 5.2 修改

| 文件 | 改动 |
|------|------|
| `main/src/app/[locale]/famous/page.tsx` | 分类过滤、语言回退、人物卡渲染、排序 |
| `main/src/app/[locale]/famous/[...slug]/page.tsx` | 封面/锚点/CTA/免责声明；`famous-article` 作用域 |
| `main/src/app/[locale]/globals.css` | 追加 `.famous-article` 作用域样式块（约 15 个模板 class） |
| `main/src/lib/cms.ts` | 新增 `fetchFamousPages()`（带回退链）；**不改** `fetchCmsPages`/`stripHtml` 既有签名与行为 |
| `main/messages/*.json`（12 语言） | `famous.disclaimer` / `famous.cta*` / `famous.categories.*` / 「中文」Badge 文案 |

### 5.3 明确不改

- CMS `Pages` collection、生产数据、迁移脚本；
- `LegacyHtmlArticle` 组件本身与 daozang 路由；
- 顶部导航 / 底栏（「名人案例」入口位置不变）；
- ziwei App 内置名人命盘功能（独立数据集，另行任务；本方案仅在 CTA 区可选加
  「紫微视角看名人 → ziwei.orasage.com/library」次级链接，默认不做）。

---

## 六、关联分支穿透与影响评估（最高宪法）

| 关联点 | 穿透结论 | 影响 |
|--------|----------|------|
| `main/src/lib/cms.ts`（famous 与 daozang 共享） | 只新增函数，不改既有导出 | daozang 零影响；`npx tsc` + `/daozang` 抽检验证 |
| `prose-sage` / `LegacyHtmlArticle`（共享样式） | famous 样式全部 `.famous-article` 前缀，不动 `prose-sage` | daozang / 法务静态页零影响 |
| CMS API 契约 | 仅消费现有 `where` 查询，新增 `locale` 回退为多次查询合并 | CMS 零改动；注意列表页由 1 次查询变最多 2 次（有 `revalidate:120` 缓存，可接受） |
| `shared/app-shell` 导航 | 「名人案例」链接 `famousUrl()` 不变 | 8 个 App 副本零同步需求 |
| i18n 12 语言 | 新增 key 需补全部 `messages/*.json`，缺 key 会 fallback 英文 | 构建时 next-intl 不校验，需人工核对清单 |
| 部署链路 | 仅 main 重新构建部署（`deploy/main`） | 其余 7 个服务零变更 |
| 旧链接 | canonical 去重仅影响列表展示，所有既有 slug 详情页保持可访问 | 无 404 回归 |

风险点：**元数据解析依赖模板一致性**（102–104/104 覆盖）。所有解析字段按可缺省设计，
解析失败时卡片退化为「标题 + 阅读全文」，详情页退化为现状排版，不会白屏。

---

## 七、实施分期与验证

| Phase | 内容 | 验证 |
|-------|------|------|
| **P1 详情页** | `famous-article` 作用域样式 + 封面/锚点/免责声明/CTA | `npm run build`；乔丹（标准模板）、崇祯（36KB 长文）、黄兴报告（变体模板）、en/pt/zh-HK 各 1 篇抽检；`/daozang` 详情页回归 |
| **P2 列表页** | 人物卡 + 分类 Tab + 人物索引 + 语言回退 + 排序去重 | zh-CN 分页全量渲染；zh-TW 非空验证；分类计数与索引表一致 |
| **P3 打磨** | 相关人物、上一位/下一位、12 语言文案补全 | 全 locale 构建 + 首屏抽检 |

每期合入前：`main` 下 `npx tsc --noEmit` + `npm run build`，PR 描述附抽检截图。

---

## 八、待确认项（不阻塞 P1）

1. 分类的最终口径（建议 7 类：政坛/军事/商界/文艺/体育/科学/其他）；
2. en/pt 等外语内容是否追加翻译投放（当前各 2 篇，方案先做中文回退 + 标注）；
3. 黄兴多版本是否需要在 CMS 中将旧版改为 `draft`（方案默认不动数据，仅列表去重）。
