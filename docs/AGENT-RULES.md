# Agent 工作规则

## 最高宪法（改动前必读）

**任何代码改动，都必须先审核是否牵涉其它关联分支（模块 / 应用 / 共享层 / 部署链路 / Git 分支）。**

1. **牵涉则必须穿透到最末端**
   - 沿调用链、依赖链、配置链、数据流一路追到叶子节点（最终消费者、入口页面、API、部署脚本、环境变量等），不得停在直接改动点。
   - 典型关联：`shared/` → 各 App 副本；`cms` → 各站 Hero/内容 API；`auth-service` → shop/admin/命理 App 登录桥接；`deploy/` → 线上 systemd/nginx。

2. **评估对其它分支的影响**
   - 列出所有受影响的 App、路由、构建产物与部署步骤。
   - 说明行为变化：兼容 / 需同步改 / 可能回归；必要时在同一变更内一并修复，或明确记录例外与后续任务。

3. **保证本次改动不影响其它功能**
   - 未在任务范围内的全站能力（导航、登录、支付、Hero、其它子域）不得意外受损。
   - 合入前对受影响路径做针对性验证（构建、`tsc`、关键页面或 API 抽检）；无法验证时须在说明中写明风险与待验项。

> 未完成上述审核与穿透时，不得开始实现或合入。

## 「全站」范围

**「全站」指 `orasage.com` 域名下的所有页面**，包括但不限于：

| 子域 / 应用 | 说明 |
|-------------|------|
| `orasage.com` | main 门户 |
| `shop.orasage.com` | 商城 |
| `auth.orasage.com` | 登录 / 用户中心 |
| `admin.orasage.com` | 运营后台 |
| `cms.orasage.com` | 内容管理后台（Payload） |
| `bazi.orasage.com` | 八字 |
| `ziwei.orasage.com` | 紫微 |
| `tarot.orasage.com` | 塔罗 |

- 除非任务中**单独列出例外**，否则不对 main / 子应用 / 后台（admin、cms）做区分或特殊豁免。
- 后台页面（admin、cms）同样遵循全站视觉与导航规范。
- 共享导航以 `shared/app-shell/` 为主源，构建前同步到各应用的 `orasage-app-shell` 副本。

## 全站响应式导航（平台统一）

| 终端 | 导航形态 |
|------|----------|
| **PC（≥1024px）** | 顶部水平菜单：八字、紫微、塔罗、名人案例、道藏 + 登录 |
| **移动（<1024px）** | 底部固定 **5 键** App Shell：首页 · 当前应用品牌 · 祈福 · 商城 · 我的 |

- 移动端与 PC 端通过 CSS 媒体查询切换，同一页面不重复显示两套主导航。
- 子页「返回」放在内容区工具条，不占顶栏主导航位。

## 布局与功能变更

- **未经明确批准**，不要改动全局布局或增删产品功能。
- 大规模 UI 变更前先与任务方确认范围与例外。

## Admin 配置包（Config Pack）— 后台改动必读

> 产品规范：[`docs/products/admin-config-pack.md`](products/admin-config-pack.md)  
> 分步改造：[`docs/plans/admin-config-pack-roadmap.md`](plans/admin-config-pack-roadmap.md)

**凡改动 `admin/`、`shared/admin-backend/`、`shared/staff-permissions/`、auth-service `/api/admin/*`、或后台信息架构 / 权限 / 多租户相关行为，必须先读配置包规范，再动手。**

1. **先归类再实现**  
   - 选定模块：`platform` / `shop` / `billing` / `content` / `legal` / `app.{id}` / `ops` / `analytics` / `finance`。  
   - 选定配置层：L1 业务 / L2 策略 / L3 密钥（L3 默认只读状态，不进普通表单）。  
   - `shop.storefront`（布局、首页商品、水晶文案）**不得**归入 content；PDP 长文/精选评价归 content。  
   - 第三方**不得**被引导或授权进入 Payload Admin。

2. **分步与测试门禁**  
   - 按路线图 Phase/Step 实施，**禁止**把未排期的大范围 IA/权限重构塞进无关 PR。  
   - **每完成一个 Step/Phase，先完成该节「全量测试门禁」，再开始下一步。**

3. **更新日志（强制）**  
   - 数据源：`shared/admin-backend/changelog.json`；后台页：`/changelog`。  
   - 每次交付后台相关更新，必须追加一条：  
     `node scripts/admin-changelog-append.mjs --title "…" --summary "…" --modules shop,platform …`  
   - 详见脚本 `--help`。

4. **全局规则增减必须公示**  
   - 若本次改动增加、修改或删除了本文件、配置包规范中的不变量、权限枚举或租户隔离规则：  
     - changelog 条目的 `rulesImpact.added|changed|removed` **必须**写明；  
     - PR 描述中复述规则变更；  
     - 同步更新 `docs/products/admin-config-pack.md`（及路线图若阶段变化）。  
   - 无规则变更时：`rulesImpact` 三数组可为空，并在 summary 写明「无全局规则变更」。

5. **多租户**  
   - 新配置表与 Admin/Module API 从第一天带 `partnerId`；平台自营 slug 固定为 `orasage`。  
   - Admin API 读写必须按当前员工 `partnerId`（或超管 `?partner=`）过滤；禁止跨租户默读。  
   - 合作方有效权限 = 角色权限 ∩ `partner_modules` ∩ `PARTNER_ASSIGNABLE_PERMISSIONS`。  
   - `finance` / wallets 永不进入合作方权限或 Module API。  
   - L3 密钥状态仅对平台租户暴露真实探测结果。

6. **Module API（Phase E）**  
   - 契约见 [`docs/products/module-api-v1.md`](products/module-api-v1.md)；前缀 `/v1/partners/{partnerSlug}`。  
   - 鉴权用 API Key（非员工 Cookie）；路径 `partnerSlug` **必须**与 Key 绑定的 `partner_id` 一致。  
   - 有效 scope = Key scopes ∩ 已启用 `partner_modules`；禁止授出 finance / wallets / `module:platform`。  
   - 配置写操作必须写入 `config_audit_logs`；不得绕过审计新增写接口。  
   - Module API ≠ 商城 Partner 下单 API（platform-roadmap V2），勿混用。
