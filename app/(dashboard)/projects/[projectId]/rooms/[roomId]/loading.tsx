import { Skeleton, GenerationSkeleton } from '@/components/ui/Skeleton';

export default function RoomLoading() {
  return (
    <div className="h-full flex flex-col bg-primary">
      <div className="h-12 border-b border-border px-md flex items-center bg-surface">
        <Skeleton className="h-4 w-48" />
      </div>
      <div className="flex-1 grid grid-cols-[1fr_320px_300px] overflow-hidden">
        <div className="p-md grid grid-cols-1 md:grid-cols-2 gap-md content-start">
          <GenerationSkeleton />
          <GenerationSkeleton />
        </div>
        <div className="border-l border-border bg-surface p-md space-y-md">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-24 w-full" />
        </div>
        <div className="border-l border-border bg-surface p-md space-y-md">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-5/6" />
        </div>
      </div>
    </div>
  );
}
