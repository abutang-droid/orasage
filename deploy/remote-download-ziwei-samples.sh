#!/usr/bin/env bash
# 从本地/Cloud Agent SSH 到 VPS，在后台下载紫微样本库
#
# 用法:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-download-ziwei-samples.sh
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-download-ziwei-samples.sh --extract
set -euo pipefail

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_PORT="${SSH_PORT:-22}"
DEPLOY_DIR="${DEPLOY_DIR:-/opt/orasage}"
ORASAGE_REF="${ORASAGE_REF:-main}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=30 -o BatchMode=yes"
EXTRACT_FLAG=""
for arg in "$@"; do
  [[ "$arg" == "--extract" ]] && EXTRACT_FLAG="--extract"
done

log() { echo "[remote-ziwei-samples] $*"; }

resolve_ssh_key_material() {
  if [ -n "${SSH_PRIVATE_KEY:-}" ]; then printf '%s' "$SSH_PRIVATE_KEY"
  elif [ -n "${VPS_SSH_KEY:-}" ]; then printf '%s' "$VPS_SSH_KEY"
  elif [ -n "${SSH_KEY:-}" ] && [ -f "${SSH_KEY}" ]; then cat "$SSH_KEY"
  elif [ -n "${SSH_KEY:-}" ] && grep -q 'BEGIN.*PRIVATE KEY' <<<"$SSH_KEY"; then printf '%s' "$SSH_KEY"
  else return 1; fi
}

setup_ssh_key() {
  if [ -n "${SSH_KEY:-}" ] && [ -f "${SSH_KEY}" ]; then return; fi
  local key_material
  key_material="$(resolve_ssh_key_material)" || {
    log "ERROR: 未找到 SSH 私钥。请在 Cursor Secrets 配置 SSH_PRIVATE_KEY，或本机指定 SSH_KEY=~/.ssh/id_rsa"
    exit 1
  }
  mkdir -p ~/.ssh && chmod 700 ~/.ssh
  printf '%s\n' "$key_material" | tr -d '\r' > ~/.ssh/deploy_key
  chmod 600 ~/.ssh/deploy_key
  SSH_KEY=~/.ssh/deploy_key
}

setup_ssh_key
ssh-keyscan -H "$SSH_HOST" >> ~/.ssh/known_hosts 2>/dev/null || true
[[ -n "${SSH_KEY:-}" ]] && SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
SSH="ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS -P $SSH_PORT"

log "测试 SSH ${SSH_USER}@${SSH_HOST}..."
$SSH "echo 'SSH OK' && df -h $DEPLOY_DIR 2>/dev/null || df -h /"

log "同步部署脚本到 VPS..."
$SCP deploy/download-ziwei-samples-on-vps.sh "${SSH_USER}@${SSH_HOST}:/tmp/download-ziwei-samples-on-vps.sh"

log "确保 /opt/orasage 存在并拉取最新脚本（可选）..."
$SSH "sudo mkdir -p $DEPLOY_DIR/data/ziwei-samples && sudo chown -R ubuntu:ubuntu $DEPLOY_DIR/data 2>/dev/null || true"
$SSH "if [ -d $DEPLOY_DIR/.git ]; then cd $DEPLOY_DIR && git fetch origin $ORASAGE_REF && git checkout $ORASAGE_REF && git pull origin $ORASAGE_REF; fi" || true

log "在 VPS 后台启动下载（约 5.5GB，需 30 分钟～数小时）..."
$SSH "chmod +x /tmp/download-ziwei-samples-on-vps.sh && sudo DEPLOY_DIR='$DEPLOY_DIR' bash /tmp/download-ziwei-samples-on-vps.sh --bg $EXTRACT_FLAG"

log "查看进度:"
log "  ssh ${SSH_USER}@${SSH_HOST} 'tail -f $DEPLOY_DIR/data/ziwei-samples/download.log'"
log "  ssh ${SSH_USER}@${SSH_HOST} 'ls -lh $DEPLOY_DIR/data/ziwei-samples/'"
