import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { getCmsPage } from '@/lib/cms-content-api';
import { deletePageAction, savePageMetaAction } from '@/app/content-actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { CMS_BRIDGE } from '@/lib/content-bridge';

const APP_SOURCES = [
  { value: 'daozang', label: '道藏精选' },
  { value: 'famous', label: '名人案例' },
  { value: 'main', label: '主站通用' },
  { value: 'bazi', label: '八字' },
  { value: 'ziwei', label: '紫微' },
  { value: 'tarot', label: '塔罗' },
  { value: 'shop', label: '商城' },
] as const;

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; err?: string }>;
};

export default async function ContentPageEditPage({ params, searchParams }: PageProps) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.pages')) redirect('/');

  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const sp = (await searchParams) ?? {};
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const page = await getCmsPage(id, token);
  if (!page) notFound();

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted">
          <Link href="/content/pages">← 页面列表</Link>
        </p>
        <h1>编辑页面 · {page.title}</h1>
        <p className="muted">
          slug <code>{page.slug}</code>
          {user.role === 'admin' ? (
            <>
              {' · '}
              <a href={`${CMS_BRIDGE.pages}/${page.id}`}>内部 CMS（Lexical）→</a>
            </>
          ) : null}
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          保存失败：{decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <form action={savePageMetaAction} className="form-grid">
          <input type="hidden" name="id" value={page.id} />
          <label>
            标题
            <input name="title" required defaultValue={page.title} />
          </label>
          <label>
            slug
            <input name="slug" required defaultValue={page.slug} />
          </label>
          <label>
            发布栏目
            <select name="appSource" defaultValue={page.appSource ?? 'main'}>
              {APP_SOURCES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            状态
            <select name="wpStatus" defaultValue={page.wpStatus ?? 'publish'}>
              <option value="publish">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </label>
          <label>
            道藏分类
            <input
              name="daozangCategory"
              defaultValue={page.daozangCategory ?? ''}
              placeholder="仅道藏栏目"
            />
          </label>
          <label>
            类内排序
            <input
              name="sortWeight"
              type="number"
              defaultValue={page.sortWeight ?? ''}
            />
          </label>
          <label>
            道藏卷次
            <input name="daozangVolume" defaultValue={page.daozangVolume ?? ''} />
          </label>
          <label className="full-width">
            摘要
            <textarea name="excerpt" rows={2} defaultValue={page.excerpt ?? ''} />
          </label>
          <label className="full-width">
            HTML 正文（legacyHtml · 道藏/名人案例主字段）
            <textarea name="legacyHtml" rows={16} defaultValue={page.legacyHtml ?? ''} />
          </label>
          <p className="muted full-width">
            新写 Lexical 富文本请由平台超管在内部 CMS 编辑；合作方与内容运营使用本页 HTML/元数据即可。
          </p>
          <AdminSubmitButton>保存</AdminSubmitButton>
        </form>
      </section>

      <section className="panel panel--danger">
        <h2>删除</h2>
        <form action={deletePageAction}>
          <input type="hidden" name="id" value={page.id} />
          <AdminSubmitButton variant="destructive">删除此页面</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
