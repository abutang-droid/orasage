# @orasage/city

全站共享城市/地址模块。命理 App 出生城市搜索、商城收货地址（后续）均复用此包。

## 结构

- `src/search.ts` — 本地模糊匹配（纯函数）
- `src/api.ts` — auth-service `/api/cities` 客户端
- `src/react/` — `CitySearchInput`、`CityConfirmCard`、`CityProvider`
- `data/cities-seed.json` — 种子城市库（运行 `pnpm generate-seed` 重新生成）

## 使用

```tsx
import { CityProvider, CitySearchInput } from "@orasage/city/react";
import { createCityApiClient } from "@orasage/city";
import "@orasage/city/city.css";

const api = createCityApiClient("https://auth.orasage.com");

<CityProvider api={api} locale="zh-CN">
  <CitySearchInput value={birthplace} onChange={setBirthplace} />
</CityProvider>
```

## 后端

`city_records` 表与 `/api/cities/*` 接口位于 `auth-service`（PostgreSQL）。
