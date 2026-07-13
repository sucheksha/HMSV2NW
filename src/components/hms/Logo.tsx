import { cn } from "@/lib/utils";

export function JeevixLogo({ className, variant = "dark" }: { className?: string; variant?: "dark" | "light" }) {
  const stroke = variant === "light" ? "text-white" : "text-primary";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div className={cn("relative grid h-9 w-9 shrink-0 place-items-center rounded-xl", variant === "light" ? "bg-white/10 ring-1 ring-white/20" : "bg-primary/10 ring-1 ring-primary/15")}>
        <svg viewBox="0 0 24 24" fill="none" className={cn("h-5 w-5", stroke)} strokeWidth={2.2} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 21s-7-4.5-9-9.2C1.4 8 3.4 4 7.2 4c2 0 3.4 1.1 4.3 2.6h.9C13.3 5.1 14.7 4 16.8 4 20.6 4 22.6 8 21 11.8 19 16.5 12 21 12 21Z" />
          <path d="M8.5 12h2l1-2 2 4 1-2h2" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className={cn("text-lg font-bold tracking-tight", variant === "light" ? "text-white" : "text-foreground")}>JEEVIX</span>
        <span className={cn("text-[10px] font-medium uppercase tracking-[0.14em]", variant === "light" ? "text-white/60" : "text-muted-foreground")}>
          Hospital OS
        </span>
      </div>
    </div>
  );
}
