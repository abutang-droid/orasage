#!/usr/bin/env bash
# 从本地/Cloud Agent 远程部署 shop 到 VPS
# 用法:
#   SSH_PASSWORD='your-password' bash deploy/deploy-shop.sh
#   SSH_KEY=~/.ssh/id_rsa bash deploy/deploy-shop.sh

set -euo pipefail

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-}"
SSH_PASSWORD="${SSH_PASSWORD:-}"
BRANCH="${BRANCH:-cursor/shop-integration-9dd1}"

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

log "上传部署脚本..."
"${SCP_CMD[@]}" -P "$SSH_PORT" deploy/deploy-shop-on-vps.sh "${SSH_USER}@${SSH_HOST}:/tmp/deploy-shop-on-vps.sh"

log "在 VPS 上执行部署..."
"${SSH_CMD[@]}" -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" \
  "chmod +x /tmp/deploy-shop-on-vps.sh && BRANCH=$BRANCH bash /tmp/deploy-shop-on-vps.sh"

log "远程部署完成"
log "验证: curl -sI https://shop.orasage.com"
