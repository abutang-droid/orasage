# Bazi History / URL 状态恢复 ADR（T3-01）

**状态：** 草案 — 实现前评审  
**范围：** 仅 `bazi/` 本地，不把个人数据明文写入 URL

## 目标

- 输入 → 结果产生可预测 History 条目
- Back 回到保留输入的表单；Forward 可恢复
- 刷新：恢复最近合法步骤或给出明确选择；不得静默展示不匹配结果
- 保持 `paid=1` / `restore=1` 现有结账回跳契约

## 方案

| 步骤 | URL | 会话快照 |
|---|---|---|
| 输入 | `/?view=form&mode=single\|couple` | 表单草稿（sessionStorage，可清） |
| 结果 | `/?view=result&mode=…` | 最小化结果快照（已有 `checkout-session`，复用并加 TTL） |
| 支付回跳 | `?paid=1&restore=1&order=…` | 现有逻辑优先 |

- **不写** 姓名、生日、地点、经纬度到 query
- History：`pushState` 在提交成功进入结果时；`popstate` 同步 `view`
- 无效/过期快照 → 回表单 + toast

## 非目标

- 不永久存储结果；不做跨设备同步
- 不改订单验证 / SKU / 价格

## 下一步

实现轻量 `bazi/client/src/lib/flow-history.ts` 并在 `Home.tsx` / `App.tsx` 接线；补 Vitest 覆盖支付回跳与普通刷新。
