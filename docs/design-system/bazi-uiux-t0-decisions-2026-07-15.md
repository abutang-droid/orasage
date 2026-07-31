# Bazi UI/UX Phase 0 决策记录（2026-07-15）

关联任务书：`OraSage_八字UIUX_Claude_Code_修复任务书_2026-07-13.md`  
审计 Commit：`b1d55ac0fa7ee416519a1dd67173eebf59b523f7`

## T0-01 未知时辰唯一契约

**现状（审计时）：**

| 层 | 行为 |
|---|---|
| 提交 payload（`Home.tsx`） | 空时辰 → `hour=08`, `minute=00` |
| i18n 帮助文案 | 声明默认为 `00:00` |
| DatePicker 时占位 | 视觉占位 `"00"` |

**裁决（本轮可执行结论）：**

在「不得改变命理计算」硬约束下，**以现行提交 payload `08:00` 为唯一契约**：

- 留空时辰提交：`hour=8`, `minute=0`
- 帮助文案与 Loading/结果回显与 `08:00` 对齐
- 用户明确选择的任意时分原样提交，不做替换
- 单人 / 合盘两人同一规则

若产品/命理负责人日后批准改为 `00:00`，须作为独立变更评估排盘结果差异后再改 payload；本轮不改计算默认值。

**测试锁定：** `resolveUnknownBirthTime` 单元测试覆盖空值与 `10:30` 显式选择。

## T0-02 对比度与图标

| 议题 | 裁决 |
|---|---|
| `#A1A1AA`（`--os-color-mono-gray-mid` / placeholder）在纸白上普通文字对比不足 | **不修改共享 Token 值**。业务组件普通文字使用已批准深灰 `--os-color-mono-gray-deep` / `#6B7280`（或语义 `muted-foreground`）。Placeholder 仅用于真正的占位提示。 |
| Tabler vs Lucide | **继续使用仓库已有 `lucide-react`**。不安装 Tabler/Iconify；结构性 Emoji 替换为 Lucide。 |

## T0-03 最小自动化回归

- 使用 Bazi 现有 Vitest；扩展 `include` 覆盖 `client/**/*.test.ts(x)`（jsdom）与可抽离的纯函数测试。
- `packages/city` 键盘 Combobox 测试放在包内或 Bazi 侧，mock 网络/CMS/支付。
- 不连接生产支付、CMS 写接口或真实用户数据。
