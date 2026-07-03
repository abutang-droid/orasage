# Agent 工作规则

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

## 全站视觉规范

- 唯一设计规范：[DS v1.1 Revised](./design-system/OraSage-Design-System-v1.1-Revised.md)
- Token 实现：`shared/design-tokens/orasage-tokens.css`
- 布局与导航：见本文「全站响应式导航」与 [mobile-first.md](./mobile-first.md)

## 布局与功能变更

- **未经明确批准**，不要改动全局布局或增删产品功能。
- 大规模 UI 变更前先与任务方确认范围与例外。
