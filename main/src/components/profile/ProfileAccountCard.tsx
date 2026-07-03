'use client';

import { Alert, AlertDescription, Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from '@orasage/ui';
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
    <Card>
      <CardHeader className="pb-4">
        <CardTitle>{t('accountTitle')}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <dl className="space-y-3 text-sm">
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">{t('displayName')}</dt>
            <dd className="font-medium text-foreground">{user.displayName}</dd>
          </div>
          {showDisplayId && user.displayId && (
            <div className="flex flex-wrap gap-x-2">
              <dt className="text-muted-foreground">{t('displayId')}</dt>
              <dd className="font-mono text-primary">{user.displayId}</dd>
            </div>
          )}
          <div className="flex flex-wrap gap-x-2">
            <dt className="text-muted-foreground">{t('email')}</dt>
            <dd className="text-foreground">{user.email}</dd>
          </div>
        </dl>

        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-nickname">{t('nickname')}</Label>
            <Input
              id="profile-nickname"
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={100}
              placeholder={t('nicknamePlaceholder')}
            />
          </div>
          {message && (
            <Alert variant="info">
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={saving} loading={saving}>
              {saving ? t('saving') : t('save')}
            </Button>
            <Button type="button" variant="ghost" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
              {t('logout')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
