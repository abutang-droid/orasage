# OraSage Android 平板壳（1280×1024 面板（竖屏 1024×1280） · 完整版）

面向 **Android 11+ / 短边 ≥480dp 的 1280×1024 面板（竖屏 1024×1280）平板** 的完整壳：

- 左侧原生导航：**首页 / 八字 / 紫微 / 塔罗 / 商城 / 我的**（不依赖网页链接）
- 八字等子域留在同一个 WebView；支持 `window.open` / `target=_blank`
- 锁定竖屏；包名 `com.orasage.tablet.debug`（调试包）


## 在线下载 / 直接安装

平板浏览器打开（文件名无 `-`）：

https://cdn.jsdelivr.net/gh/abutang-droid/orasage@cursor/android-tablet-apk-46a9/android-tablet/releases/orasagetablet.apk

备用：

- https://raw.githubusercontent.com/abutang-droid/orasage/cursor/android-tablet-apk-46a9/android-tablet/releases/orasagetablet.apk
- https://orasage.com/orasagetablet.apk（需源站 nginx / 门户静态路由就绪）

包名：`com.orasage.tablet.debug`。需允许「未知来源」安装。

源站发布：`bash deploy/publish-tablet-apk.sh`


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
