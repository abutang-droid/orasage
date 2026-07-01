#!/usr/bin/env bash
# 将 bazi / ziwei / tarot 三个独立仓库同步到 orasage monorepo 顶层目录。
# 用法:
#   bash scripts/sync-fortune-repos.sh          # clone 或 pull 全部
#   bash scripts/sync-fortune-repos.sh bazi     # 仅同步 bazi
#
# 仓库地址可通过环境变量覆盖（默认 abutang-droid GitHub 私有库）。

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

BAZI_REPO_URL="${BAZI_REPO_URL:-https://github.com/abutang-droid/bazi-calculator.git}"
ZIWEI_REPO_URL="${ZIWEI_REPO_URL:-https://github.com/abutang-droid/ziwei-doushu.git}"
TAROT_REPO_URL="${TAROT_REPO_URL:-https://github.com/abutang-droid/tarot-mind.git}"
BRANCH="${FORTUNE_REPO_BRANCH:-main}"

log() { echo "[sync-fortune] $*"; }

sync_one() {
  local name="$1"
  local url="$2"
  local dir="$ROOT/$name"

  if [ -d "$dir/.git" ]; then
    log "$name: git pull ($BRANCH)..."
    git -C "$dir" fetch --all --prune
    git -C "$dir" checkout "$BRANCH" 2>/dev/null || true
    git -C "$dir" pull --ff-only origin "$BRANCH"
  else
    if [ -d "$dir" ] && [ "$(ls -A "$dir" 2>/dev/null | wc -l)" -gt 0 ]; then
      log "$name: 目录 $dir 已存在且非 git 仓库，跳过（请手动清理后重试）"
      return 1
    fi
    log "$name: git clone $url → $dir"
    git clone --branch "$BRANCH" --depth 1 "$url" "$dir"
  fi

  # 链接共享 auth 包（若 App 有 package.json）
  if [ -f "$dir/package.json" ] && [ -f "$ROOT/packages/orasage-auth/package.json" ]; then
    if ! grep -q '@orasage/auth' "$dir/package.json" 2>/dev/null; then
      log "$name: 提示 — 在 package.json 添加 \"@orasage/auth\": \"file:../packages/orasage-auth\""
    fi
  fi
}

TARGET="${1:-all}"

case "$TARGET" in
  bazi)
    sync_one bazi "$BAZI_REPO_URL"
    ;;
  ziwei)
    sync_one ziwei "$ZIWEI_REPO_URL"
    ;;
  tarot)
    sync_one tarot "$TAROT_REPO_URL"
    ;;
  all)
    sync_one bazi "$BAZI_REPO_URL"
    sync_one ziwei "$ZIWEI_REPO_URL"
    sync_one tarot "$TAROT_REPO_URL"
    ;;
  *)
    log "未知目标: $TARGET（支持 bazi | ziwei | tarot | all）"
    exit 1
    ;;
esac

log "同步完成。下一步："
log "  1. 在各 App 接入 @orasage/auth（见 packages/orasage-auth/README.md）"
log "  2. 确认各 App 监听 127.0.0.1:3110/3111/3112 并提供 /health"
log "  3. DEPLOY_MODE=native bash deploy/remote-deploy-<app>.sh"
