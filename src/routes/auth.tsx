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
  Mail,
  Globe,
  Clock,
  Siren,
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
import hospitalHero from "@/assets/hospital-hero.jpg";

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

// Hospital profile — configurable per-tenant from Hospital Settings in production.
const HOSPITAL = {
  name: "Aster Medcity",
  tagline: "Quaternary Care · Advanced Clinical Excellence",
  description:
    "A 670-bed quaternary care hospital delivering advanced cardiac, neuro, and transplant care with AI-assisted clinical workflows.",
  address: "Kuttisahib Road, Cheranalloor, Kochi 682027, Kerala",
  phone: "+91 484 669 9999",
  email: "info@astermedcity.com",
  website: "astermedcity.com",
  emergency: "+91 484 669 9000",
  hours: "24 × 7 · Emergency & Inpatient",
  accreditation: "NABH · JCI Accredited",
  image: hospitalHero,
};

const APP_VERSION = "v2.4.1";

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
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0B1024] text-white">
      {/* Ambient background — soft radial lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 top-1/3 h-[36rem] w-[36rem] rounded-full bg-[#14106B]/60 blur-[140px]" />
        <div className="absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-[#1DA8C7]/25 blur-[140px]" />
        <div className="absolute bottom-0 left-1/2 h-[24rem] w-[80%] -translate-x-1/2 rounded-full bg-[#102A56]/50 blur-[120px]" />
      </div>

      {/* Top brand bar — JEEVIX master brand (constant) */}
      <header className="relative z-30 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-6 py-5 sm:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <JeevixLogo size="md" variant="light" />
        </div>
        <div className="hidden text-right sm:block">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-white/60">
            Smart Operations · Better Care
          </p>
          <p className="mt-0.5 text-[10px] text-white/40">AI-Powered Hospital Operating System</p>
        </div>
      </header>

      <div className="relative z-10 grid min-h-[calc(100vh-88px)] w-full grid-cols-1 lg:grid-cols-2 xl:grid-cols-[3fr_2fr]">
        {/* ============ LEFT — Hospital identity ============ */}
        <aside className="relative flex flex-col overflow-hidden lg:min-h-[calc(100vh-88px)]">
          {/* Hospital hero image occupies full panel */}
          <div className="absolute inset-0">
            <img
              src={HOSPITAL.image}
              alt={HOSPITAL.name}
              className="h-full w-full animate-in fade-in duration-1000 object-cover"
            />
            {/* Dark gradient overlay (60% → 90%) for legibility */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0B1024]/70 via-[#0B1024]/60 to-[#14106B]/85" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1024] via-[#0B1024]/40 to-transparent" />
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-1 flex-col justify-between p-8 sm:p-12">
            {/* Accreditation chip top */}
            <div className="flex animate-in fade-in slide-in-from-top-2 duration-700">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/85 backdrop-blur-md">
                <BadgeCheck className="h-3.5 w-3.5 text-[#82CBDB]" />
                {HOSPITAL.accreditation}
              </div>
            </div>

            {/* Hospital identity block */}
            <div className="mt-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* Hospital logo mark */}
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/15 bg-white/[0.08] text-lg font-black tracking-tight text-white shadow-[0_8px_30px_-8px_rgba(29,168,199,0.4)] backdrop-blur-md">
                {HOSPITAL.name
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")}
              </div>

              <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight sm:text-4xl lg:text-[42px]">
                {HOSPITAL.name}
              </h1>
              <p className="mt-2 text-sm font-medium text-[#82CBDB] sm:text-[15px]">{HOSPITAL.tagline}</p>
              <p className="mt-4 max-w-xl text-[13.5px] leading-relaxed text-white/75">{HOSPITAL.description}</p>

              {/* Contact grid */}
              <div className="mt-7 grid max-w-xl grid-cols-1 gap-x-6 gap-y-3 text-[12.5px] text-white/80 sm:grid-cols-2">
                <InfoRow icon={MapPin} text={HOSPITAL.address} />
                <InfoRow icon={Phone} text={HOSPITAL.phone} />
                <InfoRow icon={Mail} text={HOSPITAL.email} />
                <InfoRow icon={Globe} text={HOSPITAL.website} />
                <InfoRow icon={Siren} text={`Emergency ${HOSPITAL.emergency}`} accent />
                <InfoRow icon={Clock} text={HOSPITAL.hours} />
              </div>
            </div>
          </div>
        </aside>

        {/* ============ RIGHT — Authentication ============ */}
        <main className="relative flex items-center justify-center px-5 py-10 sm:px-10 lg:px-12">
          <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-3 duration-700">
            {/* Enterprise card — dark navy, soft border, small shadow */}
            <div className="rounded-2xl border border-white/10 bg-[#0F172A]/85 p-7 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.8)] backdrop-blur-xl sm:p-9">
              <div className="mb-7">
                <h2 className="text-[26px] font-bold tracking-tight text-white">Welcome back</h2>
                <p className="mt-1.5 text-[13.5px] text-white/60">Login to your hospital workspace.</p>
              </div>

              {/* Role picker */}
              <div className="mb-6">
                <Label className="mb-2 block text-[10.5px] font-semibold uppercase tracking-[0.18em] text-white/50">
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
                          ? "border-[#1DA8C7]/60 bg-[#1DA8C7]/10 ring-1 ring-[#1DA8C7]/40"
                          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
                      )}
                    >
                      <div
                        className={cn(
                          "text-[12px] font-semibold",
                          role === r.value ? "text-[#82CBDB]" : "text-white/90",
                        )}
                      >
                        {r.label}
                      </div>
                      <div className="mt-0.5 text-[10px] leading-tight text-white/45">{r.hint}</div>
                    </button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[12.5px] text-white/75">
                    Hospital Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@hospital.com"
                    className="h-11 rounded-xl border-white/10 bg-white/[0.04] text-white placeholder:text-white/30 transition-all focus-visible:border-[#1DA8C7]/60 focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#1DA8C7]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[12.5px] text-white/75">
                      Password
                    </Label>
                    <button
                      type="button"
                      className="text-[11.5px] font-medium text-[#82CBDB] hover:text-white"
                    >
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
                      className="h-11 rounded-xl border-white/10 bg-white/[0.04] pr-10 text-white placeholder:text-white/30 transition-all focus-visible:border-[#1DA8C7]/60 focus-visible:bg-white/[0.06] focus-visible:ring-2 focus-visible:ring-[#1DA8C7]/30"
                    />
                    <button
                      type="button"
                      aria-label={showPass ? "Hide password" : "Show password"}
                      onClick={() => setShowPass((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex cursor-pointer items-center gap-2 text-[12.5px] text-white/70">
                    <Checkbox
                      checked={remember}
                      onCheckedChange={(v) => setRemember(!!v)}
                      className="border-white/25 data-[state=checked]:border-[#1DA8C7] data-[state=checked]:bg-[#1DA8C7]"
                    />
                    Remember me
                  </label>
                  <div className="flex items-center gap-1 text-[11px] text-white/55">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#82CBDB]" />
                    256-bit encrypted
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-[13px] text-red-200"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-11 w-full rounded-xl bg-gradient-to-r from-[#1779B4] to-[#1DA8C7] text-[14.5px] font-semibold text-white shadow-[0_12px_30px_-12px_rgba(29,168,199,0.7)] transition-all hover:from-[#1DA8C7] hover:to-[#1779B4] hover:shadow-[0_16px_36px_-12px_rgba(29,168,199,0.85)] disabled:opacity-70"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
                    </>
                  ) : (
                    "Login to Workspace"
                  )}
                </Button>

                <p className="flex items-center justify-center gap-1.5 pt-1 text-[11px] text-white/45">
                  <Lock className="h-3 w-3" />
                  Role-based access · Audit-logged
                </p>
              </form>
            </div>

            {/* Support / version / copyright */}
            <div className="mt-6 flex flex-col items-center gap-1.5 text-center text-[11px] text-white/45">
              <p>
                Need help?{" "}
                <a className="font-medium text-[#82CBDB] hover:text-white" href="mailto:support@jeevix.health">
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

      {/* Bottom "Powered by JEEVIX" ribbon */}
      <footer className="relative z-10 border-t border-white/5 bg-[#0B1024]/60 px-6 py-3 text-center text-[10.5px] font-medium uppercase tracking-[0.28em] text-white/45 backdrop-blur-sm sm:px-10">
        Powered by JEEVIX Hospital Operating System
      </footer>
    </div>
  );
}

function InfoRow({
  icon: Icon,
  text,
  accent = false,
}: {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  accent?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <Icon
        className={cn(
          "mt-0.5 h-3.5 w-3.5 shrink-0",
          accent ? "text-red-300" : "text-[#82CBDB]",
        )}
      />
      <span className={cn("truncate", accent && "font-medium text-white/90")}>{text}</span>
    </div>
  );
}
