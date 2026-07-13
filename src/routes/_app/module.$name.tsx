import { createFileRoute } from "@tanstack/react-router";
import { Construction, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { TopBar } from "@/components/hms/TopBar";
import { Button } from "@/components/ui/button";
import { useAuth, roleHome } from "@/lib/auth";

export const Route = createFileRoute("/_app/module/$name")({
  component: ModuleStub,
});

function humanize(slug: string) {
  return slug
    .replace(/^doc-|^n-/, "")
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");
}

function ModuleStub() {
  const { name } = Route.useParams();
  const { user } = useAuth();
  const title = humanize(name);

  return (
    <>
      <TopBar title={title} subtitle="Module workspace" />
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-10 text-center shadow-[var(--shadow-card)]">
          <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10 text-accent">
            <Construction className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            This module's full workspace is being wired up. The navigation, permissions and layout are
            ready — production APIs and workflows plug in next.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2">
            <Button variant="secondary" size="sm" asChild>
              <Link to={user ? roleHome(user.role) : "/"}>
                <ArrowLeft className="h-4 w-4" /> Back to dashboard
              </Link>
            </Button>
            <Button size="sm" className="gap-1.5">
              <Sparkles className="h-4 w-4" /> Request early access
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
