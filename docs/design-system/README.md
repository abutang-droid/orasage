# OraSage Design System

全站 UI 的**唯一**视觉与交互规范：

| 文档 | 说明 |
|------|------|
| [OraSage-Design-System-v1.1-Revised.md](./OraSage-Design-System-v1.1-Revised.md) | DS v1.1 单色体系（黑 / 白 / 灰） |

## 实现

| 路径 | 角色 |
|------|------|
| `shared/design-tokens/orasage-tokens.css` | 运行时 token 权威源 |
| `packages/tokens/` | npm 包副本（`npm run tokens:sync` 同步） |
| `shared/app-shell/` | 全站导航壳层（构建前同步到各 App） |

## 布局（非视觉色板）

移动端优先、断点与导航形态见 [mobile-first.md](../mobile-first.md)。

## 已废止（勿再引用）

以下文档已删除或不再作为设计依据：`ui-phase-1.md`、`ui-phase-2.md`、`design-unify-backlog.md`、`MANTO_DESIGN.md`、`MANTO_CARD_DESIGN.md`、`OraSage-Design-System-Minimal-Refinement`、`Brand_Design_Tokens` 独立稿、纸感/jade/鎏金/暗金等旧色板描述。
