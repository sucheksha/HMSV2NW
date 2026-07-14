import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, ShieldCheck, Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth, roleHome, type Role } from "@/lib/auth";
import { JeevixLogo } from "@/components/hms/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const ROLES: { value: Role; label: string; hint: string; demoEmail: string }[] = [
  { value: "administrator", label: "Administrator", hint: "Command center", demoEmail: "admin@jeevix.health" },
  { value: "doctor", label: "Doctor", hint: "Consultation", demoEmail: "doctor@jeevix.health" },
  { value: "nurse", label: "Nurse", hint: "Patient prep", demoEmail: "nurse@jeevix.health" },
];

function AuthPage() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("administrator");
  const [email, setEmail] = useState("admin@jeevix.health");
  const [password, setPassword] = useState("Jeevix@2026");
  const [remember, setRemember] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user) navigate({ to: roleHome(user.role), replace: true });
  }, [authLoading, user, navigate]);

  useEffect(() => {
    const preset = ROLES.find((r) => r.value === role);
    if (preset) setEmail(preset.demoEmail);
  }, [role]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.includes("@")) return setError("Enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    setSubmitting(true);
    try {
      const u = await login(email, password, role);
      toast.success(`Welcome back, ${u.name.split(" ")[0]}`);
      navigate({ to: roleHome(u.role), replace: true });
    } catch {
      setError("Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-gradient-to-br from-[oklch(0.985_0.005_220)] via-[oklch(0.97_0.02_220)] to-[oklch(0.94_0.035_220)] px-4 py-10">
      {/* Ambient background pattern (low opacity, medical/AI feel) */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        {/* Soft radial glow */}
        <div className="absolute -left-40 top-1/4 h-[32rem] w-[32rem] rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-[36rem] w-[36rem] rounded-full bg-primary/10 blur-3xl" />
        {/* Subtle grid */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid-lines" width="48" height="48" patternUnits="userSpaceOnUse">
              <path d="M 48 0 L 0 0 0 48" fill="none" stroke="currentColor" strokeWidth="0.6" className="text-primary" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-lines)" />
        </svg>
        {/* Faint pulse line — medical motif */}
        <svg
          className="absolute left-0 top-1/2 h-24 w-full -translate-y-1/2 opacity-[0.05] text-primary"
          viewBox="0 0 1200 100"
          fill="none"
          preserveAspectRatio="none"
        >
          <path
            d="M0 50 L300 50 L340 20 L380 80 L420 10 L460 90 L500 50 L1200 50"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Login card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-2xl border border-border/70 bg-card/95 p-8 shadow-[0_20px_60px_-20px_oklch(0.24_0.15_275_/_0.25)] backdrop-blur-xl sm:p-10">
          {/* Logo + tagline */}
          <div className="flex flex-col items-center pb-8 text-center">
            <JeevixLogo size="lg" className="justify-center" />
            <p className="mt-5 text-[13px] font-medium tracking-wide text-muted-foreground">
              Smart Operations. Better Care.
            </p>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="h-px w-full bg-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-card px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sign in
              </span>
            </div>
          </div>

          {/* Role picker */}
          <div className="mb-5">
            <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Continue as
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "rounded-lg border px-2.5 py-2 text-left transition-all",
                    role === r.value
                      ? "border-primary bg-primary/[0.05] ring-2 ring-primary/15"
                      : "border-border bg-card hover:border-accent/50 hover:bg-accent/[0.03]",
                  )}
                >
                  <div className={cn("text-[12px] font-semibold", role === r.value ? "text-primary" : "text-foreground")}>
                    {r.label}
                  </div>
                  <div className="mt-0.5 text-[10px] leading-tight text-muted-foreground">{r.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@hospital.com"
                className="h-11"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <button type="button" className="text-xs font-medium text-accent hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-11 pr-10"
                />
                <button
                  type="button"
                  aria-label={showPass ? "Hide password" : "Show password"}
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                Keep me signed in
              </label>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-success" />
                Encrypted
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/[0.06] px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={submitting}
              className="h-11 w-full bg-gradient-to-r from-primary to-accent text-[15px] font-semibold shadow-[0_8px_24px_-8px_var(--primary)] hover:opacity-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in to JEEVIX"
              )}
            </Button>

            <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              Role-based access · Audit-logged · v2.4.1
            </p>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Need help? <a className="font-medium text-accent hover:underline" href="mailto:support@jeevix.health">support@jeevix.health</a>
          <span className="mx-2">·</span>
          © {new Date().getFullYear()} JEEVIX Health Systems
        </p>
      </div>
    </div>
  );
}
