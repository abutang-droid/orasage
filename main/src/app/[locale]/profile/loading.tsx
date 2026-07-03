
import { Skeleton } from '@orasage/ui';
export default function ProfileLoading() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      <Skeleton className="h-32 w-full rounded-lg" />
      <div className="overflow-hidden rounded-lg border border-border">
        {Array.from({ length: 5 }).map((_, index) => (
          <Skeleton key={index} className="h-[52px] w-full rounded-none border-b border-border last:border-b-0" />
        ))}
      </div>
    </div>
  );
}
