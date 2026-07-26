# WOLD App 接入交接文档

> 写给下一任开发者 / Agent：把 **OriCosmos（WOLD 轨道）Web 平台** 接入外部 **WOLD App**（原生壳 / WebView / 深度链）。  
> 最后更新：**2026-07-26**  
> 工作分支：**`cursor/wold-a564`**  
> 线上环境：**`https://*.oricosmos.com`**（勿与旧生产 `orasage.com` 混淆）

**必读关联：**

| 文档 | 用途 |
|------|------|
| [`docs/AGENT-RULES.md`](./AGENT-RULES.md) | 最高宪法：关联穿透、全站范围、底栏导航 |
| [`deploy/oricosmos/README.md`](../deploy/oricosmos/README.md) | OriCosmos VM 部署与 DNS |
| [`docs/HANDOFF-tarot.md`](./HANDOFF-tarot.md) | 塔罗功能史（偏旧 orasage 生产） |
| [`docs/mobile-first.md`](./mobile-first.md) | 移动优先约束 |

---

## 0. 一句话结论

WOLD 轨道已经是一套可独立运行的多子域 Web 平台（入口多为塔罗）。**正式接入 World Mini Apps** 的方式是：

1. 在 [World Developer Portal](https://developer.world.org) 注册 Mini App，填入 `https://tarot.oricosmos.com`  
2. 用户在 **World App** 内打开本站（WebView + MiniKit）  
3. **登录 = `MiniKit.walletAuth`（SIWE）→ `orasage_token`**（邮箱登录在 `WORLD_AUTH_REQUIRED=true` 时关闭）  
4. **支付 = `MiniKit.pay`（WLD）→ shop `/api/world/confirm` 验单后标记 paid**

官方文档：[docs.world.org/mini-apps](https://docs.world.org/mini-apps) · wallet-auth · pay。

不要把代码部署到旧 VPS，也不要在 App 里写死 `*.orasage.com`。

---

## 1. 双轨环境（绝对不能搞混）

| 项 | **orasage.com（旧生产）** | **oricosmos.com（WOLD 轨道）** |
|----|---------------------------|--------------------------------|
| 含义 | 原 OraSage 生产 | WOLD / OriCosmos 并行环境 |
| Git 分支 | 通常 `main` | **`cursor/wold-a564`** |
| VPS | `34.75.40.67`（`ubuntu`） | **`34.130.99.36`（`je`）** |
| 代码目录 | `/opt/orasage` | `/opt/orasage` |
| Nginx | `deploy/nginx/orasage.conf` | `deploy/nginx/oricosmos.conf` |
| Env 模板 | `deploy/.env.example` | **`deploy/.env.oricosmos.example`** |
| Cookie 域 | `.orasage.com` | **`.oricosmos.com`** |
| 部署开关 | `NGINX_SITE=orasage`（默认） | **必须 `NGINX_SITE=oricosmos`** |

**禁止：**

- 把 oricosmos 配置拷到旧机，或改 `orasage.com` DNS 指向新机  
- 远程部署时漏设 `SSH_HOST` / `SSH_USER`（脚本默认打旧机）  
- 漏设 `NGINX_SITE=oricosmos`（会装错 nginx、烘焙错 `SITE_APEX`）

### 子域与端口（两轨相同）

| 主机（oricosmos） | 端口 | App |
|-------------------|------|-----|
| `oricosmos.com` | 3100 | main（首页 308 → 塔罗） |
| `auth.oricosmos.com` | 3101 | 统一登录 / 用户中心 |
| `shop.oricosmos.com` | 3102 | 商城 + 结账 |
| `admin.oricosmos.com` | 3103 | 后台；`/cms/` → CMS |
| `bazi.oricosmos.com` | 3110 | 八字 |
| `ziwei.oricosmos.com` | 3111 | 紫微 |
| `tarot.oricosmos.com` | 3112 | **塔罗（WOLD 主入口）** |
| `cms.oricosmos.com` | — | 301 → admin `/cms` |

---

## 2. 推荐接入架构（WOLD App）

```
┌─────────────────────────────────────────────┐
│  WOLD App（iOS / Android）                  │
│  ├─ 原生启动页 / Tab（可选）                 │
│  └─ WebView（共享 Cookie，HTTPS only）       │
│       ├─ https://tarot.oricosmos.com/…      │
│       ├─ https://auth.oricosmos.com/login…  │
│       ├─ https://shop.oricosmos.com/…       │
│       └─ https://bazi|ziwei.oricosmos.com…  │
└─────────────────────────────────────────────┘
         Cookie: orasage_token @ .oricosmos.com
         Locale: NEXT_LOCALE @ .oricosmos.com
```

### 2.1 WebView 硬性要求

1. **仅 HTTPS** 打开线上页（生产 Cookie 带 `Secure`）。  
2. Cookie 作用域覆盖 **所有** `*.oricosmos.com`（同一 Cookie jar，允许第三方/跨子域存储按系统能力配置；至少同 site 子域互通）。  
3. 允许跳转到 `auth.` / `shop.`（登录与结账会跨子域顶层导航；`SameSite=Lax` 对此可用）。  
4. **不要**用 `file://` 或自定义 scheme 承载业务页（拿不到 Secure Cookie）。  
5. 若必须用原生自有域名包裹：只能当浏览器壳打开真实 `https://*.oricosmos.com`，不要反向代理成别的 host（Cookie Domain 对不上）。

### 2.2 深度链接（建议 App 路由表）

| App 意图 | 打开 URL |
|----------|----------|
| 塔罗首页 | `https://tarot.oricosmos.com/` |
| 脉络解构（三牌 / Trilogy） | `https://tarot.oricosmos.com/reading` |
| 定命切片 | `https://tarot.oricosmos.com/single-card` |
| 今日启示 | `https://tarot.oricosmos.com/daily-fortune` |
| 祈福 / 朝拜 | `https://tarot.oricosmos.com/temple` |
| 水晶 PDP | `https://tarot.oricosmos.com/crystal/{sku}` |
| 登录并回跳 | `https://auth.oricosmos.com/login?redirect={encodeURIComponent(完整 https URL)}` |
| 用户中心 | `https://oricosmos.com/{locale}/profile`（locale: `en` / `zh-CN` / `pt-BR`） |
| 商城 | `https://shop.oricosmos.com/` |
| 八字 / 紫微 | `https://bazi.oricosmos.com/` · `https://ziwei.oricosmos.com/` |

语言：加 `?lang=en|zh-CN|pt-BR`（命理 App）或 `?locale=`（shop）。首访默认语言为 **`en`**（见 `packages/i18n`）。

`redirect` / `return` 只允许 apex 与 `*.apex`（`auth-service` `safeRedirect`），勿指向自定义 App scheme。

### 2.3 不推荐的做法

| 做法 | 原因 |
|------|------|
| 把各 App API 重写成原生 REST 客户端 | 会话、额度、同步、结账耦合 Cookie；工作量极大 |
| iframe 嵌套跨站父页 | `SameSite=Lax` + 第三方 Cookie 限制会导致登录失败 |
| 只注入 Bearer、忽略 Cookie | 多数路由仍读 Cookie；需全站改认证（未做） |
| 继续调用 `*.orasage.com` | 另一套库 / JWT / 用户，账密与订单不互通 |

---

## 2b. World MiniKit 实现状态（2026-07-26）

| 能力 | 状态 | 关键路径 |
|------|------|----------|
| MiniKit Provider | ✅ tarot layout | `tarot/src/components/world/WorldMiniKitProvider.tsx` |
| 强制 World 登录门 | ✅ `WORLD_AUTH_REQUIRED` | `WorldAuthGate` + auth `/auth/world/*` |
| SIWE → JWT | ✅ | `auth-service/src/routes/world-auth.ts`；用户字段 `wallet_address`（0046） |
| 邮箱登录关闭 | ✅ flag 开时 | `auth-service` login/register 403 + 登录页 World CTA |
| World 钱包支付 | ✅ `PAYMENT_MODE=world` | `MiniKit.pay` → `shop/src/app/api/world/{pay-intent,confirm}` |
| 共享客户端 | ✅ | `shared/world-minikit/*`、`shared/shop-checkout/client.ts` |

**上线前必须在 VM `.env` 填真实值：**

```bash
WORLD_AUTH_REQUIRED=true
NEXT_PUBLIC_WORLD_AUTH_REQUIRED=true
PAYMENT_MODE=world
WORLD_APP_ID=app_…
NEXT_PUBLIC_WORLD_APP_ID=app_…
DEV_PORTAL_API_KEY=…          # 验支付用
WORLD_PAYMENT_TO_ADDRESS=0x…  # 收款钱包
```

并执行迁移 `0046_world_wallet_address.sql`（已加入 `deploy-shop-on-vps.sh` 列表）。

## 3. 认证与会话（接入核心）

### 3.1 Cookie

| Cookie | 域 | 说明 |
|--------|-----|------|
| **`orasage_token`** | `.oricosmos.com` | 平台登录 JWT（httpOnly, SameSite=Lax, Secure@prod） |
| `tarot_token` | 主机（tarot） | 塔罗访客 JWT；登录后可合并进平台用户 |
| `NEXT_LOCALE` / `orasage_shop_locale` | `.oricosmos.com` | 语言 |

签发：`auth-service`（`auth-service/src/lib/jwt.ts`）。  
Claims：`{ sub, role, perms? }`，HS256，默认约 30 天。

### 3.2 塔罗桥接（访客 → 平台用户）

文件：`tarot/src/lib/auth.ts`、`tarot/src/lib/guest-account-merge.ts`

1. 优先读父 Cookie `orasage_token`（可用 `PARENT_AUTH_COOKIE_NAME` 覆盖名，默认不变）  
2. 映射本地用户 `externalId = orasage:{sub}`  
3. 登录时把访客数据 `mergeGuestUserIntoTarget`  
4. 无父 Cookie 时用 `tarot_token` 访客身份  

**结账 / 占卜同步到用户中心：必须平台登录**（仅访客会 401）。

登录 URL 构造：`tarot/src/lib/login-url.ts` →  
`{AUTH}/login?redirect={tarotOrigin + path}`。

### 3.3 WebView 联调技巧

- 生产 Secure Cookie 在 HTTP / 错域下会静默丢失。  
- 本机调试可用 API JSON 里的 `token` + `Authorization: Bearer`（见 `AGENTS.md`）；**线上 App 仍以 Cookie 为准**。  
- 确认 auth CORS / `CORS_ORIGINS` 含 `https://tarot.oricosmos.com` 等（查 VM 上 `auth-service` `.env`）。

---

## 4. 塔罗产品面（WOLD 主入口）

品牌壳内称 **Manto**（`APP_BRANDS.tarot`），路由在 `tarot/`。

### 4.1 页面

| 路径 | 模块 | 要点 |
|------|------|------|
| `/` | 首页 | Destiny Slice / Trilogy / 今日启示 / 祈福入口 |
| `/reading` | **脉络解构 Trilogy** | 免费字面释义 → 付费链路报告 |
| `/single-card` | **定命切片** | 一次付费永久解锁切片 |
| `/daily-fortune` | **今日启示** | 每日额度；可推荐水晶并页内购买 |
| `/temple` | 祈福 | 地理 → 信仰 → 守护神 → 参拜 |
| `/crystal/[sku]` | 水晶 PDP | 走 App 内 checkout |
| `/history` | 历史 | 登录后与用户中心同步 |
| `/onboarding` | 引导 | 地理 / 信仰 |

### 4.2 关键 API

| 流程 | 端点前缀 |
|------|----------|
| 三牌 | `/api/three-card/{start,brief,full-report,session,questions,report-access}` |
| 定命切片 | `/api/single-card/{start,brief,full-report,session,questions,quota}` |
| 每日 | `/api/daily-fortune/{session,draw,quota,stats,questions}`、`/api/tarot/daily-recommend` |
| 结账代理 | `/api/checkout` → shop 内网 |
| 计费配置 | `/api/tarot/billing-config` |
| 会话 | `/api/auth/me` |

AI 语言：请求体带 `language` / `locale` / `lang`（客户端 `aiLangBody`）；服务端 `shared/ai-locale`。英文 UI 下解读正文不得混中文（Trilogy 已做 Han 拒绝 + 缓存重生成）。

### 4.3 计费 SKU（auth billing slots → 商品）

配置入口：`tarot/src/lib/tarot-billing-config.ts` + auth `GET /api/billing/slots?app=tarot`

| 槽位 | 典型 SKU |
|------|----------|
| 三牌报告 | `report-tarot` |
| 三牌套装 | `report-tarot-bundle` |
| 定命切片解锁 | `tarot-destiny-slice` |
| 每日超额 | `tarot-daily-draw` |
| 每日推荐饰品 | `recommend.daily`（seed 相关） |

前端购买：`startAppCheckout` → `POST /api/checkout` → `redirectAfterCheckout`  
（共享实现：`shared/shop-checkout/client.ts`，经 `tarot/src/lib/shop-checkout.ts` 再导出）。

占卜同步（已登录）：`POST {AUTH}/auth/me/readings/sync`（需 Cookie）。

---

## 5. 支付与 WOLD 币

| 项 | 说明 |
|----|------|
| 列价 | **USDT 分**（= USD 分 1:1） |
| 展示 | 双价 **`39.90 U / 39.90 W`**（蓝字金额，单位缩小）— `shared/shop-locale`、`PriceDisplay` |
| 汇率 | `WOLD_PER_USDT`（env + admin 商店配置） |
| 支付币种 | 结账可选 `USDT` \| `WOLD` |
| 模式 | **`PAYMENT_MODE=mock`（当前默认，含生产风险验收）**；真 Stripe 需 `PAYMENT_MODE=stripe` + Key/Webhook |
| WOLD 支付 | 走 mock/钱包路径，不走 Stripe |

接入 App 时：支付完成页仍在 `shop.oricosmos.com`；WebView 需允许该跳转，并在 `successUrl` 回到塔罗/原模块。

---

## 6. 全站导航（App Shell）

主源：`shared/app-shell/`（改完必须 `npm run app-shell:sync`）。

- 全端底栏 5 键：**塔罗 · 八字 · 祈福 · 商店 · 我的**  
- Apex：`NEXT_PUBLIC_SITE_APEX` / 运行时 `resolveClientSiteApex()`（hostname 优先，避免烤错 env）  
- 门户 `/` → 308 塔罗  

在 WOLD App 若自绘原生 Tab，可隐藏 Web 底栏（需产品决定）；否则保留 Web 底栏即可跨子域跳转。

---

## 7. 环境变量清单（oricosmos）

根模板：`deploy/.env.oricosmos.example` → `/opt/orasage/.env`，并同步各 App。

**全站一致：**

- `SITE_APEX` / `NEXT_PUBLIC_SITE_APEX` / `VITE_SITE_APEX=oricosmos.com`  
- `JWT_SECRET`（≥32，全站相同）  
- `JWT_COOKIE_DOMAIN=.oricosmos.com`、`COOKIE_DOMAIN=.oricosmos.com`  
- `AUTH_URL` / `SHOP_URL` / `TAROT_URL` / … 全部 `*.oricosmos.com`  
- `*_INTERNAL_URL=http://127.0.0.1:31xx`  
- `PAYMENT_MODE`、`WOLD_PER_USDT`

**分库：**

| App | DATABASE |
|-----|----------|
| auth-service | `orasage_auth` |
| tarot | `orasage_tarot`（Prisma） |
| bazi | `orasage_bazi`（Drizzle） |
| cms | `orasage_cms` + 独立 `PAYLOAD_SECRET` |

塔罗另需：`NEXT_PUBLIC_AUTH_URL`、`AUTH_INTERNAL_URL`、`SHOP_INTERNAL_URL`，否则同步/回跳可能落到旧域名默认值。

---

## 8. 部署（WOLD 轨道专用）

### 远程（Cloud Agent / 笔记本）

```bash
SSH_HOST=34.130.99.36 SSH_USER=je SSH_KEY=~/.ssh/deploy_key \
NGINX_SITE=oricosmos ORASAGE_REF=cursor/wold-a564 \
bash deploy/remote-deploy-all.sh

# 仅塔罗
SSH_HOST=34.130.99.36 SSH_USER=je SSH_KEY=~/.ssh/deploy_key \
NGINX_SITE=oricosmos ORASAGE_REF=cursor/wold-a564 \
bash deploy/remote-deploy-tarot.sh
```

### 在 VM 上

```bash
cd /opt/orasage
git fetch origin cursor/wold-a564
git reset --hard origin/cursor/wold-a564

NGINX_SITE=oricosmos ORASAGE_REF=cursor/wold-a564 FORTUNE_MODE=native \
  bash deploy/bootstrap-all-on-vps.sh
```

### 冒烟

```bash
for d in oricosmos.com auth.oricosmos.com shop.oricosmos.com \
         tarot.oricosmos.com bazi.oricosmos.com ziwei.oricosmos.com; do
  echo -n "$d → "
  curl -s -o /dev/null -w "%{http_code}\n" --max-time 10 "https://$d"
done
```

Git 习惯：功能分支 `cursor/<name>-a91d` → PR base **`cursor/wold-a564`** → fast-forward 合入 wold → 按上式部署。  
（合入 wold 后对同一 tip 再开 PR 会报 no differences，属正常。）

---

## 9. 2026-07-26 前后已合入 wold 的近期改动（接入前已知）

| 主题 | 说明 |
|------|------|
| Trilogy 英文化 | 英文 UI 解读不再混中文；Han 拒绝 + 缓存按语言重生成 |
| 卡牌标题重叠 | `TarotFlipCard` 有 caption 时高度按内容撑开 |
| Trilogy 标题 | 两行：Trilogy / 状态徽章（对齐定命切片） |
| 全站双价 | 蓝字 `U / W` |
| 推荐购买 CTA | 实心深底；每日推荐可页内 `startAppCheckout` |
| 注册回跳空白 | 访客合并竞态 / Onboarding `redirect` 保留 |
| 结账 fallback 域名 | `shared/shop-checkout/client.ts` 按 hostname/apex 选 `shop.{apex}`（勿再写死 orasage） |

当前 tip 以 `origin/cursor/wold-a564` 为准（本文提交后请 `git log -15` 复核）。

---

## 10. 接入前必须扫一遍的坑

| # | 坑 | 处理 |
|---|----|------|
| 1 | `redirectAfterCheckout` 曾硬编码 `shop.orasage.com` | 已改为按 apex；部署后实机点一次购买验证 |
| 2 | 仍有个别组件写死 `shop.orasage.com`（如 ziwei recommend / 部分 usePaymentFlow） | 接入紫微前改成 `ORASAGE_URLS.shop` / apex |
| 3 | 客户端 sync 默认 AUTH 可能回落 `auth.orasage.com` | 保证 `NEXT_PUBLIC_AUTH_URL` 烘焙为 oricosmos |
| 4 | auth `CORS_ORIGINS` 未含 oricosmos | 查并改 VM `.env` 后重启 auth |
| 5 | WebView 无跨子域 Cookie | 登录态丢失 → 检查 Cookie 配置与 HTTPS |
| 6 | 仅访客点购买 | 预期 401 → 跳转 login；App 需允许打开 auth |
| 7 | 错机部署 | 永远带 `SSH_HOST=34.130.99.36 SSH_USER=je NGINX_SITE=oricosmos` |
| 8 | 改 `shared/app-shell` 未 sync | 各 App 底栏漂移 → `npm run app-shell:sync` |
| 9 | `PAYMENT_MODE=mock` | App 审核/演示可用；真收款再开 Stripe |
| 10 | postMessage 旧 bazi Woo 路径 | **不是**当前 oricosmos 结账路径；勿依赖 |

---

## 11. WOLD App 接入检查清单

### A. 工程准备

- [ ] 确认只连 **oricosmos.com** / `cursor/wold-a564`  
- [ ] VM 上 `JWT_SECRET`、Cookie 域、各 `*_URL` 一致  
- [ ] auth `CORS_ORIGINS` 含全部 oricosmos 前台源  
- [ ] 冒烟 7 个子域 HTTP 200  

### B. WebView 壳

- [ ] 默认打开 `https://tarot.oricosmos.com/`  
- [ ] Cookie 在 `auth` ↔ `tarot` ↔ `shop` 间保持  
- [ ] 登录回跳回到原 `redirect`  
- [ ] 深链：`/reading`、`/single-card`、`/daily-fortune`、`/temple`  
- [ ] 语言：`?lang=en` / `zh-CN` / `pt-BR`  

### C. 商业闭环

- [ ] 未登录购买 → 登录墙 → 登录后可购  
- [ ] Trilogy / Destiny Slice / 每日推荐：mock 支付成功并解锁  
- [ ] 订单出现在 `https://oricosmos.com/en/profile`（或对应 locale）  
- [ ] 价格展示为 `U / W` 双价  

### D. 解读与 i18n

- [ ] 英文 UI：Trilogy mapping / chain / threshold **无汉字**  
- [ ] 中文 UI：中文解读正常  
- [ ] 卡牌下方标题与牌位副标题 **不重叠**  

### E. 文档与分支

- [ ] 后续 PR base = `cursor/wold-a564`  
- [ ] 合入后用 §8 命令部署，再给 App 发版  

---

## 12. 关键文件索引

| 用途 | 路径 |
|------|------|
| OriCosmos 部署说明 | `deploy/oricosmos/README.md` |
| Env 模板 | `deploy/.env.oricosmos.example` |
| Nginx | `deploy/nginx/oricosmos.conf` |
| 站点烘焙 | `deploy/lib/site-env.sh`、`deploy/lib/nginx-site.sh` |
| App Shell | `shared/app-shell/*` |
| 结账客户端 | `shared/shop-checkout/client.ts` |
| 价格 / WOLD | `shared/shop-locale/*` |
| AI 语言 | `shared/ai-locale/index.ts` |
| 塔罗鉴权桥 | `tarot/src/lib/auth.ts` |
| 登录 URL | `tarot/src/lib/login-url.ts` |
| Trilogy UI | `tarot/src/components/three-card/*` |
| Trilogy 生成 | `tarot/src/lib/tarot/generation/{generate,prompts}.ts` |
| 计费 | `tarot/src/lib/tarot-billing-config.ts` |
| 远程部署 | `deploy/remote-deploy-{all,tarot}.sh` |

---

## 13. 建议的下一步工作顺序

1. **App 侧：** 做最小 WebView 壳 + 深链表 + Cookie 联调（§2、§11B）。  
2. **平台侧：** 扫清残留 `*.orasage.com` 硬编码（ziwei / bazi 支付回跳优先）。  
3. **验收：** 按 §11C–D 走完英文购买 + Trilogy 解锁。  
4. **再决策：** 是否隐藏 Web 底栏、是否上真 Stripe、是否把原生 Tab 与五键对齐。  
5. **勿做：** 在未统一 Cookie 方案前，不要并行开发第二套原生登录 API。

---

## 14. 联系方式与仓库

- GitHub：`abutang-droid/orasage`  
- WOLD 工作分支：`cursor/wold-a564`  
- 线上塔罗：`https://tarot.oricosmos.com`  
- 本文路径：`docs/HANDOFF-wold-app-integration.md`
