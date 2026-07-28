import { redirect } from 'next/navigation';

/** 统一跳转主站隐私政策，避免紫微站独立文案分叉 */
export default function PrivacyRedirectPage() {
  redirect('https://orasage.com/zh-CN/privacy');
}
