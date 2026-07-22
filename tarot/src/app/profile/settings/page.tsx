import { redirect } from "next/navigation"
import { ORASAGE_URLS } from "@/lib/orasage-app-shell/config"

/** 旧路径重定向至 main 门户设置 */
export default function ProfileSettingsRedirect() {
  redirect(`${ORASAGE_URLS.main}/zh-CN/profile/settings`)
}
