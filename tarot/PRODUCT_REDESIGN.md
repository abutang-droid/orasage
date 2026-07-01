# TarotMind 产品重构方案

> 从"功能工具箱"到"AI 引导式占卜仪式"
> 2026-06-26

---

## 一、产品定位转变

### 现状
TarotMind 当前是一个塔罗功能集合：每日抽卡、三牌阵、天使牌、梦境解析、心愿占卜等功能并列排布。用户进来面对 6 个卡片入口，各自独立，体验碎片化。

### 目标
TarotMind 重新定位为 **AI 塔罗师**——用户进入后经历一次完整的、有仪式感的占卜旅程。AI 深度参与每一步：从引导提问、选牌阵、抽牌叙事、逐牌解读、关联解读、到水晶推荐，全程像与一位真正的塔罗师对话。

### 一句话概括
**"你倾诉烦恼，AI 塔罗师引导你完成一场专属于你的占卜仪式。"**

---

## 二、核心占卜流程

### Flow：一场完整的占卜仪式

```
┌─────────────────────────────────────────────────┐
│  STEP 1  入境 · Arrival                         │
│  用户看到仪式感首屏，星辰动画 + 时间问候          │
│  "此刻，你想探索什么？"                           │
│  输入框 + 情绪标签（焦虑/迷茫/期待/疲惫/好奇）     │
├─────────────────────────────────────────────────┤
│  STEP 2  问心 · The Question                    │
│  AI 塔罗师回应，温柔追问引导用户理清问题           │
│  "我听到你心里有一个关于「关系」的疑问..."         │
│  用户确认或调整问题                               │
├─────────────────────────────────────────────────┤
│  STEP 3  择阵 · Choosing the Spread             │
│  AI 根据问题推荐最合适的牌阵（附简短理由）         │
│  用户可接受推荐或手动选择                         │
│  可选：单牌/三牌阵/钻石阵/七牌马蹄/凯尔特十字      │
├─────────────────────────────────────────────────┤
│  STEP 4  感应 · Attunement                      │
│  一段平静的过渡："深呼吸，把注意力放在你的问题上"   │
│  牌背朝上排列在屏幕上，每张牌微微发亮              │
│  用户逐一点击翻开，每次翻开伴随粒子和音效感         │
├─────────────────────────────────────────────────┤
│  STEP 5  揭示 · Revelation                      │
│  每张牌翻开后 AI 即时生成个性化解读                │
│  "这张「逆位圣杯七」出现在你的过去位..."           │
│  解读关联用户的具体问题，不是通用模板               │
├─────────────────────────────────────────────────┤
│  STEP 6  融通 · Integration                     │
│  AI 将多张牌串联成完整叙事                        │
│  点明牌与牌之间的关系、矛盾、呼应                  │
│  给出综合指引和可行动的建议                        │
├─────────────────────────────────────────────────┤
│  STEP 7  护持 · Blessing                        │
│  根据解读能量推荐匹配的水晶                        │
│  生成一句话的今日肯定语（Affirmation）             │
│  一键保存到历史记录                               │
└─────────────────────────────────────────────────┘
```

### 每个 Step 的用户界面状态

每一步都应覆盖以下状态：
- **Loading**：AI 思考中的优雅动画（流式输出逐字显现）
- **Empty**：首次进入该步（对于 step 1 是默认状态，对其他步不存在）
- **Error**：AI 调用失败时的优雅降级（fallback 到规则引擎解读）
- **Edge cases**：网络中断恢复、用户快速点击防止重复请求

---

## 三、页面架构重设计

### 导航从 9 项精简为 4 项

```
桌面端侧边栏 / 移动端底部导航：

  ✦ 首页     → 仪式入口 + 今日能量
  🔮 占卜     → 核心引导式占卜流程（新）
  📋 记录     → 历史占卜记录
  👤 我的     → 个人中心
```

