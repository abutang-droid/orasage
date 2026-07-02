import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import { PageShell, PageTitle } from '@/components/PageShell';
import { externalUrls } from '@/lib/urls';

type Props = { params: Promise<{ locale: string }> };

export default async function ProfilePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('profile');

  const returnUrl = encodeURIComponent(`https://orasage.com/${locale}/profile`);
  const loginUrl = `${externalUrls.authLogin}?returnUrl=${returnUrl}`;

  return (
    <PageShell>
      <PageTitle>{t('title')}</PageTitle>
      <p className="mt-4 text-[15px] leading-relaxed text-sage-muted sm:text-base">{t('desc')}</p>
      <p className="mt-6 text-sm text-sage-purple">{t('phase2')}</p>
      <a
        href={loginUrl}
        className="mt-8 inline-flex min-h-[44px] items-center rounded-full border border-sage-gold/40 px-6 text-sm text-sage-gold transition hover:bg-sage-gold/10"
      >
        {t('login')}
      </a>
      <p className="mt-6 text-sm text-sage-muted">
        <Link href="/" className="text-sage-gold hover:text-white">
          ← {t('backHome')}
        </Link>
      </p>
    </PageShell>
  );
}
