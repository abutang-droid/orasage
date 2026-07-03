# Manto 项目交接备忘录

## 项目概况

项目名：**Manto**（葡语"圣袍"）
代码仓库：`https://github.com/abutang-droid/tarot-mind`
技术栈：Next.js 15 + TypeScript + Tailwind v4 + Prisma + MySQL
部署：Vercel

Manto 是一个面向 Web3 原住民（拉美 70% + 东南亚 30%）的精神庇护所应用。核心产品：
- 🔮 AI 塔罗占卜（$0.49-$1.99，视觉 C 位，流量入口）
- 🛐 每日拜神（免费，DAU 留存引擎，功德成长系统）
- 📿 五行水晶手串（$39.99，5 款 SKU）

## 当前开发状态：Phase 0 已完成

TypeScript 编译零错误，`next build` 通过。所有核心页面已开发完毕并推送到 GitHub。

### 已完成的页面和功能

| 路由 | 页面 | 状态 |
|------|------|------|
| `/` | 首页：Hero + 今日能量 + 精选入口（DS v1.1 单色） | ✅ |
| `/reading` | 占卜流程：问牌→翻牌（3D 翻转动画）→解读→融通→资料→水晶问答→护持 | ✅ |
| `/temple` | 拜神：8 位神祇选择 + 手指参拜（3/7/10 秒三段动画）+ 结束画面 | ✅ |
| `/crystal` | 水晶商城列表 | ✅ |
| `/crystal/[sku]` | 水晶详情页 | ✅ |
| `/profile` | 个人中心（阶位头像 + 统计 + 菜单） | ✅ |

### 视觉系统（OraSage DS v1.1）

> 全站唯一规范：仓库根目录 [`docs/design-system/OraSage-Design-System-v1.1-Revised.md`](../docs/design-system/OraSage-Design-System-v1.1-Revised.md)

- 单色体系：背景 `#FAFAF8`、主色 `#171717`、灰阶文字与边框
- 字体：Playfair Display / Noto Serif SC（标题）+ Inter / Noto Sans SC（正文）
- 全站 App Shell：PC 顶栏 + 移动 5 键底栏（与 bazi/ziwei 一致）
- 支持 `prefers-reduced-motion`

### API 路由

| 路由 | 功能 | 状态 |
|------|------|------|
| `/api/reading` | 占卜抽牌（复用现有 drawCards 引擎） | ✅ |
| `/api/reading/crystal-quiz` | 水晶问答（本地题库，零延迟） | ✅ |
| `/api/fortune` | 今日日运（纯内存生成） | ✅ |
| `/api/profile/save` | 用户资料保存 | ✅ 存根 |
| `/api/auth/me` | 游客用户 | ✅ 存根 |

### 水晶推荐系统

- **问题库**：`src/lib/tarot/crystal-quiz.ts`，12 个原型 × 10 道问题 + 9 组选项池
- 每次占卜翻完三张牌后，根据牌的所属原型随机抽 3 道问题
- 3 道问题涵盖：当前感受 → 内在需求 → 期望改变
- 每个选项对应五行（木/火/土/金/水），根据用户选择投票确定推荐水晶

### 塔罗牌知识库

- `fatemaster_tarot_knowledge.json`：78 张完整知识库（正逆位关键词、元素、含义）
- 来源：https://www.fatemaster.ai/zh/tarot-cards/
- 所有元素已校验正确（22 大阿卡纳 + 56 小阿卡纳）

---

## 下一阶段待办（Phase 1）

### 高优
1. **牌面图片集成**：78 张塔罗牌面资源
   - 将图片放入 `public/cards/` 目录
   - 修改 `cards.ts` 添加 `imageUrl` 字段
   - 修改 `TarotCard.tsx` 组件用图片替换当前 SVG
   - 文件名格式：`{id}_{name_en}.png`，例如 `0_fool.png`
   - UI 框架遵循 DS v1.1；牌面插画风格须与单色应用壳协调

2. **DeepSeek AI 接入**：配置环境变量 `DEEPSEEK_API_KEY`，启用 AI 解读
   - 当前解读用的是规则引擎 fallback
   - 代码里占卜 API 已预留 SSE 流式输出接口
   - 系统提示词见 `MANTO_PRODUCT.md` 第十二章

3. **多语言 i18n**：葡语/西语/英语/简中/繁中
   - 推荐使用 `next-intl`
   - 语气见 `MANTO_PRODUCT.md` 产品文案章节

### 中优
4. **支付对接**：占卜 $0.49-$1.99 + 水晶 $39.99
   - 走第三方父应用支付接口
   - 当前支付流程在占卜页仅做了 UI 跳转，未接真实支付

5. **功德系统**：当前 Profile 页展示的是 mock 数据
   - 需要接入数据库记录参拜/分享/消费行为
   - 五阶位徽章 SVG 待制作

6. **推送通知**：每日参拜提醒（当地 07:00）

### 低优
7. **神祇 SVG 插图**：8 位核心神祇的定制 SVG
8. **分享证书生成**：Discord/Telegram/WhatsApp 优化
9. **近神者治理权**：投票、提案、弹劾系统

---

## 关键文件索引

| 文件 | 用途 |
|------|------|
| `MANTO_PRODUCT.md` | 产品文档（流程、AI Prompt、埋点；**UI 色板以 DS v1.1 为准**） |
| `../docs/design-system/OraSage-Design-System-v1.1-Revised.md` | 全站唯一 UI 设计规范 |
| `fatemaster_tarot_knowledge.json` | 78 张牌知识库（正逆位关键词 + 元素 + 含义） |
| `src/app/page.tsx` | 首页 |
| `src/app/reading/page.tsx` | 占卜流程 — 7 步状态机 |
| `src/app/temple/page.tsx` | 拜神 — 选神 + 手指参拜 + 结束 |
| `src/app/globals.css` | 全局样式 + DS token 引用 |
| `src/lib/tarot/crystal-quiz.ts` | 水晶问答引擎 |
| `src/lib/tarot/cards.ts` | 78 张牌数据（含 meaningUp/Down） |
| `src/lib/tarot/draw.ts` | 抽牌引擎 |
| `src/components/AppShell.tsx` | OraSage App Shell + PC 页脚 |

---

## 数据库

当前 API 未连接数据库（走内存）。数据库 schema 在 `prisma/schema.prisma`。核心表设计见 `MANTO_PRODUCT.md` 第十一章。

---

## 环境变量

```
DEEPSEEK_API_KEY=sk-...          # DeepSeek AI（Phase 1 需要）
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
JWT_SECRET=...                   # 第三方 token 验证
DATABASE_URL=mysql://...         # MySQL 连接（Phase 1 需要）
```

---

## 启动方式

```bash
cd /path/to/tarot-app
npm install
npm run dev     # 开发服务器 http://localhost:3000
npm run build   # 生产构建
```

---

## 重要提醒

1. **不做 token、不做 NFT、不做预测市场** — 这是写死在 `MANTO_PRODUCT.md` 里的底线
2. **宗教敏感**：Aparecida 不和异教符号混搭，Guadalupe 不做动画变形，四面佛不做旋转动画，Santo Niño 不可拖拽
3. **AI 输出禁区**：不预测死亡/疾病，不给医疗/投资/法律建议，检测到自残信号固定回复求助热线
4. **用户语言**：葡语、西语、英语、简中、繁中；后续法、意
