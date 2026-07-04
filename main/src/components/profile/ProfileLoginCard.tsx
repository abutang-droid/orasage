'use client';

import { Button, Card, CardContent } from '@orasage/ui';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { profileLoginUrl } from '@/lib/auth';

type ProfileLoginCardProps = {
  locale: string;
  variant?: 'hub' | 'gate';
};

/** 未登录引导卡 — DS v1.1 Primary 按钮 + 衬线标题 */
export function ProfileLoginCard({ locale, variant = 'hub' }: ProfileLoginCardProps) {
  const t = useTranslations('profile');

  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-10 text-center sm:px-10 sm:py-12">
        <h2 className="font-serif text-heading-3 font-bold tracking-[-0.01em] text-foreground">
          {t('loginTitle')}
        </h2>
        <p className="mt-3 max-w-sm text-sm leading-[var(--os-line-body)] tracking-[var(--os-letter-wide)] text-muted-foreground">
          {variant === 'gate' ? t('loginRequired') : t('guestDesc')}
        </p>
        <Button asChild size="lg" className="mt-6 min-w-[12.5rem]">
          <a href={profileLoginUrl(locale)}>{t('loginCta')}</a>
        </Button>
        {variant === 'gate' ? (
          <Link
            href="/profile"
            className="mt-5 inline-flex min-h-11 items-center text-sm text-muted-foreground transition-colors hover:text-primary"
          >
            ← {t('nav.overview')}
          </Link>
        ) : null}
      </CardContent>
    </Card>
  );
}
