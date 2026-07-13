import { createFileRoute } from "@tanstack/react-router";
import {
  Users, CalendarClock, BedDouble, Wallet, HeartPulse, Receipt, Activity, UserCog, Plus,
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
  Bar, BarChart, Legend,
} from "recharts";
import { TopBar } from "@/components/hms/TopBar";
import { StatCard, Section, StatusPill } from "@/components/hms/DashboardBits";
import { adminKpis, patientTrend, revenueTrend, departmentPerformance, appointmentQueue, notifications } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/admin")({
  component: AdminDashboard,
});

const kpiIcons = [Users, CalendarClock, HeartPulse, HeartPulse, Wallet, Receipt, BedDouble, UserCog];

function AdminDashboard() {
  return (
    <>
      <TopBar title="Hospital Command Center" subtitle="Live operational overview · Today, 09:42 IST" />
      <main className="flex-1 overflow-y-auto px-6 pb-10 pt-6">
        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-4">
          {adminKpis.map((k, i) => {
            const Icon = kpiIcons[i] ?? Activity;
            return <StatCard key={k.label} label={k.label} value={k.value} delta={k.delta} tone={k.tone} icon={<Icon className="h-4 w-4" />} />;
          })}
        </div>

        {/* Charts */}
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Section
            title="Patient trends"
            description="OPD vs IPD footfall — last 7 days"
            className="xl:col-span-2"
            action={<Button variant="ghost" size="sm" className="text-muted-foreground">This week</Button>}
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={patientTrend} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gOpd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-3)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="var(--color-chart-3)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gIpd" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.28} />
                      <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} className="text-xs" stroke="var(--color-muted-foreground)" />
                  <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="opd" stroke="var(--color-chart-3)" strokeWidth={2.4} fill="url(#gOpd)" />
                  <Area type="monotone" dataKey="ipd" stroke="var(--color-chart-1)" strokeWidth={2.4} fill="url(#gIpd)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Section>

          <Section title="Revenue vs expenses" description="Last 6 months, in ₹ lakhs">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrend} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>

        {/* Queue + notifications */}
        <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
          <Section
            title="Appointment queue"
            description="Live from reception & OPD"
            className="xl:col-span-2"
            action={<Button size="sm" className="gap-1.5"><Plus className="h-4 w-4" /> New appointment</Button>}
          >
            <div className="-mx-5 overflow-x-auto">
              <table className="w-full min-w-[680px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-2 font-semibold">Token</th>
                    <th className="px-5 py-2 font-semibold">Patient</th>
                    <th className="px-5 py-2 font-semibold">Doctor</th>
                    <th className="px-5 py-2 font-semibold">Department</th>
                    <th className="px-5 py-2 font-semibold">Time</th>
                    <th className="px-5 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {appointmentQueue.map((a) => (
                    <tr key={a.token} className="border-t border-border/70 hover:bg-muted/40">
                      <td className="px-5 py-3 font-mono text-[13px] text-primary">{a.token}</td>
                      <td className="px-5 py-3 font-medium text-foreground">{a.patient}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.doctor}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.dept}</td>
                      <td className="px-5 py-3 text-muted-foreground">{a.time}</td>
                      <td className="px-5 py-3">
                        <StatusPill tone={a.status === "Waiting" ? "warning" : a.status === "Ready" ? "success" : "info"}>
                          {a.status}
                        </StatusPill>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="Critical notifications" description="Requires attention">
            <ul className="space-y-2.5">
              {notifications.map((n) => {
                const tone = n.type === "critical" ? "danger" : n.type === "warning" ? "warning" : "info";
                return (
                  <li key={n.id} className="flex items-start gap-3 rounded-lg border border-border/70 bg-background/60 p-3">
                    <StatusPill tone={tone}>{n.type}</StatusPill>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-foreground">{n.title}</div>
                      <div className="mt-0.5 text-[11px] text-muted-foreground">{n.time}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-4 rounded-lg border border-dashed border-accent/40 bg-accent/[0.04] p-3 text-xs text-muted-foreground">
              <span className="mr-1.5 font-semibold text-accent">AI Insights</span>
              Bed occupancy is projected to hit 84% by 18:00. Consider activating overflow ward B-2.
            </div>
          </Section>
        </div>

        {/* Department performance */}
        <div className="mt-6">
          <Section title="Department performance" description="Patients & revenue this week">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentPerformance} margin={{ top: 5, right: 10, left: -12, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="dept" tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <YAxis tickLine={false} axisLine={false} stroke="var(--color-muted-foreground)" fontSize={11} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", fontSize: 12 }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="patients" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="revenue" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Section>
        </div>
      </main>
    </>
  );
}
