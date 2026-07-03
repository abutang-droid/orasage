# @orasage/ui

OraSage 共享 UI 源码包，基于 React、TypeScript、Radix、CVA 和 Tailwind utility class。组件只包含无业务逻辑的基础交互与视觉适配，品牌颜色、圆角、阴影、动效和控件尺寸来自应用已接入的 OraSage CSS Variables。

## 边界

- 只放基础 UI：Button、Input、Textarea、Select、Checkbox、RadioGroup、Switch、Card、Badge、Alert、Separator、Dialog、DropdownMenu、Tooltip、Tabs、Skeleton、FormField、`cn()` 和公共 variants。
- 不放业务组件：八字命盘、紫微宫位、塔罗牌阵、商品卡片、订单、报告、API、路由或数据请求。
- 默认交互控件以 44px 为基准；Checkbox、Radio、Switch 的视觉图形可以更小，但消费侧需要用 Label 或外层布局保证可用点击区域。
- 不写硬编码品牌色，优先使用 `bg-primary`、`text-foreground`、`border-border`、`ring-ring` 等语义 token。

## main / Tailwind 3

`main` 使用 Next.js 和 Tailwind 3，消费共享源码时需要同时配置转译与扫描：

```ts
// main/next.config.ts
const nextConfig = {
  transpilePackages: ['@orasage/ui', '@orasage/tokens'],
};
```

```ts
// main/tailwind.config.ts
content: [
  './src/app/**/*.{ts,tsx}',
  './src/components/**/*.{ts,tsx}',
  './src/lib/**/*.{ts,tsx}',
  '../packages/ui/src/**/*.{ts,tsx}',
];
```

## bazi / Tailwind 4

本阶段不接入 bazi。后续在 `bazi/client` 接入时，Tailwind 4 应在全局 CSS 中增加源码扫描：

```css
@source "../../../packages/ui/src";
```

Vite 侧如遇到仓库外源码读取限制，再在 `server.fs.allow` 中显式允许仓库根目录；不要复制第二套组件源码。

## 使用方式

```tsx
import { Button, Card, Input, Select } from '@orasage/ui';
```

当前包通过源码导出，依赖由 `@orasage/ui` 声明，React 和 React DOM 保持 peerDependencies，由各 App 提供。
