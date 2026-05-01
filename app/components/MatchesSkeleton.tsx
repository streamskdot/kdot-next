function MatchCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="absolute right-3 top-3 h-6 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="flex items-center justify-between gap-4 pt-2">
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="flex flex-col items-center gap-1 px-4">
          <div className="h-6 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  )
}

export function MatchesSkeleton({ count = 6 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </>
  )
}
