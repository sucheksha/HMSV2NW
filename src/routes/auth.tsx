import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Eye, EyeOff, ShieldCheck, Lock, Loader2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth, roleHome, type Role } from "@/lib/auth";
import { JeevixLogo } from "@/components/hms/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import hospitalHero from "@/assets/hospital-hero.jpg";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const ROLES: { value: Role; label: string; hint: string; demoEmail: string }[] = [
  { value: "administrator", label: "Administrator", hint: "Command center", demoEmail: "admin@jeevix.health" },
  { value: "doctor", label: "Doctor", hint: "Consultation", demoEmail: "doctor@jeevix.health" },
  { value: "nurse", label: "Nurse", hint: "Patient prep", demoEmail: "nurse@jeevix.health" },
];

// Hospital-specific content (per-tenant configurable in production).
const HOSPITAL = {
  name: "Aster Medcity",
  description:
    "A 670-bed quaternary care hospital delivering advanced cardiac, neuro, and transplant care with AI-assisted clinical workflows.",
  location: "Kochi, Kerala, India",
  welcome: "Welcome back to your command center.",
  image: hospitalHero,
};

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
    <div className="min-h-screen w-full bg-gradient-to-br from-[oklch(0.99_0.003_220)] to-[oklch(0.96_0.02_220)]">
      <div className="mx-auto grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        {/* LEFT — Branding & Hospital */}
        <aside className="relative order-1 flex flex-col overflow-hidden bg-gradient-to-br from-primary via-primary to-accent p-8 text-white sm:p-10 lg:p-12">
          {/* Ambient pattern */}
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-40 -right-24 h-[28rem] w-[28rem] rounded-full bg-accent/40 blur-3xl" />
            <svg className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="brand-grid" width="44" height="44" patternUnits="userSpaceOnUse">
                  <path d="M 44 0 L 0 0 0 44" fill="none" stroke="currentColor" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#brand-grid)" />
            </svg>
          </div>

          {/* Top — JEEVIX brand (constant) */}
          <div className="relative z-10 flex animate-in fade-in slide-in-from-top-2 duration-700">
            <JeevixLogo size="md" variant="light" />
          </div>
          <p className="relative z-10 mt-4 max-w-md text-sm font-medium tracking-wide text-white/70">
            Smart Operations. Better Care.
          </p>

          {/* Middle — Hospital image + info card (dynamic) */}
          <div className="relative z-10 mt-8 flex flex-1 flex-col justify-center">
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/15 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)]">
              <img
                src={hospitalHero}
                alt={HOSPITAL.name}
                width={1200}
                height={1600}
                className="h-64 w-full object-cover sm:h-80 lg:h-[22rem]"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-5 sm:p-6">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/90 backdrop-blur">
                  <Sparkles className="h-3 w-3" /> AI-Powered HMS
                </div>
                <h2 className="mt-2 text-2xl font-bold leading-tight sm:text-[26px]">{HOSPITAL.name}</h2>
                {HOSPITAL.location && (
                  <div className="mt-1 flex items-center gap-1.5 text-[12px] text-white/80">
                    <MapPin className="h-3.5 w-3.5" />
                    {HOSPITAL.location}
                  </div>
                )}
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-white/15 bg-white/[0.07] p-5 backdrop-blur-md">
              <p className="text-[13px] leading-relaxed text-white/85">{HOSPITAL.description}</p>
              {HOSPITAL.welcome && (
                <p className="mt-3 text-[12px] font-medium italic text-white/60">"{HOSPITAL.welcome}"</p>
              )}
            </div>
          </div>

          {/* Bottom — trust bar */}
          <div className="relative z-10 mt-8 flex items-center justify-between border-t border-white/10 pt-5 text-[11px] text-white/60">
            <span>HIPAA · ISO 27001 · SOC 2</span>
            <span>© {new Date().getFullYear()} JEEVIX Health Systems</span>
          </div>
        </aside>

        {/* RIGHT — Login */}
        <main className="relative order-2 flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          {/* Subtle background pattern */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <svg className="absolute inset-0 h-full w-full text-primary opacity-[0.035]" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="right-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#right-grid)" />
            </svg>
            <svg
              className="absolute left-0 top-1/2 h-20 w-full -translate-y-1/2 text-primary opacity-[0.05]"
              viewBox="0 0 1200 100"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M0 50 L300 50 L340 20 L380 80 L420 10 L460 90 L500 50 L1200 50"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
              <h1 className="text-[28px] font-bold tracking-tight text-foreground">Sign in to your account</h1>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Enter your credentials to access the JEEVIX Hospital OS.
              </p>
            </div>

            {/* Role picker */}
            <div className="mb-6">
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
                      "rounded-xl border px-2.5 py-2.5 text-left transition-all",
                      role === r.value
                        ? "border-primary bg-primary/[0.06] ring-2 ring-primary/15"
                        : "border-border bg-card hover:border-accent/50 hover:bg-accent/[0.04]",
                    )}
                  >
                    <div
                      className={cn(
                        "text-[12px] font-semibold",
                        role === r.value ? "text-primary" : "text-foreground",
                      )}
                    >
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
                  className="h-11 rounded-xl transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
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
                    className="h-11 rounded-xl pr-10 transition-all focus-visible:ring-2 focus-visible:ring-primary/30"
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
                  Remember me
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
                className="h-11 w-full rounded-xl bg-gradient-to-r from-primary to-accent text-[15px] font-semibold shadow-[0_10px_28px_-10px_var(--primary)] transition-all hover:opacity-95 hover:shadow-[0_14px_32px_-10px_var(--primary)]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign in to JEEVIX"
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 pt-2 text-[11px] text-muted-foreground">
                <Lock className="h-3 w-3" />
                Role-based access · Audit-logged · v2.4.1
              </p>
            </form>

            <p className="mt-8 text-center text-xs text-muted-foreground">
              Need help?{" "}
              <a className="font-medium text-accent hover:underline" href="mailto:support@jeevix.health">
                support@jeevix.health
              </a>
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
