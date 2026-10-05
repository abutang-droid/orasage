# 八字排盘与报告：产品规则

> 依据当前代码（`bazi/`、`shop/`、`auth-service/`、`main/`）梳理。这是**产品该怎么走**，不是部署手册。
> 日期：2026-10-05。入口域名：`https://bazi.orasage.com`。

---

## 0. 五条硬规则（所有排盘必须遵守）

1. **两种起盘模式，同一套排盘算法。** 经典模式（`/` 罗盘）和计算器模式（`/classic` 表单）都调用 `calcSingleBazi`（合盘再包一层 `calcDoubleBazi`，内部仍是同一函数）。UI 不同，四柱结果必须相同。
2. **排盘后用户看到的第一步正文，由网络 AI 接口生成。** 走 `generateBaziReportContent(..., 'brief')`。禁止把本地模板 `composeFreeReport` 当作用户看到的简版叙述。本地模板只给单测、以及报告页上的命盘说明（日主行、网格 caption）。
3. **先看简版，付费解锁详版。** 简版标题「你的结构速览」+ 解锁 CTA；详版标题「你的命局解读」。同一条 URL、同一个文件。
4. **只要排过，数据库立刻同步一条记录，并落成静态 HTML。** 身份 = 用户输入指纹 + 账号（已登录）或设备号（游客）+ 请求里记下的设备地址（IP）。相同条件再打开，就是这份文件，不再调模型。
5. **付费、语言、分享沿用下文其余章节**（SKU、回跳、locale、分享卡）。本条不改那些契约。

合盘也走这五条，不再作为例外。

---

## 1. 一句话

用户排一次盘，得到**一份永远对应这次排盘的 HTML 报告**。第一步是 **AI 简版**；付钱之后，**同一条链接**变成 **AI 详版**。不要再生成第二套报告，也不要把付费按钮送回路盘首页。

---

## 2. 正确用户流程

```
门户中文站（orasage.com/zh-CN? 带 lang）
    → 八字（?lang=zh-CN）
    → 选经典模式 / 或计算器模式
    → 前端 calcSingleBazi 起盘（算法相同）
    → 服务端网络 AI 生成简版 → 写静态 HTML + upsert user_readings
    → 整页打开「你的结构速览」
    → 点「付费解锁详细解读」
    → shop 结账（数字报告 SKU report-bazi-basic）
    → 支付成功
    → 同一份 HTML 覆盖成「你的命局解读」
    → 相同账号（或设备）+ 同一输入再打开，仍是这一份
```

---

## 3. 两层内容：免费简版 vs 付费详版

同一套杂志长图模板（四柱命盘、五行环/雷达、品牌锁）。差别只在**正文从哪来、写进去多少、有没有付费墙**。

| | 免费（`data-report-tier="free"`） | 付费（`data-report-tier="paid"`） |
|---|---|---|
| 标题 | 你的结构速览 | 你的命局解读 |
| 正文从哪来 | 网络 AI 简版 prompt（约 2 章 + 方向提示） | 网络 AI 七章 `generateBaziReportContent(..., 'full')` |
| 页面上留哪些叙述 | 简版章节 + 命盘 + 五行 + 方向提示 | 七章全文 + 命盘 + 五行 + 周运时间轴 |
| 底部 | 「付费解锁详细解读」→ 商城结账 | 无付费墙；basic 档可带水晶推荐块 |
| 能否被覆盖 | 付费成功后**同一文件**覆盖为 paid | 之后免费流程**不得降级覆盖** |

`composeFreeReport` **不是**用户第一步结果。它只用于：

- 单测里没注入 `reportContent` 时的占位 markdown
- 报告页图表旁的 `dayMasterLine` / `gridCaption`（结构说明，不是解读正文）

写作硬规则两端共用：禁止医疗/财务/法律建议；身弱只写「偏耗」；术语放句尾。

---

## 4. 一份报告 = 一个稳定 readingId = 一个文件

| 约定 | 值 |
|---|---|
| ID | `bazi_u{userId}_{fingerprint}`（已登录）或 `bazi_d{deviceId}_{fingerprint}`（游客） |
| 指纹 | 姓名、性别、出生时间、历法、出生地、四柱 |
| 文件 | `REPORTS_DIR/reading_<safeId>.html` |
| 公网 | `https://bazi.orasage.com/reports/reading_….html` |
| 生产目录 | `/var/lib/orasage/bazi-reports`（**不在** `dist/` 里，避免部署冲掉） |
| 权限 | URL 本身不登录也可打开（分享链接） |
| 绑定 | `user_readings`：`userId`、输入 `payloadJson`、`deviceId`、`clientIp` |

**禁止**再写 `report_*.html` / `chart_*.html`。详情页、iframe、用户中心、分享、支付回跳，全部指向这一份。

**禁止**每次打开都重新调模型。文件已在（free 或 paid）→ 原样返回。

支付回跳如果带了**已经落盘**的 `readingId`，沿用那条（订单绑的是它），不要改成新指纹 ID。

再进入同一身份：

