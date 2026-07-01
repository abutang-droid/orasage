# TarotMind - 塔罗占卜 Web 应用

极简治愈风的在线塔罗占卜工具。

## 功能
- **每日抽卡** — 每日随机抽取专属灵卡
- **心愿占卜** — 输入心愿获取指引
- **日运播报** — 今日爱情/事业/财运/心情
- **三牌阵占卜** — 过去-现在-未来完整解读
- **五行水晶推荐** — 根据占卜结果匹配水晶手串
- **塔罗小知识** — 每日一条
- **个人中心 & 历史记录**

## 技术栈
Next.js 15 + TypeScript + Tailwind v4 + MySQL + Prisma + JWT

## 快速开始
```bash
npm install
# 配置 .env 中 DATABASE_URL
npx prisma db push
npx prisma db seed
npm run dev
```
