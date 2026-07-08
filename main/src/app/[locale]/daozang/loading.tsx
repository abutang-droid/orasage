import { PageShell } from '@/components/PageShell';

import { Skeleton } from '@orasage/ui';
export default function DaozangLoading() {
  return (
    <PageShell className="max-w-5xl" aria-busy="true" aria-live="polite">
      <div className="max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      </div>

      <Skeleton className="mt-6 h-10 w-full max-w-md rounded-full" />
      <Skeleton className="mt-6 h-6 w-28" />

      {Array.from({ length: 2 }).map((_, section) => (
        <div key={section} className="mt-8">
          <Skeleton className="h-7 w-32" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2 sm:gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-28 w-full" />
            ))}
          </div>
        </div>
      ))}
    </PageShell>
  );
}
