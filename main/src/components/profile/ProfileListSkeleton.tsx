
import { Skeleton } from '@orasage/ui';
export function ProfileListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="space-y-3" aria-hidden="true">
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index}>
          <Skeleton className="h-24 w-full rounded-lg" />
        </li>
      ))}
    </ul>
  );
}
