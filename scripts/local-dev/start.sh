#!/usr/bin/env bash
# 在 tmux 中启动全部 8 个 App（开发模式）
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
TMUX_CONF="${TMUX_CONF:-/exec-daemon/tmux.portal.conf}"
SESSION="orasage-local"

if ! command -v tmux >/dev/null 2>&1; then
  echo "tmux 未安装，请先: sudo apt-get install -y tmux"
  exit 1
fi

# 确保数据库在跑
if command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo pg_ctlcluster 16 main start 2>/dev/null || true
fi
sudo service mariadb start 2>/dev/null || true

if [ ! -f "$ROOT/auth-service/.env" ]; then
  echo "未找到 .env，先运行: bash scripts/local-dev/setup.sh"
  exit 1
fi

tmux -f "$TMUX_CONF" has-session -t "=$SESSION" 2>/dev/null && {
  echo "会话 $SESSION 已在运行。附加: tmux -f $TMUX_CONF attach -t $SESSION"
  exit 0
}

start_window() {
  local name="$1"
  local dir="$2"
  local cmd="$3"
  if tmux -f "$TMUX_CONF" list-windows -t "=$SESSION" -F '#{window_name}' 2>/dev/null | grep -qx "$name"; then
    return
  fi
  if ! tmux -f "$TMUX_CONF" has-session -t "=$SESSION" 2>/dev/null; then
    tmux -f "$TMUX_CONF" new-session -d -s "$SESSION" -c "$dir" -n "$name" -- bash -lc "$cmd"
  else
    tmux -f "$TMUX_CONF" new-window -t "=$SESSION" -c "$dir" -n "$name" -- bash -lc "$cmd"
  fi
}

start_window auth     "$ROOT/auth-service" "npm run dev"
start_window shop     "$ROOT/shop"         "npm run dev"
start_window main     "$ROOT/main"         "npm run dev"
start_window admin    "$ROOT/admin"        "npm run dev"
start_window cms      "$ROOT/cms"          "npm run dev"
start_window bazi     "$ROOT/bazi"         "pnpm dev"
start_window ziwei    "$ROOT/ziwei"        "npm run dev"
start_window tarot    "$ROOT/tarot"        "npm run dev -- -p 3112"

echo "已启动 tmux 会话: $SESSION"
echo ""
echo "  附加查看: tmux -f $TMUX_CONF attach -t $SESSION"
echo "  停止全部: bash scripts/local-dev/stop.sh"
echo ""
echo "端口:"
echo "  main  http://localhost:3100"
echo "  auth  http://localhost:3101"
echo "  shop  http://localhost:3102"
echo "  admin http://localhost:3103"
echo "  bazi  http://localhost:3110"
echo "  ziwei http://localhost:3111"
echo "  tarot http://localhost:3112"
echo "  cms   http://localhost:3120/admin"
