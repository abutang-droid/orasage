'use client';

import { usePathname } from 'next/navigation';
import { AnalyticsPageView as BaseAnalyticsPageView } from '@orasage/analytics/react';

type Props = {
  locale: string;
};

export function AnalyticsPageView({ locale }: Props) {
  const pathname = usePathname();
  return <BaseAnalyticsPageView app="main" locale={locale} path={pathname} />;
}
