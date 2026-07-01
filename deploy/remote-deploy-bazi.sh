#!/usr/bin/env bash
# 从本地/CI 远程部署 bazi 到 VPS
# 用法:
#   SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-bazi.sh
#   DEPLOY_MODE=proxy bash deploy/remote-deploy-bazi.sh
#   DEPLOY_MODE=native BAZI_REPO_URL=https://github.com/... bash deploy/remote-deploy-bazi.sh

set -euo pipefail

SSH_USER="${SSH_USER:-ubuntu}"
SSH_HOST="${SSH_HOST:-34.75.40.67}"
SSH_PORT="${SSH_PORT:-22}"
DEPLOY_MODE="${DEPLOY_MODE:-native}"
ORASAGE_REF="${ORASAGE_REF:-main}"
SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=20 -o BatchMode=yes"

log() { echo "[deploy-bazi] $*"; }

resolve_ssh_key_material() {
  if [ -n "${SSH_PRIVATE_KEY:-}" ]; then
    printf '%s' "$SSH_PRIVATE_KEY"
  elif [ -n "${VPS_SSH_KEY:-}" ]; then
    printf '%s' "$VPS_SSH_KEY"
  elif [ -n "${SSH_KEY:-}" ] && [ -f "${SSH_KEY}" ]; then
    cat "$SSH_KEY"
  elif [ -n "${SSH_KEY:-}" ] && grep -q 'BEGIN.*PRIVATE KEY' <<<"$SSH_KEY"; then
    printf '%s' "$SSH_KEY"
  else
    return 1
  fi
}

wait_for_ssh_secret() {
  local i=0
  while [ "$i" -lt 30 ]; do
    resolve_ssh_key_material >/dev/null 2>&1 && return 0
    sleep 1
    i=$((i + 1))
  done
  return 1
}

setup_ssh_key() {
  if [ -n "${SSH_KEY:-}" ] && [ -f "${SSH_KEY}" ]; then
    return
  fi

  wait_for_ssh_secret || true
  local key_material
  key_material="$(resolve_ssh_key_material)" || {
    log "ERROR: 未找到 SSH 私钥"
    log "  Cloud Agent: 在 Dashboard → Secrets 添加 SSH_PRIVATE_KEY（Runtime Secret）后重新启动 Agent"
    log "  GitHub Actions: 在仓库 Secrets 添加 SSH_PRIVATE_KEY"
    log "  CLOUD_AGENT_INJECTED_SECRET_NAMES=${CLOUD_AGENT_INJECTED_SECRET_NAMES:-unset}"
    exit 1
  }

  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
  printf '%s\n' "$key_material" | tr -d '\r' > ~/.ssh/deploy_key
  chmod 600 ~/.ssh/deploy_key
  if ! grep -q 'BEGIN.*PRIVATE KEY' ~/.ssh/deploy_key; then
    log "ERROR: SSH 私钥格式不正确，需包含 -----BEGIN ... PRIVATE KEY-----"
    exit 1
  fi
  SSH_KEY=~/.ssh/deploy_key
  log "SSH key loaded ($(wc -c < ~/.ssh/deploy_key) bytes)"
}

setup_ssh_key
ssh-keyscan -H "$SSH_HOST" >> ~/.ssh/known_hosts 2>/dev/null || true

if [ -n "${SSH_KEY:-}" ]; then
  SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

# 支持 GCP IAP 隧道（GitHub Actions 在防火墙限制时使用）
if [ -n "${GCP_IAP_PROXY_COMMAND:-}" ]; then
  SSH_OPTS="$SSH_OPTS -o ProxyCommand='$GCP_IAP_PROXY_COMMAND'"
fi

SSH="ssh $SSH_OPTS -p $SSH_PORT ${SSH_USER}@${SSH_HOST}"
SCP="scp $SSH_OPTS -P $SSH_PORT"

log "测试 SSH 连接 ${SSH_USER}@${SSH_HOST}..."
for attempt in 1 2 3; do
  if $SSH "echo 'SSH OK' && uname -a"; then
    break
  fi
  if [ "$attempt" -eq 3 ]; then
    log "ERROR: 无法 SSH 到 ${SSH_HOST}:${SSH_PORT}"
    exit 1
  fi
  log "SSH 连接失败，${attempt}/3 次重试..."
  sleep 5
done

# deploy-bazi.sh 会自行 clone/pull 完整 orasage 仓库到 VPS 上的 $DEPLOY_DIR，
# 这里只需把脚本本体传上去启动即可（native 模式不再依赖单独打包的 deploy/bazi 目录）。
log "上传 bazi 部署脚本..."
$SCP deploy/bazi/deploy-bazi.sh "${SSH_USER}@${SSH_HOST}:/tmp/deploy-bazi.sh"

log "在 VPS 上执行部署（模式: $DEPLOY_MODE）..."
$SSH "sudo DEPLOY_MODE='$DEPLOY_MODE' ORASAGE_REF='$ORASAGE_REF' BAZI_UPSTREAM_URL='${BAZI_UPSTREAM_URL:-https://api1.lilyfunnlove.com}' bash /tmp/deploy-bazi.sh"

log "远程部署完成"
log "验证: curl -sI https://bazi.orasage.com"
