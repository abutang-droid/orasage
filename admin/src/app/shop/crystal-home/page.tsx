import { getShopStaff, loginUrl } from '@/lib/auth';
import { getCrystalContent, getShopConfig, type CrystalContentMap } from '@/lib/api';
import { saveCrystalContentAction, saveShopLayoutAction } from '@/app/actions';
import { AdminSubmitButton } from '@/components/AdminButton';
import { redirect } from 'next/navigation';

const CRYSTAL_ROWS: Array<{ sku: string; element: string; name: string }> = [
  { sku: 'crystal-wood', element: '木', name: '绿幽灵能量手串' },
  { sku: 'crystal-fire', element: '火', name: '红玛瑙能量手串' },
  { sku: 'crystal-earth', element: '土', name: '黄水晶能量手串' },
  { sku: 'crystal-metal', element: '金', name: '白水晶能量手串' },
  { sku: 'crystal-water', element: '水', name: '黑曜石能量手串' },
];

export default async function CrystalHomePage({
  searchParams,
}: {
  searchParams?: Promise<{ saved?: string; save_err?: string }>;
}) {
  const admin = await getShopStaff();
  if (!admin) redirect(loginUrl());

  const sp = (await searchParams) ?? {};

  let content: CrystalContentMap = {};
  let homeLayout: 'legacy' | 'crystal_v1' = 'legacy';
  try {
    ({ content } = await getCrystalContent());
  } catch (err) {
    console.error('[admin/crystal-home]', err);
  }
  try {
    ({ homeLayout } = await getShopConfig());
  } catch (err) {
    console.error('[admin/crystal-home/config]', err);
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <h1>水晶专题首页</h1>
        <p className="muted">
          维护 shop.orasage.com 水晶专题布局（crystal_v1）的素材内容：情感短语、能量故事、
          关键词、佩戴收益与仪式；规格切换下方补充说明可选填。留空字段将回退至内置占位文案（补充说明除外）。商品价格与规格在
          「商品管理」维护；主图在 CMS「商品图」维护。
        </p>
      </header>

      {sp.saved ? (
        <p className="muted panel-notice">素材内容已保存，前台约 30 秒内生效。</p>
      ) : null}
      {sp.save_err ? (
        <p className="muted panel-notice panel-notice--error">
          保存失败：{decodeURIComponent(sp.save_err)}
        </p>
      ) : null}

      <section className="panel">
        <h2>当前首页布局</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          {homeLayout === 'crystal_v1'
            ? '✅ 线上正在使用「水晶专题」布局，下方素材实时生效。'
            : '⚠️ 线上仍是「经典目录」布局，下方素材已就绪但暂不展示。'}
        </p>
        <form action={saveShopLayoutAction} className="form-grid">
          <label className="full-width">
            切换布局
            <select name="homeLayout" defaultValue={homeLayout}>
              <option value="legacy">经典目录（全品类）</option>
              <option value="crystal_v1">水晶专题（五行主编排）</option>
            </select>
          </label>
          <AdminSubmitButton className="full-width">保存布局</AdminSubmitButton>
        </form>
      </section>

      <form action={saveCrystalContentAction}>
        {CRYSTAL_ROWS.map(({ sku, element, name }) => {
          const entry = content[sku];
          return (
            <section key={sku} className="panel">
              <h2>
                {element} · {name}
                <span className="muted" style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: '0.5rem' }}>
                  {sku} / {sku}-gift
                </span>
              </h2>
              <div className="form-grid">
                <label>
                  情感短语（主标题）
                  <input
                    name={`${sku}_tagline`}
                    defaultValue={entry?.tagline ?? ''}
                    maxLength={50}
                    placeholder="如：生长之境"
                  />
                </label>
                <label>
                  能量关键词（逗号分隔，最多 8 个）
                  <input
                    name={`${sku}_keywords`}
                    defaultValue={entry?.keywords?.join('，') ?? ''}
                    placeholder="如：招财，事业，生机"
                  />
                </label>
                <label className="full-width">
                  能量故事（1–2 段，前台引用块展示）
                  <textarea
                    name={`${sku}_story`}
                    defaultValue={entry?.story ?? ''}
                    rows={4}
                    maxLength={2000}
                  />
                </label>
                <label className="full-width">
                  佩戴收益（每行一条，最多 6 条）
                  <textarea
                    name={`${sku}_benefits`}
                    defaultValue={entry?.benefits?.join('\n') ?? ''}
                    rows={3}
                    maxLength={1200}
                  />
                </label>
                <label className="full-width">
                  佩戴仪式（一句话场景引导）
                  <textarea
                    name={`${sku}_ritual`}
                    defaultValue={entry?.ritual ?? ''}
                    rows={2}
                    maxLength={500}
                  />
                </label>
                <label className="full-width">
                  规格切换下方补充说明（选填，留空不展示）
                  <input
                    name={`${sku}_packNote`}
                    defaultValue={entry?.packNote ?? ''}
                    maxLength={200}
                    placeholder="如：礼盒含专属祝福卡，可代写赠言"
                  />
                </label>
              </div>
            </section>
          );
        })}

        <section className="panel">
          <AdminSubmitButton className="full-width">保存全部素材</AdminSubmitButton>
        </section>
      </form>
    </div>
  );
}
