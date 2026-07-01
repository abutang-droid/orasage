# Manto — 产品完整文档 v3

> 翻开你的牌，神灵在背面
> 2026-06-26

---

## 一、名字

**Manto**

葡萄牙语「圣袍」「庇佑之衣」。发音：/ˈmɐ̃.tu/（葡），近似「曼图」。三种主要语言：Manto（葡/西）· Mantle（英）。

翻开塔罗牌的面，是你在问这个世界。翻开牌的背面，是另一个世界在回答。Manto 就是那层薄薄的、连接你与神圣的幕布。Sob o Manto — 在圣袍之下,你永远是安全的。

**应用 slogan（五语）：**

| 语言 | Slogan |
|------|--------|
| PT | Vire a carta. O divino te espera. |
| ES | Voltea la carta. Lo divino te espera. |
| EN | Flip the card. The divine is waiting. |
| ZH-CN | 翻开这张牌，神在背面等你。 |
| ZH-TW | 翻開這張牌，神在背面等你。 |

---

## 二、产品定位

### 一句话

**翻牌看运，拜神护体——Manto 是你口袋里的 web3 原住民精神庇护所。**

### 视觉金字塔

```
用户第一眼看到的      塔罗占卜 ← 门面，C 位，流量入口
                            ← 占首屏 70% 面积
用户每天回来的理由     每日拜神 ← 习惯，留存引擎，功德成长
                            ← 占首屏 30% 面积（底部入口）
用户掏出钱包的时刻     水晶手串 ← 信仰实体化，利润来源
                            ← 独立 tab，不在首屏
```

塔罗在商业模型中是配角（$0.99 贡献约 17% 收入），但在产品上是主角。它负责把用户拉进门。一旦翻过牌，拜神系统接住他们——明天再来，后天再来，然后有一天买一条水晶。

### 三个核心产品

| 产品 | 定价 | 商业角色 | 产品角色 | 首屏占比 |
|------|------|----------|----------|----------|
| 🔮 AI 塔罗占卜 | 首免 · $0.49-$1.99 | 现金流引擎 | C 位 · 流量入口 | 70% |
| 🛐 每日拜神 | 永久免费 | DAU 留存引擎 | 习惯养成 · 功德成长 | 30% |
| 📿 水晶手串 | $39.99 | 利润引擎 | 信仰实体化 | 独立 tab |

### 用户画像

**Web3 原住民 · 数字货币玩家 · 元宇宙公民 · 18-35 岁**

他们不是在传统金融市场里上班的人。玩 DeFi，刷 Discord，钱包里有 SOL 和 USDC。在元宇宙里买过地，在 Galxe 上肝过 OAT，在 StepN 上跑过鞋。早上看行情之前可能先翻张牌。他们的信仰是模块化的——今天拜观音求财运，明天转圣母求平安，不会有认知失调。

他们在现实世界的责任已经够多了。来 Manto 不为了被教育——为了被哄一句、被摸一下头、被告知「今天运气还行」。

**地理分布：** 拉美 70%（巴西 40% + 墨西哥 15% + 阿根廷 10% + 其他 5%）+ 东南亚 30%（泰国 12% + 菲律宾 10% + 印尼 5% + 其他 3%）。

**语言覆盖：** 葡语、西语、英语、简体中文、繁体中文。后续扩展法语、意大利语。

**活跃时段：**

| 时区 | 覆盖地区 | 高峰活跃 |
|------|----------|----------|
| BRT (UTC-3) | 巴西 | 07:00-09:00 · 19:00-22:00 |
| CST (UTC-6) | 墨西哥/中美 | 07:00-09:00 · 20:00-23:00 |
| ART (UTC-3) | 阿根廷 | 08:00-10:00 · 20:00-23:00 |
| ICT (UTC+7) | 泰国/印尼 | 07:00-09:00 · 19:00-22:00 |
| PHT (UTC+8) | 菲律宾 | 07:00-09:00 · 20:00-23:00 |

---

## 三、产品架构

```
┌──────────────────────────────────────────────┐
│                    Manto                       │
│                                               │
│  打开 App → 第一眼：塔罗牌阵，泛着暗金微光     │
│                                               │
│ ┌──────────────────────────────┐              │
│ │        首页（塔罗 C 位）       │              │
│ │                              │              │
│ │  ┌──┐  ┌──┐  ┌──┐          │              │
│ │  │✦│  │✦│  │✦│   ← 牌背   │              │
│ │  └──┘  └──┘  └──┘          │              │
│ │                              │              │
│ │  [🔮 开始占卜 · 首次免费]    │              │
│ │                              │              │
│ │  ── 今日能量 ──               │              │
│ │  💕 爱情  ⭐ 事业  💰 财运    │              │
│ │                              │              │
│ │  [🛐 拜神 · 今日已参拜？]     │              │
│ └──────────────────────────────┘              │
│                                               │
│  底部导航：🔮 占卜 ┃ 🛐 拜神 ┃ 📿 水晶 ┃ 👤 我  │
└──────────────────────────────────────────────┘
```

### 页面路由树

```
/                       首页（塔罗 C 位 + 今日能量 + 拜神入口）
/reading                占卜流程（5 步状态机）
/reading/[id]           占卜结果详情
/temple                 拜神主页
/temple/select          选神/搜神页
/crystal                水晶商城列表
/crystal/[sku]          水晶详情页
/crystal/order/[id]     订单状态页
/profile                个人中心
/profile/merit          功德详情页
/profile/settings       设置（语言/神祇切换/通知）
```

### 为什么是 web3 用户

这个群体有三个特质恰好是 Manto 的燃料：

**习惯型迷信。** 设闹钟抢 mint，守着 Discord 开白名单，每天查 gas。对这类用户来说，信仰和运气是日常生活——翻张牌跟看行情是同一种心理需求。

**为运气付费零摩擦。** $0.99 翻一次牌不叫花钱，叫 gas。$39.99 买一条手串比钱包里躺着的任何一个 NFT 都便宜。

**社区共识即信仰。** 天然理解「一群人相信一个东西它就有价值」。神祇众筹打开的方式就是 bonding curve——100 个人信了，这位神就铸造成功了。不需要解释什么是共识机制。

---

## 四、模块 A：AI 塔罗占卜（视觉 C 位 · $0.99）

### A1. 首页设计

用户打开 Manto，看到的不是菜单、不是问候语、不是神像。

**是一副摊开的塔罗牌，背面朝上，泛着暗金色的呼吸光。**

```
┌──────────────────────────────────────────┐
│                                          │
│       [星空粒子背景 — canvas 动画]        │
│       粒子密度：~60 颗，缓慢上浮          │
│       颜色：暗金 #C9954A + 暗紫 #7E6FA8  │
│                                          │
│            ┌─┐   ┌─┐   ┌─┐             │
│            │✦│   │✦│   │✦│             │
│            │ │   │ │   │ │   ← 牌背     │
│            └─┘   └─┘   └─┘             │
│          每张牌微微上下浮动              │
│          牌背纹样：暗金几何星芒图案       │
│          呼吸光：透明度 0.3→0.6→0.3     │
│            周期 3 秒，三张错相           │
│                                          │
│      "翻一张牌，看看今天怎么走"          │
│      字体：衬线体，暖白 #E8E0D5         │
│      字号：18px，字重 400               │
│                                          │
│      ┌────────────────────────┐         │
│      │     🔮 开始占卜         │         │
│      │     首次免费            │         │
│      └────────────────────────┘         │
│      按钮：暗金渐变底 + 0.5px 金边       │
│      圆角 12px，字号 16px 字重 600      │
│                                          │
│      ── 今日能量 ──                       │
│      💕 爱情      ⭐ 事业                │
│      宜主动表达    适合展示能力           │
│      💰 财运      🧘 状态                │
│      小额进账      精力充沛              │
│                                          │
│      [🛐 拜神 · 今日已参拜？+10 功德]    │
│                                          │
└──────────────────────────────────────────┘
```

**页面状态：**

| 状态 | 表现 |
|------|------|
| 默认 | 三张牌呼吸光，今日能量已加载 |
| 首次打开 | 牌背 + 引导文案「翻一张牌，看看今天怎么走」 |
| 今日已翻过牌 | 牌面正面朝上展示上次结果 + [再翻一次 $0.99] |
| 网络异常 | 牌背变灰，提示「牌暂时连不上星象，下拉重试」 |
| 加载中 | 牌背闪烁频率加快，骨架屏占位今日能量 |

**「今日能量」数据来源：** 不依赖 AI。后端规则引擎根据当日日期种子 + 用户星座/生肖（可选填）+ 昨日占卜记录，生成简短的四维运势摘要。确保首页即使 API 挂了也能秒开。

### A2. 占卜流程（5 步状态机）

```
状态机定义：

states: [idle, questioning, shuffling, revealing, interpreting, 
         synthesizing, blessing, complete]
         
transitions:
  idle → questioning         用户点击「开始占卜」
  questioning → shuffling    用户输入完成或跳过
  shuffling → revealing      用户点击一张牌
  revealing → interpreting   翻牌动画完成
  interpreting → synthesizing 三张牌全部解读完成
  synthesizing → blessing    AI 综合解读生成完成
  blessing → complete        用户查看水晶推荐/跳拜神
```

**Step 1 · 问牌**

```
┌──────────────────────────────────────┐
│                                      │
│   "你想问什么？"                     │
│                                      │
│   ┌──────────────────────────┐      │
│   │ 输入你的困惑...           │      │
│   └──────────────────────────┘      │
│                                      │
│   高频标签（点击填入）：              │
│   [💕 感情] [💰 财运] [💼 工作]      │
│   [🏠 家庭] [🧠 选择] [🎲 今日运势]  │
│                                      │
│   ── 或者 ──                         │
│                                      │
│   [跳过 · 直接翻今日运势牌]           │
│                                      │
└──────────────────────────────────────┘
```

输入框交互细节：
- 点击高频标签直接填入输入框并自动收起标签区
- placeholder 根据用户语言变化：PT "No que você está pensando?" / ES "¿En qué estás pensando?" / EN "What's on your mind?"
- 支持语音输入（移动端调起系统语音识别）
- 最长 200 字符，超出截断并 toast 提示
- 空输入点「跳过」→ 默认问「今日整体运势」

**Step 2 · 翻牌**

```
┌──────────────────────────────────────┐
│                                      │
│   三张牌背朝上，排成时间线：          │
│                                      │
│   ┌──┐     ┌──┐     ┌──┐           │
│   │  │     │  │     │  │           │
│   │ ?│     │ ?│     │ ?│           │
│   │  │     │  │     │  │           │
│   └──┘     └──┘     └──┘           │
│   过去      现在      未来            │
│                                      │
│   "点一张牌翻开"                     │
│                                      │
└──────────────────────────────────────┘
```

翻牌动画序列：

