# OraSage 前端设计规范

> **移动优先（Mobile First）**：所有页面优先适配手机显示，再向上兼容平板与 PC。

## 核心原则

1. **默认样式面向手机**（375px 宽度），用 `sm:` / `md:` / `lg:` 渐进增强桌面体验
2. **触控目标 ≥ 44px**（按钮、链接、菜单项）
3. **安全区域**：刘海屏 / 底部横条使用 `env(safe-area-inset-*)`
4. **viewport**：`width=device-width`, `viewport-fit=cover`
5. **避免横向滚动**：`overflow-x: hidden`，内容宽度 `w-full`
6. **交互反馈**：移动端用 `active:` 替代 `hover:`

## Tailwind 断点用法

| 断点 | 宽度 | 用途 |
|------|------|------|
| 默认 | &lt; 640px | 手机（主要设计目标） |
| `sm:` | ≥ 640px | 大屏手机 / 小平板 |
| `md:` | ≥ 768px | 平板 / 小桌面 |
| `lg:` | ≥ 1024px | 桌面导航、多栏布局 |

## 布局模式

- **导航**：手机汉堡菜单 + 全屏抽屉；`lg:` 以上水平导航
- **卡片列表**：手机单列纵向；`md:` 以上多列网格
- **CTA 按钮**：手机全宽（`max-w-xs`）；桌面自适应宽度
- **内容页**：`PageShell` 组件统一 `px-5 py-10` 移动内边距

## 各 App 要求

| App | 移动优先 |
|-----|---------|
| main（门户） | ✅ 已实施 |
| auth | 登录/注册页需独立适配 |
| bazi / ziwei / tarot | 接入时遵循本规范 |
| shop | 结账浮层必须手机友好 |

## 参考实现

- `main/src/components/Header.tsx` — 移动菜单 + 语言切换
- `main/src/components/PageShell.tsx` — 内容页容器
- `main/src/app/[locale]/globals.css` — 安全区与触控基础样式
