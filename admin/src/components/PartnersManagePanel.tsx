'use client';

import { useState, useTransition } from 'react';
import {
  applyPartnerTemplateAction,
  createPartnerApiKeyAction,
  revokePartnerApiKeyAction,
  upsertPartnerAction,
} from '@/app/partners-actions';
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
}: {
  partners: AdminPartner[];
  platformSlug: string;
  templates: Template[];
  keysBySlug: Record<string, AdminPartnerApiKey[]>;
  auditsBySlug: Record<string, AdminConfigAuditLog[]>;
  isSuperAdmin: boolean;
}) {
  const [selected, setSelected] = useState(partners[0]?.slug ?? '');
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [rawNote, setRawNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const partner = partners.find((p) => p.slug === selected) ?? null;
  const keys = selected ? keysBySlug[selected] ?? [] : [];
  const audits = selected ? auditsBySlug[selected] ?? [] : [];

  function run(action: () => Promise<void>) {
    setError(null);
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

      <section className="panel">
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
                  暂无数据（请确认已跑 migration 0038）
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

      {isSuperAdmin ? (
        <>
          <section className="panel">
            <h2 style={{ fontSize: '1rem', marginTop: 0 }}>创建 / 更新合作方</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              可选交付模板（shop-only / tarot-only / full-apps）展开为{' '}
              <code>partner_modules</code>。Module API 契约见{' '}
              <code>docs/products/module-api-v1.md</code>。
            </p>
            <form
              action={(fd) =>
                run(async () => {
                  await upsertPartnerAction(fd);
                })
              }
              style={{ display: 'grid', gap: '0.5rem', maxWidth: 480 }}
            >
              <input
                name="slug"
                className="shipment-input"
                placeholder="slug（如 acme-shop）"
                required
              />
              <input name="name" className="shipment-input" placeholder="显示名称" required />
              <select name="template" className="shipment-input" defaultValue="">
                <option value="">自定义模块（稍后设置）</option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.id} — {t.modules.join(', ')}
                  </option>
                ))}
              </select>
              <select name="status" className="shipment-input" defaultValue="active">
                <option value="active">active</option>
                <option value="disabled">disabled</option>
              </select>
              <AdminSubmitButton type="submit" size="sm" disabled={pending}>
                保存合作方
              </AdminSubmitButton>
            </form>
          </section>

          {partner ? (
            <>
              <section className="panel">
                <h2 style={{ fontSize: '1rem', marginTop: 0 }}>
                  模块模板 · <code>{partner.slug}</code>
                </h2>
                <form
                  action={(fd) =>
                    run(async () => {
                      await applyPartnerTemplateAction(fd);
                    })
                  }
                  style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}
                >
                  <input type="hidden" name="slug" value={partner.slug} />
                  <select name="template" className="shipment-input" required defaultValue={templates[0]?.id}>
                    {templates.map((t) => (
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
                  明文 Key 仅创建时显示一次。调用基址{' '}
                  <code>/v1/partners/{'{partnerSlug}'}</code>。
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
        </>
      ) : null}
    </div>
  );
}
