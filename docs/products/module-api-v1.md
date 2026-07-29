# Module API v1（Config Pack · Phase E）

> **状态**：契约冻结（2026-07-29）  
> **基址**：`https://auth.orasage.com`（或内网 `AUTH_INTERNAL_URL`）  
> **配套**：[`admin-config-pack.md`](./admin-config-pack.md) · Phase D `partnerId` 隔离

---

## 1. 目标与边界

| 在范围内 | 不在范围内 |
|----------|------------|
| 按合作方读取已开通模块的 L1/L2 配置 | `finance` / wallets |
| API Key + 模块 scope | L3 密钥明文或自助填 Key |
| 交付模板（shop-only / tarot-only） | Payload Admin / CMS 直连 |
| 配置变更审计 | 商城 Partner 下单 API（另见 platform-roadmap V2） |

---

## 2. 鉴权

```http
Authorization: Bearer <api_key>
# 或
X-Api-Key: <api_key>
```

- Key 前缀：`mk_live_`（生产）/ `mk_test_`（预留）
- 服务端只存 `key_hash`（SHA-256）与 `key_prefix`；明文仅创建时返回一次
- Key 绑定唯一 `partner_id`（slug）；**路径中的 `{partnerSlug}` 必须与 Key 一致**，否则 `403`
- 合作方 `status !== active` → `403`
- Key `scopes` 与 `partner_modules` 取交集后生效

### Scope 约定

| Scope | 含义 |
|-------|------|
| `module:{id}` | 可访问该模块只读接口（如 `module:shop`） |
| `config:read` | 读配置（默认含在 module scope 中） |
| `config:write` | 写低风险 L1 字段（v1 仅开放 storefront layout） |

**禁止**授出任何 finance / wallets / L3 相关 scope。

---

## 3. 路径（冻结）

前缀：`/v1/partners/{partnerSlug}`

| Method | Path | Scope | 说明 |
|--------|------|-------|------|
| `GET` | `/` | 任意有效 Key | 合作方元数据 + 启用模块 |
| `GET` | `/modules` | 任意有效 Key | 模块清单 |
| `GET` | `/shop/products` | `module:shop` | 商品目录（本租户） |
| `GET` | `/shop/storefront` | `module:shop` | 店铺布局 / 首页 SKU |
| `PUT` | `/shop/storefront` | `module:shop` + `config:write` | 更新 `homeLayout` |
| `GET` | `/billing/slots` | `module:billing` | 计费槽位 |
| `GET` | `/apps/{appId}` | `module:app.{appId}` | App 概览（bazi/ziwei/tarot） |
| `GET` | `/audit` | 任意有效 Key | 本租户近期审计（只读摘要） |

`appId` ∈ `bazi` \| `ziwei` \| `tarot`。

---

## 4. 错误码

| HTTP | 含义 |
|------|------|
| 401 | 缺少/无效 API Key |
| 403 | 跨租户、模块未开通、scope 不足、合作方停用 |
| 404 | 资源不存在 |
| 422 | 参数校验失败 |

响应体：`{ "error": string, "code"?: string }`

---

## 5. 与 Admin API 的关系

- 运营后台继续用员工 JWT + `/api/admin/*`
- Module API 供第三方/白标服务端调用，**不**使用员工 Cookie
- 两边共享同一 `partner_id` 数据行与 `partner_modules`

---

## 6. 交付模板

见 `shared/partners` · `DELIVERY_TEMPLATES`：

| 模板 | 模块 |
|------|------|
| `shop-only` | shop, billing, ops, analytics |
| `tarot-only` | app.tarot, billing, content, legal, ops, analytics |
| `full-apps` | shop, billing, content, legal, ops, analytics, app.bazi, app.ziwei, app.tarot |

创建合作方时可传 `template`，展开为 `partner_modules`。
