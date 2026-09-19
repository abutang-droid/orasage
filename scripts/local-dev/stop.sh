#!/usr/bin/env bash
set -euo pipefail
TMUX_CONF="${TMUX_CONF:-/exec-daemon/tmux.portal.conf}"
SESSION="orasage-local"
if tmux -f "$TMUX_CONF" has-session -t "=$SESSION" 2>/dev/null; then
  tmux -f "$TMUX_CONF" kill-session -t "=$SESSION"
  echo "已停止 $SESSION"
else
  echo "会话 $SESSION 不存在"
fi
