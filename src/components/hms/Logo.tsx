import { cn } from "@/lib/utils";

export function JeevixLogo({
  className,
  variant = "dark",
  size = "md",
}: {
  className?: string;
  variant?: "dark" | "light";
  size?: "md" | "lg";
}) {
  const dims = size === "lg" ? "h-16 w-16" : "h-9 w-9";
  const iconDims = size === "lg" ? "h-9 w-9" : "h-5 w-5";
  const brand = size === "lg" ? "text-3xl" : "text-lg";
  const tag = size === "lg" ? "text-[11px] tracking-[0.28em]" : "text-[10px] tracking-[0.14em]";
  const stroke = variant === "light" ? "text-white" : "text-primary";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "relative grid shrink-0 place-items-center rounded-2xl",
          dims,
          variant === "light"
            ? "bg-white/10 ring-1 ring-white/20"
            : "bg-gradient-to-br from-primary to-accent shadow-[0_10px_30px_-10px_var(--primary)] ring-1 ring-primary/10",
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className={cn(iconDims, variant === "light" ? stroke : "text-white")}
          strokeWidth={2.2}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21s-7-4.5-9-9.2C1.4 8 3.4 4 7.2 4c2 0 3.4 1.1 4.3 2.6h.9C13.3 5.1 14.7 4 16.8 4 20.6 4 22.6 8 21 11.8 19 16.5 12 21 12 21Z" />
          <path d="M8.5 12h2l1-2 2 4 1-2h2" />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            "font-bold tracking-tight",
            brand,
            variant === "light" ? "text-white" : "text-foreground",
          )}
        >
          JEEVIX
        </span>
        <span
          className={cn(
            "mt-1 font-semibold uppercase",
            tag,
            variant === "light" ? "text-white/60" : "text-muted-foreground",
          )}
        >
          Hospital OS
        </span>
      </div>
    </div>
  );
}