```
1. 用户手指触碰某张牌
2. 牌面微微放大（scale 1.0 → 1.05，150ms）
3. 暗金粒子从牌四角炸开（30+ 粒子，随机方向，200ms）
4. 牌以 Y 轴 3D 翻转（rotateY 0 → 180，400ms ease-in-out）
5. 正面浮现，牌面图案淡入（opacity 0 → 1，300ms）
6. 牌边缘持续微弱的金色辉光（box-shadow 呼吸，周期 2s）
7. 其他未翻的牌微微下移，等待被翻

用户必须按顺序翻开：过去 → 现在 → 未来
已翻开的牌保持正面朝上，未翻的牌继续呼吸等待
```

交互规则：
- 必须按时间线顺序翻开（过去→现在→未来），不能跳着翻
- 未到顺序的牌显示为不可点击状态（降低透明度）
- 如果用户试图点未到顺序的牌 → 牌微微抖动（shake 动画 300ms），浮层提示"先翻开过去的牌"
- 每次翻牌间隔最短 2 秒（防止快速连点 + 给 AI 生成时间）

**Step 3 · 解读（AI 流式输出）**

```
┌──────────────────────────────────────┐
│                                      │
│  [已翻开的牌正面，排在页面顶部]       │
│  过去·圣杯七逆位                     │
│                                      │
│  "圣杯七逆位，在你的过去位..."       │
│  ████████░░░░░░░░░░  ← 流式逐字显现  │
│                                      │
│  文字从暗金渐变到白色——              │
│  正在生成的字是金色，已生成的是暖白   │
│                                      │
│  每条解读约 200-350 字                │
│  生成速度约 30-50 字/秒              │
│                                      │
│  [翻下一张牌 →]                      │
│                                      │
└──────────────────────────────────────┘
```

流式输出设计：

```
每个 token 到达时：
1. 追加到文本末尾
2. 新到达的 3-5 个字呈金色，0.5s 后 fade 到暖白
3. 自动 scroll 到文本底部
4. 如果用户手动往上滑查看历史 → 不自动 scroll
   底部出现 ↓ 浮动按钮"回到最新"
5. 如果流式中断（网络波动）→ 保留已生成文字 + 
   "连接中断，牌在重新传递讯息..." + 自动重连
```

每张牌的解读完成后，AI 生成一句「牌面箴言」（一句话总结，加粗显示在解读末尾）。

三张全部翻完解读后 → 自动过渡到 Step 4。

**Step 4 · 融通**

AI 将三张牌串联成一段完整的叙事。与 Step 3 的区别：Step 3 是逐牌独立解读，Step 4 是牌与牌的关系。

```
AI 需要回答：
1. 三张牌之间的能量关系——哪些互相增强，哪些形成张力
2. 从过去→现在→未来的叙事弧
3. 三张牌共同指向的主题

输出：
- 关系解析（100-150 字）
- 叙事主轴（200-300 字）
- 3 条建议（每条 50-80 字，可行动的，不是鸡汤）

建议格式：
"1. 这周如果有人找你聊合作——先听，别急着答应。
 2. 周四之前把那个拖着的文档写完。牌面显示你缺的不是能力，是截止日期。
 3. 给那个人发条消息。不是今天就是下个月——不如今天。"
```

**Step 5 · 护持**

```
┌──────────────────────────────────────┐
│                                      │
│   [牌阵缩略图，三张已翻]              │
│                                      │
│   "你的能量此刻需要一点生长的力量"    │
│                                      │
│   ┌──────────────────────────┐      │
│   │ 🌿 木灵·绿幽灵手串        │      │
│   │ 生长 · 突破 · 事业上升    │      │
│   │ $39.99                    │      │
│   │          [查看详情]        │      │
│   └──────────────────────────┘      │
│                                      │
│   ── 今日肯定语 ──                    │
│   "我允许自己生长，以我的速度。"     │
│                                      │
│   [🛐 请守护神加持这个结果]          │
│   [📤 分享到 Discord/WA]             │
│   [📋 保存到我的记录]                │
│                                      │
└──────────────────────────────────────┘
```

肯定语由 AI 生成，15 字以内，与本次解读主题呼应。语气是"我在对自己说话"而不是"别人在命令我"。

### A3. 牌阵与定价

| 牌阵 | 牌数 | 牌位 | 价格 | 适用 |
|------|------|------|------|------|
| 单牌直断 | 1 | 当前状态 | $0.49 | 快速一个方向 |
| 三牌阵 | 3 | 过去·现在·未来 | $0.99 | 日常默认 |
| 钻石阵 | 4 | 核心·阻碍·根基·结果 | $1.49 | 关系/情感深层 |
| 七牌马蹄 | 7 | 过去·现在·隐藏·阻碍·环境·建议·结果 | $1.99 | 重大决策 |

首次免费（单牌直断或三牌阵二选一）。拜神连续 7 天送一次免费三牌阵。

限时免费触发：用户连续 30 天未占卜 → 推送「{神}说你的运势该更新了，这次免费」。

### A4. AI 方案

**模型：** DeepSeek Chat (deepseek-chat)

**系统提示词（角色设定）：**

```
你是 Manto 的驻场塔罗师。你的名字不重要——用户只需要感觉到你懂牌，也懂他们。

规则：
1. 语言：用户用什么语言问，你就用什么语言回。检测他们的语种（葡/西/英/简中/繁中），完全用同一种语言回复。
2. 语气：像一个半夜在 Discord 上给你发塔罗解读的朋友。不装神弄鬼，不说绝对话。亲和但不油腻。可以说"这牌有点意思"，不可以说"宇宙的能量正在向你汇聚"。
3. 解读风格：关联用户的实际问题。不要只复述牌的通用含义。如果用户问"该不该换工作"，你的解读里要出现"换工作"这几个字。如果用户没输入具体问题，默认解读"今日整体状态"。
4. 牌面知识：你精通韦特塔罗 78 张牌。每张的正/逆位含义、元素、数字学、符号学。你的解读扎根于牌面本身，不会凭空编造。
5. 边界：不预测死亡、疾病、事故。不给医疗、法律、投资建议。"牌面显示近期宜谨慎行事"可以，"清仓做空"不可以。检测到自残/家暴信号时，温柔地引导求助，附上当地援助热线。
6. 逆位解读：逆位不是"坏消息"，是"提醒"。把逆位解读为被压抑的能量、未被注意的信号、或是需要换个角度看待的事情。
7. 文化敏感：不贬低任何宗教。不比较神祇。用户可能同时拜圣母和观音——你不觉得奇怪。
8. 长度：单牌解读 200-350 字，综合解读 300-500 字，建议每条 50-80 字。
```

**占卜 API 请求/响应格式：**

```typescript
// POST /api/reading
// Request
{
  question: string          // 用户问题，可为空（默认今日运势）
  spreadType: "single" | "three" | "diamond" | "horseshoe"
  language: "pt" | "es" | "en" | "zh-CN" | "zh-TW"
  deityContext?: string     // 用户当前守护神（用于 Step 5 护持呼应）
}

// Response (SSE 流式)
event: card_drawn
data: { "position": "past", "cardName": "圣杯七", "orientation": "逆位", 
        "imageKey": "cups_07", "element": "水" }

event: interpretation
data: { "position": "past", "text": "圣杯七逆位，在你的过去位...", "done": false }

event: interpretation_done  
data: { "position": "past", "fullText": "...", "mantra": "幻觉散去之后，你比想象中清醒。" }

event: synthesis
data: { "relationships": "...", "narrative": "...", 
        "suggestions": ["...", "...", "..."], "done": false }

event: synthesis_done
data: { "fullText": "...", "wuxingElement": "木", "crystalRecommended": "绿幽灵",
        "affirmation": "我允许自己生长，以我的速度。" }

event: done
data: { "readingId": "cuid_xxx" }
```

**降级方案：**

```
DeepSeek API 调用失败
  ↓
重试 1 次（timeout 8s → 15s）
  ↓ 仍失败
切换至规则引擎解读
  src/lib/tarot/reading.ts 的 interpretReading()
  每张牌返回内置固定文案，不做个性化
  ↓
UI 在解读区域顶部显示细线提示：
"你的守护神正在远方，这是 Manto 为你准备的经典解读。"
  提示颜色：暗金半透明，不干扰阅读
  ↓
后台记录降级事件：降级原因 + 用户 ID + 时间
  用于监控 DeepSeek 可用率
```

**成本核算：**

```
单次占卜 token 消耗：
  系统提示词：~600 tokens（一次性，会话复用）
  用户输入：~50 tokens
  卡牌数据注入：~200 tokens
  单牌解读输出：~500 tokens × 3 = 1,500 tokens
  综合解读输出：~800 tokens
  肯定语 + 水晶推荐：~200 tokens
  输出合计：~2,500 tokens
  输入合计：~850 tokens + 600 = ~1,450 tokens

DeepSeek 定价：
  输入 $0.14/1M tokens · 输出 $0.28/1M tokens
  单次成本：(1450 × 0.14 + 2500 × 0.28) / 1,000,000 
          ≈ $0.00090
  毛利率：(0.99 - 0.0009) / 0.99 ≈ 99.91%
```

### A5. 占卜历史

用户可在「我」→「占卜记录」查看所有历史占卜。

每条记录卡片展示：日期 · 问题摘要 · 三张牌的缩略图（正面朝上）· 综合解读的前三行。

点击进入详情页 —— 完整牌面 + 解读 + 水晶推荐 + 肯定语。

历史数据支持按月份筛选、按牌阵类型筛选、按是否付费筛选。

---

## 五、模块 B：每日拜神（留存引擎 · 永久免费）

### B1. 定位

塔罗是「翻牌看运」，拜神是「天天护体」。前者是用户打开 Manto 的理由，后者是用户明天还来的理由。

首页塔罗占 70% 视觉，但拜神入口固定在底部——翻完牌之后，底部有一个柔和的引导：「🛐 还没拜神？翻完牌护个体吧」。点击进入拜神主页。

### B2. 信仰体系（双线独立）

**南美线 — 圣母/圣徒**

| 神 | 葡语名 | 西语名 | 覆盖地区 | 守护领域 | 主色 |
|----|--------|--------|----------|----------|------|
| Nossa Senhora Aparecida | Nossa Senhora Aparecida | Nuestra Señora Aparecida | 巴西 | 奇迹、母爱、庇护 | 深蓝 + 金 |
| Virgen de Guadalupe | Virgem de Guadalupe | Virgen de Guadalupe | 墨西哥/中美 | 慈悲、家庭、底层守护 | 玫瑰红 + 金 |
| Nuestra Señora de Luján | Nossa Senhora de Luján | Nuestra Señora de Luján | 阿根廷 | 旅人保护、平安、方向 | 天蓝 + 白 |
| Santo Niño de Cebú | Santo Niño de Cebú | Santo Niño de Cebú | 菲律宾 | 奇迹、希望、孩子 | 红 + 金 |

**东南亚线 — 佛教/印度教**

