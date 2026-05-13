import { CardSkeleton } from '@/components/ui/Skeleton';

export default function ProjectsLoading() {
  return (
    <div className="min-h-screen bg-primary p-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-lg">
          <div className="space-y-xs">
            <div className="h-8 w-48 bg-secondary/60 rounded-md animate-pulse" />
            <div className="h-4 w-32 bg-secondary/40 rounded-md animate-pulse" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    </div>
  );
}
