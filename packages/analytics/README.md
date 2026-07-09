# @orasage/analytics

轻量行为统计 SDK（#10 路线 A）。各子域应用统一上报到 `auth-service` 的 `POST /api/events`，数据写入 `analytics_events` 表，供 **7b 统计后台**查询。

## 特性

- 匿名 `session_key`（localStorage），**不采集 IP**
- `referrer` 仅存 hostname
- 批量上报（自动 flush，最多 25 条/批）
- 登录用户自动附带 `user_id`（cookie 鉴权）

## 用法

```ts
import { createAnalyticsClient } from "@orasage/analytics";

const analytics = createAnalyticsClient({ app: "shop" });
analytics.page();
analytics.track("add_to_cart", { sku: "crystal-001" });
```

### Next.js（main / shop）

```tsx
import { AnalyticsPageView } from "@orasage/analytics/react";

<AnalyticsPageView app="main" locale={locale} path={pathname} />
```

## 环境变量

| 变量 | 默认 |
|------|------|
| `NEXT_PUBLIC_ANALYTICS_URL` | `https://auth.orasage.com/api/events` |
| `VITE_ANALYTICS_URL` | 同上（Vite 应用） |

## 事件命名

小写 snake_case，如 `page_view`、`checkout_start`、`order_paid`。
