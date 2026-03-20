export function SkeletonLine({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-200 rounded ${className}`} />;
}

export function SkeletonCard() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="animate-pulse space-y-3">
        <SkeletonLine className="h-5 w-2/3" />
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-4 w-1/4" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="animate-pulse">
        <div className="bg-gray-50 px-6 py-3">
          <SkeletonLine className="h-3 w-full" />
        </div>
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="px-6 py-4 border-t border-gray-200 flex gap-6"
          >
            <SkeletonLine className="h-4 w-1/4" />
            <SkeletonLine className="h-4 w-1/3" />
            <SkeletonLine className="h-4 w-16" />
            <SkeletonLine className="h-4 w-24 ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonDetail() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="animate-pulse space-y-3">
        <SkeletonLine className="h-7 w-1/2" />
        <SkeletonLine className="h-4 w-1/4" />
        <SkeletonLine className="h-4 w-1/3" />
        <SkeletonLine className="h-4 w-2/3 mt-4" />
      </div>
    </div>
  );
}
