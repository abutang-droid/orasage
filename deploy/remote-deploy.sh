#!/usr/bin/env bash
# 从本地/CI 远程部署到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa SSH_USER=ubuntu SSH_HOST=34.75.40.67 bash deploy/remote-deploy.sh
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy.sh ziwei   # 仅部署紫微
#
# 或设置环境变量后执行:
#   export SSH_USER=ubuntu
#   export SSH_HOST=34.75.40.67
#   export SSH_KEY=/path/to/private_key
#   bash deploy/remote-deploy.sh [all|ziwei|nginx]

set -euo pipefail

TARGET="${1:-all}"

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

log "上传部署文件..."
$SCP deploy/vps-setup.sh "${SSH_USER}@${SSH_HOST}:/tmp/vps-setup.sh"
$SCP deploy/nginx/orasage.conf "${SSH_USER}@${SSH_HOST}:/tmp/orasage.conf"
$SCP -r deploy/ziwei "${SSH_USER}@${SSH_HOST}:/tmp/orasage-ziwei"

log "在 VPS 上拉取最新配置..."
$SSH "sudo mkdir -p /opt/orasage && \
  if [ -d /opt/orasage/.git ]; then git -C /opt/orasage pull --ff-only; else git clone https://github.com/abutang-droid/orasage.git /opt/orasage; fi"

case "$TARGET" in
  ziwei)
    log "部署紫微应用..."
    $SSH "sudo DEPLOY_MODE=proxy ORASAGE_REF='${ORASAGE_REF:-main}' bash /tmp/orasage-ziwei/deploy-ziwei.sh"
    ;;
  nginx)
    log "仅更新 Nginx 配置..."
    $SSH "sudo cp /tmp/orasage.conf /etc/nginx/sites-available/orasage && \
      sudo ln -sf /etc/nginx/sites-available/orasage /etc/nginx/sites-enabled/orasage && \
      sudo nginx -t && sudo systemctl reload nginx"
    ;;
  all|*)
    log "执行完整 VPS 部署..."
    $SSH "sudo bash /tmp/vps-setup.sh"
    log "部署紫微应用..."
    $SSH "sudo DEPLOY_MODE=proxy ORASAGE_REF='${ORASAGE_REF:-main}' bash /tmp/orasage-ziwei/deploy-ziwei.sh"
    ;;
esac

log "远程部署完成"
log "验证: curl -I https://ziwei.orasage.com"
