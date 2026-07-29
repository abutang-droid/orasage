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
        <h1>合作方</h1>
        <p className="muted">
          多租户：平台自营 slug 固定为 <code>{platformSlug}</code>。
          当前会话 partner：<code>{currentPartnerId}</code>。
          超管可用 API 查询参数 <code>?partner=</code> 切换作用域。
          对外 Module API 基址：<code>{ENV.authUrl}</code>。
        </p>
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
