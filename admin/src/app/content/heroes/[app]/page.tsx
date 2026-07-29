import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import {
  getCmsHeroGlobal,
  HERO_APP_LABELS,
  isHeroAppId,
} from '@/lib/cms-content-api';
import { resolveCmsMediaUrl } from '@/lib/cms-media-utils';
import { saveHeroGlobalAction } from '@/app/content-actions';
import { AdminSubmitButton } from '@/components/AdminButton';

type PageProps = {
  params: Promise<{ app: string }>;
  searchParams?: Promise<{ saved?: string; err?: string }>;
};

export default async function ContentHeroEditPage({ params, searchParams }: PageProps) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.heroes')) redirect('/');

  const { app: raw } = await params;
  if (!isHeroAppId(raw)) notFound();
  const app = raw;
  const sp = (await searchParams) ?? {};
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const doc = await getCmsHeroGlobal(app, token);
  const imageUrl = resolveCmsMediaUrl(doc?.heroImage);
  const videoUrl = resolveCmsMediaUrl(doc?.heroVideo);
  const imageId =
    typeof doc?.heroImage === 'number' ? doc.heroImage : doc?.heroImage?.id ?? null;
  const videoId =
    typeof doc?.heroVideo === 'number' ? doc.heroVideo : doc?.heroVideo?.id ?? null;

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted">
          <Link href="/content/heroes">← 各站 Hero</Link>
        </p>
        <h1>Hero · {HERO_APP_LABELS[app]}</h1>
        <p className="muted">展示模式决定必填项；图片/视频可只展示媒体。</p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          保存失败：{decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <form action={saveHeroGlobalAction} encType="multipart/form-data" className="form-grid">
          <input type="hidden" name="app" value={app} />

          <label className="checkbox-label">
            <input name="enabled" type="checkbox" defaultChecked={doc?.enabled !== false} />
            启用 Hero
          </label>

          <label>
            展示模式
            <select name="displayMode" defaultValue={doc?.displayMode ?? 'text'}>
              <option value="text">纯文字</option>
              <option value="image">图片</option>
              <option value="video">视频</option>
            </select>
          </label>

          <label>
            眉标
            <input name="eyebrow" defaultValue={doc?.eyebrow ?? ''} />
          </label>
          <label>
            主标题
            <input name="headline" defaultValue={doc?.headline ?? ''} />
          </label>
          <label className="full-width">
            副标题
            <textarea name="subtitle" rows={2} defaultValue={doc?.subtitle ?? ''} />
          </label>
          <label className="full-width">
            补充正文
            <textarea name="bodyText" rows={3} defaultValue={doc?.bodyText ?? ''} />
          </label>

          <div className="full-width" style={{ marginTop: '0.5rem' }}>
            <h3 className="product-content-subhead">Hero 图片</h3>
            {imageUrl ? (
              <p className="muted" style={{ marginBottom: '0.5rem' }}>
                当前：
                <img src={imageUrl} alt="" style={{ maxHeight: 96, display: 'block', marginTop: 8 }} />
                {imageId ? <code> media#{imageId}</code> : null}
              </p>
            ) : (
              <p className="muted">尚未设置图片</p>
            )}
            <label>
              上传新图片
              <input type="file" name="heroImageFile" accept="image/*" />
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="heroImageClear" /> 清除已有图片
            </label>
          </div>

          <div className="full-width">
            <h3 className="product-content-subhead">Hero 视频</h3>
            {videoUrl ? (
              <p className="muted">
                当前上传：<a href={videoUrl} target="_blank" rel="noreferrer">{videoUrl}</a>
                {videoId ? <code> media#{videoId}</code> : null}
              </p>
            ) : null}
            <label>
              上传视频
              <input type="file" name="heroVideoFile" accept="video/mp4,video/webm" />
            </label>
            <label>
              或外部视频 URL
              <input name="videoExternalUrl" defaultValue={doc?.videoExternalUrl ?? ''} />
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="videoAutoplay"
                defaultChecked={doc?.videoAutoplay !== false}
              />
              静音自动播放
            </label>
            <label className="checkbox-label">
              <input type="checkbox" name="heroVideoClear" /> 清除已上传视频
            </label>
          </div>

          <AdminSubmitButton>保存 Hero</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
