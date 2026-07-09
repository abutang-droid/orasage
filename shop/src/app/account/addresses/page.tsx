'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@orasage/ui/button';
import {
  SHIPPING_COUNTRIES,
  type ShippingRecipient,
} from '../../../../../shared/shop-fulfillment/index';
import type { UserAddress } from '@/lib/addresses';

function emptyForm(): ShippingRecipient & { label?: string } {
  return {
    label: '',
    name: '',
    phone: '',
    countryCode: 'CN',
    province: '',
    city: '',
    address: '',
    postalCode: '',
    wristCm: '',
  };
}

export default function AddressBookPage() {
  const t = useTranslations('addresses');
  const ts = useTranslations('shipping');
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [form, setForm] = useState(emptyForm());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function countryLabel(code: string) {
    return ts(`countries.${code}` as 'countries.CN');
  }

  async function loadAddresses() {
    const res = await fetch('/api/addresses', { credentials: 'include' });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || t('loadFailed'));
    setAddresses(data.addresses ?? []);
  }

  useEffect(() => {
    void loadAddresses()
      .catch((err) => setError(err instanceof Error ? err.message : t('loadFailed')))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only load
  }, []);

  function startEdit(addr: UserAddress) {
    setEditingId(addr.id);
    setForm({
      label: addr.label ?? '',
      name: addr.name,
      phone: addr.phone,
      countryCode: addr.countryCode,
      province: addr.province ?? '',
      city: addr.city ?? '',
      address: addr.addressLine,
      postalCode: addr.postalCode ?? '',
      wristCm: addr.wristCm ?? '',
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      label: form.label || null,
      name: form.name,
      phone: form.phone,
      countryCode: form.countryCode ?? 'CN',
      province: form.province || null,
      city: form.city || null,
      addressLine: form.address,
      postalCode: form.postalCode || null,
      wristCm: form.wristCm || null,
      isDefault: addresses.length === 0,
    };
    try {
      const res = await fetch(
        editingId ? `/api/addresses/${editingId}` : '/api/addresses',
        {
          method: editingId ? 'PUT' : 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        },
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || ts('saveFailed'));
      setForm(emptyForm());
      setEditingId(null);
      await loadAddresses();
    } catch (err) {
      setError(err instanceof Error ? err.message : ts('saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(t('deleteConfirm'))) return;
    const res = await fetch(`/api/addresses/${id}`, { method: 'DELETE', credentials: 'include' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || t('deleteFailed'));
      return;
    }
    if (editingId === id) {
      setEditingId(null);
      setForm(emptyForm());
    }
    await loadAddresses();
  }

  if (loading) {
    return <main className="shop-page p-16 text-center text-sage-muted">{t('loading')}</main>;
  }

  return (
    <main className="shop-page safe-bottom mx-auto w-full max-w-md flex-1 py-8 px-4">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h1 className="font-serif text-2xl text-sage-primary">{t('title')}</h1>
        <Link href="/" className="text-sm text-sage-muted underline orasage-subpage-back-local">{t('backToShop')}</Link>
      </div>

      {addresses.length > 0 ? (
        <ul className="mb-8 space-y-3">
          {addresses.map((addr) => (
            <li key={addr.id} className="rounded-xl border border-sage-border bg-white p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-sage-primary">
                    {addr.label ? `${addr.label} · ` : ''}{addr.name}
                    {addr.isDefault ? <span className="ml-2 text-xs text-sage-muted">{t('default')}</span> : null}
                  </p>
                  <p className="mt-1 text-xs text-sage-muted">
                    {addr.phone} · {countryLabel(addr.countryCode)}
                  </p>
                  <p className="mt-1 text-xs text-sage-muted leading-relaxed">
                    {[addr.province, addr.city, addr.addressLine].filter(Boolean).join(' ')}
                  </p>
                </div>
                <div className="flex flex-col gap-2 text-xs">
                  <button type="button" className="text-sage-primary" onClick={() => startEdit(addr)}>{t('edit')}</button>
                  <button type="button" className="text-red-600" onClick={() => void handleDelete(addr.id)}>{t('delete')}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mb-6 text-sm text-sage-muted">{t('empty')}</p>
      )}

      <form className="shop-shipping-form" onSubmit={(e) => void handleSubmit(e)}>
        <h2 className="shop-shipping-title">{editingId ? t('editTitle') : t('addTitle')}</h2>
        <label className="shop-shipping-label">
          {t('labelOptional')}
          <input className="shop-shipping-input" value={form.label ?? ''} onChange={(e) => setForm({ ...form, label: e.target.value })} />
        </label>
        <label className="shop-shipping-label">
          {ts('name')}
          <input className="shop-shipping-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label className="shop-shipping-label">
          {ts('phone')}
          <input className="shop-shipping-input" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label className="shop-shipping-label">
          {ts('country')}
          <select className="shop-shipping-input" value={form.countryCode ?? 'CN'} onChange={(e) => setForm({ ...form, countryCode: e.target.value })}>
            {SHIPPING_COUNTRIES.map((c) => <option key={c.code} value={c.code}>{countryLabel(c.code)}</option>)}
          </select>
        </label>
        <label className="shop-shipping-label">
          {ts('province')}
          <input className="shop-shipping-input" value={form.province ?? ''} onChange={(e) => setForm({ ...form, province: e.target.value })} />
        </label>
        <label className="shop-shipping-label">
          {ts('city')}
          <input className="shop-shipping-input" value={form.city ?? ''} onChange={(e) => setForm({ ...form, city: e.target.value })} />
        </label>
        <label className="shop-shipping-label">
          {ts('address')}
          <textarea className="shop-shipping-textarea" required rows={3} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </label>
        <label className="shop-shipping-label">
          {t('postal')}
          <input className="shop-shipping-input" value={form.postalCode ?? ''} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} />
        </label>
        {error ? <p className="shop-shipping-error">{error}</p> : null}
        <Button type="submit" className="shop-shipping-submit w-full" disabled={saving} loading={saving}>
          {saving ? ts('saving') : editingId ? t('update') : t('add')}
        </Button>
      </form>
    </main>
  );
}
