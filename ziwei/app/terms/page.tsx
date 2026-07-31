import { redirect } from 'next/navigation';

/** 统一跳转主站服务协议，避免紫微站独立文案分叉 */
export default function TermsRedirectPage() {
  redirect('https://orasage.com/zh-CN/terms');
}
