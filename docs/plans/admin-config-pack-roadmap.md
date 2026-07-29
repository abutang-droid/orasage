# Admin Config Pack — 分级分步改造大纲

> 规范正文：[`docs/products/admin-config-pack.md`](../products/admin-config-pack.md)  
> **纪律**：每完成一个 Phase（或 Phase 内标出的 Step），先做该节「全量测试门禁」，通过后再开始下一 Step/Phase。  
> **日志**：每步交付后执行 `scripts/admin-changelog-append.mjs` 追加后台更新日志。

---

## Phase 0 — 规范落地与更新日志（本迭代）

| Step | 内容 | 主要路径 |
|------|------|----------|
| 0.1 | 产品规范 + Agent 规则挂钩 | `docs/products/admin-config-pack.md`, `docs/AGENT-RULES.md`, `AGENTS.md` |
| 0.2 | 本路线图 | `docs/plans/admin-config-pack-roadmap.md` |
| 0.3 | Changelog 数据源 + 追加脚本 + `/changelog` 页 + 侧栏入口 | `shared/admin-backend/changelog.json`, `scripts/admin-changelog-append.mjs`, `admin/src/app/changelog` |

**测试门禁 P0**

- [x] 文档链接可互相跳转；AGENT-RULES 含 Admin 专节
- [x] `node scripts/admin-changelog-append.mjs --dry-run …` 正常
- [x] `admin`：`npm run build` 通过（含 `/changelog` 路由）
- [x] 首条 changelog 已写入且含 `rulesImpact`（上线后登录侧栏可见「更新日志」）

---

## Phase A — 信息架构与路由别名（单租户 `orasage`）

| Step | 内容 |
|------|------|
| A.1 | 侧栏按规范重组分组（平台/商城/计费/内容/合规/应用/客服/数据/资金） |
| A.2 | 新路径落地 + **旧 URL redirect**（见规范对照表） |
| A.3 | `/shop/storefront` 合并 crystal-home + home_layout 入口 |
| A.4 | `/integrations` 只读 L3 状态页（复用 notifications/status 等） |
| A.5 | `/partners` 超管占位页（列表可先写死 orasage） |
| A.6 | `/apps/{bazi,ziwei,tarot}` 深链概览壳 |
| A.7 | 主 IA 对非超管隐藏 Payload 链；超管折叠「内部 CMS」 |

**测试门禁 PA**

- [x] 全部旧书签路径 redirect 到新路径（products/messages/im/crystal-home…）
- [x] 侧栏按平台/商城/计费/内容/合规/应用/客服/数据/资金重组；超管折叠「内部 CMS」
- [x] finance/wallets 仅 admin（nav roles）
- [x] App 深链 `/content/*?app=`、`/billing?app=` 
- [x] `admin` `npm run build` 通过（含新路由）
- [x] 追加 changelog（导航 IA / Payload 折叠等规则影响）

---

## Phase B — 权限模型对齐

| Step | 内容 |
|------|------|
| B.1 | `shared/staff-permissions` 引入目标权限名（可并行保留旧名映射） |
| B.2 | 页面 gate 与 API `staffCan` 统一走新权限（修 analytics/im 无门闩问题） |
| B.3 | 子账号 UI 按新枚举授出；finance 永不出现在合作方模板 |
| B.4 | CMS 子权限与 content.* 映射表（内部仍可调 Payload） |

**测试门禁 PB**

- [x] `npx tsx scripts/test-staff-permissions.mjs` 矩阵通过（含旧名别名）
- [x] auth-service / admin `npm run build` 通过
- [x] analytics / im / integrations / storefront API 与页面门闩对齐新权限
- [x] 子账号 extras 扩大且 sanitize；finance 永不授出；meta 含 partnerAssignable
- [x] changelog + `rulesImpact`（权限枚举变更）

---

## Phase C — Content 自研控制面（仍可写 CMS DB）

| Step | 内容 |
|------|------|
| C.1 | `/content/*` 自研列表/编辑（heroes、pages、product content…） |
| C.2 | 商品编辑拆「交易 / 内容」入口
| C.3 | UGC vs 精选评价双入口文案与权限拆清 |
| C.4 | 合作方角色验证无法访问 `/cms/admin` |

**测试门禁 PC**

- [x] 自研页读写与前台展示一致（main/shop/apps Hero 抽检）
- [x] 合作方账号无 Payload 入口（Payload `Users.access.admin` 仅 `staffRole===admin`；侧栏「内部 CMS」仅超管）
- [x] changelog

---

## Phase D — `partnerId` 数据与隔离

| Step | 内容 |
|------|------|
| D.1 | `partners` / `partner_modules` / staff↔partner 绑定 |
| D.2 | 配置表与关键查询补 `partner_id`，默认回填 `orasage` |
| D.3 | Admin API 强制租户作用域 |
| D.4 | 集成状态按 partner 过滤展示 |

**测试门禁 PD**

- [ ] 双账号不同 partner（可用第二测试 partner）数据互不可见
- [ ] 平台超管可查看 orasage
- [ ] 迁移脚本可重复执行；构建与核心下单/登录回归
- [ ] changelog + 规则说明（多租户不变量）

---

## Phase E — Module API 与交付

| Step | 内容 |
|------|------|
| E.1 | `/v1/partners/{id}/…` 或 `/v1/{module}` 契约冻结文档 |
| E.2 | API Key + 模块 scope |
| E.3 | 交付模板（只开 tarot / 只开 shop） |
| E.4 | 审计日志（配置变更） |

**测试门禁 PE**

- [ ] 契约测试 + 越权否定用例
- [ ] 文档与 changelog；规则若新增 API 纪律则写 `rulesImpact`

---

## 全局规则变更纪律（全程）

任一 Phase 若修改了：

- `docs/AGENT-RULES.md`
- `docs/products/admin-config-pack.md` 中的不变量/模块边界
- 权限枚举或租户隔离规则

则该次更新的 changelog 条目**必须**填写 `rulesImpact`，并在 PR 描述中复述「增加 / 修改 / 删除了哪些全局规则」。

---

## 建议排期依赖（非日历）

```text
P0（规范+日志） → A（IA） → B（权限） → C（content 控制面）
                      ↘ D（partnerId）可与 C 部分并行，但 API 强制作用域建议在 C 对外前完成
E 依赖 B+D
```
