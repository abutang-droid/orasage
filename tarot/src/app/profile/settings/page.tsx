import { redirect } from "next/navigation"

const MAIN_SETTINGS = "https://orasage.com/zh-CN/profile/settings"

/** 旧路径重定向至 main 门户设置 */
export default function ProfileSettingsRedirect() {
  redirect(MAIN_SETTINGS)
}
