import { createFileRoute } from "@tanstack/react-router";
import { Users, Clock, CheckCircle2, Activity, ShieldCheck, ChevronRight, Search } from "lucide-react";
import { TopBar } from "@/components/hms/TopBar";
import { StatCard, Section, StatusPill } from "@/components/hms/DashboardBits";
import { nurseQueue } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/nurse")({
  component: NurseDashboard,
});

function NurseDashboard() {
  return (
    <>
      <TopBar title="Patient preparation" subtitle="Priya Menon · Staff Nurse · OPD Zone A" />
      <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Today's Patients" value={38} icon={<Users className="h-4 w-4" />} tone="neutral" delta="8 remaining" />
          <StatCard label="Waiting" value={5} icon={<Clock className="h-4 w-4" />} tone="warning" delta="Oldest 12m" />
          <StatCard label="Ready" value={7} icon={<CheckCircle2 className="h-4 w-4" />} tone="positive" delta="+3 last hour" />
          <StatCard label="Vitals Pending" value={2} icon={<Activity className="h-4 w-4" />} tone="warning" delta="Token A-016, A-021" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-5">
          <Section
            title="Today's queue"
            description="Prepare patients in order"
            className="xl:col-span-3"
            action={<Button size="sm" variant="secondary" className="gap-1.5"><ShieldCheck className="h-4 w-4" /> Verify patient</Button>}
          >
            <ul className="divide-y divide-border/70">
              {nurseQueue.map((p) => (
                <li key={p.token} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent/10 font-mono text-[13px] font-semibold text-accent">
                    {p.token}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-semibold text-foreground">{p.patient}</span>
                      <span className="text-xs text-muted-foreground">· {p.age}y</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.doctor}</div>
                  </div>
                  <StatusPill tone={p.stage === "Vitals" || p.stage === "Vitals pending" ? "warning" : p.stage === "History" ? "info" : "muted"}>
                    {p.stage}
                  </StatusPill>
                  <Button variant="ghost" size="sm">
                    Prepare <ChevronRight className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Record vitals" description="Token A-016 · Kabir Singh, 34y" className="xl:col-span-2">
            <div className="mb-4">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Find patient</Label>
              <div className="relative mt-1.5">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="UHID, token or mobile…" className="h-10 pl-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: "BP (mmHg)", ph: "120 / 80" },
                { l: "Pulse (bpm)", ph: "76" },
                { l: "Temp (°F)", ph: "98.6" },
                { l: "SpO₂ (%)", ph: "98" },
                { l: "Height (cm)", ph: "172" },
                { l: "Weight (kg)", ph: "68" },
              ].map((f) => (
                <div key={f.l} className="space-y-1">
                  <Label className="text-[11px] font-medium text-muted-foreground">{f.l}</Label>
                  <Input placeholder={f.ph} className="h-10" />
                </div>
              ))}
              <div className="col-span-2 space-y-1">
                <Label className="text-[11px] font-medium text-muted-foreground">Chief complaint</Label>
                <Input placeholder="e.g. Fever with cough for 3 days" className="h-10" />
              </div>
            </div>
            <div className="mt-5 flex items-center justify-between rounded-lg border border-dashed border-success/40 bg-success/[0.05] px-3 py-2 text-xs text-muted-foreground">
              <span>BMI auto-calculated · 23.0 (Normal)</span>
              <Button size="sm" className="gap-1.5">
                <CheckCircle2 className="h-4 w-4" /> Mark ready
              </Button>
            </div>
          </Section>
        </div>

        <div className="mt-6">
          <Section title="Queue status" description="Live flow across preparation stages">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
              {[
                { label: "Waiting", value: 5, tone: "warning" as const },
                { label: "Verification", value: 2, tone: "info" as const },
                { label: "Vitals", value: 3, tone: "info" as const },
                { label: "History", value: 2, tone: "info" as const },
                { label: "Ready", value: 7, tone: "success" as const },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border bg-background/60 p-4">
                  <div className="mb-2"><StatusPill tone={s.tone}>{s.label}</StatusPill></div>
                  <div className="text-2xl font-bold text-foreground">{s.value}</div>
                  <div className="text-[11px] text-muted-foreground">patients</div>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </>
  );
}
