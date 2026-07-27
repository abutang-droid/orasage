# Derive public URLs / cookie domain from NGINX_SITE (orasage | oricosmos).
# Source after NGINX_SITE is set:
#   source "$DEPLOY_DIR/deploy/lib/site-env.sh"
#   apply_site_env

apply_site_env() {
  local site="${NGINX_SITE:-orasage}"
  local apex="orasage.com"
  case "$site" in
    oricosmos) apex="oricosmos.com" ;;
    orasage|*) apex="orasage.com" ;;
  esac

  export SITE_APEX="$apex"
  export NEXT_PUBLIC_SITE_APEX="$apex"
  export VITE_SITE_APEX="$apex"

  export APP_URL="https://${apex}"
  export NEXT_PUBLIC_APP_URL="https://${apex}"

  export AUTH_URL="https://auth.${apex}"
  export NEXT_PUBLIC_AUTH_URL="https://auth.${apex}"
  export VITE_AUTH_URL="https://auth.${apex}"

  export SHOP_URL="https://shop.${apex}"
  export NEXT_PUBLIC_SHOP_URL="https://shop.${apex}"
  export VITE_SHOP_URL="https://shop.${apex}"

  export ADMIN_URL="https://admin.${apex}"
  export NEXT_PUBLIC_ADMIN_URL="https://admin.${apex}"

  export BAZI_URL="https://bazi.${apex}"
  export BAZI_PUBLIC_URL="https://bazi.${apex}"
  export VITE_BAZI_URL="https://bazi.${apex}"

  export ZIWEI_URL="https://ziwei.${apex}"
  export NEXT_PUBLIC_SITE_URL_ZIWEI="https://ziwei.${apex}"

  export TAROT_URL="https://tarot.${apex}"
  export NEXT_PUBLIC_SITE_URL_TAROT="https://tarot.${apex}"

  export CMS_PUBLIC_URL="https://admin.${apex}/cms"
  export NEXT_PUBLIC_CMS_URL="https://admin.${apex}/cms"
  export VITE_CMS_PUBLIC_URL="https://admin.${apex}/cms"

  export COOKIE_DOMAIN=".${apex}"
  export JWT_COOKIE_DOMAIN=".${apex}"

  echo "[site-env] NGINX_SITE=$site SITE_APEX=$apex APP_URL=$APP_URL COOKIE_DOMAIN=$COOKIE_DOMAIN"
}
