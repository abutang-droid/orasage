# 八字排盘 TODO

## 升级冲突修复
- [x] 恢复原有 Home.tsx 八字排盘 UI（保留墨金设计）
- [x] 集成 tRPC Provider（main.tsx 已自动合并完成）
- [x] App.tsx 保持 dark theme
- [x] 安装缺失依赖：@trpc/server, @trpc/client, @trpc/react-query, @tanstack/react-query

## 用户登录 + 历史记录功能
- [x] 数据库 schema：添加 bazi_records 表
- [x] 推送数据库迁移（pnpm db:push）
- [x] 后端 API：保存排盘记录（protectedProcedure）
- [x] 后端 API：获取用户历史记录
- [x] 后端 API：删除排盘记录
- [x] 前端：顶部显示登录状态（已登录用户名 / 登录按钮）
- [x] 前端：排盘完成后自动保存到数据库（已登录用户）
- [x] 前端：历史记录页面 /history（查看/删除排盘，五行分布可视化）
- [x] 注册 /history 路由到 App.tsx
- [x] 编写 vitest 测试（8 个测试全部通过）

## AI 解读功能
- [x] 后端：添加 bazi.analyze tRPC 接口（publicProcedure，接收排盘结果，调用 LLM 生成解读）
- [x] 后端：设计八字解读 prompt（单人/双人两种模板）
- [x] 前端：BaziResult.tsx 中 SingleBaziResultView 添加 AI 解读按钮
- [x] 前端：DoubleBaziResultView 添加 AI 解读按钮
- [x] 前端：AI 解读报告展示面板（墓金风格，Streamdown 渲染 Markdown）
- [x] 前端：加载状态动画（太极旋转）
- [x] 前端：报告展示添加打字机动画（报告内容逐字显示 + 金色光标闪烁）
- [x] TypeScript 零错误，8 个测试全部通过

## 报告分节折叠功能
- [x] 后端：analyze 接口同时返回 sections 数组（解析好的分节数据）
- [x] 前端：实现 SectionCard 折叠组件（金色标题栏 + 展开/收起动画）
- [x] 前端：默认展开第一节（命盘总览），其余收起
- [x] 前端：每节标题配对应图标（六节各不同）
- [x] 前端：替换 AIAnalysisPanel 中的纯文本展示为分节折叠展示
- [x] TypeScript 零错误，8 个测试全部通过

## 八字计算修复 + 真太阳时
- [x] 上传 lunar-javascript 重新生成的正确数据文件（20个年代）
- [x] 更新 lunarData.ts 中的 DECADE_URLS 指向新数据文件
- [x] 真太阳时修正逻辑已存在（bazi.ts 中根据经度自动计算偏移）
- [x] 前端输入表单添加全局城市搜索（支持中英文，486个城市含旧金山等海外城市）
- [x] 结果页展示真太阳时修正信息（经度 + 时区 + 偏移分钟）
- [x] 确认子时起于 23:00（23:00-01:00 为子时）
- [x] 编写真太阳时计算的单元测试（8 个测试全部通过）

## 真太阳时算法升级
- [x] 新增均时差查表（365天精确值，来源 USNO），修正最大 ±16 分钟误差
- [x] getShiZhu 接收 minute 参数，以总分钟数精确判断时辰边界
- [x] applyTrueSolarTime 传入 month/day 参数，自动查均时差
- [x] calcSingleBazi 中 getShiZhu 调用传入 minute
- [x] 验证：石首 112.41°E，6月24日 23:20 → 真太阳时 22:48 → 亥时 → 辛亥 ✓
- [x] 23 个测试全部通过

## 时辰划分 Bug 修复
- [x] 修复 getShiZhu 中 23:00 应归亥时而非子时（亥时范围 21:00-23:00）
- [x] 23 测试用例全部通过

## OraSage 设计规范改造（历史 · 已由 DS v1.1 取代）

> 当前规范：[`docs/design-system/OraSage-Design-System-v1.1-Revised.md`](../docs/design-system/OraSage-Design-System-v1.1-Revised.md)

- [x] ~~淡紫/鎏金色板~~ → DS v1.1 单色（`#FAFAF8` / `#171717` / 灰阶）
- [x] 全局 CSS：更新字体（标题 Noto Serif SC、正文/按钮 Noto Sans SC）
- [x] 全局 CSS：切换为亮色主题（ThemeProvider defaultTheme="light"）
- [x] Home.tsx：表单卡片改为白色背景 + 淡紫边框 + 圆角 18-24px
- [x] Home.tsx：主按钮改为金色 #D9A441 + 白色文字 + 圆角 12px
- [x] Home.tsx：输入框改为白色背景 + 淡紫描边
- [x] BaziResult.tsx：结果卡片改为白色/淡紫背景 + 深紫标题
- [x] BaziResult.tsx：AI 解读面板适配亮色风格
- [x] 导航栏：改为白色背景 + 深紫文字 + 金色当前页下划线
- [x] 历史记录页：适配亮色风格
- [x] 页脚：实现 OraSage 页脚结构（品牌区 + 快速导航 + 资源 + 关于 + 支付方式）

## 计算差异修复
- [x] 扩充城市数据库：新增106个县级市（石首、荆州、义乌等），总计592城市
- [x] 修复模精匹配误命中：实现汉字边界检查，避免“吉林四平”命中“吉林市”
- [x] 精确大运起运年龄：扫描前后节气天数÷3计算，替代固定5岁

## 城市搜索体验优化
- [x] 城市数据库添加拼音首字母字段（pinyin 字段，使用 pinyin-pro 100% 覆盖）
- [x] getCityCoords 支持拼音首字母匹配
- [x] 城市搜索下拉列表显示省份信息（区分同名城市）
- [x] 搜索结果按匹配质量排序（精确 > 拼音 > 模精）
