'use client';

import { Alert, AlertDescription, Badge, Button, Card, CardContent, Input, Label } from '@orasage/ui';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  createSavedProfile,
  deleteSavedProfile,
  fetchSavedProfiles,
  type SavedProfile,
} from '@/lib/auth';
import { ProfileListSkeleton } from './ProfileListSkeleton';

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
    return <ProfileListSkeleton rows={2} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">{t('desc')}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? t('cancel') : t('add')}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-4 p-4 sm:p-5">
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="profile-name">{t('name')}</Label>
                <Input id="profile-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="profile-label">{t('label')}</Label>
                <Input
                  id="profile-label"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder={t('labelPlaceholder')}
                  maxLength={50}
                />
              </div>
              <Button type="submit" disabled={saving} loading={saving} size="sm">
                {saving ? t('saving') : t('save')}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {profiles.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t('empty')}</p>
      ) : (
        <ul className="space-y-3">
          {profiles.map((p, i) => (
            <li key={p.id}>
              <Card>
                <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4 sm:p-5">
                  <div>
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <Badge variant="secondary" className="size-6 justify-center rounded-full p-0">
                        {profileLabel(p, i)}
                      </Badge>
                      {p.name}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {formatBirth(p)}
                      {p.birthPlaceCity ? ` · ${p.birthPlaceCity}` : ''}
                      {p.sourceAppLabel ? ` · ${p.sourceAppLabel}` : ''}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(p.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    {t('delete')}
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
