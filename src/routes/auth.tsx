import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  Lock,
  Loader2,
  MapPin,
  Phone,
  Globe,
  BedDouble,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth, roleHome, type Role } from "@/lib/auth";
import { JeevixLogo } from "@/components/hms/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useHospitalProfile } from "@/lib/hospital-profile";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  head: () => ({
    meta: [
      { title: "Sign in · JEEVIX Hospital OS" },
      {
        name: "description",
        content:
          "Secure enterprise sign-in for the JEEVIX Hospital Operating System — role-based access for administrators, doctors, and nurses.",
      },
    ],
  }),
});

const ROLES: { value: Role; label: string; hint: string; demoEmail: string }[] = [
  { value: "administrator", label: "Administrator", hint: "Command center", demoEmail: "admin@jeevix.health" },
  { value: "doctor", label: "Doctor", hint: "Consultation", demoEmail: "doctor@jeevix.health" },
  { value: "nurse", label: "Nurse", hint: "Patient prep", demoEmail: "nurse@jeevix.health" },
];

const APP_VERSION = "v2.4.1";

function AuthPage() {
  const { login, user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [hospital] = useHospitalProfile();
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

  const location = [hospital.city, hospital.state, hospital.country].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen w-full bg-background text-foreground">
      <div className="mx-auto grid min-h-screen w-full grid-cols-1 lg:grid-cols-2">
        {/* ============ LEFT — Hospital identity ============ */}
        <aside className="relative flex flex-col overflow-hidden bg-secondary/40 lg:min-h-screen">
          {/* Cover image */}
          <div className="absolute inset-0">
            <img
              src={hospital.coverUrl}
              alt={hospital.name}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/65 to-accent/55" />
          </div>

          <div className="relative z-10 flex flex-1 flex-col justify-between p-8 sm:p-12 text-white">
            {/* Top: JEEVIX brand */}
            <div className="flex items-center justify-between">
              <JeevixLogo size="md" variant="light" />
              <div className="hidden items-center gap-2 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md sm:inline-flex">
                <BadgeCheck className="h-3.5 w-3.5" />
                NABH · JCI
              </div>
            </div>

            {/* Middle: welcome + hospital info */}
            <div className="my-10 max-w-xl animate-in fade-in slide-in-from-bottom-2 duration-700">
              {hospital.logoUrl && (
                <img
                  src={hospital.logoUrl}
                  alt={`${hospital.name} logo`}
                  className="mb-5 h-14 w-14 rounded-2xl border border-white/25 bg-white/10 object-contain p-2 backdrop-blur-md"
                />
              )}
              <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/80">
                {hospital.welcomeMessage}
              </p>
              <h1 className="mt-2 text-[34px] font-bold leading-tight tracking-tight sm:text-[42px]">
                {hospital.name}
              </h1>
              <p className="mt-4 max-w-lg text-[14px] leading-relaxed text-white/85">
                {hospital.description}
              </p>

              <div className="mt-8 grid max-w-lg grid-cols-1 gap-3 text-[13px] text-white/85 sm:grid-cols-2">
                <InfoRow icon={MapPin} text={location || hospital.address} />
                <InfoRow icon={Phone} text={hospital.phone} />
                <InfoRow icon={Globe} text={hospital.website} />
                <InfoRow icon={BedDouble} text={`${hospital.beds} beds · ${hospital.type}`} />
              </div>
            </div>

            {/* Bottom: powered by */}
            <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-white/70">
              Powered by JEEVIX Hospital Operating System
            </p>
          </div>
        </aside>

        {/* ============ RIGHT — Authentication ============ */}
        <main className="relative flex items-center justify-center px-5 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="mb-8">
              <h2 className="text-[28px] font-bold tracking-tight text-foreground">Sign in</h2>
              <p className="mt-1.5 text-[14px] text-muted-foreground">
                Access your hospital workspace with role-based permissions.
              </p>
            </div>

            {/* Role picker */}
            <div className="mb-6">
              <Label className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Continue as
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={cn(
                      "rounded-xl border px-2.5 py-2.5 text-left transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                      role === r.value
                        ? "border-primary/50 bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/30 hover:bg-secondary/50",
                    )}
                  >
                    <div className={cn("text-[12.5px] font-semibold", role === r.value ? "text-primary" : "text-foreground")}>
                      {r.label}
                    </div>
                    <div className="mt-0.5 text-[10.5px] leading-tight text-muted-foreground">{r.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-[13px] font-medium text-foreground">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@hospital.com"
                  className="h-11 rounded-xl"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[13px] font-medium text-foreground">
                    Password
                  </Label>
                  <button type="button" className="text-[12px] font-medium text-primary hover:underline">
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
                    className="h-11 rounded-xl pr-10"
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
                <label className="flex cursor-pointer items-center gap-2 text-[13px] text-foreground">
                  <Checkbox checked={remember} onCheckedChange={(v) => setRemember(!!v)} />
                  Remember me
                </label>
                <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                  256-bit encrypted
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-[13px] text-destructive"
                >
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="h-11 w-full rounded-xl text-[14.5px] font-semibold"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                  </>
                ) : (
                  "Sign in to Workspace"
                )}
              </Button>

              <p className="flex items-center justify-center gap-1.5 pt-1 text-[11.5px] text-muted-foreground">
                <Lock className="h-3 w-3" /> Role-based access · Audit-logged
              </p>
            </form>

            <div className="mt-8 flex flex-col items-center gap-1 text-center text-[11.5px] text-muted-foreground">
              <p>
                Need help?{" "}
                <a className="font-medium text-primary hover:underline" href="mailto:support@jeevix.health">
                  support@jeevix.health
                </a>
              </p>
              <p>
                JEEVIX Hospital OS · {APP_VERSION} · © {new Date().getFullYear()} JEEVIX Health Systems
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  text,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/80" />
      <span className="truncate">{text}</span>
    </div>
  );
}
