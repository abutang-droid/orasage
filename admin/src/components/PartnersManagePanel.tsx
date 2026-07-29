'use client';

import { useState, useTransition } from 'react';
import {
  applyPartnerTemplateAction,
  createPartnerApiKeyAction,
  revokePartnerApiKeyAction,
  upsertPartnerAction,
} from '@/app/partners-actions';
import { PartnerModuleApiGuide } from '@/components/PartnerModuleApiGuide';
import { AdminSubmitButton } from '@/components/AdminButton';
import type {
  AdminConfigAuditLog,
  AdminPartner,
  AdminPartnerApiKey,
} from '@/lib/api';

type Template = { id: string; modules: string[] };

export function PartnersManagePanel({
  partners,
  platformSlug,
  templates,
  keysBySlug,
  auditsBySlug,
  isSuperAdmin,
  moduleApiBaseUrl,
}: {
  partners: AdminPartner[];
  platformSlug: string;
  templates: Template[];
  keysBySlug: Record<string, AdminPartnerApiKey[]>;
  auditsBySlug: Record<string, AdminConfigAuditLog[]>;
  isSuperAdmin: boolean;
  moduleApiBaseUrl: string;
}) {
  const [selected, setSelected] = useState(partners[0]?.slug ?? '');
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [rawNote, setRawNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const partner = partners.find((p) => p.slug === selected) ?? null;
  const keys = selected ? keysBySlug[selected] ?? [] : [];
  const audits = selected ? auditsBySlug[selected] ?? [] : [];

  function run(action: () => Promise<void>) {
    setError(null);
    setMessage(null);
    startTransition(() => {
      void action().catch((e: unknown) => {
        setError(e instanceof Error ? e.message : '操作失败');
      });
    });
  }

  return (
    <div style={{ display: 'grid', gap: '1.25rem' }}>
      {error ? (
        <p style={{ color: 'var(--destructive, #c00)', margin: 0 }}>{error}</p>
      ) : null}
      {message ? <p className="muted" style={{ margin: 0 }}>{message}</p> : null}

      {isSuperAdmin ? (
        <section className="panel" id="create-partner">
          <h2 style={{ fontSize: '1.1rem', marginTop: 0 }}>新建合作方（创建 slug）</h2>
          <p className="muted" style={{ marginTop: 0 }}>
            在此填写新的合作方 <code>slug</code>（对外 Module API 路径中的{' '}
            <code>{'{partnerSlug}'}</code>）。已存在的 slug 再次保存会更新名称/状态/模板。
          </p>
          <form
            action={(fd) =>
              run(async () => {
                await upsertPartnerAction(fd);
                const slug = String(fd.get('slug') ?? '')
                  .trim()
                  .toLowerCase();
                if (slug) setSelected(slug);
                setMessage(`已保存合作方 ${slug || ''}`.trim());
              })
            }
            style={{ display: 'grid', gap: '0.75rem', maxWidth: 520 }}
          >
            <label style={{ display: 'grid', gap: 4 }}>
              <span>
                slug <span className="muted">（必填，小写字母/数字/连字符）</span>
              </span>
              <input
                name="slug"
                className="shipment-input"
                placeholder="例如 acme-shop"
                pattern="[a-z0-9][a-z0-9-]{0,62}"
                title="小写字母或数字开头，仅含 a-z、0-9、-"
                required
                autoComplete="off"
              />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>显示名称</span>
              <input name="name" className="shipment-input" placeholder="例如 Acme 商城" required />
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>交付模板</span>
              <select name="template" className="shipment-input" defaultValue="shop-only">
                <option value="">自定义模块（稍后在下方设置）</option>
                {templates.length === 0 ? (
                  <>
                    <option value="shop-only">shop-only</option>
                    <option value="tarot-only">tarot-only</option>
                    <option value="full-apps">full-apps</option>
                  </>
                ) : (
                  templates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.id} — {t.modules.join(', ')}
                    </option>
                  ))
                )}
              </select>
            </label>
            <label style={{ display: 'grid', gap: 4 }}>
              <span>状态</span>
              <select name="status" className="shipment-input" defaultValue="active">
                <option value="active">active（可调用 API）</option>
                <option value="disabled">disabled（拒绝 API）</option>
              </select>
            </label>
            <div>
              <AdminSubmitButton type="submit" size="sm" disabled={pending}>
                创建 / 保存合作方
              </AdminSubmitButton>
            </div>
          </form>

          <details style={{ marginTop: '1.25rem' }}>
            <summary style={{ cursor: 'pointer', fontWeight: 600 }}>
              对外 Module API · 开户与调用规则（点击展开）
            </summary>
            <div style={{ marginTop: '0.75rem' }}>
              <PartnerModuleApiGuide
                baseUrl={moduleApiBaseUrl}
                exampleSlug={
                  partner?.slug && partner.slug !== platformSlug ? partner.slug : 'acme-shop'
                }
              />
            </div>
          </details>
        </section>
      ) : (
        <section className="panel">
          <p className="muted" style={{ margin: 0 }}>
            当前账号无权创建合作方 slug（需要平台超管 <code>role=admin</code>）。
            如需开通，请联系超管在本页创建。
          </p>
        </section>
      )}

      <section className="panel">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: '0.75rem',
            flexWrap: 'wrap',
            marginBottom: '0.5rem',
          }}
        >
          <h2 style={{ fontSize: '1rem', margin: 0 }}>已有合作方</h2>
          {isSuperAdmin ? (
            <a href="#create-partner" className="muted" style={{ fontSize: '0.9rem' }}>
              ↑ 去创建 slug
            </a>
          ) : null}
        </div>
        <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th align="left">slug</th>
              <th align="left">名称</th>
              <th align="left">状态</th>
              <th align="left">已开通模块</th>
              {isSuperAdmin ? <th align="left">操作</th> : null}
            </tr>
          </thead>
          <tbody>
            {partners.length === 0 ? (
              <tr>
                <td colSpan={isSuperAdmin ? 5 : 4} className="muted">
                  暂无数据。请先在上方「新建合作方」创建 slug（并确认已跑 migration 0038）。
                </td>
              </tr>
            ) : (
              partners.map((p) => (
                <tr key={p.slug}>
                  <td>
                    <code>{p.slug}</code>
                    {p.slug === platformSlug ? (
                      <span className="badge ok" style={{ marginLeft: 8 }}>
                        平台
                      </span>
                    ) : null}
                  </td>
                  <td>{p.name}</td>
                  <td>{p.status}</td>
                  <td className="muted" style={{ fontSize: '0.85rem' }}>
                    {p.modules.join(', ') || '—'}
                  </td>
                  {isSuperAdmin ? (
                    <td>
                      <button
                        type="button"
                        className="admin-link-btn"
                        onClick={() => setSelected(p.slug)}
                        style={{
                          fontWeight: selected === p.slug ? 700 : 400,
                          textDecoration: selected === p.slug ? 'underline' : 'none',
                        }}
                      >
                        管理
                      </button>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {isSuperAdmin && partner ? (
        <>
          <section className="panel">
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>
              模块模板 · <code>{partner.slug}</code>
            </h2>
            <form
              action={(fd) =>
                run(async () => {
                  await applyPartnerTemplateAction(fd);
                  setMessage(`已更新 ${partner.slug} 模块`);
                })
              }
              style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}
            >
              <input type="hidden" name="slug" value={partner.slug} />
              <select
                name="template"
                className="shipment-input"
                required
                defaultValue={templates[0]?.id ?? 'shop-only'}
              >
                {(templates.length
                  ? templates
                  : [
                      { id: 'shop-only', modules: [] },
                      { id: 'tarot-only', modules: [] },
                      { id: 'full-apps', modules: [] },
                    ]
                ).map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id}
                  </option>
                ))}
              </select>
              <AdminSubmitButton type="submit" size="sm" disabled={pending}>
                应用模板
              </AdminSubmitButton>
            </form>
          </section>

          <section className="panel">
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>Module API Keys</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              明文 Key 仅创建时显示一次。调用示例：
              <code style={{ display: 'block', marginTop: 4, wordBreak: 'break-all' }}>
                {`${moduleApiBaseUrl.replace(/\/$/, '')}/v1/partners/${partner.slug}/modules`}
              </code>
            </p>
            {rawKey ? (
              <div
                style={{
                  marginBottom: '0.75rem',
                  padding: '0.75rem',
                  background: 'var(--muted-bg, #f5f5f4)',
                  borderRadius: 6,
                }}
              >
                <div className="muted" style={{ marginBottom: 4 }}>
                  {rawNote}
                </div>
                <code style={{ wordBreak: 'break-all' }}>{rawKey}</code>
              </div>
            ) : null}
            <form
              action={(fd) =>
                run(async () => {
                  const result = await createPartnerApiKeyAction(fd);
                  setRawKey(result.raw);
                  setRawNote(result.note);
                })
              }
              style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}
            >
              <input type="hidden" name="slug" value={partner.slug} />
              <input
                name="name"
                className="shipment-input"
                placeholder="Key 备注名"
                defaultValue="default"
              />
              <AdminSubmitButton type="submit" size="sm" disabled={pending}>
                创建 API Key
              </AdminSubmitButton>
            </form>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">前缀</th>
                  <th align="left">名称</th>
                  <th align="left">状态</th>
                  <th align="left">scopes</th>
                  <th align="left" />
                </tr>
              </thead>
              <tbody>
                {keys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      尚无 Key
                    </td>
                  </tr>
                ) : (
                  keys.map((k) => (
                    <tr key={k.id}>
                      <td>
                        <code>{k.keyPrefix}…</code>
                      </td>
                      <td>{k.name}</td>
                      <td>{k.status}</td>
                      <td className="muted" style={{ fontSize: '0.8rem' }}>
                        {(k.scopes ?? []).join(', ') || '—'}
                      </td>
                      <td>
                        {k.status === 'active' ? (
                          <form
                            action={(fd) =>
                              run(async () => {
                                await revokePartnerApiKeyAction(fd);
                              })
                            }
                          >
                            <input type="hidden" name="slug" value={partner.slug} />
                            <input type="hidden" name="id" value={k.id} />
                            <AdminSubmitButton type="submit" size="sm" disabled={pending}>
                              吊销
                            </AdminSubmitButton>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>

          <section className="panel">
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>配置审计</h2>
            <table className="admin-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th align="left">时间</th>
                  <th align="left">动作</th>
                  <th align="left">模块</th>
                  <th align="left">操作者</th>
                  <th align="left">资源</th>
                </tr>
              </thead>
              <tbody>
                {audits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="muted">
                      暂无审计记录
                    </td>
                  </tr>
                ) : (
                  audits.map((log) => (
                    <tr key={log.id}>
                      <td className="muted" style={{ fontSize: '0.8rem' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleString() : '—'}
                      </td>
                      <td>
                        <code>{log.action}</code>
                      </td>
                      <td>{log.moduleKey ?? '—'}</td>
                      <td className="muted">
                        {log.actorType}
                        {log.actorId ? `:${log.actorId}` : ''}
                      </td>
                      <td className="muted" style={{ fontSize: '0.8rem' }}>
                        {[log.resourceType, log.resourceId].filter(Boolean).join(' / ') || '—'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </>
      ) : null}
    </div>
  );
}
