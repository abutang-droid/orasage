import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAdminToken, getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { getCmsFaith } from '@/lib/cms-content-api';
import { deleteFaithAction, saveFaithAction } from '@/app/content-actions';
import { AdminSubmitButton } from '@/components/AdminButton';

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ saved?: string; err?: string }>;
};

export default async function ContentFaithEditPage({ params, searchParams }: PageProps) {
  const user = await getAdminUser();
  if (!user) redirect(loginUrl());
  if (!staffCan(user, 'content.faith')) redirect('/');

  const { id: raw } = await params;
  const id = Number(raw);
  if (!Number.isFinite(id) || id <= 0) notFound();

  const sp = (await searchParams) ?? {};
  const token = await getAdminToken();
  if (!token) redirect(loginUrl());

  const faith = await getCmsFaith(id, token);
  if (!faith) notFound();

  return (
    <div className="admin-page">
      <header className="page-header">
        <p className="muted">
          <Link href="/content/faith">← 信仰列表</Link>
        </p>
        <h1>编辑信仰 · {faith.nameZh}</h1>
        <p className="muted">
          代码 <code>{faith.code}</code>
        </p>
      </header>

      {sp.saved === 'ok' ? <p className="muted panel-notice">已保存。</p> : null}
      {sp.err ? (
        <p className="muted panel-notice panel-notice--error">
          保存失败：{decodeURIComponent(sp.err)}
        </p>
      ) : null}

      <section className="panel">
        <form action={saveFaithAction} className="form-grid">
          <input type="hidden" name="id" value={faith.id} />
          <label>
            代码 ID
            <input name="code" required defaultValue={faith.code} />
          </label>
          <label>
            中文名
            <input name="nameZh" required defaultValue={faith.nameZh} />
          </label>
          <label>
            英文名
            <input name="nameEn" required defaultValue={faith.nameEn} />
          </label>
          <label>
            表情
            <input name="emoji" defaultValue={faith.emoji ?? ''} />
          </label>
          <label>
            排序
            <input name="rank" type="number" defaultValue={faith.rank ?? 50} />
          </label>
          <label>
            信众（百万）
            <input
              name="adherentsM"
              type="number"
              step="any"
              defaultValue={faith.adherentsM ?? ''}
            />
          </label>
          <label>
            朝拜朝向
            <select name="worshipFacing" defaultValue={faith.worshipFacing ?? 'none'}>
              <option value="none">无特定朝向</option>
              <option value="qibla">麦加（Qibla）</option>
              <option value="east">东方</option>
              <option value="jerusalem">耶路撒冷</option>
            </select>
          </label>
          <label>
            发布状态
            <select name="wpStatus" defaultValue={faith.wpStatus ?? 'publish'}>
              <option value="publish">已发布</option>
              <option value="draft">草稿</option>
            </select>
          </label>
          <label>
            朝向文案（中）
            <input name="facingLabelZh" defaultValue={faith.facingLabelZh ?? ''} />
          </label>
          <label>
            朝向文案（英）
            <input name="facingLabelEn" defaultValue={faith.facingLabelEn ?? ''} />
          </label>
          <label>
            方位角
            <input
              name="facingBearing"
              type="number"
              min={0}
              max={360}
              defaultValue={faith.facingBearing ?? ''}
            />
          </label>
          <AdminSubmitButton>保存</AdminSubmitButton>
        </form>
      </section>

      <section className="panel panel--danger">
        <h2>删除</h2>
        <form action={deleteFaithAction}>
          <input type="hidden" name="id" value={faith.id} />
          <AdminSubmitButton variant="destructive">删除此信仰</AdminSubmitButton>
        </form>
      </section>
    </div>
  );
}
