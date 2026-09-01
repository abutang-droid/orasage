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
| **PC（≥1024px）** | 顶部水平菜单：英文 **Shop → Insights → Origins → Readings**；中文 **首页 / 商城 / 玄析 / 造物 / 道藏 / 测算** + Search · Me · Cart + 语言切换 |
| **移动（<1024px）** | 底部固定 **4 键** App Shell：首页 · 商城 · 测算 · 我的（中英一致） |

- 移动端与 PC 端通过 CSS 媒体查询切换，同一页面不重复显示两套主导航。
- 子页「返回」放在内容区工具条，不占顶栏主导航位。

## 布局与功能变更

- **未经明确批准**，不要改动全局布局或增删产品功能。
- 大规模 UI 变更前先与任务方确认范围与例外。

## 生产环境与 SSH（Cloudflare Tunnel）

家用生产机经 **Cloudflare Tunnel** 对外；**GCP VPS `34.75.40.67` 是另一套环境，勿当作默认部署目标**。

| 环境 | 角色 | Agent 策略 |
|------|------|------------|
| 家用服务器（`orasage.com` 源站） | 当前生产 | 部署 / 验证 / SSH 的目标 |
| GCP `34.75.40.67` | 历史 VPS / 其它分支 | **除非任务明确要求，否则不 SSH、不部署、不修改** |

### SSH 连接规则

1. **禁止**对 `orasage.com`、`ssh.orasage.com` 等 Cloudflare 橙云域名 **直连 `:22`**（会连到 CDN IP 并超时）。
2. Tunnel SSH  hostname 为 **`ssh.orasage.com`**；登录用户为 **`root`**（不是 `ubuntu`）。
3. 部署脚本 `deploy/lib/ssh-setup.sh` 会在以下情况 **自动** 启用 Cloudflare Tunnel：
   - `SSH_HOST` 为 `ssh.*`（如 `ssh.orasage.com`），或
   - 设置了 `SSH_TUNNEL_HOSTNAME`，或
   - `SSH_USE_CLOUDFLARE_TUNNEL=1`
4. 自动模式：`cloudflared access tcp --hostname <tunnel> --url localhost:2222`，再 `ssh root@127.0.0.1:2222`。
5. 显式关闭 Tunnel：`SSH_USE_CLOUDFLARE_TUNNEL=0`（用于 GCP 等直连 IP）。

### Cloud Agent Secrets（Cursor Dashboard）

在 [Cloud Agents → Secrets](https://cursor.com/dashboard/cloud-agents) 添加（**新开 Agent 后生效**）：

| Name | Type | 值 |
|------|------|-----|
| `SSH_PRIVATE_KEY` | Runtime Secret | 完整 PEM 私钥 |
| `SSH_HOST` | Environment Variable | `ssh.orasage.com` |
| `SSH_USER` | Environment Variable | `root` |

可选：`CF_ACCESS_CLIENT_ID` / `CF_ACCESS_CLIENT_SECRET`（Runtime Secret，若 Zero Trust Access 策略要求 Service Token）。

验证：

```bash
source deploy/lib/ssh-setup.sh && setup_ssh_key && test_ssh_connection
```

### GitHub Actions

Actions runner **无法**走家用 Tunnel；若部署 GCP 仍用 `SSH_HOST=34.75.40.67` + IAP。家用生产部署由 **Cloud Agent 或本地** 执行 `bash deploy/remote-deploy-all.sh` / `bash scripts/vps-deploy-main.sh`。