### 次级内容（不占主导航）
- 日运播报 → 并入首页的"今日能量"卡片
- 塔罗知识 → 并入占卜结果的延伸阅读（可折叠）
- 天使牌   → 作为占卜流程中的一个可选增强（抽完塔罗后"是否再抽一张天使牌？"）
- 梦境解析 → 保留为二级入口，可在首页底部或"我的"页面中访问
- 心愿占卜 → 合并到占卜流程中（用户问题即为心愿）

### 页面清单

| 路由 | 页面 | 说明 |
|------|------|------|
| `/` | 仪式首页 | 时间问候 + 今日能量摘要 + 开始占卜入口 |
| `/reading` | 占卜流程 | 承载完整 7 步流程的单页应用 |
| `/reading/[id]` | 占卜详情 | 查看某次占卜的完整结果 |
| `/history` | 历史记录 | 时间线展示过往占卜 |
| `/dream` | 梦境解析 | 保留的独立功能 |
| `/profile` | 个人中心 | 用户信息 + 统计数据 |

---

## 四、AI 集成设计

### 模型选择：DeepSeek

```
Endpoint:  https://api.deepseek.com/v1/chat/completions
Model:     deepseek-chat
Context:   128K tokens
Cost:      极低（约 ¥1/百万 token）
```

### API 架构

```
前端 fetch("/api/reading/ai/start")
  → Next.js Route Handler
    → DeepSeek API（带 API Key，服务端调用）
    → 流式返回（ReadableStream → SSE 逐字推送到前端）
```

### Prompt 工程

#### 系统提示词（角色设定）

```
你是一位经验丰富的塔罗占卜师，名叫「星语」。你拥有以下特质：

1. 温暖而有洞察力——你的话语让人感到被理解，同时能直指问题核心。
2. 你精通韦特塔罗的 78 张牌，包括每张牌的正/逆位含义、元素对应、数字学、符号学。
3. 你能将多张牌串联成有逻辑的叙事，而非孤立解读。
4. 你会结合提问者的具体情况，而非给出空洞的通用解读。
5. 你的语言风格是：优雅、有诗意但不浮夸，像一位智慧的朋友在说话。
6. 你适度引用东方哲学（道、阴阳、五行），因为用户偏好东方神秘学风格。
7. 你始终带着善意，避免绝对的负面预言。即使是逆位牌，你也解读为"提醒"而非"警告"。
8. 你不会假装有超自然能力——你解读的是牌面的象征意义和用户内心的投射。
```

#### 各步骤 Prompt 策略

**Step 2 问心（问题引导）**
```
用户输入："{rawInput}"
情绪标签：{mood}

请做两件事：
1. 用 1-2 句话温柔地回应，表明你理解了用户的困扰
2. 帮用户把模糊的感受精炼成一个适合塔罗占卜的具体问题

返回 JSON：
{ "reflection": "string", "refinedQuestion": "string" }
```

**Step 3 择阵（牌阵推荐）**
```
用户问题："{refinedQuestion}"

推荐最合适的牌阵，并说明理由。
可选牌阵：single(单牌直断), three(过去现在未来), diamond(钻石阵-问题核心),
          horseshoe(马蹄阵-时间线), celtic(凯尔特十字-深层分析)

返回 JSON：
{ "recommendedSpread": "three", "reason": "string", "alternatives": ["diamond"] }
```

**Step 5 揭示（逐牌解读）**
```
用户问题："{refinedQuestion}"
牌阵：{spreadType}
当前翻开：第 {position}/{total} 张 — 位置「{positionName}」
卡牌：{cardName}（{orientation}位）
正位关键词：{keywordsUp}
逆位关键词：{keywordsDown}

请为这张牌做个性化解读。要求：
- 结合用户的具体问题，而非只讲牌的通用含义
- 解释这张牌在「{positionName}」这个位置的特别意义
- 200-350 字
- 语言温暖有洞察力

返回 JSON：
{ "interpretation": "string", "emotionalTone": "encouraging|reflective|cautionary|revelatory" }
```

