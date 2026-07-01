# OraSage 代码框架评审报告

**评审日期**：2026-06-26  
**评审范围**：整体架构、模块交互、数据流、安全性、可维护性  
**评审标准**：严格（生产级标准）  
**代码规模**：服务器端 760 行 routers.ts，前端 2443 行 BaziResult.tsx，核心算法 1847 行 bazi.ts  

---

## 一、总体评价

项目定位清晰——客户端完成八字计算、服务端负责 AI 报告生成与付费分发。模块职责大体合理，但在**边界划分**、**错误处理一致性**、**生产环境路径对齐**三方面存在较严重问题。以下按严重程度递减排列。

---

## 二、关键问题（🔴 必须修复）

### 2.1 `server/index.ts` 是死代码

`dev`/`build`/`start` 三个脚本入口均为 `server/_core/index.ts`，不存在任何引用 `server/index.ts` 的路径。该文件仅包含 Express 静态文件服务，无 tRPC 注册、无 OAuth、无任何 API 路由。作为生产入口启动将是一个完全不可用的空壳。

**建议**：删除或改为显式标记 `// DEPRECATED`，避免后续维护者误用。

### 2.2 `Home.tsx` 中 `isAuthenticated` 硬编码为 `false`

```typescript
// client/src/pages/Home.tsx:533
const isAuthenticated = false;
```

`useAuth()` hook 已正确实现认证状态检测（`client/src/_core/hooks/useAuth.ts:53`），但主页面完全绕过它，导致：

- 付费后 `saveRecord` 永不触发（line 626 的条件分支永不进入）
- 用户登录状态对核心业务流程不可见
- `HistoryPage.tsx` 正确使用了 `useAuth()`，但 `Home.tsx` 却硬编码为 false——同一项目内行为不统一

**建议**：替换为 `const { isAuthenticated } = useAuth();`

### 2.3 报告静态 HTML 写入与读取路径不一致（⚠️ 已知问题，再次确认）

```
写入路径 (routers.ts:619):
  path.resolve(import.meta.dirname, '_core', 'public', 'reports')
  → 生产环境: dist/_core/public/reports/

读取路径 (vite.ts:63-65):
  path.join(distPath, "reports")   // distPath = dist/public
  → 生产环境: dist/public/reports/
```

两路径不重合。除非 `_core/public/reports` 恰好存在符号链接指向 `dist/public/reports`，否则所有报告都将 404。

**建议**：在 `routers.ts` 中改为与 `serveStatic` 相同的逻辑——统一路径计算函数，从环境变量或共享常量读取 `distPath`。

### 2.4 无 CSRF 保护、无频率限制

搜索全部代码，无任何 CSRF token、频率限制（rate limiting）相关逻辑。结合 cookie `sameSite: "none"` 配置，这意味着：

- 跨站请求可携带认证 cookie 发起写操作（支付、报告推送）
- `buyPlan` 接口可被暴力调用消耗 LLM 配额和 WordPress 资源
- `analyze` / `freeInsight` 可被滥用以消耗 DeepSeek API 费用

**建议**：至少为写操作接口加上 CSRF token；为 LLM 调用接口加频率限制（按 IP 或 session），防刷。

---

## 三、架构设计问题（🟡 应尽快改进）

### 3.1 `server/routers.ts` 成为 God File（760 行）

该文件承担了 5 种不应在此的职责：

| 职责 | 当前位置 | 建议位置 |
|------|----------|----------|
| LLM Prompt 构建（~300 行多语言模板） | routers.ts | `server/prompts.ts` |
| 静态 HTML 报告生成（Markdown→HTML，CSS 样式） | routers.ts | `server/reportRenderer.ts` |
| WooCommerce API 调用 | routers.ts | `server/woocommerce.ts` |
| WordPress REST API 推送 | routers.ts | `server/wordpress.ts` |
| 价格映射常量 | routers.ts 内联 | `shared/const.ts` 或配置 |

**建议**：拆分为独立模块，router 仅做参数校验 + 编排调用。

### 3.2 `BaziResult.tsx` 过大（2443 行）

该文件混合了：
- 单人/双人结果视图
- 支付升级面板
- AI 报告展示与折叠
- 八字图表 SVG 渲染
- 图片导出（html2canvas）
- 多种模态弹窗

