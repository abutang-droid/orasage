#!/usr/bin/env bash
# 从本地/Cloud Agent 远程部署 main + auth + shop 到 VPS
# 用法:
#   SSH_PASSWORD='your-password' bash deploy/deploy-shop.sh
#   SSH_KEY=~/.ssh/id_rsa bash deploy/deploy-shop.sh

set -euo pipefail

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"
SSH_PASSWORD="${SSH_PASSWORD:-}"
BRANCH="${BRANCH:-main}"

SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=15"
if [ -n "$SSH_KEY" ]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

if [ -n "$SSH_PASSWORD" ]; then
  SSH_CMD=(sshpass -p "$SSH_PASSWORD" ssh $SSH_OPTS)
  SCP_CMD=(sshpass -p "$SSH_PASSWORD" scp $SSH_OPTS)
else
  SSH_OPTS="$SSH_OPTS -o BatchMode=yes"
  SSH_CMD=(ssh $SSH_OPTS)
  SCP_CMD=(scp $SSH_OPTS)
fi

log() { echo "[deploy] $*"; }

log "测试 SSH 连接 ${SSH_USER}@${SSH_HOST}..."
if ! "${SSH_CMD[@]}" -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "echo SSH_OK"; then
  echo "SSH 连接失败。请设置 SSH_PASSWORD 或 SSH_KEY 环境变量。"
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
  "cd /opt/orasage && tar xzf /tmp/orasage-shop-deploy.tgz && BRANCH=$BRANCH bash deploy/deploy-shop-on-vps.sh"

log "远程部署完成"
log "验证: curl -sI https://shop.orasage.com"
