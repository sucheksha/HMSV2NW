import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth, roleHome } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: IndexRedirect,
});

function IndexRedirect() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (user) navigate({ to: roleHome(user.role), replace: true });
    else navigate({ to: "/auth", replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="grid min-h-screen place-items-center bg-background text-muted-foreground">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        Loading JEEVIX…
      </div>
    </div>
  );
}
