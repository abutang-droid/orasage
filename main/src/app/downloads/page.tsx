export const metadata = {
  title: '安装 OraSage 平板版',
  description: '下载 Android 平板调试包。原网站各页面仍从 orasage.com 正常访问。',
  robots: { index: false, follow: false },
};

/** Install landing for the tablet APK. Served by Next so nginx alias cannot 500 this path. */
export default function TabletDownloadPage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        margin: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '"Noto Sans SC", system-ui, sans-serif',
        background: '#FAFAF8',
        color: '#1A1A1A',
        padding: '2rem',
      }}
    >
      <div style={{ maxWidth: '28rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.75rem' }}>OraSage 平板版</h1>
        <p style={{ lineHeight: 1.6, color: '#444' }}>
          Android 平板调试包。网站电脑版、手机版页面不受影响，仍从{' '}
          <a href="/zh-CN" style={{ color: '#1A1A1A' }}>
            orasage.com
          </a>{' '}
          打开。
        </p>
        <a
          href="/get-tablet.apk"
          style={{
            display: 'inline-block',
            marginTop: '1.5rem',
            padding: '0.9rem 1.4rem',
            background: '#1A1A1A',
            color: '#FAFAF8',
            textDecoration: 'none',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: '1.05rem',
          }}
        >
          下载并安装 APK
        </a>
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#777' }}>
          包名 com.orasage.tablet.debug
          <br />
          若系统提示未知来源，请允许本次安装
        </p>
      </div>
    </main>
  );
}
