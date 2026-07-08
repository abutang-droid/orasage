'use client';

import { Card } from '@orasage/ui';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { useProfileAuth } from './ProfileAuth';
import { ProfileIdentitySummary } from './ProfileIdentitySummary';
import { ProfileLoginCard } from './ProfileLoginCard';
import { BlessingMeritCard } from './BlessingMeritCard';
import { ProfileDataCards } from './ProfileDataCards';
import { ProfileSection } from './ProfileSection';

export function ProfileHub({ locale }: { locale: string }) {
  const t = useTranslations('profile');
  const { user } = useProfileAuth();

  return (
    <ProfileSection title={t('title')} description={t('desc')}>
      <div className="space-y-6">
        {!user ? <ProfileLoginCard locale={locale} variant="hub" /> : <ProfileIdentitySummary />}

        {user ? <BlessingMeritCard /> : null}

        <ProfileDataCards />

        {/* 已登录用户经身份卡「管理账户」进入账户与设置，此处不再重复入口（避免同页双入口） */}
        {!user ? (
          <section aria-labelledby="profile-more-heading">
            <h2 id="profile-more-heading" className="sr-only">
              {t('moreSection')}
            </h2>
            <Card className="overflow-hidden p-0">
              <Link
                href="/profile/settings"
                className="flex min-h-[52px] items-center justify-between px-4 py-3 text-sm transition-colors hover:bg-muted/40 active:bg-muted/60"
              >
                <span className="text-foreground">{t('nav.settings')}</span>
                <span className="text-muted-foreground" aria-hidden>
                  ›
                </span>
              </Link>
            </Card>
          </section>
        ) : null}
      </div>
    </ProfileSection>
  );
}
