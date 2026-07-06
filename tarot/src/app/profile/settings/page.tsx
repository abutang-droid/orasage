import { redirect } from "next/navigation"

/** 应用设置已迁至 /settings，避免挂在旧版 /profile 用户中心路径下 */
export default function ProfileSettingsRedirect() {
  redirect("/settings")
}
