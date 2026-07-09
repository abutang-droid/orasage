import Link from 'next/link';
import type { AdminBillingSlot } from '@/lib/api';

type ProductBillingSlotsPanelProps = {
  sku: string;
  slots: AdminBillingSlot[];
};

export function ProductBillingSlotsPanel({ sku, slots }: ProductBillingSlotsPanelProps) {
  const refs = slots.filter((s) => s.sku === sku);

  if (refs.length === 0) {
    return (
      <div className="product-billing-slots-panel">
        <p className="muted">此 SKU 未被任何计费槽位引用。若设为「仅 App 计费」，可在应用计费中配置。</p>
        <Link href="/billing" className="admin-cms-link">
          打开计费槽位管理 →
        </Link>
      </div>
    );
  }

  const grouped = refs.reduce<Record<string, AdminBillingSlot[]>>((acc, row) => {
    const key = `${row.appSource}::${row.slotKey}`;
    acc[key] = acc[key] ?? [];
    acc[key].push(row);
    return acc;
  }, {});

  return (
    <div className="product-billing-slots-panel">
      <p className="muted">
        下架或改价前请确认：此 SKU 被 <strong>{refs.length}</strong> 个计费槽位引用。
      </p>
      <ul className="product-billing-slots-list">
        {Object.entries(grouped).map(([key, rows]) => {
          const [app, slotKey] = key.split('::');
          return (
            <li key={key} className="product-billing-slots-item">
              <code>{app}</code>
              <span className="product-billing-slots-sep">·</span>
              <code>{slotKey}</code>
              {rows.length > 1 ? (
                <span className="muted">（{rows.length} 行轮换）</span>
              ) : null}
              {!rows[0]?.active ? <span className="product-billing-slots-inactive">已停用</span> : null}
            </li>
          );
        })}
      </ul>
      <Link href="/billing" className="admin-cms-link">
        在计费槽位管理中编辑 →
      </Link>
    </div>
  );
}
