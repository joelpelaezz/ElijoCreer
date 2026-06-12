export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-container-high ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-3">
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-full" />
    </div>
  );
}

export function FixtureMatchSkeleton() {
  return (
    <div className="bg-card border border-border rounded-xl p-4 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-3 w-24" />
      </div>
      <div className="flex items-center justify-around gap-4">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="w-14 h-14 rounded-xl" />
          <Skeleton className="h-4 w-3" />
          <Skeleton className="w-14 h-14 rounded-xl" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="w-12 h-12 rounded-full" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  );
}

export function RankingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
          <Skeleton className="w-8 h-8 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-8 w-12 rounded-lg" />
        </div>
      ))}
    </div>
  );
}