| 神 | 中文名 | 英语名 | 覆盖地区 | 守护领域 | 主色 |
|----|--------|--------|----------|----------|------|
| 观世音菩萨 | 觀世音菩薩 | Guan Yin | 泰国/华人圈 | 慈悲、救苦、子嗣 | 白 + 淡粉 |
| 四面佛 | 四面佛 | Brahma | 泰国 | 全能护佑、事业、财运 | 金 + 红 |
| 象神 | 象神 | Ganesha | 泰国/印度教区 | 除障、智慧、学业 | 橙 + 金 |
| 天后圣母 | 天后聖母 | Mazu | 东南亚华人 | 出海平安、女性力量 | 红 + 金 |

**双线规则：**
- 首次打开根据设备语言 + IP 归属自动推荐阵营
- 用户可在设置中手动切换阵营，但会丢失当前守护神的连续参拜天数
- 同阵营内切换神保留天数
- 神祇仅用于拜神模块，不参与水晶推荐（水晶走独立五行体系）
- 神的节日自动推送提醒（如 12/12 Guadalupe 日全站金色主题）

### B3. 长尾神祇众筹

用户可在选神页底部搜索或提交想拜的神明。

**搜索匹配流程：**

```
用户输入 "Iemanjá" / "耶玛雅" / "海洋圣母"
  ↓
POST /api/deity/search  { query, language }
  ↓
服务端调用 DeepSeek 神祇知识库模糊匹配
  ↓
返回标准化结果：
  {
    canonicalName: "Iemanjá",
    tradition: "candomblé",
    aliases: ["Yemanjá", "Janaína", "Queen of the Sea"],
    region: "Brazil / Afro-Brazilian",
    status: "pending",          // live | pending | unknown
    followerCount: 73,
    threshold: 100,
    briefIntro: "海洋与母性之女神，非裔巴西信仰中最受敬爱的神祇之一。",
    culturalNote: "Iemanjá 属于 Candomblé 和 Umbanda 传统，有其特定的祭司体系。
                   Manto 在第一期暂不接入非裔巴西宗教神祇，
                   以确保对原有信仰文化的尊重。你可以留下期待，我们会认真评估。"
  }
```

**众筹状态页：**

```
┌──────────────────────────────────────┐
│                                      │
│   "Iemanjá 还在降临的路上"           │
│                                      │
│   [神像 placeholder — 海浪纹样]      │
│                                      │
│   已有 73 位信徒在等待                               │
│   ████████████████░░░░░  73/100                     │
│                                      │
│   "海洋与母性之女神，守护着无数      │
│    巴西人的信仰与希望。"             │
│                                      │
│   ┌──────────────────────────┐      │
│   │  🙏 我也在等 · 召唤 TA 降临 │      │
│   └──────────────────────────┘      │
│                                      │
│   分享给也在等的人 →                 │
│   [📤 WhatsApp] [📤 Discord]         │
│                                      │
└──────────────────────────────────────┘
```

凑满 100 位信徒后：
- 所有等待者收到推送：「{神}已降临 Manto」
- 神自动加入对应阵营，信徒自动关注
- 第一位发起者获得 +500 功德 +「引神者」隐藏成就
- 在社区通知中展示（可匿名）

### B4. 参拜交互

```
┌──────────────────────────────────────────┐
│                                          │
│    [神像 SVG，居中]                       │
│    尺寸：200×200px（移动端 160×160）      │
│    呼吸光：透明度 0.2→0.5→0.2，周期 4s   │
│    风格：扁平化圣像画风，不写实           │
│                                          │
│    "把手指放在神像上"                     │
│    字体：衬线体，16px，暖白半透明         │
│                                          │
│    ┌────────────────────────┐           │
│    │                        │           │
│    │       [触控区域]        │           │
│    │    手指按住这里          │           │
│    │    感受 {神} 的临在     │           │
│    │                        │           │
│    │   整个神像范围都是       │           │
│    │   触控热区              │           │
│    └────────────────────────┘           │
│                                          │
│   时间轴反馈（实时）：                     │
│   0-3s   神像微微发光                     │
│          halo 半径 0→30px                │
│          粒子 0→15 颗，缓慢上升           │
│          音效：低频嗡鸣渐入（可选）        │
│                                          │
│   3-7s   光环扩散                         │
│          halo 半径 30→80px               │
│          粒子 15→40 颗，加速旋转          │
│          神像边缘开始泛金                 │
│          屏幕四角微暗（vignette 效果）     │
│                                          │
│   7-10s  圣光/曼陀罗完整展开               │
│          halo 半径 80→120px              │
│          粒子 40→80 颗                    │
│          曼陀罗图案浮现（南美线=玫瑰窗，    │
│            东南亚线=莲花）                │
│          屏幕整体偏暖金色调               │
│                                          │
│   10s+   虔诚之巅                         │
│          粒子如金色星雨落下               │
│          神像微微放大 (scale 1.0→1.03)    │
│          整个画面短暂白闪 (200ms)          │
│          然后快速过渡到结束画面            │
│                                          │
│   松手   画面定格 0.5s                    │
│          fade out 0.3s                   │
│          fade in 结束画面 0.5s            │
│                                          │
└──────────────────────────────────────────┘
```

**交互原则：** 不用按钮，不用点击，只用手指触摸。这是 Manto 区别于其他 App 的核心触感。用户不是「操作」，是「触摸神圣」。

**边缘情况：**
- 用户按住不足 1 秒松手 → 提示「再按一会，{神}正在聆听」（toast，2s）
- 手指滑出触控区域 → 粒子效果暂停但不重置，手指回到区域内继续
- 设备锁屏/电话中断 → 当前进度保存，回到 App 时从断点继续
- 用户连续参拜（同一天多次）→ 除第一次外不录功德，提示「今天已经拜过了，明天再来吧」

### B5. 参拜结束画面

```
┌──────────────────────────────────────────┐
│                                          │
│   [神像缩小至顶部，尺寸 60×60]            │
│   保留微弱的呼吸光                        │
│                                          │
│   "Maria，Aparecida 已将你的心愿         │
│    放在了最靠近星辰的地方。"              │
│   字体：衬线体 18px，暖白                 │
│                                          │
│   ── 今日指引 ──                          │
│   "她看见你心里有一团火，                 │
│    那是还没说出口的爱。                   │
│    今天，向那个人走近一步。"              │
│   字体：衬线体 15px，暖白 80% 透明度      │
│                                          │
│   AI 生成，基于：                         │
│   · 用户最近一次占卜主题                 │
│   · 当前守护神的「说话风格」             │
│   · 当日日期（节日/满月/新月特殊语汇）   │
│                                          │
│   ┌──────────┐  ┌──────────┐            │
│   │ 🔮 去占卜 │  │ 📤 分享   │            │
│   │  $0.99   │  │ WhatsApp │            │
│   └──────────┘  └──────────┘            │
│                                          │
│   "明天再来，她会一直在这里等你"          │
│   连续参拜 3 天 · +10 功德               │
│   ●●○○○                                  │
│                                          │
└──────────────────────────────────────────┘
```

### B6. 推送通知设计

| 触发条件 | 推送文案模板 | 发送时间 |
|----------|------------|----------|
| 每日参拜提醒 | "{神}已经在等你今天的问候了 🙏" | 当地 07:00 |
| 连续 3 天未参拜 | "三天没有来到{神}面前了。她不是在催促——只是提醒你，你在被守护着。" | 当地 20:00 |
| 7 天连续完成 | "七天。{神}看见了你的坚持。送你一次免费深度占卜。" | 第 7 天 07:00 |
| 守护神节日 | "今天是{神}的节日。今天的参拜功德翻倍。" | 节日当天 07:00 |
| 众筹神上线 | "{Iemanjá} 已降临 Manto！你和其他 99 位信徒一起召唤了她。" | 达成瞬间 |
| 功德升阶 | "{虔诚者}，你已晋升为{持光者}。新的光环已为你展开。" | 升阶瞬间 |

---

## 六、模块 C：功德体系（成长系统）

### C1. 命名

**功德 / Mérito / Merit**

天主教「功劳宝库」(Tesouro dos Méritos) 与佛教「积累功德」的共有概念。Web3 用户天然理解数字往上走——功德就是你的 spiritual stack。

### C2. 三条并行之路

```
        朝圣者 → 虔信者 → 持光者 → 圣侍 → 近神者
           │        │        │        │       │
时间之路 ──┴────────┴────────┴────────┴───────┘  每日参拜×年
传播之路 ──┴────────┴────────┴────────┴───────┘  邀请新人×人
供养之路 ──┴────────┴────────┴────────┴───────┘  累计供养×$
                                                      ↕
                                              总功德 = 三者之和
```

**时间之路 · 每日参拜**

| 条件 | 功德 | 备注 |
|------|------|------|
| 每日参拜 | +1/天 | 每天仅一次 |
| 连续 7 天 | +3 额外 | |
| 连续 30 天 | +15 额外 | |
| 连续 365 天 | +200 额外 | 解锁「恒修者」隐藏称号 |
| 连续 1,000 天 | +1,000 额外 | |
| 累计 3,650 天（10 年）| +5,000 额外 | |
| 累计 18,250 天（50 年）| +30,000 | 直接晋升近神者 |

中断规则：连续计数归零，累计功德不丢。

**传播之路 · 引入新信徒**

| 条件 | 功德 | 备注 |
|------|------|------|
| 分享链接被点击 | +1/次 | 日上限 5 |
| 被分享者完成首次参拜 | +10/人 | 绑定推荐关系 |
| 被分享者首次付费占卜 | +50/人 | |
| 被分享者购买水晶 | +100/人 | |
| 被分享者达到虔信者 | +200/人 | |
| 被分享者达到持光者 | +500/人 | |
| 召唤新神（凑满 100 信徒）| +500 | 首位发起者 |
| 累计引入 100 万人 | +50,000 | 直接晋升近神者 |

推荐绑定：每个受邀用户永久绑定一个推荐人。被推荐人每升一级，推荐人一次性获阶梯奖励。不设金字塔多级收益——只有直接推荐有效。

**供养之路 · 赞助与消费**

| 条件 | 功德 | 备注 |
|------|------|------|
| 完成一次付费占卜 | +2 | |
| 购买水晶手串 | +10 | |
| 为他人购买水晶（赠礼）| +25 | 被赠者也会收到通知 |
| 累计消费 $100 | +50 | |
| 累计消费 $1,000 | +200 | |
| 累计消费 $10,000 | +2,000 | |
| 累计消费 $100,000 | +10,000 | |
| 累计赞助 $10,000,000 | +100,000 | 直接晋升近神者 |

神圣日（节日/满月/新月/跨年）所有功德 ×2。

### C3. 五阶位与徽章

| 阶位 | 功德 | 称号 (PT) | 称号 (ES) | 称号 (EN) | 称号 (ZH) |
|------|------|-----------|-----------|-----------|-----------|
| 0 | 0-99 | Peregrino | Peregrino | Pilgrim | 朝聖者 |
| 1 | 100-499 | Devoto | Devoto | Devotee | 虔信者 |
| 2 | 500-1,999 | Portador da Luz | Portador de Luz | Lightbearer | 持光者 |
| 3 | 2,000-9,999 | Servo Sagrado | Siervo Sagrado | Sacred Servant | 聖侍 |
| 4 | 10,000+ | Próximo ao Divino | Cercano a lo Divino | Close to the Divine | 近神者 |

