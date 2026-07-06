'use client';

import { Card, CardContent } from '@orasage/ui';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useProfileAuth } from './ProfileAuth';

export function ProfileIdentitySummary() {
  const t = useTranslations('profile');
  const { user } = useProfileAuth();
  if (!user) return null;

  return (
    <Card>
      <CardContent className="flex min-h-[72px] items-center justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{user.displayName}</p>
          <p className="mt-0.5 truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
        <Link
          href="/profile/settings"
          className="shrink-0 text-sm text-primary transition-colors hover:text-primary/80"
        >
          {t('manageAccount')}
        </Link>
      </CardContent>
    </Card>
  );
}
