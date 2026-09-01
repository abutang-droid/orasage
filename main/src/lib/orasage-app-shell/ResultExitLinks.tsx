'use client';

type ResultExitLinksProps = {
  locale?: string;
  /** Optional reading id for analytics attribution */
  readingId?: string | null;
  className?: string;
};

function isZh(locale?: string) {
  return Boolean(locale && (locale === 'zh-CN' || locale === 'zh-TW' || locale.startsWith('zh')));
}

/**
 * Post-result exit zone (doc 20 §4) — Insights / Me / Home.
 * Emits `cta_result_exit` CustomEvent for analytics wiring.
 */
export function ResultExitLinks({ locale = 'en', readingId = null, className = '' }: ResultExitLinksProps) {
  const zh = isZh(locale);
  const lang = zh ? 'zh-CN' : 'en';
  const base = `https://orasage.com/${lang}`;
  const items = [
    {
      id: 'insights' as const,
      href: `${base}/insights/day-master`,
      label: zh ? '看看你的日主是什么意思' : 'What does your Day Master mean?',
    },
    {
      id: 'profile' as const,
      href: `${base}/profile`,
      label: zh ? '把这次测算存到账户' : 'Save this reading to your account',
    },
    {
      id: 'home' as const,
      href: base,
      label: zh ? '← 返回 OraSage 首页' : '← Back to OraSage home',
    },
  ];

  const onClick = (exitId: string) => {
    try {
      window.dispatchEvent(
        new CustomEvent('cta_result_exit', {
          detail: { exitId, readingId, locale },
        }),
      );
    } catch {
      /* ignore */
    }
  };

  return (
    <nav
      className={`orasage-result-exit ${className}`.trim()}
      aria-label={zh ? '结果页出口' : 'Result exits'}
    >
      <p className="orasage-result-exit-title">
        {zh ? '接下来可以…' : 'Where to go next'}
      </p>
      <ul className="orasage-result-exit-list">
        {items.map((item) => (
          <li key={item.id}>
            <a href={item.href} onClick={() => onClick(item.id)}>
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
