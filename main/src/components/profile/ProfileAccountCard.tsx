'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { logout, updateProfile } from '@/lib/auth';
import { externalUrls } from '@/lib/urls';
import { useProfileAuth } from './ProfileAuth';

export function ProfileAccountCard() {
  const t = useTranslations('profile');
  const { user, setUser } = useProfileAuth();
  if (!user) return null;

  const [nickname, setNickname] = useState(user.nickname);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const showDisplayId = !user.nickname?.trim();

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateProfile({ nickname: nickname.trim() });
      setUser(updated);
      setMessage(t('saved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : t('saveError'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    window.location.href = externalUrls.authLogin;
  }

  return (
    <section className="rounded-2xl border border-sage-border/60 bg-sage-card/40 p-5 sm:p-6">
      <h2 className="font-serif text-lg text-sage-gold">{t('accountTitle')}</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-sage-muted">{t('displayName')}</dt>
          <dd className="text-sage-primary">{user.displayName}</dd>
        </div>
        {showDisplayId && user.displayId && (
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-sage-muted">{t('displayId')}</dt>
            <dd className="font-mono text-sage-gold">{user.displayId}</dd>
          </div>
        )}
        <div className="flex flex-wrap gap-x-2">
          <dt className="text-sage-muted">{t('email')}</dt>
          <dd className="text-sage-primary">{user.email}</dd>
        </div>
      </dl>

      <form onSubmit={handleSave} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="text-sage-muted">{t('nickname')}</span>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-sage-border bg-sage-bg px-3 py-2 text-sage-primary outline-none focus:border-sage-gold/50"
            placeholder={t('nicknamePlaceholder')}
          />
        </label>
        {message && <p className="text-sm text-green-600">{message}</p>}
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-full border border-sage-gold/40 px-5 py-2 text-sm text-sage-gold transition hover:bg-sage-gold/10 disabled:opacity-50"
          >
            {saving ? t('saving') : t('save')}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="text-sm text-sage-muted underline-offset-2 hover:text-red-500 hover:underline"
          >
            {t('logout')}
          </button>
        </div>
      </form>
    </section>
  );
}