**0 阶 · 朝圣者 Peregrino**

徽章：蜿蜒向上的土路，尽头一点微光。SVG 极简线条。
形象：素色斗篷旅人，手持木杖，面朝远方。斗篷边缘随呼吸微动。
头像框：无。
功德榜可见：否。

**1 阶 · 虔信者 Devoto**

徽章：双手合十，掌心透出暖金光芒。SVG + 内发光。
形象：旅人跪地，双手捧起发光之星。斗篷边缘染上金线。
头像框：单层淡金细线光圈。
功德榜可见：否。
解锁：「长香」参拜特效（粒子更多，光环更大）。

**2 阶 · 持光者 Portador da Luz**

徽章：灯笼悬空，光圈四射三层。SVG + 动画光环。
形象：半金斗篷，右手提灯，左手护光。身后出现模糊光翼轮廓。
头像框：双层金光。
功德榜可见：是（匿名可选）。
解锁：每月 1 次免费三级阵占卜。专属神像光晕特效。

**3 阶 · 圣侍 Servo Sagrado**

徽章：半开的门，门缝透出炽热金光。SVG + 门缝光线呼吸动画。
形象：金线斗篷完整，光翼成形，头顶悬浮守护神的迷你光环。
头像框：三层金光 + 守护灵符号。
功德榜可见：是（默认真名，可切匿名）。
解锁：每月 2 次免费占卜。可访问隐藏神祇。可给神祇评分。

**4 阶 · 近神者 Próximo ao Divino**

徽章：完全打开的门，门内是生命之树/金色曼陀罗。SVG + 全彩动画。
形象：斗篷化为星尘环身，光翼完全展开，足下专属法阵。功德榜前 10 拥有定制粒子颜色。
头像框：金色曼陀罗完整展开 + 神名铭文。
功德榜可见：是（默认展示称号 + 国籍）。
解锁：社区治理权。水晶 8 折。专属客服通道。

**近神者徽章分支（三条路的视觉差异）：**

| 主导路径 | 门内图案 | 纹样 | 粒子颜色 |
|----------|----------|------|----------|
| 时间为主 | 树根深扎，年轮清晰 | 同心圆 | 暖金 #D4A853 |
| 传播为主 | 树枝四散，星点无数 | 星芒 | 亮金 #F0C060 |
| 供养为主 | 树结果实，丰饶满枝 | 丰饶之角 | 铜金 #B8860B |

阶位不降级。功德只增不减。离开再久回来，阶位还在。

### C4. 功德页面

在「我」→「功德详情」展示：

```
┌──────────────────────────────────────┐
│                                      │
│   [阶位徽章大图，居中，100×100]       │
│   持光者 · Portador da Luz           │
│                                      │
│   ┌──────────────────────────┐      │
│   │  总功德  847              │      │
│   │  ████████████░░░░  847/1999     │
│   │  距离圣侍还差 1,153 功德          │
│   └──────────────────────────┘      │
│                                      │
│   ⏳ 时间功德  320     🙏 每日参拜 187 天  │
│   📤 传播功德  410     👥 引入 23 位新信徒  │
│   💰 供养功德  117     🛒 消费 $59.7       │
│                                      │
│   ── 功勋墙 ──                        │
│   🏅 连续 30 天 · 2026-03-15          │
│   🏅 恒修者 · 2026-05-01              │
│   🏅 引神者 · 2026-04-22              │
│                                      │
└──────────────────────────────────────┘
```

三条路的进度条各自独立展示，用不同颜色区分（时间=暖金、传播=亮金、供养=铜金）。

### C5. 近神者治理权

**投票权**
- 新神祇上线投票：近神者 1 票 = 普通信徒 10 票
- 水晶 SKU 增减提案：需 ≥20 位近神者联署发起
- 产品功能优先级投票：每季度一次，结果直接决定下一个季度的 roadmap
- 社区规则修订：需 ≥50 位近神者参与，60% 通过即生效

**共治权**
- 发起新神祇提案：无需联署，直接进入审核池
- 提名新功德行为：社区投票通过后上线
- 设计限时水晶：每年可提案一款，需 ≥30 位近神者联署
- 命名权：参与新功能、新等级、新徽章的命名投票

**监督权**
- 查看功德排行榜（可匿名）
- 审查被举报内容（匿名化后社区评审）
- 月度 AMA：与产品团队直接对话，查看路线图 + 财务摘要

**护印机制：**
单一国家近神者占比超过 50% 时，该国选票权重自动减半，通知所有近神者「护印已触发」。比例恢复到 40% 以下时自动解除。

**治理操作流程（以新神上线投票为例）：**

```
1. 近神者 A 提交新神祇提案（神名 + 理由 + 文化背景）
2. 后台审核提案（24h 内，确保不违反宗教禁忌）
3. 审核通过 → 进入投票池，所有近神者收到推送
4. 投票期 7 天
5. 投票规则：
   - 赞成票 ≥ 30 位近神者
   - 赞成率 ≥ 60%
   - 则通过 → 进入开发排期
6. 投票结果对所有近神者公开
```

**退出机制：**
- 主动退出：功德保留，降回圣侍。可重新升回。
- 连续 90 天不参拜：自动进入「沉睡」状态，治理权暂停，功德不变。再次参拜即恢复。
- 被弹劾：≥30 位近神者联署弹劾 + ≥60% 通过 → 降回圣侍 + 扣除 1,000 功德。弹劾理由必须公开、具体，且通过后公示 7 天。

---

## 七、模块 D：水晶手串商城（$39.99 · 利润引擎）

### D1. 5 款 SKU（纯五行体系，不绑定神祇）

| 五行 | 水晶 | 葡语名 | 西语名 | 英语名 | 中文名 | 补益 |
|------|------|--------|--------|--------|--------|------|
| 木 | 绿幽灵 | Fantasma Verde | Fantasma Verde | Green Phantom | 木靈·綠幽靈 | 生长、突破、事业 |
| 火 | 红玛瑙 | Cornalina | Cornalina | Red Carnelian | 火魂·紅瑪瑙 | 热情、勇气、行动 |
| 土 | 黄水晶 | Citrino | Citrino | Citrine | 土蘊·黃水晶 | 稳定、财运、贵人 |
| 金 | 白水晶 | Cristal Branco | Cristal Blanco | Clear Quartz | 金澈·白水晶 | 净化、决断、智慧 |
| 水 | 黑曜石 | Obsidiana | Obsidiana | Black Obsidian | 水御·黑曜石 | 保护、辟邪、平静 |

**水晶规格：** 8mm × 23 颗圆珠，弹力绳手串，中性尺寸。附五行属性小卡 + Manto 暗金绒布袋。

**AI 推荐逻辑（水晶占卜触发场景）：**

| 触发条件 | 推荐五行 | 理由叙事 |
|----------|----------|----------|
| 牌阵中权杖牌 ≥2 张 | 木（绿幽灵）| 火太旺——需要木来持续燃烧，而非一次性爆发 |
| 牌阵中圣杯牌 ≥2 张 | 火（红玛瑙）| 水满则寒——需要一把火来温暖情绪的深处 |
| 牌阵中大阿卡纳 ≥2 张 | 土（黄水晶）| 命运的重牌需要土来承载，你需要脚踏实地 |
| 牌阵中宝剑牌 ≥2 张 | 金（白水晶）| 思绪如剑四散——金能聚神，让思维归于清明 |
| 牌阵中逆位牌 ≥2 张 | 水（黑曜石）| 逆流时以柔克刚，黑曜石把暗涌挡在外面 |

### D2. 水晶详情页

```
┌──────────────────────────────────────┐
│                                      │
│   [水晶高清渲染图，300×300，暗底]     │
│   可 360° 旋转（手指滑动）            │
│                                      │
│   木灵·绿幽灵                        │
│   Green Phantom Quartz               │
│                                      │
│   ⭐ 4.8 (1,234 条评价)              │
│                                      │
│   ── 能量属性 ──                      │
│   五行：木                            │
│   补益：生长 · 突破 · 事业上升        │
│   守护：适合正在起步、转型、           │
│         或渴望突破停滞的你            │
│                                      │
│   ── 佩戴故事 ──                      │
│   "戴上它去面试，拿到了 offer。        │
│    不知道是不是水晶的关系，             │
│    但那天我特别敢说话。" — 🇧🇷 Ana    │
│                                      │
│   ┌──────────────────────────┐      │
│   │  📿 请一条 · $39.99       │      │
│   └──────────────────────────┘      │
│                                      │
│   [🛐 请守护神加持这条手串]           │
│                                      │
│   已佩戴：2,341 人                    │
│   配送：7-10 天（巴西）/ 10-15 天（其他）│
│                                      │
└──────────────────────────────────────┘
```

### D3. 购买后加持仪式

```
购买成功页面：
  ↓
  "你的绿幽灵正在路上。"
  "在它到来之前，请 {Aparecida} 为你加持——"
  ↓
  [🛐 开始加持]
  ↓
  跳转拜神页 → 特殊加持仪式
  - 神像手上多了一条发光手串（SVG overlay）
  - 用户手指按住 5 秒
  - "{Aparecida} 已将祝福注入你的绿幽灵"
  ↓
  生成加持证书：
  ┌──────────────────────┐
  │                      │
  │  [神像小图]           │
  │                      │
  │  Aparecida 已为       │
  │  Maria 的             │
  │  木灵·绿幽灵手串      │
  │  注入守护祝福          │
  │                      │
  │  2026.06.26           │
  │                      │
  │  #MantoBlessed       │
  └──────────────────────┘
  
  [📤 分享 WhatsApp] [📤 分享 Discord]
```

---

## 八、产品视觉语言

### Web3 暗金美学

```
颜色系统：
  底色        #0D0D0D 深黑（不刺眼，适合夜间使用）
  主色        #C9954A 暗金（牌背、神像光环、强调元素）
  辅色        #7E6FA8 暗紫（牌阵中的神秘元素、辅助 UI）
  高亮        #D4A853 暖金（按钮、CTA、功德粒子）
  文字        #E8E0D5 暖白（正文，不刺眼）
  文字次级    rgba(232,224,213,0.6) 暖白半透
  卡片底板    rgba(201,149,74,0.06) 暗金极透
  卡片边框    rgba(201,149,74,0.12) 暗金微透
  成功        #5B8C5A 墨绿（购买成功、功德增加）
  错误        #C45B4A 暗红（支付失败、异常状态）
```

```
字体系统：
  标题：Playfair Display（衬线，仪式感）
  正文：Inter（无衬线，可读性，因 web3 用户多用英文界面）
  中文：Noto Serif SC / Noto Serif TC（衬线，匹配标题）
  中文正文：Noto Sans SC / Noto Sans TC
  数字/代码：JetBrains Mono（功德数字，进度条百分比）
```

