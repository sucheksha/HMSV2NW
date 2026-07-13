import { createFileRoute } from "@tanstack/react-router";
import { CalendarClock, Users, ClipboardCheck, FlaskConical, Stethoscope, Sparkles, ChevronRight } from "lucide-react";
import { TopBar } from "@/components/hms/TopBar";
import { StatCard, Section, StatusPill } from "@/components/hms/DashboardBits";
import { doctorQueue } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/doctor")({
  component: DoctorDashboard,
});

function DoctorDashboard() {
  return (
    <>
      <TopBar title="Consultation workspace" subtitle="Dr. Vikram Shah · Cardiology · Room 214" />
      <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Today's Schedule" value={24} delta="6 remaining" tone="neutral" icon={<CalendarClock className="h-4 w-4" />} />
          <StatCard label="Waiting" value={4} delta="Avg wait 8m" tone="warning" icon={<Users className="h-4 w-4" />} />
          <StatCard label="Completed" value={12} delta="+2 vs yesterday" tone="positive" icon={<ClipboardCheck className="h-4 w-4" />} />
          <StatCard label="Pending Labs" value={3} delta="1 urgent" tone="warning" icon={<FlaskConical className="h-4 w-4" />} />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Section
            title="Consultation queue"
            description="Patients ready to be seen"
            className="xl:col-span-2"
            action={<Button size="sm" className="gap-1.5"><Stethoscope className="h-4 w-4" /> Start next</Button>}
          >
            <ul className="divide-y divide-border/70">
              {doctorQueue.map((p, i) => (
                <li key={p.token} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary/[0.06] font-mono text-[13px] font-semibold text-primary">
                    {p.token}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-semibold text-foreground">{p.patient}</span>
                      <span className="text-xs text-muted-foreground">· {p.age}y</span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">{p.complaint}</div>
                  </div>
                  <div className="hidden text-right md:block">
                    <StatusPill tone={p.status === "Ready" ? "success" : p.status === "Waiting" ? "warning" : "info"}>
                      {p.status}
                    </StatusPill>
                    <div className="mt-1 text-[11px] text-muted-foreground">Waited {p.waited}</div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-accent" disabled={i > 0}>
                    {i === 0 ? "Consult" : "View"} <ChevronRight className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Patient timeline" description="Rohan Verma · UHID 20418">
            <div className="space-y-4">
              {[
                { t: "Today", title: "Vitals recorded", meta: "BP 138/86 · HR 92 · SpO₂ 97%" },
                { t: "3 days ago", title: "Lab: Lipid Profile", meta: "LDL 168 mg/dL — elevated" },
                { t: "2 weeks ago", title: "Consultation — Cardiology", meta: "Advised beta-blocker start" },
                { t: "1 month ago", title: "ECG performed", meta: "Sinus rhythm, mild LVH" },
              ].map((e, idx) => (
                <div key={idx} className="relative pl-6">
                  <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-accent/15" />
                  <div className="absolute left-[10px] top-4 h-full w-px bg-border" />
                  <div className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{e.t}</div>
                  <div className="mt-0.5 text-sm font-semibold text-foreground">{e.title}</div>
                  <div className="text-xs text-muted-foreground">{e.meta}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-accent/40 bg-accent/[0.04] p-3 text-xs text-muted-foreground">
              <div className="mb-1 flex items-center gap-1.5 text-accent">
                <Sparkles className="h-3.5 w-3.5" /> <span className="font-semibold">AI Clinical Summary</span>
              </div>
              Hypertensive male, 42y, elevated LDL. Consider titrating anti-hypertensive and initiating statin therapy.
            </div>
          </Section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
          <Section title="Pending follow-ups" description="Scheduled this week">
            <ul className="space-y-3">
              {[
                { name: "Kavya Bhatt", when: "Tomorrow · 10:30", reason: "Post-cath review" },
                { name: "Manoj Deshmukh", when: "Wed · 15:00", reason: "BP recheck" },
                { name: "Riya Malhotra", when: "Fri · 11:15", reason: "Echo follow-up" },
              ].map((f) => (
                <li key={f.name} className="flex items-center justify-between rounded-lg border border-border/70 bg-background/50 p-3">
                  <div>
                    <div className="text-sm font-semibold text-foreground">{f.name}</div>
                    <div className="text-xs text-muted-foreground">{f.reason}</div>
                  </div>
                  <div className="text-xs font-medium text-accent">{f.when}</div>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Quick actions" description="Shortcuts for this shift">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "New prescription", icon: ClipboardCheck },
                { label: "Order lab test", icon: FlaskConical },
                { label: "Refer patient", icon: Users },
                { label: "Voice note (beta)", icon: Sparkles },
              ].map((a) => (
                <button key={a.label} className="group flex items-center gap-3 rounded-lg border border-border bg-card p-3 text-left transition hover:border-accent/60 hover:shadow-[var(--shadow-elegant)]">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground">
                    <a.icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{a.label}</span>
                </button>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </>
  );
}
