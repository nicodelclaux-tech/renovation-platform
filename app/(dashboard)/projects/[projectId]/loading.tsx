import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function ProjectLoading() {
  return (
    <div className="min-h-full bg-primary p-lg">
      <div className="max-w-6xl mx-auto">
        <Skeleton className="h-4 w-32 mb-md" />
        <div className="space-y-xs mb-lg">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-36" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          <div className="lg:col-span-2 space-y-md">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-8 w-28" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          </div>
          <div className="space-y-md">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
