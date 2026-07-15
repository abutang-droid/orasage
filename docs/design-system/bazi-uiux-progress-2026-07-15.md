# Bazi UI/UX 修复进度（任务书 2026-07-13）

基线：`b1d55ac`（与审计 Commit 一致）  
分支：`cursor/bazi-uiux-fix-3d1a`  
决策：`docs/design-system/bazi-uiux-t0-decisions-2026-07-15.md`

## 本轮已完成

| 编号 | 状态 | 证据 |
|---|---|---|
| T0-01 | 完成（payload 权威 08:00） | 决策文档 + `birth-time.test.ts` |
| T0-02 | 完成（记录） | 决策文档；业务文案用 deep gray |
| T0-03 | 部分 | Vitest 扩展 + 14 个新测通过 |
| T1-01 | 完成 | i18n 对齐 08:00；`resolveUnknownBirthTime` |
| T1-02 | 完成 | `CitySearchInput` Combobox 键盘；共享包；ziwei 同消费 |
| T1-03 | 完成 | 移除 `maximum-scale=1` |
| T1-04 | 完成 | Paywall CTA gating + retry；单元测 |
| T1-05 | 完成 | label/fieldset/radio/aria-invalid/焦点首错 |
| T2-01 | 部分 | 去伪 1900 占位；空年不算闰月；占位 `--` |
| T2-02 | 部分 | 字段错误就近；Loading `aria-live`；去掉固定 1.8s |
| T2-03 | 部分 | 性别/历法/清除 44px |
| T5-01 | 部分 | 结构性 emoji → Lucide |
| T5-03 | 部分 | Skip link |
| T6-01 | 部分 | reduced-motion CSS |
| T6-02 | 完成 | Feed 副本 `aria-hidden` |
| T6-03 | 部分 | `document.documentElement.lang` |
| T6-04 | 完成 | ErrorBoundary 无 stack |
| T3-01 | ADR 草案 | `bazi-flow-history-adr-2026-07-15.md`（未实现） |

## 共享文件

- `packages/city/src/react/CitySearchInput.tsx`（**共享**，消费者：bazi、ziwei）
- `packages/city/src/react/city.css`、`packages/city/src/i18n.ts`

## 自动测试

```bash
pnpm --prefix bazi exec vitest run client/src/lib/birth-time.test.ts \
  client/src/lib/paywall-gating.test.ts \
  client/src/components/CitySearchInput.keyboard.test.tsx
# → 14 passed
```

基线失败（未混入本修复）：`server/bazi.sections.test.ts`（`parseSections`）、`packages/ui` 缺依赖的 `tsc` 噪声。

## 未验证 / 未做

- 全视口手工矩阵、屏幕阅读器、真机 200% 缩放
- 登录 History / 已解锁报告 / 真实支付回跳（T7）
- T3 History URL 实现、T4 结果宽度、Paywall Token 去金色迁移、Hero CLS、动态拆包

## 确认边界

未改：命理计算、`bazi.ts`、价格/SKU/订单、权限、CMS 线上内容、共享 Token 值、无关应用。
