import type { Metadata } from 'next';
import { Link } from '@/i18n/navigation';

export const metadata: Metadata = {
  title: '安装 OraSage 平板版',
  description: '下载 Android 平板调试包。原网站各页面仍从 orasage.com 正常访问。',
  robots: { index: false, follow: false },
};

/** Install landing inside the locale tree so original Header/nav still wrap it. */
export default function TabletDownloadPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center px-6 py-16">
      <div className="max-w-md text-center">
        <h1 className="text-2xl font-semibold tracking-tight">OraSage 平板版</h1>
        <p className="mt-3 leading-relaxed text-muted-foreground">
          Android 平板调试包。网站电脑版、手机版页面不受影响，仍从首页打开。
        </p>
        <a
          href="/get-tablet.apk"
          className="mt-6 inline-block rounded-lg bg-foreground px-5 py-3 text-base font-semibold text-background"
        >
          下载并安装 APK
        </a>
        <p className="mt-4 text-sm text-muted-foreground">
          包名 com.orasage.tablet.debug
          <br />
          若系统提示未知来源，请允许本次安装
        </p>
        <p className="mt-6 text-sm">
          <Link href="/" className="underline underline-offset-4">
            返回原网站首页
          </Link>
        </p>
      </div>
    </main>
  );
}
