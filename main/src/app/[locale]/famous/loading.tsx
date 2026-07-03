import { PageShell } from '@/components/PageShell';
import { Skeleton } from '@/components/ui/skeleton';

export default function FamousLoading() {
  return (
    <PageShell className="max-w-5xl" aria-busy="true" aria-live="polite">
      <div className="max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-4 h-5 w-full max-w-2xl" />
      </div>

      <Skeleton className="mt-6 h-6 w-28" />

      <div className="mt-6 grid gap-3 sm:gap-4">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full" />
        ))}
      </div>
    </PageShell>
  );
}
