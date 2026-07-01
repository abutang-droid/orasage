#!/usr/bin/env bash
# 从本地/Cloud Agent 远程部署 main + auth + shop + admin 到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/deploy-shop.sh
#   ORASAGE_REF=main bash deploy/deploy-shop.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/ssh-setup.sh"

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_PORT="${SSH_PORT:-22}"
BRANCH="${BRANCH:-${ORASAGE_REF:-main}}"

log() { echo "[deploy] $*"; }

setup_ssh_key || {
  if [ -z "${SSH_PASSWORD:-}" ]; then
    log "SSH 连接失败。请设置 SSH_PRIVATE_KEY、SSH_KEY 或 SSH_PASSWORD。"
    exit 1
  fi
}

if [ -n "${SSH_PASSWORD:-}" ] && [ ! -f "${SSH_KEY:-}" ]; then
  SSH_CMD=(sshpass -p "$SSH_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=15)
  SCP_CMD=(sshpass -p "$SSH_PASSWORD" scp -o StrictHostKeyChecking=no -o ConnectTimeout=15)
else
  configure_ssh_transport
  SSH_CMD=(ssh $SSH_OPTS)
  SCP_CMD=(scp $SSH_OPTS)
fi

log "测试 SSH 连接 ${SSH_USER}@${SSH_HOST}..."
if ! "${SSH_CMD[@]}" -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "echo SSH_OK"; then
  log "SSH 连接失败。"
  exit 1
fi

log "上传代码包..."
TMP_TAR="/tmp/orasage-shop-deploy-$$.tgz"
tar czf "$TMP_TAR" \
  --exclude='node_modules' --exclude='.next' --exclude='dist' --exclude='.git' \
  -C "$(dirname "$0")/.." main admin shop auth-service deploy
"${SCP_CMD[@]}" -P "$SSH_PORT" "$TMP_TAR" "${SSH_USER}@${SSH_HOST}:/tmp/orasage-shop-deploy.tgz"
rm -f "$TMP_TAR"

log "在 VPS 上解压并部署..."
"${SSH_CMD[@]}" -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" \
  "cd /opt/orasage && tar xzf /tmp/orasage-shop-deploy.tgz && ORASAGE_REF=$BRANCH BRANCH=$BRANCH bash deploy/deploy-shop-on-vps.sh"

log "远程部署完成"
log "验证: curl -sI https://shop.orasage.com"
