import { redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { listCmsMedia } from '@/lib/cms-content-api';
import { resolveCmsMediaUrl } from '@/lib/cms-media-utils';
import { saveMediaAltAction, uploadMediaAction } from '@/app/content-actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import Link from 'next/link';

export default async function ContentMediaPage({
  searchParams,
}: {
  searchParams?: Promise<{ page?: string; saved?: string; err?: string }>;
}) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.media')) redirect('/');

  const sp = (await searchParams) ?? {};
  const pageNum = Math.max(1, Number(sp.page ?? 1) || 1);
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const { docs, totalDocs, totalPages, page } = await listCmsMedia(token, {
    page: pageNum,
    limit: 48,
  });

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>媒体库</h1>
        <p className="muted">
          上传与浏览 CMS 媒体（content.media）。共 {totalDocs} 个文件。
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          {decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <h2>上传</h2>
        <form action={uploadMediaAction} encType="multipart/form-data" className="form-grid">
          <label>
            文件
            <input type="file" name="file" required accept="image/*,video/mp4,video/webm" />
          </label>
          <label>
            替代文字（alt）
            <input name="alt" placeholder="可选" />
          </label>
          <AdminSubmitButton>上传</AdminSubmitButton>
        </form>
      </section>

      <section className="panel">
        <h2>文件列表</h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '1rem',
          }}
        >
          {docs.map((m) => {
            const url = resolveCmsMediaUrl(m);
            const isImage = (m.mimeType ?? '').startsWith('image/');
            return (
              <div key={m.id} style={{ borderTop: '1px solid var(--border, #ddd)', paddingTop: 8 }}>
                {url && isImage ? (
                  <img
                    src={url}
                    alt={m.alt ?? ''}
                    style={{ width: '100%', height: 120, objectFit: 'cover' }}
                  />
                ) : url ? (
                  <a href={url} target="_blank" rel="noreferrer" className="muted">
                    {m.mimeType || '文件'}
                  </a>
                ) : (
                  <p className="muted">无预览</p>
                )}
                <p style={{ margin: '0.35rem 0 0', fontSize: '0.85rem' }}>
                  <code>#{m.id}</code> {m.filename}
                </p>
                <form action={saveMediaAltAction} style={{ marginTop: 6 }}>
                  <input type="hidden" name="id" value={m.id} />
                  <input name="alt" defaultValue={m.alt ?? ''} placeholder="alt" />
                  <AdminSubmitButton size="sm">更新 alt</AdminSubmitButton>
                </form>
              </div>
            );
          })}
        </div>

        {totalPages > 1 ? (
          <p style={{ marginTop: '1rem' }}>
            {page > 1 ? (
              <Link href={`/content/media?page=${page - 1}`}>← 上一页</Link>
            ) : null}
            <span className="muted" style={{ margin: '0 0.75rem' }}>
              {page} / {totalPages}
            </span>
            {page < totalPages ? (
              <Link href={`/content/media?page=${page + 1}`}>下一页 →</Link>
            ) : null}
          </p>
        ) : null}
      </section>
    </div>
  );
}
