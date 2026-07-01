#!/usr/bin/env bash
# 紫微完全自托管 — VPS 一键引导脚本
# 在 VPS 上执行: curl -fsSL ... | sudo bash
# 或: sudo bash bootstrap-native.sh
#
# 前置: gh auth login  或  export GITHUB_TOKEN=ghp_xxx

set -euo pipefail

ORASAGE_REF="${ORASAGE_REF:-cursor/deploy-ziwei-1ddb}"
ZIWEI_REPO="abutang-droid/ziwei-doushu"
DEPLOY_DIR="/opt/orasage"

log() { echo "[bootstrap] $*"; }

[ "$(id -u)" -eq 0 ] || { log "请 sudo 运行"; exit 1; }

# ── 依赖 ─────────────────────────────────────────────────────
apt-get update -qq
apt-get install -y -qq git curl
if ! command -v docker >/dev/null 2>&1; then
  apt-get install -y -qq docker.io docker-compose-plugin
  systemctl enable --now docker
fi
if ! command -v gh >/dev/null 2>&1; then
  curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg 2>/dev/null
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
    > /etc/apt/sources.list.d/github-cli.list
  apt-get update -qq && apt-get install -y -qq gh
fi

# ── 检查 GitHub 认证 ─────────────────────────────────────────
if [ -z "${GITHUB_TOKEN:-}" ] && ! gh auth status >/dev/null 2>&1; then
  log "请先登录 GitHub（私有仓库需要）:"
  log "  gh auth login"
  log "或: export GITHUB_TOKEN=ghp_xxx && sudo -E bash $0"
  exit 1
fi

# ── 拉取 orasage 部署配置 ──────────────────────────────────────
log "拉取 orasage 部署配置..."
mkdir -p "$DEPLOY_DIR"
if [ -d "$DEPLOY_DIR/.git" ]; then
  git -C "$DEPLOY_DIR" fetch --all --prune
  git -C "$DEPLOY_DIR" checkout "$ORASAGE_REF" 2>/dev/null || git -C "$DEPLOY_DIR" checkout main
  git -C "$DEPLOY_DIR" pull --ff-only || true
else
  gh repo clone abutang-droid/orasage "$DEPLOY_DIR" -- --branch "$ORASAGE_REF" --depth 1
fi

# ── 环境变量 ─────────────────────────────────────────────────
mkdir -p "$DEPLOY_DIR/ziwei"
if [ ! -f "$DEPLOY_DIR/ziwei/.env" ]; then
  cp "$DEPLOY_DIR/deploy/ziwei/.env.example" "$DEPLOY_DIR/ziwei/.env"
  log "已创建 $DEPLOY_DIR/ziwei/.env — 部署前请编辑 GEMINI_API_KEY / JWT_SECRET / 数据库密码"
  log "按 Enter 继续（或 Ctrl+C 先编辑 .env）..."
  read -r
fi

# ── 执行 native 部署 ───────────────────────────────────────────
export GITHUB_TOKEN="${GITHUB_TOKEN:-}"
export ZIWEI_REPO_URL="https://github.com/abutang-droid/ziwei-doushu.git"
bash "$DEPLOY_DIR/deploy/ziwei/deploy-native-ziwei.sh"