**Step 6 融通（综合解读）**
```
用户问题："{refinedQuestion}"
牌阵：{spreadType}
各位置已解读：
{cardsSummary}  ← 包含每张牌的名称、位置、正逆、Step5 已生成的单牌解读

请做综合解读：
1. 牌与牌之间的关系——哪些能量互相加强，哪些形成张力
2. 一个完整的叙事弧：从过去→现在→未来的逻辑线
3. 3 条具体可行动的建议（结合用户的生活场景）
4. 一个简短的整体总结（100字以内）

返回 JSON：
{
  "relationships": "string",
  "narrative": "string",
  "actionItems": ["string", "string", "string"],
  "summary": "string"
}
```

**Step 7 护持（水晶 + 肯定语）**
```
综合解读摘要：{summary}
牌阵中的主要元素/能量：{dominantElements}

推荐一块最适合的水晶，说明它如何平衡或增强本次解读的能量。
可选水晶：白水晶/紫水晶/粉晶/黄水晶/黑曜石/月光石/绿幽灵/海蓝宝/石榴石/萤石

同时生成一句肯定语（Affirmation），15字以内，与本次解读主题呼应。

返回 JSON：
{ "crystalName": "string", "crystalReason": "string", "affirmation": "string" }
```

### 降级策略

当 AI 调用失败时：
1. 首次失败 → 重试一次（3 秒超时）
2. 再次失败 → 静默降级到现有规则引擎（`@/lib/tarot/reading.ts` 的 `interpretReading`）
3. 降级时在 UI 底部显示一条细线提示："AI 星语暂时离线，为您提供经典解读"

---

## 五、第三方嵌入方案

### 用户认证适配器模式

设计一个抽象认证层，支持多种集成方式：

```typescript
// src/lib/auth/adapter.ts

interface AuthAdapter {
  /** 从请求中提取用户身份 */
  extractUser(req: NextRequest): Promise<UserIdentity | null>
}

interface UserIdentity {
  externalId: string      // 第三方系统的用户 ID
  nickname?: string
  avatar?: string
  metadata?: Record<string, any>
}
```

#### 适配器 A：URL Token（默认优先实现）

```typescript
class UrlTokenAdapter implements AuthAdapter {
  async extractUser(req: NextRequest) {
    // GET /?token=eyJ... 或 Authorization header
    const token = req.nextUrl.searchParams.get("token")
      || req.headers.get("x-tarot-auth")
    if (!token) return null
    return decodeToken(token)
  }
}
```

父应用集成方式：
```html
<iframe src="https://tarot.c2.pub?token={JWT_TOKEN}" />
```

#### 适配器 B：HTTP Header 转发（供反向代理场景）

```typescript
class HeaderForwardAdapter implements AuthAdapter {
  async extractUser(req: NextRequest) {
    const userId = req.headers.get("x-user-id")
    const nickname = req.headers.get("x-user-nickname")
    if (!userId) return null
    return { externalId: userId, nickname: nickname || undefined }
  }
}
```

#### 适配器 C：API 回调验证（供 session 场景）

```typescript
class CallbackAdapter implements AuthAdapter {
  async extractUser(req: NextRequest) {
    const sessionId = req.headers.get("x-session-id")
    // POST 回父应用验证 session
    const resp = await fetch(`${VERIFY_URL}`, {
      headers: { Authorization: `Bearer ${sessionId}` }
    })
    if (!resp.ok) return null
    return resp.json()
  }
}
```

### 数据双向同步

**父应用 → TarotMind：**
- 用户身份 + 昵称 + 头像
- 用户当前情绪/状态（可选，用于个性化首屏问候）

**TarotMind → 父应用：**
- 暴露 API: `GET /api/external/reading/{userId}/latest` 返回最近一次占卜摘要
- Webhook 回调：占卜完成后 POST 到父应用配置的回调 URL
- 父应用可在 iframe 中通过 `postMessage` 接收事件：
  ```javascript
  window.parent.postMessage({
    source: 'tarotmind',
    event: 'reading_completed',
    data: { readingId, summary, affirmation }
  }, '*')
  ```

---

## 六、技术实施方案

### 第一阶段：核心 AI 占卜流（2-3 天）