**建议**：按视图职责拆分：
```
components/
  BaziResult/
    SingleBaziView.tsx
    DoubleBaziView.tsx
    BaziChart.tsx          ← 八字柱表格 SVG
    AIReportPanel.tsx      ← 报告折叠展示
    PaymentUpgradeBanner.tsx
    SaveImageButton.tsx
    index.tsx               ← 根组件，组合上述
```

### 3.3 设计常量在 Home.tsx 和 BaziResult.tsx 中重复定义

```typescript
// Home.tsx:51-59
const GOLD       = "#D9A441";
const HEADING    = "#2E295B";
const BG_PAGE    = "#F7F4FA";
const BG_CARD    = "#FFFFFF";

// BaziResult.tsx 中也有相同定义（通过 grep 确认存在）
```

虽然 `index.css` 中有 CSS 变量 `--gold` 等，但内联 style 对象直接使用 JS 常量。两文件各自定义了相同常量。

**建议**：提取到 `client/src/const.ts` 或 `client/src/theme.ts`，统一引用。

### 3.4 认证错误检查依赖字符串匹配

```typescript
// client/src/main.tsx:17
const isUnauthorized = error.message === UNAUTHED_ERR_MSG;
// UNAUTHED_ERR_MSG = 'Please login (10001)'
```

tRPC 错误码 `UNAUTHORIZED` 已被框架设置，但认证重定向逻辑绕过它，直接匹配 message 字符串。如果：

- 错误信息被 i18n 化
- tRPC 版本升级改变 message 格式
- 任何中间件包装了错误 message

重定向将静默失效。

**建议**：检查 `error.data?.code === "UNAUTHORIZED"` 而非匹配 message 文本。

### 3.5 `useAuth()` 向 localStorage 写数据是一个副作用

```typescript
// client/src/_core/hooks/useAuth.ts:45-48
const state = useMemo(() => {
  localStorage.setItem("manus-runtime-user-info", JSON.stringify(meQuery.data));
  return { ... };
}, [...]);
```

`useMemo` 本应用于缓存计算结果，不应有副作用。React 文档明确警告 `useMemo` 中的副作用可能在未来的并发渲染中被多次调用或完全跳过。

**建议**：将 `localStorage.setItem` 移到 `useEffect` 中。

---

## 四、数据流与模块交互问题（🟡）

### 4.1 `cityData.ts` 的隐式依赖注入

```typescript
// client/src/lib/cityData.ts
let _trpcClient: ReturnType<typeof createTRPCReact> | null = null;

export function setCityLookupTrpc(client: typeof _trpcClient) {
  _trpcClient = client;
}
```

模块级可变状态 + 无类型安全的注入方式。如果 `Home.tsx` 未能调用 `setCityLookupTrpc`（例如在 iframe 嵌入场景），AI 城市查询将静默跳过。没有编译时保证。

**建议**：改为 React Context 注入，或让调用方直接传入 tRPC client 作为函数参数。

### 4.2 LLM 用作城市查询引擎

```typescript
// server/routers.ts:362
bazi.lookupCity: publicProcedure
  .mutation(async ({ input }) => {
    const prompt = `用户输入了一个城市名称"${input.query}"，请识别...`;
    const response = await invokeLLM({ messages: [...] });
  });
```

每次城市查询调用一次 LLM（DeepSeek API），成本高、延迟大、结果不确定。本地已有 592 个城市数据，AI 应仅作兜底。

**建议**：本地城市匹配之后再加一层简单的地理 API（如 OpenStreetMap Nominatim）作为备用，LLM 仅在前两者都失败时才调用。

### 4.3 `build` 脚本一次性编译前端+后端

```json
"build": "vite build && esbuild server/_core/index.ts ..."
```

两阶段构建通过 `&&` 串联，如果 vite build 成功但 esbuild 失败，`dist/` 中残留不完整的前端产物和旧的后端产物，下次部署可能导致版本混乱。没有原子性保证。

**建议**：在构建脚本中先清空 `dist/` 再构建，或使用构建工具链（如 turborepo）管理阶段依赖。

### 4.4 `PLAN_OPTIONS` 和 `COUPLE_PLAN_OPTIONS` 双向引用

