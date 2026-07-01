#!/usr/bin/env bash
# 共享 SSH 密钥加载逻辑（Cloud Agent / GitHub Actions / 本地）
# 用法: source deploy/lib/ssh-setup.sh && setup_ssh_key

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
    return 0
  fi

  wait_for_ssh_secret || true
  local key_material
  key_material="$(resolve_ssh_key_material)" || {
    echo "[ssh] ERROR: 未找到 SSH 私钥" >&2
    echo "[ssh]   Cloud Agent: Dashboard → Secrets 添加 SSH_PRIVATE_KEY（Runtime Secret）后重新启动 Agent" >&2
    echo "[ssh]   GitHub Actions: 仓库 Secrets 添加 SSH_PRIVATE_KEY" >&2
    echo "[ssh]   本地: SSH_KEY=~/.ssh/id_rsa bash deploy/remote-deploy-all.sh" >&2
    return 1
  }

  mkdir -p ~/.ssh
  chmod 700 ~/.ssh
  printf '%s\n' "$key_material" | tr -d '\r' > ~/.ssh/deploy_key
  chmod 600 ~/.ssh/deploy_key
  if ! grep -q 'BEGIN.*PRIVATE KEY' ~/.ssh/deploy_key; then
    echo "[ssh] ERROR: SSH 私钥格式不正确，需包含 -----BEGIN ... PRIVATE KEY-----" >&2
    return 1
  fi
  SSH_KEY=~/.ssh/deploy_key
  echo "[ssh] key loaded ($(wc -c < ~/.ssh/deploy_key) bytes)"
  return 0
}

configure_ssh_transport() {
  SSH_USER="${SSH_USER:-ubuntu}"
  SSH_HOST="${SSH_HOST:-34.75.40.67}"
  SSH_PORT="${SSH_PORT:-22}"
  SSH_OPTS="-o StrictHostKeyChecking=no -o ConnectTimeout=20 -o BatchMode=yes"

  if [ -n "${SSH_KEY:-}" ]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
  fi

  if [ -n "${GCP_IAP_PROXY_COMMAND:-}" ]; then
    SSH_OPTS="$SSH_OPTS -o ProxyCommand='$GCP_IAP_PROXY_COMMAND'"
  fi

  ssh-keyscan -H "$SSH_HOST" >> ~/.ssh/known_hosts 2>/dev/null || true
}

test_ssh_connection() {
  local max_attempts="${1:-3}"
  local attempt
  configure_ssh_transport
  for attempt in $(seq 1 "$max_attempts"); do
    if ssh $SSH_OPTS -p "$SSH_PORT" "${SSH_USER}@${SSH_HOST}" "echo SSH_OK"; then
      return 0
    fi
    if [ "$attempt" -eq "$max_attempts" ]; then
      echo "[ssh] ERROR: 无法 SSH 到 ${SSH_HOST}:${SSH_PORT}" >&2
      return 1
    fi
    echo "[ssh] 连接失败，${attempt}/${max_attempts} 次重试..."
    sleep 5
  done
}