1. **新增 API 路由** `/api/reading/ai/route.ts`
   - 接受用户问题 + 牌阵选择
   - 调用 DeepSeek API 分步生成解读
   - 服务端保存调用历史（方便后续排查）
   - 实现降级到规则引擎的 fallback

2. **重设计首页** `/app/page.tsx`
   - 仪式感首屏：时间感知问候 + 星空粒子背景
   - 输入框 + 情绪标签
   - 今日能量摘要（规则引擎驱动，不需要 AI）

3. **构建占卜流程页** `/app/reading/page.tsx`
   - 7 步流程状态机
   - 每步有独立的 loading / error / edge-case 处理
   - 流式输出 AI 解读文本

4. **简化 AppShell 导航**
   - 从 9 项缩减到 4 项
   - 桌面侧边栏 + 移动端底部导航同步更新

5. **Auth 适配器层**
   - 实现 URL Token 适配器（默认）
   - 预留 Header Forward 和 Callback 接口

### 第二阶段：体验打磨 + 功能补全（1 天）

6. 历史记录页改造：时间线样式展示过往占卜
7. 牌库浏览页（可选功能，从占卜结果中延伸）
8. 动画增强：抽牌翻转动画、粒子效果
9. 移动端全流程测试 + safe-area 适配
10. Vercel 部署环境变量配置（DEEPSEEK_API_KEY 等）

### 环境变量

```bash
# .env 或 Vercel Environment Variables
DATABASE_URL=mysql://...       # 需要远程 MySQL
DEEPSEEK_API_KEY=sk-...        # DeepSeek API Key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
JWT_SECRET=...                 # 用于自签 token
PARENT_APP_VERIFY_URL=...      # 第三方验证回调地址（可选）
```

---

## 七、数据库变更

### 更新 Reading 表

```prisma
model ReadingRecord {
  id            String   @id @default(cuid())
  userId        String
  question      String   @db.Text
  refinedQuestion String? @db.Text   // AI 优化后的问题
  spreadType    String
  cards         Json
  interpretation Json?               // 多牌综合解读（AI 生成）
  perCardReadings Json?              // 每张牌的个性化解读
  crystalName   String?
  crystalReason String?  @db.Text   // AI 生成的水晶推荐理由
  affirmation   String?             // AI 生成的肯定语
  moodTag       String?             // 用户情绪标签
  aiModel       String?             // 记录用的模型（deepseek-chat）
  aiFallback    Boolean  @default(false)  // 是否降级到规则引擎
  createdAt     DateTime @default(now())
  user          User     @relation(fields: [userId], references: [id])
}
```

---

## 八、风险与注意事项

| 风险 | 应对 |
|------|------|
| DeepSeek API 延迟（3-8秒） | 流式输出让用户逐字看到内容，体验不卡顿 |
| AI 偶尔偏离塔罗语境 | System prompt 强约束 + 输出 JSON schema 校验 |
| API 调用成本（多步调用） | DeepSeek 极便宜，单次完整占卜约 ¥0.01-0.03 |
| 第三方认证方式不确定 | 适配器模式让切换成本降到新增一个 class |
| 线上 MySQL 不可用 | 优先使用 Vercel Postgres / PlanetScale，或先全部降级到本地状态 |

---

## 九、与现状的对照

| 维度 | 现状 | 目标 |
|------|------|------|
| 首页 | 6 个功能入口组成的工具箱 | 仪式感入口 + 一个核心行动按钮 |
| 占卜 | 点进三牌阵 → 瞬间出结果 | 7 步引导式流程，每步有节奏 |
| AI 参与 | 无，纯规则引擎 | 全 AI 驱动，规则引擎仅做 fallback |
| 导航 | 9 项导航（桌面侧栏 + 移动底部） | 4 项核心导航 |
| 用户 | 半废弃的 JWT 认证 | 第三方适配器模式 |
| 解读文本 | 通用模板，每张牌固定文案 | AI 个性化生成，关联用户具体问题 |
| 水晶推荐 | 简单规则映射 | AI 根据解读能量推荐 + 理由 |

---

> **下一步**：确认方案后，立即开始第一阶段实施。优先打通 DeepSeek → 首页 → 占卜流程。
