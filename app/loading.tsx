function MatchCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      {/* Status badge */}
      <div className="absolute right-3 top-3 h-6 w-16 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />

      {/* Teams */}
      <div className="flex items-center justify-between gap-4 pt-2">
        {/* Team 1 */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* VS / Score */}
        <div className="flex flex-col items-center gap-1 px-4">
          <div className="h-6 w-12 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-3 w-10 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>

        {/* Team 2 */}
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="h-12 w-12 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
          <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
        </div>
      </div>
    </div>
  )
}

function TabSkeleton() {
  return (
    <div className="flex gap-2">
      <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-9 w-28 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-9 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
      <div className="h-9 w-32 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-700" />
    </div>
  )
}

export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950">
      {/* Navbar skeleton */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-6 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
            <div className="h-9 w-9 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-700" />
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          {/* Header skeleton */}
          <div className="mb-6 space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700 sm:h-10 sm:w-80" />
            <div className="h-4 w-48 animate-pulse rounded bg-zinc-200 dark:bg-zinc-700" />
          </div>

          {/* Tabs skeleton */}
          <TabSkeleton />

          {/* Matches grid skeleton */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
            <MatchCardSkeleton />
          </div>
        </div>
      </main>
    </div>
  )
}
