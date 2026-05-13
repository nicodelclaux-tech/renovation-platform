export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-secondary/60 rounded-md ${className}`} />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-secondary/40 border border-border rounded-lg p-md space-y-md">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function GenerationSkeleton() {
  return (
    <div className="bg-secondary/40 border border-border rounded-lg overflow-hidden">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="p-sm space-y-xs">
        <Skeleton className="h-3 w-3/4" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}