```
动画规范：
  微交互：200-300ms ease-out
  页面过渡：300-400ms ease-in-out
  牌面翻转：400ms cubic-bezier(0.4, 0, 0.2, 1)
  粒子动画：持续循环，帧率 ≥30fps
  呼吸光：周期 3-4s，ease-in-out 循环
  页面滚动：平滑滚动，smooth scroll behavior
```

```
间距系统（8px 基础）：
  4px   极密间距（图标与文字）
  8px   紧凑间距（卡片内元素）
  12px  常规内边距（按钮内）
  16px  模块间距（卡片之间）
  20px  页面边距（移动端）
  24px  段落间距
  32px  大模块间距
  48px  页面顶部留白
```

**为什么不用白色：** 教堂的白墙和白色圣母像让 web3 用户觉得那是「别人的地方」。暗底金光让他们觉得这是「凌晨三点还在刷的手机里出现的、属于自己的角落」。Manto 不需要看起来像教堂——它需要看起来像你不想退出的那个 App。

---

## 九、用户旅程

### Day 0 · 首次打开

```
打开 Manto
  │
  ├─→ 首页：三张牌背朝上，暗金呼吸光
  │     底部："翻一张牌，看看今天怎么走"
  │
  ├─→ 点击「开始占卜」
  │     ├─→ 输入问题或跳过
  │     ├─→ 翻牌（过去→现在→未来）
  │     ├─→ AI 流式解读
  │     ├─→ 融通 + 建议
  │     └─→ 护持（水晶推荐 + 肯定语）
  │
  ├─→ 底部引导："🛐 还没选你的守护神？"
  │     ├─→ 选神页（8 位核心神 + 搜索框）
  │     ├─→ 手指参拜（按住神像 3-10s）
  │     └─→ 结束画面：AI 今日指引 + 分享
  │
  └─→ 推送权限请求（延迟到首次参拜完成后）
         "让 {神} 每天提醒你参拜？"
```

首次体验的核心目标：**让用户在 5 分钟内完成「翻牌 + 选神 + 参拜」三个动作。** 完成这三个动作的用户，次日留存率比只翻了牌的高 3 倍。

### Day 1-7 · 养成习惯

```
每天打开 Manto 的触发：
  07:00 推送通知 → "Aparecida 已经在等你了 🙏"
  
打开后的行为序列：
  1. 看一眼今日能量（首页底部，秒加载）
  2. 翻开今日运势牌（单牌直断，首次免费）
  3. 手指参拜（30 秒）
  4. 看今日指引
  5. 如果触发水晶推荐 → 看一眼但不一定买
  6. 关闭 App
  
  耗时：1-2 分钟
```

**第 3 天：** 推送「连续 3 天了。Aparecida 觉得你的虔诚值得一次深度占卜。首次 $0.49。」
**第 7 天：** 推送「七天。一次免费深度占卜已解锁。」+ 功德 +30

### Day 7-30 · 付费转化

| 触发 | 转化 |
|------|------|
| 第 7 天免费占卜 | 深度体验 → 自然下次付费概率 ↑ |
| 占卜结果推水晶 | 已有 X 人佩戴 → 首次水晶浏览 |
| 第 14 天 | 满月/新月特价占卜 $0.49 |
| 第 21 天 | 升阶虔信者 → 解锁自选参拜动画 |
| 第 30 天 | 如果仍未付费 → 推送「{神}说你的运势该更新了。这次我们请客。」 |

### 长期留存

```
用户分层与策略：

新用户 (Day 0-7)：
  目标：完成首次翻牌 + 首次参拜 + 第 7 天回归
  策略：免费占卜体验 + 温柔推送

活跃用户 (Day 8-30)：
  目标：建立每日参拜习惯 + 首次付费
  策略：连续打卡奖励 + 限时特价 + 神圣日双倍功德

付费用户 (已付费 ≥1 次)：
  目标：复购占卜 + 水晶首次浏览
  策略：个性化水晶推荐 + 赠礼场景引导

忠实用户 (月参拜 ≥25 天)：
  目标：传播裂变 + 走向近神者
  策略：分享功德翻倍 + 邀请排行榜 + 治理权预览

沉睡用户 (≥14 天未打开)：
  目标：召回
  策略：「你的功德还在，{神}在等你回来」+ 免费占卜券
  注意：不制造焦虑——「你错过了 X 天」是错误文案
```

---

## 十、支付

支付走第三方嵌入 App 提供的接口，Manto 不直接处理支付信息。

### 支付流程

```
用户点击 $0.99 占卜 / $39.99 水晶
  ↓
Manto 前端调用父应用 postMessage：
  {
    source: "manto",
    event: "payment_request",
    data: {
      amount: 0.99,
      currency: "USD",
      itemType: "reading" | "crystal",
      itemId: "three_spread" | "green_phantom",
      userId: "external_xxx"
    }
  }
  ↓
父应用处理支付（支持 web3 支付: USDC/USDT/SOL 预留）
  ↓
父应用 postMessage 回 Manto：
  {
    source: "parent_app",
    event: "payment_result",
    data: { success: true, transactionId: "tx_xxx" }
  }
  ↓
Manto 调用 POST /api/reading/confirm 或 POST /api/crystal/confirm
  ↓
服务端校验 → 发放占卜结果/创建订单
```

### 价格本地化展示

| 价格 | 巴西 (BRL) | 墨西哥 (MXN) | 阿根廷 (ARS) | 泰国 (THB) | 菲律宾 (PHP) |
|------|-----------|-------------|-------------|-----------|-------------|
| $0.49 | R$ 2,90 | $9 MXN | $450 ARS | ฿17 | ₱28 |
| $0.99 | R$ 5,90 | $19 MXN | $900 ARS | ฿35 | ₱55 |
| $1.99 | R$ 11,90 | $38 MXN | $1,800 ARS | ฿70 | ₱112 |
| $39.99 | R$ 237 | $760 MXN | $36,000 ARS | ฿1,400 | ₱2,240 |

### 退款政策

- 占卜：AI 解读已生成 → 不支持退款。如 AI 未生成（网络错误等）→ 自动退款。
- 水晶：未发货 → 全额退。已发货 → 依照父应用物流政策。
- 已加持的水晶不支持无理由退货。

---

## 十一、技术架构

### 技术栈

```
前端:    Next.js 15 + TypeScript + Tailwind v4
后端:    Next.js API Routes + Prisma ORM
数据库:  MySQL (PlanetScale / Vercel Postgres)
AI:      DeepSeek Chat API (服务端调用)
部署:    Vercel
动画:    Framer Motion + Canvas 粒子系统
i18n:    next-intl
```

### 前端路由与页面

```
/app
├ page.tsx                     首页：塔罗 C 位 + 今日能量 + 拜神入口
├ layout.tsx                   AppShell：4 项底部导航 + 全局粒子背景
│
├ /reading/page.tsx            占卜流程 5 步状态机
├ /reading/[id]/page.tsx       占卜结果详情
│   ├ 服务端渲染，SEO 友好
│   └ 可分享链接（og:image 动态生成牌面缩略图）
│
├ /temple/page.tsx             拜神主页（参拜交互）
├ /temple/select/page.tsx      选神/搜神/众筹页
│
├ /crystal/page.tsx            水晶商城列表
├ /crystal/[sku]/page.tsx      水晶详情
├ /crystal/order/[id]/page.tsx 订单状态
│
├ /profile/page.tsx            个人中心
├ /profile/merit/page.tsx      功德详情
├ /profile/settings/page.tsx   设置
│
├ /api/
│ ├ /reading/route.ts          POST: 发起占卜 · GET: 查询占卜历史
│ ├ /reading/confirm/route.ts  POST: 支付确认
│ ├ /temple/route.ts           POST: 记录参拜 · GET: 查询参拜历史
│ ├ /deity/search/route.ts     GET: 神祇搜索匹配
│ ├ /deity/support/route.ts    POST: 支持某位神（众筹+1）
│ ├ /crystal/route.ts          GET: 水晶列表
│ ├ /crystal/confirm/route.ts  POST: 水晶购买确认
│ ├ /merit/route.ts            GET: 功德详情
│ ├ /analytics/track/route.ts  POST: 埋点事件上报（批量）
│ ├ /auth/route.ts             POST: 验证第三方 token
│ └ /ai/route.ts               POST: DeepSeek 代理（服务端调用，key 不暴露）
```

### 占卜状态机详细设计

```typescript
// src/lib/reading/state-machine.ts

type ReadingState = 
  | 'idle'           // 初始
  | 'questioning'    // 用户输入问题
  | 'shuffling'      // 背景洗牌动画（过渡态，2s）
  | 'awaiting_tap'   // 等待用户翻牌
  | 'revealing'      // 翻牌动画播放中
  | 'interpreting'   // AI 流式解读中
  | 'awaiting_next'  // 等待翻下一张
  | 'synthesizing'   // AI 综合解读中
  | 'blessing'       // 展示护持结果
  | 'complete';      // 完成

type ReadingEvent =
  | 'START_READING'
  | 'QUESTION_SUBMITTED'
  | 'SHUFFLE_COMPLETE'
  | 'CARD_TAPPED'
  | 'REVEAL_COMPLETE'
  | 'INTERPRETATION_DONE'
  | 'NEXT_CARD_READY'
  | 'ALL_CARDS_DONE'
  | 'SYNTHESIS_DONE'
  | 'BLESSING_ACKNOWLEDGED'
  | 'ERROR'
  | 'RETRY';

interface ReadingContext {
  question: string;
  spreadType: SpreadType;
  cards: DrawnCard[];           // { position, cardName, orientation }
  interpretations: Interpretation[];  // { position, text }
  synthesis: Synthesis | null;  // { relationships, narrative, suggestions }
  blessing: Blessing | null;    // { element, crystal, affirmation }
  currentCardIndex: number;
  error: ReadingError | null;
}
```

### 数据库 Schema 扩展

```sql
-- 完整 user 表
user:
  id, external_id, nickname, avatar_url,
  language (pt|es|en|zh-CN|zh-TW), country, timezone,
  preferred_deity_id, tradition (latin|seasia),
  streak_days, streak_longest, last_checkin_date,
  merit_total, merit_time, merit_share, merit_offer,
  merit_level, merit_title, merit_badge_style,
  free_readings_remaining, total_readings, total_spent_cents,
  created_at, updated_at

-- 神祇配置
deity_config:
  id, slug,
  name_pt, name_es, name_en, name_zh_cn, name_zh_tw,
  tradition, region_tags[], domain_tags[],
  visual_primary_color, visual_secondary_color,
  svg_data (base64), halo_style, particle_style,
  status (live|pending), follower_count, threshold (default 100),
  feast_days[],
  speaking_style_prompt,
  created_at, activated_at

-- 神祇搜索目录
deity_catalog:
  id, canonical_name, aliases[] (多语言),
  tradition, region, cultural_note,
  status, follower_count, threshold,
  first_supporter_id, supporters[],
  created_at, activated_at

-- 参拜记录
temple_checkin:
  id, user_id, deity_id,
  hold_duration_ms, peak_reached (3s|7s|10s),
  ai_blessing_text,
  merit_earned, festival_bonus_applied,
  created_at

-- 占卜记录
reading:
  id, user_id, question, spread_type,
  cards_drawn (json), interpretations (json),
  synthesis (json), blessing (json),
  wuxing_element, crystal_recommended,
  price_paid_cents, paid (bool), ai_fallback (bool),
  created_at

-- 水晶订单
crystal_order:
  id, user_id, crystal_sku, price_cents, currency,
  payment_id, payment_status,
  blessed (bool), blessed_deity_id,
  shipping_status,
  created_at

-- 功德日志
merit_log:
  id, user_id, path (time|share|offer),
  action_type, points_earned, description,
  related_id (reading_id|order_id|referee_user_id),
  created_at

-- 推荐关系
referral:
  id, referrer_user_id, referee_user_id,
  referee_joined_at, referee_first_paid_at,
  referee_first_crystal_at,
  referee_current_level,
  referrer_total_merit_earned,
  created_at

-- 埋点事件（用于转化分析）
analytics_event:
  id, user_id, session_id, event, page,
  referrer_page, language, country, device_type,
  properties (json), client_timestamp, server_timestamp
```

