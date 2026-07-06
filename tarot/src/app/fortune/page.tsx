import { redirect } from 'next/navigation';

/** @deprecated 旧日运页已合并至 /daily-fortune */
export default function FortunePage() {
  redirect('/daily-fortune');
}
