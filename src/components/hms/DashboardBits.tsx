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
    positive: { text: "text-success", Icon: ArrowUpRight },
    warning: { text: "text-warning", Icon: Minus },
    negative: { text: "text-danger", Icon: ArrowDownRight },
    neutral: { text: "text-muted-foreground", Icon: Minus },
  } as const;
  const T = toneMap[tone];
  return (
    <div className="group rounded-xl border border-border bg-card p-5 shadow-[var(--shadow-card)] transition-all hover:shadow-[var(--shadow-elegant)]">
      <div className="flex items-start justify-between">
        <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
        {icon && <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent">{icon}</div>}
      </div>
      <div className="mt-3 text-[26px] font-bold tracking-tight text-foreground">{value}</div>
      {delta && (
        <div className={cn("mt-1.5 inline-flex items-center gap-1 text-xs font-medium", T.text)}>
          <T.Icon className="h-3.5 w-3.5" />
          {delta}
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
    <section className={cn("rounded-xl border border-border bg-card shadow-[var(--shadow-card)]", className)}>
      <header className="flex items-center justify-between gap-4 border-b border-border px-5 py-3.5">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-foreground">{title}</h3>
          {description && <p className="mt-0.5 truncate text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function StatusPill({ children, tone = "info" }: { children: ReactNode; tone?: "info" | "success" | "warning" | "danger" | "muted" }) {
  const map = {
    info: "bg-info/10 text-info",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
    muted: "bg-muted text-muted-foreground",
  };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold", map[tone])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
