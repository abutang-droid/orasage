'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  createSavedProfile,
  deleteSavedProfile,
  fetchSavedProfiles,
  type SavedProfile,
} from '@/lib/auth';

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function profileLabel(profile: SavedProfile, index: number): string {
  return profile.label?.trim() || LABELS[index] || `#${profile.id}`;
}

function formatBirth(p: SavedProfile): string {
  const parts = [p.birthYear, p.birthMonth, p.birthDay].filter(Boolean);
  if (parts.length === 0) return '—';
  const date = parts.join('-');
  const time = [p.birthHour, p.birthMinute].filter(Boolean).join(':');
  return time ? `${date} ${time}` : date;
}

export function ProfilesList() {
  const t = useTranslations('profile.profiles');
  const [profiles, setProfiles] = useState<SavedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [label, setLabel] = useState('');
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      setProfiles(await fetchSavedProfiles());
    } catch {
      setError(t('loadError'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      const created = await createSavedProfile({
        name: name.trim(),
        label: label.trim() || null,
      });
      setProfiles((prev) => [created, ...prev]);
      setName('');
      setLabel('');
      setShowForm(false);
    } catch {
      setError(t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm(t('deleteConfirm'))) return;
    try {
      await deleteSavedProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch {
      setError(t('deleteError'));
    }
  }

  if (loading) {
    return <p className="text-sm text-sage-muted">{t('loading')}</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-sage-muted">{t('desc')}</p>
        <button
          type="button"
          onClick={() => setShowForm(!showForm)}
          className="rounded-full border border-sage-gold/40 px-4 py-2 text-sm text-sage-gold hover:bg-sage-gold/10"
        >
          {showForm ? t('cancel') : t('add')}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="rounded-2xl border border-sage-border/60 bg-sage-card/30 p-4 space-y-3">
          <label className="block text-sm">
            <span className="text-sage-muted">{t('name')}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 w-full rounded-lg border border-sage-border bg-sage-bg px-3 py-2 text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="text-sage-muted">{t('label')}</span>
            <input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder={t('labelPlaceholder')}
              maxLength={50}
              className="mt-1 w-full rounded-lg border border-sage-border bg-sage-bg px-3 py-2 text-white"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-sage-gold/40 px-4 py-2 text-sm text-sage-gold disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
        </form>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      {profiles.length === 0 ? (
        <p className="text-sm text-sage-muted">{t('empty')}</p>
      ) : (
        <ul className="space-y-3">
          {profiles.map((p, i) => (
            <li
              key={p.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-sage-border/60 bg-sage-card/30 p-4"
            >
              <div>
                <p className="font-medium text-white">
                  <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-sage-purple/30 text-xs text-sage-gold">
                    {profileLabel(p, i)}
                  </span>
                  {p.name}
                </p>
                <p className="mt-1 text-sm text-sage-muted">
                  {formatBirth(p)}
                  {p.birthPlaceCity ? ` · ${p.birthPlaceCity}` : ''}
                  {p.sourceAppLabel ? ` · ${p.sourceAppLabel}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="text-sm text-sage-muted hover:text-red-300"
              >
                {t('delete')}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
