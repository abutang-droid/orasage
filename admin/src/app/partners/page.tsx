import { PartnersManagePanel } from '@/components/PartnersManagePanel';
import {
  listPartnerApiKeys,
  listPartnerAuditLogs,
  listPartnerTemplates,
  listPartners,
  type AdminConfigAuditLog,
  type AdminPartnerApiKey,
} from '@/lib/api';
import { getAdminUser, loginUrl, staffCan } from '@/lib/auth';
import { ENV } from '@/lib/env';
import { redirect } from 'next/navigation';

export default async function PartnersPage() {
  const user = await getAdminUser();
  if (!user || !staffCan(user, 'platform.partners')) redirect(loginUrl());

  const isSuperAdmin = user.role === 'admin';
  let partners: Awaited<ReturnType<typeof listPartners>>['partners'] = [];
  let platformSlug = 'orasage';
  let currentPartnerId = user.partnerId ?? 'orasage';
  let templates: Array<{ id: string; modules: string[] }> = [];
  const keysBySlug: Record<string, AdminPartnerApiKey[]> = {};
  const auditsBySlug: Record<string, AdminConfigAuditLog[]> = {};

  try {
    const data = await listPartners();
    partners = data.partners;
    platformSlug = data.platformSlug;
    currentPartnerId = data.currentPartnerId;
  } catch (err) {
    console.error('[admin/partners]', err);
  }

  if (isSuperAdmin) {
    try {
      const tpl = await listPartnerTemplates();
      templates = tpl.templates;
    } catch (err) {
      console.error('[admin/partners] templates', err);
    }
    await Promise.all(
      partners.map(async (p) => {
        try {
          const [keys, audits] = await Promise.all([
            listPartnerApiKeys(p.slug),
            listPartnerAuditLogs(p.slug, 30),
          ]);
          keysBySlug[p.slug] = keys.keys;
          auditsBySlug[p.slug] = audits.logs;
        } catch (err) {
          console.error(`[admin/partners] detail ${p.slug}`, err);
          keysBySlug[p.slug] = [];
          auditsBySlug[p.slug] = [];
        }
      }),
    );
  }

  return (
    <div className="admin-page">
      <header className="page-header">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1 style={{ marginBottom: '0.35rem' }}>合作方</h1>
            <p className="muted" style={{ margin: 0 }}>
              多租户：平台自营 slug 固定为 <code>{platformSlug}</code>。
              当前会话 partner：<code>{currentPartnerId}</code>。
              对外 Module API：<code>{ENV.authUrl}</code>。
            </p>
          </div>
          {isSuperAdmin ? (
            <a
              href="#create-partner"
              className="admin-submit-btn admin-submit-btn--primary admin-submit-btn--sm"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
            >
              新建合作方 / 创建 slug
            </a>
          ) : null}
        </div>
      </header>
      <PartnersManagePanel
        partners={partners}
        platformSlug={platformSlug}
        templates={templates}
        keysBySlug={keysBySlug}
        auditsBySlug={auditsBySlug}
        isSuperAdmin={isSuperAdmin}
        moduleApiBaseUrl={ENV.authUrl}
      />
    </div>
  );
}