```typescript
// shared/types.ts
export const PLAN_OPTIONS: PlanOption[] = [...];      // 单人参
export const COUPLE_PLAN_OPTIONS: PlanOption[] = [...]; // 双人参
```

两套定价方案在前后端共享同一份硬编码数据。修改价格或产品 ID 需要改代码、打包、部署——没有 CMS 或配置中心。

**建议**：短期至少将价格/产品 ID 映射放到环境变量；长期通过 WordPress REST API 动态拉取 WooCommerce 产品信息。

### 4.5 `Streamdown` 组件存在但后端不支持流式

```typescript
// BaziResult.tsx:7
import { Streamdown } from "streamdown";
// ...
<Streamdown>{para}</Streamdown>
```

`bazi.analyze` 返回完整 LLM 响应（`await invokeLLM(...)`），不走 SSE 或 chunked transfer。`Streamdown` 实际上只是渲染 Markdown，不会产生逐字输出的效果。这是死依赖——增加了 bundle 体积但无实际价值。

**建议**：要么实现真正的 streaming（需要改 LLM 调用和 tRPC subscription/webSocket），要么用简单的 Markdown 渲染组件替换。

---

## 五、数据库设计问题（🟡）

### 5.1 `price` 字段类型为 varchar

```typescript
// drizzle/schema.ts
price: varchar("price", { length: 32 }),
```

存储金额却用字符串类型。无法做数值排序、范围查询、聚合统计。

**建议**：改为 `decimal("price", { precision: 10, scale: 2 })` 或 `int`（以分为单位）。

### 5.2 无外键约束

所有表间关系（`userId`、`baziRecordId`、`purchaseId`）仅在应用层维护，数据库层无任何外键定义。`drizzle/relations.ts` 文件除了 `import {} from "./schema";` 外为空。

**建议**：至少在 Drizzle schema 中定义 `references` 约束。

### 5.3 `baziReports.sections` 冗余列

`sections`（JSON）和 `reportContent`（text）存储同一份数据的两种表示。`sections` 可由 `parseSections(reportContent)` 随时生成。冗余数据需要额外维护——写入时同步、更新时同步。

**建议**：移除 `sections` 列，需要时通过 `parseSections` 实时生成。或在写入时只存 sections，读取时反序列化组装。

---

## 六、安全性问题（🟡）

### 6.1 报告静态 HTML 无访问控制

静态报告文件（`report_xxx.html`）通过 `serveStatic` 以公开路径 `/reports/` 暴露。文件名虽含随机 ID，但只要 URL 泄露，任何人可访问。无过期机制、无 token 验证。

**建议**：至少加入短期签名 URL（如 S3 presigned URL 模式），或在 `/reports/` 路由中加入 JWT/token 验证。

### 6.2 WooCommerce API 密钥通过 Basic Auth 明文传输

```typescript
const auth = Buffer.from(ck + ":" + cs).toString("base64");
const res = await fetch(`${wpUrl}/wp-json/wc/v3/orders/${id}`, {
  headers: { authorization: "Basic " + auth },
});
```

虽然走 HTTPS，但密钥以明文存储在环境变量中，任何能访问 `process.env` 的代码（包括第三方依赖）都可读取。

**建议**：确保 WordPress 服务器与计算器服务器之间使用内网通信（不经过公网），或改用 HMAC 签名代替 Basic Auth。

### 6.3 JWT 密钥无轮换机制

`JWT_SECRET` 用于签发 session cookie（HS256），一年有效期。密钥泄露后无法主动吊销已签发的 token。

**建议**：缩短 token 有效期（如 7 天 + refresh token），密钥配置支持多版本以支持轮换。

---

## 七、代码质量与可维护性（🟢 改进建议）

### 7.1 调试日志过多且未分级

```typescript
console.log('[StaticReport] reportsDir:', reportsDir, 'exists:', ...);
console.log('[WordPress] Pushing report URL to:', apiUrl, 'email:', email, ...);
```

生产代码中应移除或使用结构化日志（如 winston/pino）配合日志级别控制。当前 `console.log` 会输出敏感信息（邮箱、文件路径）到服务器标准输出。

### 7.2 错误吞噬过于激进

```typescript
// server/_core/context.ts
try {
  const session = await sdk.authenticateRequest(opts.req);
  return { ..., user: session.user };
} catch {
  return { ..., user: null };  // 所有错误统一归零
}
```

