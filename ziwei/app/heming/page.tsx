import { redirect } from 'next/navigation';

/** 旧合盘独立页 → 统一入口 /chart 双人模式 */
export default function HemingRedirectPage() {
  redirect('/chart?mode=heming');
}
