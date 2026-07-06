#!/usr/bin/env bash
# 从 Renhuai123/ziwei-doushu Release 下载 51 万样本库（约 5.5GB，三卷分片）
# 数据目录默认：仓库根目录 data/ziwei-samples/（已 .gitignore，勿提交 Git）
#
# 用法（在仓库根目录）：
#   bash scripts/ziwei-samples/download.sh
#   bash scripts/ziwei-samples/download.sh --extract   # 下载后合并并解压
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DATA_DIR="${ZIWEI_SAMPLES_DIR:-$REPO_ROOT/data/ziwei-samples}"
RELEASE_BASE="https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples"
PARTS=(
  ziwei-samples-v3-part1.zip.001
  ziwei-samples-v3-part2.zip.002
  ziwei-samples-v3-part3.zip.003
)

EXTRACT=false
for arg in "$@"; do
  case "$arg" in
    --extract) EXTRACT=true ;;
    -h|--help)
      echo "Usage: bash scripts/ziwei-samples/download.sh [--extract]"
      exit 0
      ;;
  esac
done

mkdir -p "$DATA_DIR"
cd "$DATA_DIR"

if ! command -v curl >/dev/null 2>&1 && ! command -v wget >/dev/null 2>&1; then
  echo "[error] need curl or wget" >&2
  exit 1
fi

download() {
  local url="$1" out="$2"
  if [[ -f "$out" ]]; then
    echo "[skip] $out already exists"
    return 0
  fi
  echo "[download] $out"
  if command -v curl >/dev/null 2>&1; then
    curl -fL --retry 5 --retry-delay 10 -C - -o "$out" "$url"
  else
    wget -c -O "$out" "$url"
  fi
}

download "$RELEASE_BASE/SHA256SUMS.txt" SHA256SUMS.txt
for part in "${PARTS[@]}"; do
  download "$RELEASE_BASE/$part" "$part"
done

if command -v sha256sum >/dev/null 2>&1; then
  echo "[verify] sha256sum"
  sha256sum -c SHA256SUMS.txt
elif command -v shasum >/dev/null 2>&1; then
  echo "[verify] shasum (macOS)"
  shasum -a 256 -c SHA256SUMS.txt
else
  echo "[warn] no sha256 tool; skip checksum"
fi

if [[ "$EXTRACT" == true ]]; then
  COMBINED="ziwei-samples-toolkit-v3-full.zip"
  if [[ ! -f "$COMBINED" ]]; then
    echo "[merge] cat parts -> $COMBINED"
    cat "${PARTS[0]}" "${PARTS[1]}" "${PARTS[2]}" > "$COMBINED"
  fi
  if command -v unzip >/dev/null 2>&1; then
    echo "[extract] unzip $COMBINED"
    unzip -o "$COMBINED"
  else
    echo "[warn] unzip not found; merge done at $DATA_DIR/$COMBINED"
  fi
fi

echo "[done] samples in $DATA_DIR"
ls -lh "$DATA_DIR"
