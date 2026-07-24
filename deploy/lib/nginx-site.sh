# Nginx site selection for parallel envs (orasage.com vs oricosmos.com).
# Usage (from deploy scripts):
#   DEPLOY_DIR=/opt/orasage
#   # shellcheck source=deploy/lib/nginx-site.sh
#   source "$DEPLOY_DIR/deploy/lib/nginx-site.sh"
#   install_nginx_site   # respects NGINX_SITE=orasage|oricosmos
#
# Default: orasage (production). OriCosmos VM must set NGINX_SITE=oricosmos.

NGINX_SITE="${NGINX_SITE:-orasage}"

nginx_apex_domain() {
  case "$NGINX_SITE" in
    oricosmos) echo "oricosmos.com" ;;
    *)         echo "orasage.com" ;;
  esac
}

nginx_conf_src() {
  local dir="${DEPLOY_DIR:-/opt/orasage}"
  echo "$dir/deploy/nginx/${NGINX_SITE}.conf"
}

nginx_bootstrap_src() {
  local dir="${DEPLOY_DIR:-/opt/orasage}"
  echo "$dir/deploy/nginx/${NGINX_SITE}-http-bootstrap.conf"
}

nginx_site_available() {
  echo "/etc/nginx/sites-available/${NGINX_SITE}"
}

# Install the selected site config. On oricosmos, disable orasage site to avoid
# pulling in missing /etc/letsencrypt/live/orasage.com certs.
# If full HTTPS conf fails nginx -t (no certs yet), fall back to HTTP bootstrap.
install_nginx_site() {
  local src bootstrap dest
  src="$(nginx_conf_src)"
  bootstrap="$(nginx_bootstrap_src)"
  dest="$(nginx_site_available)"

  if [ ! -f "$src" ] && [ ! -f "$bootstrap" ]; then
    echo "[nginx-site] no config for NGINX_SITE=$NGINX_SITE, skip"
    return 0
  fi

  echo "[nginx-site] installing site=$NGINX_SITE"

  # Avoid dual sites fighting over the same machine
  if [ "$NGINX_SITE" = "oricosmos" ]; then
    rm -f /etc/nginx/sites-enabled/orasage
  elif [ "$NGINX_SITE" = "orasage" ]; then
    rm -f /etc/nginx/sites-enabled/oricosmos
  fi
  rm -f /etc/nginx/sites-enabled/default

  if [ -f "$src" ]; then
    cp "$src" "$dest"
    ln -sf "$dest" "/etc/nginx/sites-enabled/${NGINX_SITE}"
    if nginx -t 2>/dev/null; then
      systemctl reload nginx
      echo "[nginx-site] loaded $src"
      return 0
    fi
    echo "[nginx-site] full conf failed nginx -t (certs missing?); trying bootstrap"
  fi

  if [ -f "$bootstrap" ]; then
    cp "$bootstrap" "$dest"
    ln -sf "$dest" "/etc/nginx/sites-enabled/${NGINX_SITE}"
    nginx -t
    systemctl reload nginx
    echo "[nginx-site] loaded bootstrap $bootstrap — run certbot, then re-deploy"
    return 0
  fi

  echo "[nginx-site] ERROR: cannot install nginx for $NGINX_SITE"
  return 1
}

nginx_verify_domains() {
  local apex
  apex="$(nginx_apex_domain)"
  echo "${apex}" "www.${apex}" "auth.${apex}" "shop.${apex}" "admin.${apex}" \
    "bazi.${apex}" "ziwei.${apex}" "tarot.${apex}" "cms.${apex}"
}
