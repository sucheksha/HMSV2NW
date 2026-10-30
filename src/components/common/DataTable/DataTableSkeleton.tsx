type DataTableSkeletonProps = {
  rows?: number;
  columns?: number;
  statCards?: number;
  showHeader?: boolean;
  showTabs?: boolean;
  showToolbar?: boolean;
};

export function DataTableSkeleton({
  rows = 8,
  columns = 5,
  statCards = 3,
  showHeader = true,
  showTabs = false,
  showToolbar = true,
}: DataTableSkeletonProps) {
  return (
    <div className="w-full space-y-6 animate-pulse" aria-label="Loading content">
      {/* Page heading */}
      {showHeader && (
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 shrink-0 rounded-xl bg-muted" />
            <div className="space-y-2">
              <div className="h-6 w-48 rounded bg-muted" />
              <div className="h-4 w-64 max-w-full rounded bg-muted" />
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <div className="h-9 w-24 rounded-md bg-muted" />
            <div className="h-9 w-28 rounded-md bg-muted" />
          </div>
        </div>
      )}

      {/* Dashboard statistic cards */}
      {statCards > 0 && (
        <div
          className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
            statCards >= 3 ? "lg:grid-cols-3" : ""
          }`}
        >
          {Array.from({ length: statCards }, (_, index) => (
            <div key={index} className="rounded-xl border border-border p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div className="w-full space-y-3">
                  <div className="h-4 w-28 rounded bg-muted" />
                  <div className="h-8 w-16 rounded bg-muted" />
                  <div className="h-3 w-36 max-w-full rounded bg-muted" />
                </div>
                <div className="h-10 w-10 shrink-0 rounded-xl bg-muted" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table container */}
      <div className="overflow-hidden rounded-xl border border-border shadow-sm">
        {/* List title and action buttons */}
        <div className="flex flex-col justify-between gap-4 border-b border-border p-5 sm:flex-row sm:items-center">
          <div className="space-y-2">
            <div className="h-5 w-36 rounded bg-muted" />
            <div className="h-4 w-28 rounded bg-muted" />
          </div>
          <div className="flex flex-wrap gap-2">
            <div className="h-9 w-28 rounded-md bg-muted" />
            <div className="h-9 w-28 rounded-md bg-muted" />
            <div className="h-9 w-24 rounded-md bg-muted" />
            <div className="h-9 w-32 rounded-md bg-muted" />
          </div>
        </div>

        {showTabs && (
          <div className="flex gap-3 border-b border-border p-4">
            <div className="h-9 w-24 rounded-md bg-muted" />
            <div className="h-9 w-24 rounded-md bg-muted" />
            <div className="h-9 w-24 rounded-md bg-muted" />
          </div>
        )}

        {/* Search and filters */}
        {showToolbar && (
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
            <div className="h-10 w-full max-w-md rounded-md bg-muted" />
            <div className="h-10 w-32 rounded-md bg-muted" />
            <div className="h-10 w-36 rounded-md bg-muted" />
          </div>
        )}

        {/* Table header and rows */}
        <div className="overflow-x-auto">
          <div
            className="min-w-[600px]"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
            }}
          >
            <div
              className="grid border-b border-border bg-muted/30"
              style={{
                gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              }}
            >
              {Array.from({ length: columns }, (_, index) => (
                <div key={index} className="border-r border-border p-4 last:border-r-0">
                  <div className="h-4 w-20 max-w-full rounded bg-muted" />
                </div>
              ))}
            </div>

            {Array.from({ length: rows }, (_, rowIndex) => (
              <div
                key={rowIndex}
                className="grid border-b border-border last:border-b-0"
                style={{
                  gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
                }}
              >
                {Array.from({ length: columns }, (_, columnIndex) => (
                  <div key={columnIndex} className="border-r border-border p-4 last:border-r-0">
                    <div
                      className={`h-4 max-w-full rounded bg-muted ${
                        columnIndex === 0 ? "w-36" : "w-20"
                      }`}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination placeholder */}
        <div className="flex flex-col justify-between gap-3 border-t border-border p-4 sm:flex-row sm:items-center">
          <div className="h-4 w-36 rounded bg-muted" />
          <div className="flex gap-2">
            <div className="h-9 w-20 rounded-md bg-muted" />
            <div className="h-9 w-20 rounded-md bg-muted" />
            <div className="h-9 w-20 rounded-md bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}
