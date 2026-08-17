import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth, roleHome } from "@/lib/auth";
import { JeevixLogo } from "@/components/hms/Logo";

export const Route = createFileRoute("/")({
  component: SplashScreen,
});

function SplashScreen() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    const fadeOut = window.setTimeout(() => setLeaving(true), 1600);
    const go = window.setTimeout(() => {
      if (user) navigate({ to: roleHome(user.role), replace: true });
      else navigate({ to: "/auth", replace: true });
    }, 2000);
    return () => {
      window.clearTimeout(fadeOut);
      window.clearTimeout(go);
    };
  }, [user, loading, navigate]);

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-background px-6">
      {/* Soft blue accents */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[20rem] w-[20rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div
        className={`relative flex flex-col items-center transition-all duration-500 ease-out ${
          leaving
            ? "translate-y-1 opacity-0"
            : "animate-in fade-in slide-in-from-bottom-2 opacity-100 duration-700"
        }`}
      >
        <JeevixLogo size="xl" />
        <p className="mt-5 text-[13px] font-medium uppercase tracking-[0.32em] text-muted-foreground">
          Smart Operations · Better Care
        </p>

        <div className="mt-10 flex items-center gap-1.5" aria-label="Loading">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
        </div>
      </div>

      <p className="absolute bottom-6 text-[11px] text-muted-foreground/70">
        AI-Powered Hospital Operating System
      </p>
    </div>
  );
}
