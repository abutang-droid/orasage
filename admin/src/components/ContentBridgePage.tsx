import Link from 'next/link';

export function ContentBridgePage({
  title,
  description,
  href,
  links,
}: {
  title: string;
  description: string;
  href?: string;
  links?: Array<{ label: string; href: string }>;
}) {
  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </header>
      <section className="panel">
        <p className="muted" style={{ marginBottom: '1rem' }}>
          Phase A：内容控制面仍桥接到内部 CMS。Phase C 将替换为自研表单；第三方永不直接进入 Payload。
        </p>
        {href ? (
          <p>
            <a className="btn-primary" href={href}>
              打开编辑器 →
            </a>
          </p>
        ) : null}
        {links?.length ? (
          <ul style={{ margin: href ? '1rem 0 0' : 0, paddingLeft: '1.25rem' }}>
            {links.map((l) => (
              <li key={l.href} style={{ marginBottom: '0.5rem' }}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