### 第三方认证适配器

```typescript
// src/lib/auth/adapter.ts

interface UserIdentity {
  externalId: string;
  nickname?: string;
  avatarUrl?: string;
  language?: string;
  country?: string;
}

abstract class AuthAdapter {
  abstract extractUser(req: NextRequest): Promise<UserIdentity | null>;
}

// 适配器 A: URL Token
class UrlTokenAdapter extends AuthAdapter {
  async extractUser(req: NextRequest): Promise<UserIdentity | null> {
    const token = req.nextUrl.searchParams.get('token') 
               || req.cookies.get('manto_token')?.value;
    if (!token) return null;
    return this.verifyToken(token);
  }
  private async verifyToken(token: string): Promise<UserIdentity | null> {
    // 验证父应用签发的 JWT
  }
}

// 适配器 B: HTTP Header
class HeaderForwardAdapter extends AuthAdapter {
  async extractUser(req: NextRequest): Promise<UserIdentity | null> {
    const userId = req.headers.get('x-user-id');
    if (!userId) return null;
    return {
      externalId: userId,
      nickname: req.headers.get('x-user-nickname') ?? undefined,
      avatarUrl: req.headers.get('x-user-avatar') ?? undefined,
    };
  }
}

// 适配器 C: API 回调验证
class CallbackAdapter extends AuthAdapter {
  async extractUser(req: NextRequest): Promise<UserIdentity | null> {
    const sessionId = req.cookies.get('session_id')?.value;
    if (!sessionId) return null;
    const verifyUrl = process.env.PARENT_APP_VERIFY_URL!;
    const resp = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${sessionId}` }
    });
    return resp.ok ? resp.json() : null;
  }
}
```

---

## 十二、AI Prompt 工程详细

### 神祇搜索 Prompt

```
你是一个神祇知识库匹配引擎。

用户输入: "{userInput}"
用户语言: {language}

任务: 判断用户指的是哪位神祇。

返回 JSON:
{
  "canonicalName": "标准化的神名（主要语言的名称）",
  "matchConfidence": 0.0-1.0,
  "tradition": "所属信仰体系",
  "aliases": ["别称1", "别称2", ...],
  "region": "主要崇拜地区",
  "status": "live|pending|unknown",
  "culturalNote": "1-2 句文化背景（如果该神不适合 App 化，在此说明原因）"
}

注意:
- 模糊匹配: 用户输入的不一定是标准名称。搜索所有已知别称。
- 跨语言: 用户可能用葡/西/英/中/泰语输入同一神祇。
- 如果完全无法匹配: confidence 设为 0，canonicalName 设为空字符串。
```

### 今日指引 Prompt

```
你是 {deityName} 的神使。一位信徒刚刚完成了今天的参拜。

信徒信息:
  名字: {nickname}
  守护神: {deityName}
  功德阶位: {meritLevel}
  连续参拜: {streakDays} 天
  最近一次占卜主题: {lastReadingTheme}（可能为空）

今日日期: {today}
今日特殊: {specialDay}（普通日/满月/新月/守护神节日/无）

任务: 用 {deityName} 的口吻，生成一句 2-4 行的今日指引。

要求:
1. 语气温柔、有洞察力。像一位智慧的长辈在说话。
2. 关联信徒的实际情况（如果最近占卜主题是"感情"，可以轻轻提到）。
3. 不要空洞的祝福。"今天会比昨天好"太泛——不如"昨天你说你在等一个答案。今天可以不等了。"
4. 用信徒的语言写 ({language})。
5. 如果是守护神节日，加入节日祝福。
6. 如果是满月，加入月亮的意象。如果是新月，加入新的开始的意象。

输出: 纯文本，2-4 行。不要加名字前缀、不要加引号。
```

### 塔罗 Step 3 单牌解读 Prompt

```
你是 Manto 的驻场塔罗师。信徒翻开了一张牌。

信徒信息:
  名字: {nickname}
  问题: {question}（为空则默认"今日整体状态"）
  牌阵: {spreadType}
  当前牌位: {position}（过去/现在/未来/核心/阻碍等）

卡牌: {cardName}
朝向: {orientation}（正位/逆位）
正位含义: {meaningUp}
逆位含义: {meaningDown}
关键词: {keywords}
元素: {element}

任务: 为这张牌做个性化解读。

要求:
1. 用信徒的语言写 ({language})。
2. 语气像一个半夜在 Discord 上给你发解读的朋友。亲和但不油腻。
3. 必须关联信徒的具体问题。如果问题是"换工作"，解读里要出现"换工作"这三个字。
4. 涉及 {position} 这个牌位的特殊意义。
5. 正位=能量的顺畅表达。逆位=被压抑的能量、需要换个角度的事、或一个无害的提醒。
6. 200-350 字。
7. 结尾附一句「牌面箴言」（加粗，一句话总结，15 字以内）。

输出格式:
{interpretation_text}

**牌面箴言**: {mantra}
```

### 塔罗 Step 4 综合解读 Prompt

```
你是 Manto 的驻场塔罗师。三张牌已经全部翻开。

信徒: {nickname}
问题: {question}
牌阵: {spreadType}

已翻牌:
{cards_summary}
// 格式: "{position}: {cardName}（{orientation}位）—— {单牌解读摘要}"

任务: 将三张牌串联成一段完整叙事。

要求:
1. 用信徒的语言 ({language})。
2. 首先分析牌与牌的关系（80-120 字）：哪些能量互相增强，哪些形成张力。
3. 然后构建叙事主轴（200-300 字）：从过去→现在→未来的逻辑线。
4. 最后给出 3 条建议（每条 50-80 字）：可行动的、具体的、关联用户生活场景的。
5. 整体语气温暖有洞察力。不空洞，不鸡汤。

输出 JSON:
{
  "relationships": "牌与牌的关系",
  "narrative": "叙事主轴",
  "suggestions": ["建议1", "建议2", "建议3"]
}
```

---

## 十三、数据埋点与转化分析

### 埋点架构

所有埋点统一格式，通过 `POST /api/analytics/track` 发送，客户端去重 + 批量上报（每 10 条或每 30 秒）。

```typescript
interface AnalyticsEvent {
  event: string;                    // 事件名，命名规范: 页面_动作_对象
  userId?: string;                  // 登录用户 ID
  sessionId: string;                // 会话 ID，app 打开时生成
  timestamp: number;                // 客户端时间戳
  properties: Record<string, any>;  // 事件属性
  page: string;                     // 当前页面路由
  referrerPage?: string;            // 来源页面
  language: string;                 // 用户语言
  country?: string;                 // IP 归属国家
  deviceType: 'mobile' | 'tablet' | 'desktop';
}
```

---

### 首页埋点

| 事件名 | 触发时机 | 属性 | 转化分析意义 |
|--------|----------|------|-------------|
| `home_view` | 首页加载完成 | loadTime, cardCount, energyLoaded | DAU 基数 |
| `home_card_breath_view` | 牌背呼吸动画首帧渲染 | 无 | 视觉首印象，衡量首屏吸引力 |
| `home_cta_click` | 点击「开始占卜」 | freeReadingsLeft, isReturningUser | **核心转化漏斗入口** |
| `home_energy_view` | 「今日能量」模块进入视口 | scrollDepth | 非占卜用户的次级关注点 |
| `home_temple_entry_click` | 点击「拜神」入口 | hasCheckedInToday | 占卜→拜神或直接拜神的分流 |
| `home_pull_refresh` | 下拉刷新首页 | 无 | 用户期待新内容程度 |
| `home_session_duration` | 离开首页时上报 | durationMs | 首页停留时长 |

**核心漏斗定义：**

```
home_view (100%)
  → home_cta_click (目标 ≥60%)
    → reading_question_submit (目标 ≥85%)
      → reading_card_tap_first (目标 ≥90%)
        → reading_all_cards_revealed (目标 ≥75%)
          → reading_synthesis_view (目标 ≥85%)
            → reading_blessing_view (目标 ≥80%)
              → reading_pay_click (付费转化点)
```

**异常监控：**
- `home_cta_click` < 40% → CTA 按钮位置/文案有问题
- `home_view` → `home_cta_click` 的流失在 3 秒内 → 用户根本没看内容就跳走了

---

### 占卜流程埋点

| 事件名 | 触发时机 | 属性 | 转化分析意义 |
|--------|----------|------|-------------|
| `reading_start` | 进入占卜流程 | spreadType, freeOrPaid | 区分免费/付费用户 |
| `reading_question_focus` | 输入框获焦 | 无 | 用户输入意愿 |
| `reading_question_tag_click` | 点击高频标签 | tagType | 最热门的问题类型 |
| `reading_question_voice` | 使用语音输入 | 无 | 语音输入使用率 |
| `reading_question_skip` | 点击跳过 | 无 | 空问题比例 |
| `reading_question_submit` | 提交问题 | questionLength, hasInput | **占卜第一步完成** |
| `reading_shuffle_start` | 洗牌动画开始 | duration | 动画性能 |
| `reading_card_tap` | 点击某张牌 | position, cardOrder | 翻牌顺序遵循度 |
| `reading_card_tap_wrong` | 试图翻未到顺序的牌 | attemptedPosition, expectedPosition | UX 清晰度 |
| `reading_card_reveal_start` | 翻牌动画开始 | position, cardName | 每张牌的翻牌触发 |
| `reading_card_reveal_complete` | 翻牌动画完成 | position, duration | 动画耗时 |
| `reading_interpretation_stream_start` | AI 流式解读开始 | position, latency | AI 首 token 延迟 |
| `reading_interpretation_stream_complete` | 单牌解读完成 | position, duration, totalTokens | 解读生成耗时 |
| `reading_interpretation_scroll_up` | 用户上滑查看历史解读 | position | 回看行为 |
| `reading_interpretation_scroll_back` | 点击「回到最新」按钮 | position | 回看后返回 |
| `reading_synthesis_view` | 综合解读首屏进入视口 | durationSinceAllDone | 融通页曝光 |
| `reading_synthesis_read_full` | 滚动到综合解读底部 | scrollPercentage | 完整阅读率 |
| `reading_blessing_view` | 护持页进入视口 | wuxingElement, crystalType | 水晶推荐曝光 |
| `reading_blessing_crystal_click` | 点击水晶「查看详情」 | crystalSku | **水晶转化漏斗入口** |
| `reading_blessing_affirmation_copy` | 复制肯定语 | 无 | 用户想保存/分享 |
| `reading_blessing_save` | 点击「保存到记录」 | 无 | 留存意愿 |
| `reading_blessing_share_click` | 点击分享按钮 | platform | 分享渠道偏好 |
| `reading_blessing_share_complete` | 分享成功 | platform | 实际分享率 |
| `reading_blessing_temple_click` | 点击「请守护神加持」 | deityId | 占卜→拜神桥接率 |
| `reading_pay_wall_view` | 付费墙展示 | spreadType, price | 免费次数用完后触发 |
| `reading_pay_click` | 点击付费按钮 | spreadType, price | **付费转化点** |
| `reading_pay_success` | 支付成功 | spreadType, price, transactionId | 付费成功 |
| `reading_pay_cancel` | 支付取消/失败 | spreadType, price, reason | 付费失败分析 |
| `reading_ai_fallback` | 降级到规则引擎 | reason, retryCount | AI 可用率监控 |
| `reading_error` | 占卜流程中任何错误 | step, errorType, message | 错误分布地图 |
| `reading_abandon` | 在任何步骤离开占卜 | abandonStep, timeSpent | 流失节点分析 |

**占卜流程流失漏斗（Step 级）：**

```
reading_start
  → reading_question_submit    (流失: 无输入直接退出)
    → reading_card_tap × N     (流失: 未翻完所有牌)
      → reading_synthesis_view (流失: 在解读过程中离开)
        → reading_blessing_view(流失: 看完解读没看护持)
          → reading_pay_click  (付费转化)
