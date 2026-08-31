import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

export function StatCard({
  label,
  value,
  delta,
  tone = "neutral",
  icon,
}: {
  label: string;
  value: ReactNode;
  delta?: string;
  tone?: "positive" | "warning" | "negative" | "neutral";
  icon?: ReactNode;
}) {
  const toneMap = {
    positive: {
      text: "text-success",
      Icon: ArrowUpRight,
    },
    warning: {
      text: "text-warning",
      Icon: Minus,
    },
    negative: {
      text: "text-danger",
      Icon: ArrowDownRight,
    },
    neutral: {
      text: "text-muted-foreground",
      Icon: Minus,
    },
  } as const;

  const T = toneMap[tone];

  return (
    <div
      className={cn(
        "min-w-0 rounded-xl border border-border bg-card p-4 shadow-[var(--shadow-card)]",
        "transition-all hover:shadow-[var(--shadow-elegant)]",
        "sm:p-5",
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0 flex-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground sm:text-[12px]">
          <span className="block truncate">{label}</span>
        </div>

        {icon && (
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10 text-accent sm:h-9 sm:w-9">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2 truncate text-[23px] font-bold tracking-tight text-foreground sm:mt-3 sm:text-[26px]">
        {value}
      </div>

      {delta && (
        <div
          className={cn(
            "mt-1.5 inline-flex max-w-full items-center gap-1",
            "text-[11px] font-medium sm:text-xs",
            T.text,
          )}
        >
          <T.Icon className="h-3.5 w-3.5 shrink-0" />

          <span className="truncate">{delta}</span>
        </div>
      )}
    </div>
  );
}

export function Section({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border border-border bg-card shadow-[var(--shadow-card)]",
        className,
      )}
    >
      <header
        className={cn(
          "flex min-w-0 items-center justify-between gap-3",
          "border-b border-border px-4 py-3.5",
          "sm:gap-4 sm:px-5",
        )}
      >
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[14px] font-semibold text-foreground sm:text-[15px]">
            {title}
          </h3>

          {description && (
            <p className="mt-0.5 truncate text-[11px] text-muted-foreground sm:text-xs">
              {description}
            </p>
          )}
        </div>

        {action && <div className="shrink-0">{action}</div>}
      </header>

      <div className="min-w-0 p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function StatusPill({
  children,
  tone = "info",
}: {
  children: ReactNode;
  tone?: "info" | "success" | "warning" | "danger" | "muted";
}) {
  const map = {
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    muted: "bg-muted text-muted-foreground",
  };

  return (
    <span
      className={cn(
        "inline-flex max-w-full shrink-0 items-center gap-1.5",
        "rounded-full px-2 py-0.5 text-[10px] font-semibold",
        "sm:px-2.5 sm:text-[11px]",
        map[tone],
      )}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />

      <span className="truncate">{children}</span>
    </span>
  );
}
