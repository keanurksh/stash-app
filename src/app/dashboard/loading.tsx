export default function DashboardLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f10]">
      {/* Navbar skeleton */}
      <div className="sticky top-0 z-40 border-b border-[#1c2225]/80 bg-[#0b0f10]/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="size-10 animate-pulse rounded-xl bg-[#1c2225]" />
            <div className="h-5 w-16 animate-pulse rounded bg-[#1c2225]" />
          </div>
          <div className="flex items-center gap-4">
            <div className="h-10 w-36 animate-pulse rounded-xl bg-[#1c2225]" />
            <div className="size-9 animate-pulse rounded-full bg-[#1c2225]" />
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-7xl flex-1 space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-2">
            <div className="h-8 w-64 animate-pulse rounded bg-[#1c2225]" />
            <div className="h-4 w-48 animate-pulse rounded bg-[#1c2225]" />
          </div>
          <div className="h-14 w-full max-w-md animate-pulse rounded-xl bg-[#1c2225]" />
        </div>

        {/* Metric cards skeleton */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="glass-panel h-32 animate-pulse rounded-2xl border border-[#1c2225]/80"
            />
          ))}
        </div>

        {/* Wallets + chart skeleton */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-[#14191b]"
            />
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="glass-panel h-96 animate-pulse rounded-2xl border border-[#1c2225]/80 lg:col-span-7" />
          <div className="glass-panel h-96 animate-pulse rounded-2xl border border-[#1c2225]/80 lg:col-span-5" />
        </div>

        <div className="glass-panel h-72 animate-pulse rounded-2xl border border-[#1c2225]/80" />
      </main>
    </div>
  )
}
