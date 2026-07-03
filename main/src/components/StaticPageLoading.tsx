import { PageShell } from '@/components/PageShell';
import { Skeleton } from '@/components/ui/skeleton';

export function StaticPageLoading() {
  return (
    <PageShell aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-48" />
      <div className="mt-6 space-y-4">
        <Skeleton className="h-5 w-full" />
        <Skeleton className="h-5 w-11/12" />
        <Skeleton className="h-5 w-10/12" />
      </div>
    </PageShell>
  );
}
