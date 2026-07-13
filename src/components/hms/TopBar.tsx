import { Bell, Search, Command as CommandIcon, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-card/90 px-6 backdrop-blur">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-semibold text-foreground">{title}</h1>
        {subtitle && <p className="truncate text-xs text-muted-foreground">{subtitle}</p>}
      </div>

      <div className="hidden lg:block">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search patients, doctors, UHID, tokens…"
            className="h-10 w-96 rounded-lg border border-input bg-background pl-9 pr-16 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
            <CommandIcon className="h-3 w-3" /> K
          </kbd>
        </div>
      </div>

      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
        <Sparkles className="h-4 w-4 text-accent" />
        <span className="hidden md:inline">AI Assistant</span>
      </Button>

      <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
        <Bell className="h-5 w-5" />
        <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-danger px-1 text-[10px] text-danger-foreground">4</Badge>
      </Button>

      {user && (
        <div className="flex items-center gap-3 border-l border-border pl-4">
          <div className="hidden text-right md:block">
            <div className="text-sm font-medium leading-tight">{user.name}</div>
            <div className="text-[11px] text-muted-foreground">{user.title}</div>
          </div>
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
        </div>
      )}
    </header>
  );
}