- 已是 **paid** → 原样打开。
- 已是合格 **free** 简版 → 不重新生成。
- 旧 free 却长得像详版（标题「你的命局解读」或带周运）→ 允许重写成简版。
- 打开时若 CTA 仍指向罗盘首页 → 服务端改写成 shop 结账，不改 paid 页。

---

## 5. 两条起盘入口（算法相同）

首页 `/` 是**经典模式**（罗盘拨盘）；`/classic` 是**计算器模式**（表单）。`/luopan`、`/scene` 都重定向到 `/`。切换条文案：经典模式 / 计算器模式。

两种模式都：

1. `calcSingleBazi`（合盘：两人各算一次再合成）
2. `bazi.materializeReport`（AI 简版 + 静态 HTML + readings）
3. `window.location.replace` 打开 `/reports/reading_….html`

物化失败时留在当前页报错，**不要**用本地模板冒充第一步结果。

支付回跳落在 `/classic?paid=1&restore=1&lang=&readingId=`：

- 该 `readingId` 的文件已是 paid → 直接打开。
- 文件还是 free、但本地有排盘快照 → SPA 走通道 B 写详版（见 §7）。
- 都没有 → 提示重新排盘。**不允许**把用户丢回 `/`。

---

## 6. 付费商品：简版解锁 vs 手串套餐

### 6.1 静态报告页上的按钮（产品主 CTA）

只卖**数字详版**，不绑发货：

- SKU：`report-bazi-basic`（八字深度解读）
- 结账：`shop.orasage.com/checkout?sku=report-bazi-basic&return=…&appSource=bazi&planType=basic&readingId=…`
- `return` 必须是 `/classic?paid=1&restore=1&lang=…&readingId=…`
- **禁止** `href="https://bazi.orasage.com/"`（那是回罗盘，流程错误）
- 不需要收货地址（`report-bazi-basic` 不含 `-advanced`/`-premium`）

### 6.2 商城里还有的套餐（SPA 付费墙仍会露出）

| SKU | 名称 | 含义 |
|---|---|---|
| `report-bazi-basic` | 八字深度解读 | 只要 HTML 全文 |
| `report-bazi-advanced` | 报告 + 水晶手串 | 全文 + 实体，要地址/腕围 |
| `report-bazi-premium` | 终极水晶礼盒 | 全文 + 礼盒发货 |
| `report-bazi-couple-*` | 合盘三档 | 同上，双人 |

静态长图的解锁**不要**误用 advanced（手串）。用户从报告页付钱，买的是「看详细解读」。

支付成功后，不论 basic / advanced / premium，**报告层做的是同一件事**：把该 `readingId` 的 HTML 写成 paid。手串只走商城履约，不另生成一套报告。

---

## 7. 付钱之后全文怎么写进去

两条通道，写的是**同一文件**。

### 通道 A（主）：商城支付完成 → 后台任务

`mock` 或 Stripe webhook 把订单标 paid 后，shop 调八字内网：

`POST http://127.0.0.1:3110/internal/report-job`

带上 `orderNo`、`userId`、`readingId`、由 SKU 推出的 `planType`。

任务侧：

1. 从 auth 取出这次排盘的 `payloadJson`（排盘数据）。
2. 若文件已是 paid → 直接当成功（幂等）。
3. 否则 LLM 生成七章（`kind: 'full'`）→ `writePaidReadingReport` 覆盖 HTML。
4. 回写 `user_readings.report_url`，订单标 completed。

### 通道 B（回跳兜底）：浏览器还在 `/classic`

用户带着排盘快照回到经典页且 `paid=1`、文件尚未 paid 时，SPA 再调 `bazi.analyze`（同样七章 LLM），再 `bazi.buyPlan` 把正文写进同一文件。

通道 A 先完成时，用户打开的已经是详版，不必等 B。

---

## 8. 合盘

合盘同样：AI 简版 → 静态 HTML → 付费覆盖详版。身份指纹把两人输入拼在一起。杂志页上的命盘图取 `person1` 做主盘展示。

付费墙 SKU 仍是 `report-bazi-couple-*`。不要用合盘 SPA 分数页去替代静态简版。

---

## 9. 语言

中文是默认。门户 `localeCookie` 关闭；跨子域 referrer 只有 `https://orasage.com/`，看不到 `/zh-CN`。

因此：

- 中文门户进八字必须带 `?lang=zh-CN`（导航已如此）。
- 八字检测顺序：`?lang=` / `?locale=` → 门户 referrer 路径 → **默认 zh-CN**。
- **不要**用浏览器 `Accept-Language` 或残留的 `NEXT_LOCALE` / `orasage_shop_locale` 把人切到英文。
- 英文门户应带 `?lang=en`。

报告 HTML 的 `lang` 跟这次排盘的 locale；付费回跳 URL 里也带同一 `lang`。身份指纹**不含**语言：相同人再打开仍是当初那份（不因切语言重生成）。

---

## 10. 报告会出现在哪

