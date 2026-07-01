#!/usr/bin/env bash
# 从本地/CI 远程部署 ziwei 到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-ziwei.sh
#   DEPLOY_MODE=proxy bash deploy/remote-deploy-ziwei.sh
#   DEPLOY_MODE=native ZIWEI_REPO_URL=https://github.com/... bash deploy/remote-deploy-ziwei.sh

set -euo pipefail

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_KEY="${SSH_KEY:-}"
SSH_PORT="${SSH_PORT:-22}"
DEPLOY_MODE="${DEPLOY_MODE:-proxy}"
ORASAGE_REF="${ORASAGE_REF:-cursor/deploy-ziwei-1ddb}"
ZIWEI_REPO_URL="${ZIWEI_REPO_URL:-https://github.com/abutang-droid/ziwei-doushu.git}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=15 -o BatchMode=yes"

if [ -n "$SSH_KEY" ]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

SSH="ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS -P $SSH_PORT"

log() { echo "[deploy-ziwei] $*"; }

log "测试 SSH 连接 ${SSH_USER}@${SSH_HOST}..."
$SSH "echo 'SSH OK' && uname -a"

log "上传 ziwei 部署文件..."
$SCP -r deploy/ziwei "${SSH_USER}@${SSH_HOST}:/tmp/orasage-ziwei"
$SCP deploy/nginx/orasage-live.conf "${SSH_USER}@${SSH_HOST}:/tmp/orasage-live.conf"

log "在 VPS 上执行部署（模式: $DEPLOY_MODE）..."
$SSH "sudo DEPLOY_MODE='$DEPLOY_MODE' ORASAGE_REF='$ORASAGE_REF' ZIWEI_REPO_URL='${ZIWEI_REPO_URL:-}' ZIWEI_UPSTREAM_URL='${ZIWEI_UPSTREAM_URL:-https://api2.lilyfunnlove.com}' bash /tmp/orasage-ziwei/deploy-ziwei.sh"

log "远程部署完成"
log "验证: curl -s https://ziwei.orasage.com/health"
