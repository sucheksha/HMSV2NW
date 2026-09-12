import type { LucideIcon } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  className?: string;
  iconClassName?: string;
}

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  className = "",
  iconClassName = "",
}: KpiCardProps) {
  return (
    <div
      className={`
        group
        rounded-2xl
        border
        p-5
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-md
        ${className}
      `}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>

          <p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p>

          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>

        <div
          className={`
            flex h-11 w-11
            shrink-0
            items-center justify-center
            rounded-xl
            transition-transform
            duration-200
            group-hover:scale-105
            ${iconClassName}
          `}
          aria-hidden="true"
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export { KpiCard };
export type { KpiCardProps };
