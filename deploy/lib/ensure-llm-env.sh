#!/usr/bin/env bash
# Ensure an LLM API key is present for AI readings (bazi / ziwei / tarot).
# Source from deploy scripts after APP_DIR is known.
#
# Usage:
#   # shellcheck disable=SC1091
#   source "$DEPLOY_DIR/deploy/lib/ensure-llm-env.sh"
#   ensure_llm_api_key "$APP_DIR" || exit 1
#
# Escape hatch (deploy without AI intentionally):
#   ALLOW_MISSING_LLM=1

ensure_llm_api_key() {
  local app_dir="${1:?app_dir required}"
  local env_file="$app_dir/.env"
  local deploy_root="${DEPLOY_DIR:-$(cd "$(dirname "$app_dir")" && pwd)}"
  local name val src inherit_name inherit_val label

  touch "$env_file"

  _llm_first_key() {
    # prints: NAME=value  (first non-empty match)
    local file="$1" n v
    [ -f "$file" ] || return 1
    for n in DEEPSEEK_API_KEY OPENAI_API_KEY MANUS_API_KEY BUILT_IN_FORGE_API_KEY; do
      v=$(grep -E "^${n}=" "$file" 2>/dev/null | head -1 | cut -d= -f2- | tr -d '\r' || true)
      if [ -n "$v" ]; then
        printf '%s=%s' "$n" "$v"
        return 0
      fi
    done
    return 1
  }

  if ! _llm_first_key "$env_file" >/dev/null; then
    for src in \
      "$deploy_root/.env" \
      "$deploy_root/bazi/.env" \
      "$deploy_root/ziwei/.env" \
      "$deploy_root/tarot/.env"
    do
      [ "$src" = "$env_file" ] && continue
      if inherit_val=$(_llm_first_key "$src"); then
        inherit_name=${inherit_val%%=*}
        inherit_val=${inherit_val#*=}
        if grep -q "^${inherit_name}=" "$env_file" 2>/dev/null; then
          sed -i "s|^${inherit_name}=.*|${inherit_name}=${inherit_val}|" "$env_file"
        else
          echo "${inherit_name}=${inherit_val}" >> "$env_file"
        fi
        label=$(basename "$(dirname "$src")")
        [ "$src" = "$deploy_root/.env" ] && label="root"
        echo "[ensure-llm-env] inherited ${inherit_name} from ${label}/.env → $(basename "$app_dir")/.env"
        break
      fi
    done
  fi

  if ! _llm_first_key "$env_file" >/dev/null; then
    if [ "${ALLOW_MISSING_LLM:-0}" = "1" ]; then
      echo "[ensure-llm-env] WARNING: no LLM API key in $(basename "$app_dir")/.env (ALLOW_MISSING_LLM=1)"
      return 0
    fi
    echo "[ensure-llm-env] ERROR: AI readings require DEEPSEEK_API_KEY (or OPENAI_API_KEY / MANUS_API_KEY / BUILT_IN_FORGE_API_KEY)."
    echo "[ensure-llm-env] Set it in ${env_file} (or ${deploy_root}/.env), then re-run deploy / restart the service."
    echo "[ensure-llm-env] To deploy without AI intentionally: ALLOW_MISSING_LLM=1"
    return 1
  fi
  return 0
}
