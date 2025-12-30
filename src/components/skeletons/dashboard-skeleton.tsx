import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen relative">
            {/* Header Skeleton */}
            <div className="relative container mx-auto px-4 py-6 max-w-7xl">
                <header className="flex items-center justify-between mb-6">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64 bg-white/10" />
                        <Skeleton className="h-4 w-48 bg-white/5" />
                    </div>
                    <div className="flex items-center gap-4">
                        <Skeleton className="h-10 w-32 bg-white/5 rounded-full" />
                        <div className="text-right pl-4 border-l border-white/10 space-y-1">
                            <Skeleton className="h-4 w-24 bg-white/10 ml-auto" />
                            <Skeleton className="h-3 w-16 bg-white/5 ml-auto" />
                        </div>
                    </div>
                </header>

                <div className="space-y-4">
                    {/* Metrics Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                        <div className="lg:col-span-3 h-48">
                            <Skeleton className="h-full w-full bg-white/5 rounded-xl border border-white/10" />
                        </div>
                        <div className="lg:col-span-2 h-48 space-y-3">
                            <Skeleton className="h-[48%] w-full bg-white/5 rounded-xl border border-white/10" />
                            <Skeleton className="h-[48%] w-full bg-white/5 rounded-xl border border-white/10" />
                        </div>
                    </div>

                    {/* Table Skeleton */}
                    <div className="glass-card p-4 space-y-4">
                        <div className="flex justify-between items-center">
                            <Skeleton className="h-9 w-64 bg-white/5" />
                            <div className="flex gap-2">
                                <Skeleton className="h-9 w-24 bg-white/5" />
                                <Skeleton className="h-9 w-24 bg-white/5" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            {Array.from({ length: 10 }).map((_, i) => (
                                <Skeleton key={i} className="h-12 w-full bg-white/5 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
