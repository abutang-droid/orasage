# OraSage Android 平板壳（4:3 竖屏）

把线上门户 [`https://orasage.com/zh-CN`](https://orasage.com/zh-CN) 包成可安装的 APK，面向 **短边 ≥600dp 的 4:3 竖屏平板**。

## 在线下载

调试 APK（约 5.5MB）：

- GitHub：https://github.com/abutang-droid/orasage/raw/cursor/android-tablet-apk-46a9/android-tablet/releases/orasage-tablet-4x3-portrait-debug.apk
- 备用（Gofile）：https://gofile.io/d/sS3NQscA

包名：`com.orasage.tablet.debug`。

## 行为

- 启动进入中文门户；`*.orasage.com` 内跳转（登录、商城、八字、紫微、塔罗）留在同一个 WebView。
- `screenOrientation=portrait`，不随重力旋转到横屏。
- `supports-screens` 声明 large / xlarge，并要求 `requiresSmallestWidthDp=600`。
- 站点本身已有平板左侧导航轨（见 `shared/app-shell/`），短边 ≥600px 时会自动显示。

## 构建

在仓库根目录：

```bash
bash android-tablet/scripts/build-apk.sh
```

产物：

- `android-tablet/app/build/outputs/apk/debug/app-debug.apk`
- `/opt/cursor/artifacts/orasage-tablet-4x3-portrait-debug.apk`（脚本复制）

需要 JDK 17+ 与 Android SDK（脚本会写 `local.properties`，默认 `ANDROID_HOME=$HOME/android-sdk`）。

## 安装到平板

```bash
adb install -r /opt/cursor/artifacts/orasage-tablet-4x3-portrait-debug.apk
```

调试包 applicationId 为 `com.orasage.tablet.debug`。
