import { Skeleton } from "@/components/ui/skeleton";

export function DashboardHeroSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-2/3 max-w-md rounded-xl" />
      <Skeleton className="h-5 w-full max-w-lg rounded-lg" />
    </div>
  );
}

export function KpiGridSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-3xl border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/80"
        >
          <Skeleton className="mb-4 h-12 w-12 rounded-2xl" />
          <Skeleton className="mb-2 h-3 w-24 rounded-md" />
          <Skeleton className="h-8 w-16 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function ChartBlockSkeleton({ tall }) {
  return (
    <div
      className={`rounded-[2rem] border border-zinc-200/80 bg-white/80 p-6 dark:border-zinc-800 dark:bg-zinc-900/80 ${tall ? "min-h-[320px]" : "min-h-[240px]"}`}
    >
      <Skeleton className="mb-6 h-6 w-40 rounded-lg" />
      <Skeleton className={`w-full rounded-xl ${tall ? "h-[260px]" : "h-[180px]"}`} />
    </div>
  );
}

export function AdminDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <DashboardHeroSkeleton />
      <KpiGridSkeleton count={4} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ChartBlockSkeleton tall />
        </div>
        <ChartBlockSkeleton />
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartBlockSkeleton />
        <ChartBlockSkeleton />
      </div>
    </div>
  );
}

export function TeacherDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <DashboardHeroSkeleton />
      <KpiGridSkeleton count={3} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-7 w-48 rounded-lg" />
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-3xl" />
          ))}
        </div>
        <ChartBlockSkeleton tall />
      </div>
    </div>
  );
}

export function StudentDashboardSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-10">
      <DashboardHeroSkeleton />
      <KpiGridSkeleton count={3} />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <ChartBlockSkeleton tall />
        </div>
        <div className="space-y-4 lg:col-span-2">
          <Skeleton className="h-7 w-40 rounded-lg" />
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-3xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