DB 连接失败、OAuth 服务宕机、JWT 验证异常——全部静默变为"未登录"。运维人员无法从日志中区分故障类型。

**建议**：`catch` 中记录错误日志（至少 `console.error`），区分 `TRPCError`（正常认证失败）和意外错误（系统故障）。

### 7.3 Markdown→HTML 转换用正则链式替换

```typescript
const reportHtml = input.reportContent
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')...
  .replace(/^### (.+)$/gm, '<h3>$1</h3>')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')...
```

正则顺序敏感：先转义 HTML 再替换 Markdown 标记意味着 `**text**` 可能因 `&` 转换而断裂。`<ul>` 包装也依赖 LLM 是否输出连续的 `- item` 行。

**建议**：使用成熟的 Markdown 解析库（如 `marked` 或 `markdown-it`），配置 `{ breaks: true }` 处理换行。

### 7.4 无全局类型检查

```json
"check": "tsc --noEmit"
```

虽然配置了 `tsc --noEmit`，但未见 CI 中强制执行。建议在 `build` 脚本前增加 `pnpm check` 或通过 husky pre-commit hook 保障。

---

## 八、优先级矩阵

| 优先级 | 问题 | 影响 | 修复难度 |
|--------|------|------|----------|
| 🔴 P0 | 报告路径不一致 | 所有付费用户报告 404 | 低（一行代码） |
| 🔴 P0 | `isAuthenticated` 硬编码 false | 付费后记录不保存 | 低（替换为 useAuth） |
| 🔴 P0 | 无 CSRF / 无频率限制 | 可被滥用消耗 API 配额 | 中（需加中间件） |
| 🔴 P1 | `server/index.ts` 死代码 | 维护者可能误用 | 低（删除） |
| 🟡 P1 | routers.ts God File | 可维护性差 | 中（重构拆分） |
| 🟡 P1 | 设计常量重复 | 修改遗漏风险 | 低（提取共享文件） |
| 🟡 P1 | 认证错误字符串匹配 | 认证重定向可能失效 | 低（改 code 匹配） |
| 🟡 P2 | BaziResult.tsx 过大 | 组件难以维护 | 高（需全面重构） |
| 🟡 P2 | 价格 varchar → decimal | 数据统计不可用 | 中（需 migration） |
| 🟡 P2 | 报告无访问控制 | 报告泄露风险 | 中（需加 token 验证） |
| 🟢 P3 | 调试日志 | 生产环境信息泄露 | 低（加日志级别） |
| 🟢 P3 | cityData 隐式注入 | 类型安全缺失 | 低（改 Context 注入） |
| 🟢 P3 | Streamdown 死依赖 | 打包体积 | 低（替换组件） |

---

## 九、数据流总图（现状）

```
用户浏览器
  │
  ├─[postMessage]─→ WordPress 页面（支付 iframe、用户中心）
  │
  ├─[tRPC query/mutation]─→ server/_core/index.ts
  │                              │
  │     ┌────────────────────────┼─────────────────────────┐
  │     │                        │                         │
  │  [OAuth]                [tRPC Router]            [静态文件]
  │  /api/oauth/callback    /api/trpc/*             /reports/*.html
  │     │                        │                         │
  │     ▼                        ▼                         ▼
  │  Forge SDK               routers.ts              dist/public/reports/
  │  (用户注册/登录)         (760行 God File)         (路径可能错误↑)
  │                              │
  │          ┌───────────────────┼──────────────────┐
  │          │                   │                  │
  │     [invokeLLM]         [DB CRUD]        [WordPress REST]
  │     DeepSeek/Forge      Drizzle+MySQL    WC API + /save-report
  │          │                                      │
  │          ▼                                      ▼
  │     AI 报告生成                           WordPress user_meta
  │                                                orasage_reports
  │
  ▼
客户端计算
  bazi.ts (1847行) ← lunarData.ts (懒加载) + cityData.ts (本地+AI)
  ├─ 四柱计算
  ├─ 五行分析
  ├─ 神煞
  ├─ 大运
  └─ 四层过滤引擎
```

---

*评审人：Claude (Claude Opus 4) · 全部代码已审计 · 以上结论均基于 2026-06-26 master 分支实际代码*