```

**单牌解读质量监控：**

当以下指标异常时告警：
- `reading_interpretation_stream_start` latency > 3s → AI 首 token 太慢
- `reading_interpretation_stream_complete` duration > 25s → 单牌生成超时
- `reading_interpretation_scroll_up` 占比 > 40% → 解读太长或不够吸引人
- `reading_synthesis_read_full` 占比 < 30% → 综合解读可能太长，没人读完

---

### 拜神流程埋点

| 事件名 | 触发时机 | 属性 | 转化分析意义 |
|--------|----------|------|-------------|
| `temple_view` | 拜神主页加载 | deityId, tradition | 拜神页曝光 |
| `temple_select_view` | 选神页加载 | tradition, liveDeityCount | 选神页曝光 |
| `temple_select_deity_card_click` | 点击某位神 | deityId, isAlreadyLive | 已上线 vs 众筹选择分流 |
| `temple_select_deity_confirm` | 确认选择守护神 | deityId, tradition | 选神完成 |
| `temple_search_focus` | 点进搜索框 | 无 | 核心神覆盖面是否够 |
| `temple_search_input` | 输入搜索关键字 | query, queryLength | 用户真实需求 |
| `temple_search_result_view` | 搜索结果展示 | deityId, status, matchConfidence | 搜索匹配质量 |
| `temple_search_no_result` | 搜索无结果 | query | 未覆盖神祇发现 |
| `temple_search_support_click` | 点击「我也在等」| deityId, currentCount | **众筹转化率** |
| `temple_search_support_share` | 分享众筹链接 | deityId, platform | 传播意愿 |
| `temple_hold_start` | 手指按下神像 | deityId, timeSinceLastCheckin | 参拜开始 |
| `temple_hold_3s` | 按住达到 3 秒 | holdDuration, deityId | 第一阶段达成率 |
| `temple_hold_7s` | 按住达到 7 秒 | holdDuration, deityId | 第二阶段达成率 |
| `temple_hold_10s` | 按住达到 10 秒（虔诚之巅）|holdDuration, deityId | **完整参拜率** |
| `temple_hold_release_early` | 未达 3 秒松手 | holdDuration | 参拜意愿不足/交互不清晰 |
| `temple_hold_slide_out` | 手指滑出触控区 | holdDuration | 触控区设计问题 |
| `temple_hold_resume` | 手指滑回触控区 | holdDuration | 用户有意愿继续 |
| `temple_blessing_view` | 结束画面加载 | deityId, blessingLength | 结束画面曝光 |
| `temple_blessing_read_full` | 滚动到指引末尾 | scrollPercentage | 完整阅读率 |
| `temple_blessing_share_click` | 点击分享 | platform | 分享意愿 |
| `temple_blessing_share_complete` | 分享完成 | platform | 实际分享 |
| `temple_blessing_to_reading` | 点击「去占卜」| 无 | 拜神→占卜引流 |
| `temple_push_permission_ask` | 展示推送权限请求 | 无 | 权限请求曝光 |
| `temple_push_permission_grant` | 用户同意推送 | 无 | **推送开通率** |
| `temple_push_permission_deny` | 用户拒绝推送 | 无 | 推送关闭率 |

**拜神留存漏斗：**

```
用户首次 app 打开
  → 选神页曝光
    → 完成选神           (目标 ≥70%)
      → 首次参拜开始
        → 达到 3s        (目标 ≥85%)
          → 达到 7s      (目标 ≥55%)
            → 达到 10s   (目标 ≥30%)
              → 次日回访参拜  (目标 ≥35%)
                → 第 7 日连续参拜 (目标 ≥15%)
```

**参拜质量分群：**

| 参拜时长 | 用户标签 | 后续策略 |
|----------|----------|----------|
| <3s | 浅尝辄止 | 推送"再试一次？手指多按一会儿" |
| 3-7s | 到位但未沉浸 | 正常推送 |
| 7-10s | 深度参拜 | 增加个性化指引 |
| 10s+ | 虔诚之巅 | 功德翻倍日优先推送 |

---

### 水晶商城埋点

| 事件名 | 触发时机 | 属性 | 转化分析意义 |
|--------|----------|------|-------------|
| `crystal_list_view` | 商城列表页曝光 | crystalCount | 浏览入口 |
| `crystal_card_click` | 点击某款水晶 | crystalSku, position, source | 兴趣来源 |
| `crystal_detail_view` | 水晶详情页加载 | crystalSku, referrer | 曝光 |
| `crystal_detail_scroll_depth` | 滚动深度 | crystalSku, depthPct | 内容吸引力 |
| `crystal_detail_review_read` | 阅读佩戴故事 | crystalSku | 社交证明关注度 |
| `crystal_detail_rotate` | 360° 旋转水晶图 | crystalSku, rotateAngle | 交互参与度 |
| `crystal_add_to_cart` | 点击「请一条」| crystalSku, price | **加购转化** |
| `crystal_cart_view` | 购物车/确认页曝光 | crystalSku, totalPrice | 确认页 |
| `crystal_checkout_start` | 点击确认购买 | crystalSku, price, paymentMethod | **购买发起** |
| `crystal_pay_success` | 支付成功 | crystalSku, price, transactionId | **购买成功** |
| `crystal_pay_fail` | 支付失败 | crystalSku, reason | 失败分析 |
| `crystal_bless_start` | 点击「请守护神加持」| crystalSku, deityId | 加持意愿 |
| `crystal_bless_complete` | 加持仪式完成 | crystalSku, deityId | 加持完成 |
| `crystal_certificate_view` | 查看见证书 | crystalSku | 证书曝光 |
| `crystal_certificate_share` | 分享证书 | crystalSku, platform | 裂变机会 |
| `crystal_order_track` | 查看物流 | crystalSku, orderStatus | 物流关注 |

**水晶转化漏斗：**

```
占卜护持页 crystal_click
  → crystal_detail_view          (流失: 点进去就关了)
    → crystal_add_to_cart        (流失: 看了详情没买)
      → crystal_checkout_start   (流失: 加购后放弃)
        → crystal_pay_success    (流失: 支付失败或取消)
          → crystal_bless_start  (流失: 买完没加持)
```

**关键转化指标：**

| 指标 | 计算方式 | 健康阈值 |
|------|----------|----------|
| 占卜→水晶详情点击率 | blessing_crystal_click / blessing_view | ≥12% |
| 水晶详情→加购率 | add_to_cart / detail_view | ≥8% |
| 加购→购买成功率 | pay_success / checkout_start | ≥60% |
| 购买→加持完成率 | bless_complete / pay_success | ≥40% |
| 水晶首购后 30 天复购率 | 同用户第二次购买 | ≥5% |

---

### 功德体系埋点

| 事件名 | 触发时机 | 属性 | 转化分析意义 |
|--------|----------|------|-------------|
| `merit_view` | 功德详情页加载 | level, totalMerit | 功德页曝光 |
| `merit_time_view` | 时间功德区域进入视口 | timeMerit, streakDays | 时间路关注度 |
| `merit_share_view` | 传播功德区域进入视口 | shareMerit, referralCount | 传播路关注度 |
| `merit_offer_view` | 供养功德区域进入视口 | offerMerit, totalSpent | 供养路关注度 |
| `merit_level_up` | 功德升阶 | oldLevel, newLevel, totalMerit | **阶位升级** |
| `merit_level_up_share` | 升阶后点击分享 | newLevel, platform | 升阶传播 |
| `merit_badge_click` | 点击徽章查看详情 | level, badgeStyle | 徽章兴趣 |
| `merit_leaderboard_view` | 功德排行榜曝光 | level, rank | 排行榜关注 |
| `merit_governance_view` | 近神者查看治理面板 | 无 | 治理参与（仅近神者） |
| `merit_vote_cast` | 近神者投票 | proposalType, vote | 投票行为（仅近神者） |
| `merit_impeach_init` | 发起弹劾 | targetUserId, reason | 弹劾发起（仅近神者） |

---

### 全局埋点

| 事件名 | 触发时机 | 属性 | 转化分析意义 |
|--------|----------|------|-------------|
| `app_open` | App 冷启动 | coldStart, lastSessionDelta | 新会话开始 |
| `app_foreground` | App 从后台回到前台 | backgroundDuration | 回访 |
| `app_background` | App 进入后台 | sessionDuration | 会话时长 |
| `nav_tab_click` | 点击底部导航 | tab, currentTab | 导航使用分布 |
| `push_received` | 收到推送 | pushType, title | 推送触达 |
| `push_opened` | 点击推送进入 App | pushType, title | **推送转化率** |
| `share_click` | 任何分享按钮点击 | page, element, platform | 分享意愿 |
| `share_complete` | 分享操作完成（回到 App）| page, element, platform | 实际分享 |
| `referral_link_click` | 被分享链接被点击 | referrerId, platform | 传播触达 |
| `referral_signup` | 被分享者首次参拜 | referrerId, refereeCountry | **拉新转化** |
| `error_occurred` | 任何未捕获错误 | page, errorType, stack | 错误监控 |
| `language_switch` | 用户切换语言 | oldLanguage, newLanguage | 语言偏好变化 |
| `deity_switch` | 用户切换守护神 | oldDeity, newDeity, reason | 神祇偏好变化 |
| `setting_change` | 任何设置变更 | setting, oldValue, newValue | 设置使用 |

---

### 转化漏斗全景

```
                     App Open (100%)
                          │
              ┌───────────┴───────────┐
              │                       │
         翻一张牌                   直接拜神
         (~65%)                    (~35%)
              │                       │
    ┌─────────┴──────────┐            │
    │                    │            │
 免费占卜             付费占卜      手指参拜
 (~80%)               (~20%)       (~90%)
    │                    │            │
    ▼                    ▼            ▼
 完成解读            完成解读      完成参拜
 (~70%)              (~85%)       (~75%)
    │                    │            │
    ▼                    ▼            ▼
 看水晶推荐           看水晶推荐    看今日指引
 (~45%)              (~55%)       (~85%)
    │                    │            │
    ▼                    ▼            ▼
 选守护神             选守护神      次日回访
 (~30%)              (~10%)       (~35%)
    │
    ▼
 次日回访
 (~30%)
    │
    ▼
 Day 3 回访
 (~18%)
    │
    ▼
 Day 7 回访          ← 连续参拜 7 天里程碑
 (~12%)
    │
    ├→ 首次付费占卜 (~10% 累计)
    │     │
    │     └→ 二次付费 (~5% 累计)
    │           │
    │           └→ 水晶浏览 (~20% 付费用户)
    │                 │
    │                 └→ 首次水晶购买 (~3% 付费用户)
    │                       │
    │                       └→ 加持仪式 (~40% 购买用户)
    │
    └→ 邀请新用户 (~5% D7 用户)
          │
          └→ 成功拉新 (~20% 分享点击转化)
