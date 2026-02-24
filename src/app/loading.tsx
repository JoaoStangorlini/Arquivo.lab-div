export default function Loading() {
    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
            {/* Header Skeleton */}
            <div className="max-w-3xl mb-16 space-y-4">
                <div className="h-6 w-40 animate-shimmer-labdiv block" />
                <div className="h-16 w-3/4 animate-shimmer-labdiv block" />
                <div className="h-16 w-1/2 animate-shimmer-labdiv block" />
                <div className="h-20 w-full animate-shimmer-labdiv block" />
            </div>

            {/* Separator Skeleton */}
            <div className="flex items-center gap-3 mb-8">
                <div className="h-8 w-48 animate-shimmer-labdiv rounded-full block" />
                <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="rounded-2xl bg-white dark:bg-card-dark border border-gray-100 dark:border-gray-800 flex flex-col overflow-hidden aspect-[4/5] sm:aspect-auto">
                        {/* Shimmer on a per-card basis for visual impact */}
                        <div className="p-3 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full animate-shimmer-labdiv block" />
                                <div className="w-24 h-4 animate-shimmer-labdiv block" />
                            </div>
                            <div className="w-16 h-6 animate-shimmer-labdiv block" />
                        </div>

                        {/* Media Placeholder: Fixed Aspect Ratio for CLS Zero */}
                        <div className="webkit-aspect-guard w-full animate-shimmer-labdiv rounded-none" />

                        <div className="p-4 flex flex-col gap-3">
                            <div className="flex justify-between items-center mb-1">
                                <div className="flex gap-4">
                                    <div className="w-10 h-5 animate-shimmer-labdiv block" />
                                    <div className="w-10 h-5 animate-shimmer-labdiv block" />
                                </div>
                                <div className="w-10 h-5 animate-shimmer-labdiv block" />
                            </div>
                            <div className="w-20 h-4 animate-shimmer-labdiv block" />
                            <div className="w-3/4 h-5 animate-shimmer-labdiv mt-1 block" />
                            <div className="w-full h-4 animate-shimmer-labdiv block" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
