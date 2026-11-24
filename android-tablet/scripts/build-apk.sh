#!/usr/bin/env bash
# Build the 4:3 portrait tablet debug APK and copy it to artifacts.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
APP_DIR="$ROOT/android-tablet"
ARTIFACT_DIR="${ARTIFACT_DIR:-/opt/cursor/artifacts}"
ANDROID_HOME="${ANDROID_HOME:-${HOME}/android-sdk}"

if [ ! -d "$ANDROID_HOME/platforms/android-34" ]; then
  echo "Android SDK platform 34 missing under $ANDROID_HOME" >&2
  exit 1
fi

export ANDROID_HOME
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

cat > "$APP_DIR/local.properties" <<EOF
sdk.dir=${ANDROID_HOME}
EOF

cd "$APP_DIR"

if [ ! -f ./gradlew ]; then
  echo "Bootstrapping Gradle wrapper..."
  gradle_ver="8.7"
  tmp="$(mktemp -d)"
  curl -fsSL "https://services.gradle.org/distributions/gradle-${gradle_ver}-bin.zip" -o "$tmp/gradle.zip"
  unzip -q "$tmp/gradle.zip" -d "$tmp"
  "$tmp/gradle-${gradle_ver}/bin/gradle" wrapper --gradle-version "$gradle_ver"
  rm -rf "$tmp"
fi

chmod +x ./gradlew
./gradlew --no-daemon assembleDebug

apk="$APP_DIR/app/build/outputs/apk/debug/app-debug.apk"
mkdir -p "$ARTIFACT_DIR"
cp -f "$apk" "$ARTIFACT_DIR/orasage-tablet-4x3-portrait-debug.apk"
ls -lh "$apk" "$ARTIFACT_DIR/orasage-tablet-4x3-portrait-debug.apk"
echo "APK_READY=$ARTIFACT_DIR/orasage-tablet-4x3-portrait-debug.apk"
