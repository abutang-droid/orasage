#!/usr/bin/env bash
# 在 VPS 本机下载紫微 51 万样本库（约 5.5GB）
#
# GCP 控制台 SSH 登录后直接执行：
#   sudo bash /opt/orasage/deploy/download-ziwei-samples-on-vps.sh
#   sudo bash /opt/orasage/deploy/download-ziwei-samples-on-vps.sh --extract
#
# 或从本地/Cloud Agent 远程触发：
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-download-ziwei-samples.sh
set -euo pipefail

DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
DATA_DIR="${ZIWEI_SAMPLES_DIR:-$DEPLOY_DIR/data/ziwei-samples}"
RELEASE_BASE="https://github.com/Renhuai123/ziwei-doushu/releases/download/v3.0-samples"
PARTS=(
  ziwei-samples-v3-part1.zip.001
  ziwei-samples-v3-part2.zip.002
  ziwei-samples-v3-part3.zip.003
)
LOG_FILE="$DATA_DIR/download.log"

EXTRACT=false
BG=false
for arg in "$@"; do
  case "$arg" in
    --extract) EXTRACT=true ;;
    --bg) BG=true ;;
    -h|--help)
      echo "Usage: bash download-ziwei-samples-on-vps.sh [--extract] [--bg]"
      exit 0
      ;;
  esac
done

log() { echo "[ziwei-samples] $*" | tee -a "$LOG_FILE"; }

run_download() {
  mkdir -p "$DATA_DIR"
  cd "$DATA_DIR"

  if ! command -v curl >/dev/null 2>&1; then
    log "installing curl..."
    sudo apt-get update -qq && sudo apt-get install -y -qq curl
  fi

  avail_gb="$(df -BG "$DATA_DIR" | awk 'NR==2 {gsub(/G/,"",$4); print $4}')"
  if [[ "${avail_gb:-0}" -lt 12 ]]; then
    log "WARN: free disk ${avail_gb}GB < 12GB recommended for download+extract"
  fi

  download() {
    local url="$1" out="$2"
    if [[ -f "$out" ]]; then
      log "[skip] $out ($(du -h "$out" | cut -f1))"
      return 0
    fi
    log "[download] $out"
    curl -fL --retry 8 --retry-delay 15 -C - -o "$out" "$url"
  }

  download "$RELEASE_BASE/SHA256SUMS.txt" SHA256SUMS.txt
  for part in "${PARTS[@]}"; do
    download "$RELEASE_BASE/$part" "$part"
  done

  if command -v sha256sum >/dev/null 2>&1; then
    log "[verify] sha256sum"
    sha256sum -c SHA256SUMS.txt
  fi

  if [[ "$EXTRACT" == true ]]; then
    COMBINED="ziwei-samples-toolkit-v3-full.zip"
    if [[ ! -f "$COMBINED" ]]; then
      log "[merge] cat parts -> $COMBINED"
      cat "${PARTS[0]}" "${PARTS[1]}" "${PARTS[2]}" > "$COMBINED"
    fi
    if ! command -v unzip >/dev/null 2>&1; then
      sudo apt-get install -y -qq unzip
    fi
    log "[extract] unzip $COMBINED (may take several minutes)"
    unzip -o "$COMBINED"
  fi

  log "[done] data at $DATA_DIR"
  ls -lh "$DATA_DIR"
}

if [[ "$BG" == true ]]; then
  mkdir -p "$DATA_DIR"
  nohup bash "$0" ${EXTRACT:+--extract} >> "$LOG_FILE" 2>&1 &
  echo "[ziwei-samples] background pid $! — tail -f $LOG_FILE"
  exit 0
fi

run_download
