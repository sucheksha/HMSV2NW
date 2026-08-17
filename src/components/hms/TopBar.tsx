import { Bell, Search, Command as CommandIcon, Sparkles, LogOut } from "lucide-react";

import { useNavigate } from "@tanstack/react-router";

import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
interface TopBarProps {
  title: string;
  subtitle?: string;
}

export function TopBar({ title, subtitle }: TopBarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      navigate({
        to: "/auth",
        replace: true,
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 flex min-h-16 w-full shrink-0 items-center justify-between gap-3 border-b border-border bg-background/95 px-4 backdrop-blur sm:px-6">
      {/* Left side - Page title */}
      <div className="min-w-0 flex-1 pl-12 lg:pl-0">
        <h1 className="truncate text-lg font-semibold text-foreground sm:text-xl">{title}</h1>

        {subtitle && (
          <p className="hidden truncate text-xs text-muted-foreground sm:block">{subtitle}</p>
        )}
      </div>

      {/* Right side */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3">
        {/* Search */}
        <div className="hidden lg:block">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

            <input
              type="search"
              placeholder="Search patients, doctors, UHID, tokens…"
              className="h-10 w-80 rounded-lg border border-input bg-background pl-9 pr-16 text-sm outline-none transition focus:border-ring focus:ring-2 focus:ring-ring/25 xl:w-96"
            />

            <kbd className="pointer-events-none absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              <CommandIcon className="h-3 w-3" />K
            </kbd>
          </div>
        </div>

        {/* AI Assistant */}
        <Button variant="ghost" size="sm" className="gap-2 px-2 text-muted-foreground sm:px-3">
          <Sparkles className="h-4 w-4 shrink-0 text-accent" />

          <span className="hidden md:inline">AI Assistant</span>
        </Button>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative shrink-0"
        >
          <Bell className="h-5 w-5" />

          <Badge className="absolute -right-0.5 -top-0.5 h-4 min-w-4 rounded-full bg-danger px-1 text-[10px] text-danger-foreground">
            4
          </Badge>
        </Button>

        {/* Logged-in user */}
        {user && (
          <div className="flex shrink-0 items-center gap-2 border-l border-border pl-2 sm:gap-3 sm:pl-3 lg:pl-4">
            {/* User information */}
            <div className="hidden text-right md:block">
              <div className="max-w-32 truncate text-sm font-medium leading-tight lg:max-w-40">
                {user.name}
              </div>

              <div className="max-w-32 truncate text-[11px] text-muted-foreground lg:max-w-40">
                {user.title || user.role}
              </div>
            </div>

            {/* User initials */}
            <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground sm:h-9 sm:w-9 sm:text-sm">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>

            {/* Logout */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Logout"
                  title="Logout"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="sr-only">Logout</span>
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to logout?</AlertDialogTitle>

                  <AlertDialogDescription>
                    You will be signed out of your hospital management system session and redirected
                    to the login page.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                  <AlertDialogAction onClick={handleLogout}>Logout</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>
    </header>
  );
}
