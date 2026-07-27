import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import { Button } from '@orasage/ui/button';
import { ORASAGE_URLS } from '@/lib/orasage-app-shell/config';

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;
  const t = await getTranslations('success');

  return (
    <main className="shop-page safe-bottom mx-auto flex min-h-[60dvh] max-w-lg flex-1 flex-col items-center justify-center py-12 text-center">
      <div className="shop-success-icon">✓</div>
      <h1 className="mt-4 font-serif text-2xl text-sage-primary">{t('title')}</h1>
      {order && (
        <p className="mt-3 text-sm text-sage-muted">
          {t('orderNo', { order })}
        </p>
      )}
      <p className="mt-2 text-sm text-sage-muted">{t('synced')}</p>
      <div className="mt-8 flex w-full max-w-xs flex-col gap-3">
        {order ? (
          <Button asChild className="w-full">
            <Link href={`/orders/${encodeURIComponent(order)}`}>{t('viewOrder')}</Link>
          </Button>
        ) : null}
        <Button asChild variant={order ? 'secondary' : 'default'} className="w-full">
          <a href={ORASAGE_URLS.authCenter}>{t('myOrders')}</a>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link href="/">{t('continueShopping')}</Link>
        </Button>
      </div>
    </main>
  );
}