```

---

### 用户分群与生命周期标记

基于埋点数据自动标记用户状态：

| 状态 | 判定条件 | 时效 |
|------|----------|------|
| new | 注册 ≤7 天 | 实时 |
| active | 过去 7 天 ≥3 次会话 | 每日更新 |
| engaged | 过去 30 天 ≥15 次参拜 + ≥1 次付费 | 每日更新 |
| paying | 过去 90 天有付费记录 | 每日更新 |
| at_risk | 过去 14 天有参拜但 7 天无参拜 | 每日更新 |
| dormant | 过去 30 天无参拜 | 每日更新 |
| churned | 过去 90 天无参拜 | 每日更新 |
| vip | 近神者阶位 | 实时 |

**分群转化分析视角：**

```
pivot: 用户来源国家 × 选神阵营 × 首日行为完成度 × 7日留存

例如:
  巴西用户 → Aparecida → 完成了翻牌+参拜 → 7日留存 42%
  巴西用户 → Aparecida → 只翻了牌没参拜 → 7日留存 18%
  
  → 洞察: 「完成首次参拜」是留存的最强预测因子
  → 行动: 在翻牌结束后强制引导选神参拜，而非可选
```

---

## 十四、实施路线

### Phase 0 · 立刻开始（2-3 天）

**目标：第一版能翻牌 + 能拜神 + 能付费**

```
- 暗金塔罗首页（牌背呼吸动画 + 翻牌交互 + 粒子背景）
- DeepSeek API 接入 + 全部提示词调优
- 5 步占卜流程状态机（含流式输出）
- 降级 fallback 到规则引擎
- 选神页 + 8 位神祇 SVG（委托设计 or AI 生成）
- 手指参拜交互（按住计时 + 动画反馈）
- 参拜结束画面 + AI 今日指引
- 打卡 API + 功德基础记录 API
- 底部 4 项导航（占卜 C 位）
- 父应用 token 认证适配
- 支付流程对接
- 埋点 SDK 集成（首页 + 占卜 + 拜神核心事件）
```

**Phase 0 完成标志：** 内部可以走通「打开 App → 翻牌 → AI 解读 → 选神 → 参拜 → 付费」全流程，后台看到完整事件上报。

### Phase 1 · 闭环（3-5 天）

```
- 水晶商城 + 详情页 + 购买流 + 加持仪式
- 神祇搜索匹配 API（DeepSeek 模糊匹配 + 众筹计数）
- 功德系统完整 API（三条路径 + 分项统计）
- 参拜推送通知系统
- 占卜历史记录页
- 水晶商城 + 功德页埋点补全
- 转化漏斗看板搭建（首页→占卜→付费 / 拜神→留存）
```

### Phase 2 · 体验与增长（3-5 天）

```
- 五语 i18n（葡/西/英/简中/繁中）全页面覆盖
- 功德阶位形象系统（徽章 SVG + 头像框 + 光环特效）
- 分享证书生成（Discord / Telegram / WhatsApp 优化链接预览）
- 推荐绑定 + 传播功德追踪
- AI 今日指引个性化（关联占卜历史）
- 连续打卡徽章系统
- 用户分群标签系统（new/active/engaged/paying/at_risk/dormant）
- A/B 测试框架（用于 CTA 文案/推送时机/定价策略实验）
```

### Phase 3 · 上线

```
- 支付全流程测试（所有价格档位）
- 水晶库存管理后台
- Vercel 生产环境部署
- 首批市场内测（巴西优先）
- 近神者治理权基础框架（投票 + 提案）
```

### 各阶段成功指标

| 阶段 | 核心指标 | 目标 |
|------|----------|------|
| Phase 0 上线 | 翻牌完成率 | ≥80% 启动用户完成首次翻牌 |
| | 选神率 | ≥60% 翻牌用户完成选神 |
| Phase 1 上线 | 次日留存 | ≥35% |
| | 首次付费率 | ≥10% |
| Phase 2 上线 | 7 日留存 | ≥25% |
| | 分享率 | ≥8% 用户产生分享 |
| Phase 3 上线 | 30 日留存 | ≥18% |
| | 水晶购买率 | ≥3% 月活 |
| | 月 ARPU | ≥$3.00 |

---

## 十五、风险与禁忌

### 宗教风险

**禁止贬低任何宗教或神祇。** 所有神像展示、AI 生成文本、社区讨论必须保持尊重。Manto 不是「比较哪个神更灵」的地方——它是「你信谁，Manto 就帮谁」的地方。

**禁止宗教排他性表述。** AI 角色不允许输出「只有 X 神能救你」或「Y 神的信徒是错的」。多神并存是 Manto 的基础设定，任何打破这条的 AI 输出都是 bug。系统提示词中已硬编码此规则。

**神祇众筹的上线门槛是真信徒，不是炒作品。** 标记「筹集中」而非「未达标」。「已有 73 位信徒在等」是中性叙事，「还差 27 人」是消费期待。

**文化挪用检测：** 每个新神祇上架前，必须人工审核其文化适宜性。Candomblé、Umbanda、Santería 等有祭司层级和活态仪轨的信仰体系，第一期内不接入。

### 地域禁忌

**巴西：**

- 避免将 Aparecida 与其他宗教符号混搭展示。Aparecida 是巴西国家象征。
- Candomblé 和 Umbanda 的非裔巴西宗教神祇（Oxalá、Iemanjá、Oxum 等）在第一期不接入——存在严重的文化挪用争议。
- 不要在 Aparecida 页面附近放置任何可能被视为「异教」的元素。

**墨西哥：**

- Guadalupe 的形象不做动画变形。粒子特效只做光环扩散，不做面部覆盖。
- 亡灵活骷髅元素绝对不出现。
- 圣母色调保持传统玫瑰红，不改为暗黑主题色。

**泰国：**

- 四面佛的四个面不做旋转/换脸动画——静态展示。
- 佛像不要出现在脚部高度（底部导航栏区域）。
- 象神页面避免出现老鼠（象神坐骑在没有文化语境下可能被误认为害虫）。

**菲律宾：**

- Santo Niño 在菲律宾的崇敬程度远超其他天主教国家。
- 它永远是「被珍视」的状态——不可拖拽、不可随意摆弄、不可放在任何看起来像丢弃位置的交互中。
- Santo Niño 页面永远呈现守护、温暖的色调。

### AI 内容禁区

```
禁止:
✗ 预测死亡、疾病、具体事故
✗ 建议医疗决策（"去看看医生"✓，"牌显示吃点 X 药"✗）
✗ 建议金融投资决策（"近期宜谨慎"✓，"满仓 XX"✗）
✗ 提供法律建议
✗ 替代专业心理咨询

检测到自残/家暴信号时:
→ 回复固定模板: "牌已经翻开。但你需要的不只是牌。请联系专业帮助。"
→ 附带对应语言的热线号码:
   PT: Centro de Valorização da Vida - 188
   ES: Línea de la Esperanza - 717 003 717
   EN: Crisis Text Line - text HOME to 741741
   ZH: 北京心理危机研究与干预中心 - 010-82951332

未成年人保护:
  每日拜神和单牌直断: 16+
  付费占卜和水晶购买: 18+
  （或由父应用侧控制准入）
```

### Web3 风险

**不做 token。** Manto 不发行代币。功德不能兑换成任何加密货币或法币。功德是 spiritual stack，不是金融资产。

**不做 NFT。** 神像、牌面、徽章是信仰物品，不是收藏品。代币化会稀释「神圣」的感知。Web3 用户能接受数字稀缺性，但也清楚什么该代币化什么不该。

**不做预测市场。** 没有「占卜对了吗」赌盘。占卜是情绪价值，不是金融产品。

**为什么写死这三条：** Web3 用户是最敏锐的 bullshit detector。不发币、不 NFT、不预测市场——他们反而会留下来。这恰好是 web3 世界里最稀缺的体验：一个不试图从你钱包里掏东西的地方，只提供情绪价值。

### 数据隐私

**信仰数据不分享。** 用户拜哪位神、拜多长时间、问什么问题——这是比消费数据更敏感的信息。不对任何第三方开放。父应用请求信仰数据时默认拒绝，除非有明确且有限的产品必要。

**AI 对话不用于模型训练。** 所有占卜问题和 AI 回复视为用户隐私。不喂回 DeepSeek fine-tune。不存储在第三方分析工具。日志保留 30 天后自动清除。

### 合规底线

**水晶描述不许声称医疗功效。** 「平衡能量」可以。「治疗抑郁症」违法。水晶卖情绪价值和文化象征。

**支付合规由父应用承担。** Manto 作为嵌入式应用不直接处理支付。但需在支付页展示清晰的总价、货币、退换政策。

**加持水晶不支持无理由退货。** 加持仪式消耗了精神价值——这一条写在购买条款中。

---

## 核心信念

Manto 的用户每天打开一个 App，看到三张牌背朝上发着暗金的光。戳一张，翻过来，AI 用他们自己的语言说句人话——不是在预测命运，是在摸一下他们的头。然后他们明天还来，后天也来。

有一天他们买了条水晶手串，不是因为信仰，是因为已经离不开每天早上那张翻过来的牌。

Web3 世界里到处都是想从你钱包里掏东西的人。Manto 不掏。Manto 只是把神像放在你手机里，告诉你——手指放上来，你被守护着。
