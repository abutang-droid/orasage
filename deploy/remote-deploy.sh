#!/usr/bin/env bash
# 从本地/CI 远程部署到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa SSH_USER=ubuntu SSH_HOST=34.75.40.67 bash deploy/remote-deploy.sh
#
# 或设置环境变量后执行:
#   export SSH_USER=ubuntu
#   export SSH_HOST=34.75.40.67
#   export SSH_KEY=/path/to/private_key
#   bash deploy/remote-deploy.sh

set -euo pipefail

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_KEY="${SSH_KEY:-}"
SSH_PORT="${SSH_PORT:-22}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=10"

if [ -n "$SSH_KEY" ]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

SSH="ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS -P $SSH_PORT"

log() { echo "[deploy] $*"; }

log "测试 SSH 连接 ${SSH_USER}@${SSH_HOST}..."
$SSH "echo 'SSH OK' && uname -a"

log "上传部署脚本..."
$SCP deploy/vps-setup.sh "${SSH_USER}@${SSH_HOST}:/tmp/vps-setup.sh"
$SCP deploy/nginx/orasage.conf "${SSH_USER}@${SSH_HOST}:/tmp/orasage.conf"

log "在 VPS 上执行部署..."
$SSH "sudo bash /tmp/vps-setup.sh"

log "远程部署完成"
log "验证: curl -I https://auth.orasage.com/health"
