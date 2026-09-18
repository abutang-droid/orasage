# OraSage Mobile（Expo / React Native）

OraSage 全站的 iOS / Android 客户端（路线三第 1 步：骨架 + 登录 + 门户首页）。

## 当前功能

- 底部固定 5 键导航，对齐全站移动端 App Shell 规范（`docs/AGENT-RULES.md`）：
  首页 · 探索 · 祈福 · 商城 · 我的
- 门户首页：命理工具与典籍内容入口（八字 / 紫微 / 塔罗 / 名人案例 / 道藏 / 能量商城）
- 登录 / 注册 / 我的：直连 `auth-service`（`POST /auth/login`、`POST /auth/register`、
  `GET /auth/me`），token 走 `Authorization: Bearer`，原生端存 SecureStore
  （iOS Keychain / Android Keystore），Web 预览回退 localStorage
- 尚未原生化的子域（祈福殿堂、商城、三个命理站）通过站内 WebView 接入，
  后续按「塔罗 → 紫微 → 八字 → 商城结算」的顺序逐步原生化

## 本地开发

```bash
cd mobile
npm install
npm run web        # 浏览器预览（react-native-web）
npm run ios        # 需 macOS + Xcode，或用 Expo Go 扫码
npm run android    # 需 Android Studio 模拟器，或用 Expo Go 扫码
```

环境变量（可选）：

- `EXPO_PUBLIC_AUTH_URL` — auth-service 基址，默认 `https://auth.orasage.com`。
  本地联调设为 `http://127.0.0.1:3101`（需先按仓库 AGENTS.md 启动 auth-service）。

本地联调注意：auth-service 的 `npm start` 固定 `NODE_ENV=production`，
此时 CORS 只放行 `CORS_ORIGINS` 白名单。浏览器里跑 `npm run web` 联调时需
`CORS_ORIGINS=http://localhost:8081` 启动 auth-service（原生 App 内的 fetch
不受 CORS 限制，生产无需此配置）。

## iOS / Android 出包（EAS Build，需要开发者账号）

一次性准备：

```bash
npm install -g eas-cli
eas login                      # Expo 账号
eas init                       # 关联 EAS 项目（写入 projectId）
```

iOS（需要 Apple Developer 账号，登录后 EAS 自动管理证书/描述文件）：

```bash
eas build --platform ios --profile production
eas submit --platform ios      # 上传到 App Store Connect / TestFlight
```

Android：

```bash
eas build --platform android --profile production
eas submit --platform android  # 上传到 Google Play（需 service account）
```

内部测试包：`--profile preview`（iOS 出模拟器包，Android 出 APK）。

## 上架前待办

- 替换 `assets/images/` 下的占位图标 / 启动图为正式 VI 素材（玄璧标）
- iOS 审核 4.2：补充推送、深链等原生能力后再提审，避免被判定为网页壳
- 数字内容（命理解读）在 iOS 内购买需接 Apple IAP；WebView 内的支付入口
  提审前需按平台政策处理

## 代码同步说明

`src/theme/tokens.ts`、`src/lib/urls.ts`、`src/lib/labels.ts` 为
`packages/tokens` 与 `shared/app-shell` 的手工同步副本（与各 Web 应用的
`orasage-app-shell` 副本模式一致）。改动请先改主源，再同步此处。