| 表面 | 行为 |
|---|---|
| `bazi.orasage.com/reports/reading_*.html` | 唯一展示页（Express 读文件；缺失 404，不回 SPA） |
| 经典模式「上次报告」 | 打开浏览器记下的路径 |
| `orasage.com/{locale}/profile/readings` | 登录后列表，链到 `reportUrl` |
| 八字 `/history` | 本机保存的排盘记录，有则链到报告 |
| `admin.orasage.com` 测试报告 | `user_readings`，含 `report_url` |
| 分享 | 报告页内分享卡 / 复制链接，还是这一份 URL |

游客排盘：`userId=0` 也会 upsert 一条 readings（给后台看见测试报告），并绑 `deviceId` + `clientIp`。登录后用同一 `readingId` 认领并补上 `reportUrl`。之后再排同一输入，ID 改为账号键 `bazi_u{userId}_{fp}`（条件变了：有账号）。

---

## 11. 数据落在哪（关联穿透）

```
浏览器排盘（经典模式或计算器模式，同一 calcSingleBazi）
  ├─ localStorage：orasage:device-id、报告路径
  ├─ POST auth /auth/me/readings/sync     → orasage_auth.user_readings
  └─ tRPC bazi.materializeReport
        ├─ 已有 HTML → 跳过 LLM
        ├─ 否则 generateBaziReportContent(..., 'brief')
        ├─ 写 REPORTS_DIR/reading_*.html
        └─ POST auth /internal/readings   → 同上表
              payloadJson: 盘面、deviceId、clientIp、inputFingerprint

shop 结账
  └─ orasage_auth.user_orders（sku、readingId、status）
        └─ 支付成功 → bazi /internal/report-job → 覆盖同一 HTML（full）
```

八字自己的 Postgres（`orasage_bazi`）还记 `purchases`，与商城订单是两套账；**报告文件**才是用户看见的产品。

受影响表面：罗盘、计算器、合盘、`/reports`、shop return、用户中心、admin 测试报告、分享卡。改其中一处必须穿透其余。

---

## 12. 产品上明确禁止的事

1. 排盘结束后直接给**详版全文**，却还挂着付费按钮。
2. 付费按钮跳回 `https://bazi.orasage.com/` 或罗盘，让人重新拨盘。
3. 简版解锁去买 `report-bazi-advanced`（手串发货）。
4. 每次打开都重新生成 HTML（付费页会被免费稿盖掉，或闪「正在生成」）。
5. 详情页、分享、用户中心各拿一份不同的 `report_*` / `chart_*`。
6. 把报告写进 `bazi/dist/public/reports`（下次 overlay dist 会丢）。
7. 从中文门户进八字却落到英文界面。
8. 用本地 `composeFreeReport` 充当用户看到的第一步解读。
9. 经典模式和计算器模式用两套不同的排盘算法。

---

## 13. 和「全站」其它块的边界

- **导航 / 页脚 / 品牌**：跟全站 app-shell，不在报告正文里再做一套顶栏主导航。
- **商城**：只负责下单、收款、手串履约；数字报告的「解锁」由八字写 HTML。
- **紫微 / 塔罗**：各自的 `report-*` SKU 和 report-job，**不是**八字这份 `reading_*.html`。
- **罗盘刻度**：与报告无关；改罗盘或 overlay `bazi/dist` 前必须过手机刻度测试（见 `docs/AGENT-RULES.md`）。

---

## 14. 关键代码入口（给改代码的人）

| 职责 | 位置 |
|---|---|
| 排盘算法（两模式共用） | `bazi/client/src/lib/bazi.ts` → `calcSingleBazi` |
| 稳定 readingId / 输入指纹 | `bazi/shared/chart-identity.ts` |
| 设备号 | `bazi/client/src/lib/device-id.ts`（`orasage:device-id`） |
| 简版 / 详版 prompt | `bazi/server/prompts.ts` → `buildBriefBaziPrompt` / `buildSingleBaziPrompt` |
| LLM | `bazi/server/reportGenerator.ts`（`kind: 'brief' \| 'full'`） |
| 写 HTML / 免费·付费分层 / 结账 URL | `bazi/server/readingReport.ts`、`reportHtml.ts`、`staticFreeReport.ts` |
| 物化 API | `bazi/server/routers.ts` → `materializeReport` |
| 支付后覆盖 | `bazi/server/reportJob.ts`；shop `shop/src/lib/reportJob.ts` |
| 经典模式起盘 | `bazi/client/src/pages/LuopanPage.tsx` |
| 计算器模式 / 支付回跳 | `bazi/client/src/pages/Home.tsx` |
| 打开/探测固定页 | `bazi/client/src/lib/static-report.ts` |
| 模式切换文案 | `BaziEntryChrome`：经典模式 / 计算器模式 |
| 静态页解锁 SKU | `BAZI_UNLOCK_SKU = report-bazi-basic` |
| 语言 | `packages/i18n/src/detect.ts`；门户 `withAppLocale` |

改免费/付费分层、身份键或 CTA 时：必须同时看罗盘、计算器、合盘、回跳、serve `/reports`、shop return URL、用户中心链接。停在其中一个页面上改，线上就会再出现「没改」。
