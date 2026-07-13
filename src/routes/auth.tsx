import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, ShieldCheck, Sparkles, Activity, Lock, Loader2 } from "lucide-react";
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
  { value: "administrator", label: "Administrator", hint: "Hospital command center", demoEmail: "admin@jeevix.health" },
  { value: "doctor", label: "Doctor", hint: "Consultation workspace", demoEmail: "doctor@jeevix.health" },
  { value: "nurse", label: "Nurse / Assistant", hint: "Patient preparation queue", demoEmail: "nurse@jeevix.health" },
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
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
      {/* Brand Panel */}
      <section className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:flex lg:flex-col">
        {/* decorative background */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -bottom-32 -right-16 h-[28rem] w-[28rem] rounded-full bg-white/10 blur-3xl" />
          <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-1 flex-col p-12">
          <JeevixLogo variant="light" />

          <div className="mt-24 max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium ring-1 ring-white/15 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              AI-Enabled Hospital Operating System
            </div>
            <h2 className="text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
              Intelligence Behind <span className="text-accent">Every Care.</span>
            </h2>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-white/70">
              A calm, reliable workspace for administrators, doctors and nurses — unifying OPD, IPD,
              laboratory, pharmacy, billing and analytics under one enterprise-grade platform.
            </p>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                { icon: Activity, title: "Digital Patient Records", copy: "Longitudinal EMR with vitals & timelines." },
                { icon: Sparkles, title: "AI Clinical Assistance", copy: "Summaries, prescriptions & risk signals." },
                { icon: ShieldCheck, title: "HIPAA-Ready Architecture", copy: "Role-based access, encrypted at rest." },
                { icon: Lock, title: "Secure by Design", copy: "Audit logs across every hospital action." },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur">
                  <f.icon className="h-4 w-4 text-accent" />
                  <div className="mt-3 text-sm font-semibold text-white">{f.title}</div>
                  <div className="mt-0.5 text-xs text-white/60">{f.copy}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex items-center justify-between pt-12 text-xs text-white/50">
            <span>v2.4 · Enterprise</span>
            <span>© {new Date().getFullYear()} JEEVIX Health Systems</span>
          </div>
        </div>
      </section>

      {/* Auth Panel */}
      <section className="flex min-h-screen items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 flex items-center justify-between lg:hidden">
            <JeevixLogo />
          </div>

          <div className="mb-8">
            <h1 className="text-[26px] font-bold tracking-tight text-foreground">Welcome back</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Sign in to your hospital account to continue.
            </p>
          </div>

          {/* Role picker */}
          <div className="mb-6">
            <Label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Signing in as
            </Label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setRole(r.value)}
                  className={cn(
                    "rounded-lg border px-3 py-2.5 text-left transition-all",
                    role === r.value
                      ? "border-primary bg-primary/[0.04] shadow-[0_0_0_3px_var(--primary)/8]"
                      : "border-border bg-card hover:border-accent/50",
                  )}
                >
                  <div className={cn("text-[13px] font-semibold", role === r.value ? "text-primary" : "text-foreground")}>
                    {r.label}
                  </div>
                  <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{r.hint}</div>
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
                Encrypted session
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-danger/30 bg-danger/[0.06] px-3 py-2 text-sm text-danger">
                {error}
              </div>
            )}

            <Button type="submit" disabled={submitting} className="h-11 w-full text-[15px] font-semibold">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                </>
              ) : (
                "Sign in to JEEVIX"
              )}
            </Button>

            <p className="pt-2 text-center text-xs text-muted-foreground">
              Protected by role-based access · Audit-logged · v2.4.1
            </p>
          </form>

          <div className="mt-10 flex items-center justify-between text-xs text-muted-foreground">
            <span>Need help? support@jeevix.health</span>
            <span>© {new Date().getFullYear()}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
