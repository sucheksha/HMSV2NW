import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard, Users, CalendarClock, UserCog, Stethoscope, Building2, ShieldCheck,
  Database, Hospital, FlaskConical, Pill, PackageSearch, HeartPulse, DoorOpen, BedDouble,
  ClipboardList, Receipt, Wallet, LineChart, PieChart, CreditCard, Settings, Bell, User,
  ListChecks, FileText, ClipboardCheck, CalendarDays, Activity, UploadCloud, CheckCircle2,
  LogOut, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/lib/auth";
import { useAuth } from "@/lib/auth";
import { JeevixLogo } from "@/components/hms/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem { label: string; to: string; icon: LucideIcon; }
interface NavGroup { label?: string; items: NavItem[]; }

const ADMIN_NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", to: "/admin", icon: LayoutDashboard }] },
  {
    label: "Operations",
    items: [
      { label: "Patients", to: "/module/patients", icon: Users },
      { label: "Appointments", to: "/module/appointments", icon: CalendarClock },
      { label: "OPD", to: "/module/opd", icon: Stethoscope },
      { label: "IPD", to: "/module/ipd", icon: HeartPulse },
    ],
  },
  {
    label: "Clinical",
    items: [
      { label: "Laboratory", to: "/module/laboratory", icon: FlaskConical },
      { label: "Pharmacy", to: "/module/pharmacy", icon: Pill },
      { label: "Medicines", to: "/module/medicines", icon: PackageSearch },
      { label: "Diagnosis", to: "/module/diagnosis", icon: ClipboardList },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { label: "Wards", to: "/module/wards", icon: Building2 },
      { label: "Rooms", to: "/module/rooms", icon: DoorOpen },
      { label: "Beds", to: "/module/beds", icon: BedDouble },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Staff", to: "/module/staff", icon: UserCog },
      { label: "Doctors", to: "/module/doctors", icon: Stethoscope },
      { label: "Departments", to: "/module/departments", icon: Hospital },
      { label: "Roles", to: "/module/roles", icon: ShieldCheck },
      { label: "Master Data", to: "/module/master", icon: Database },
    ],
  },
  {
    label: "Finance & Insights",
    items: [
      { label: "Billing", to: "/module/billing", icon: Receipt },
      { label: "Expenses", to: "/module/expenses", icon: Wallet },
      { label: "Reports", to: "/module/reports", icon: LineChart },
      { label: "Analytics", to: "/module/analytics", icon: PieChart },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Hospital Profile", to: "/module/hospital", icon: Hospital },
      { label: "Subscription", to: "/module/subscription", icon: CreditCard },
      { label: "Settings", to: "/module/settings", icon: Settings },
    ],
  },
];

const DOCTOR_NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", to: "/doctor", icon: LayoutDashboard }] },
  {
    label: "Today",
    items: [
      { label: "Appointments", to: "/module/doc-appointments", icon: CalendarClock },
      { label: "Consultation Queue", to: "/module/doc-queue", icon: ListChecks },
      { label: "Follow-ups", to: "/module/doc-followups", icon: CalendarDays },
    ],
  },
  {
    label: "Clinical",
    items: [
      { label: "Patient Records", to: "/module/doc-records", icon: FileText },
      { label: "Consultations", to: "/module/doc-consultations", icon: Stethoscope },
      { label: "Digital Prescription", to: "/module/doc-prescription", icon: ClipboardCheck },
      { label: "Lab Requests", to: "/module/doc-labs", icon: FlaskConical },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Calendar", to: "/module/doc-calendar", icon: CalendarDays },
      { label: "Notifications", to: "/module/doc-notifications", icon: Bell },
      { label: "Profile", to: "/module/doc-profile", icon: User },
      { label: "Settings", to: "/module/doc-settings", icon: Settings },
    ],
  },
];

const NURSE_NAV: NavGroup[] = [
  { items: [{ label: "Dashboard", to: "/nurse", icon: LayoutDashboard }] },
  {
    label: "Workflow",
    items: [
      { label: "Today's Queue", to: "/module/n-queue", icon: ListChecks },
      { label: "Patient Verification", to: "/module/n-verify", icon: ShieldCheck },
      { label: "Vitals", to: "/module/n-vitals", icon: Activity },
      { label: "Medical History", to: "/module/n-history", icon: FileText },
      { label: "Report Upload", to: "/module/n-reports", icon: UploadCloud },
      { label: "Ready For Consultation", to: "/module/n-ready", icon: CheckCircle2 },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Notifications", to: "/module/n-notifications", icon: Bell },
      { label: "Profile", to: "/module/n-profile", icon: User },
      { label: "Settings", to: "/module/n-settings", icon: Settings },
    ],
  },
];

function navFor(role: Role): NavGroup[] {
  if (role === "administrator") return ADMIN_NAV;
  if (role === "doctor") return DOCTOR_NAV;
  return NURSE_NAV;
}

export function AppSidebar() {
  const { user, logout } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!user) return null;
  const groups = navFor(user.role);

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <JeevixLogo variant="light" />
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {groups.map((group, gi) => (
          <div key={gi} className={cn(gi > 0 && "mt-5")}>
            {group.label && (
              <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
                {group.label}
              </div>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active = pathname === item.to;
                const Icon = item.icon;
                return (
                  <li key={item.to}>
                    <Link
                      to={item.to}
                      className={cn(
                        "group flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] font-medium transition-colors",
                        active
                          ? "bg-sidebar-accent text-sidebar-primary-foreground shadow-[inset_2px_0_0_var(--sidebar-primary)]"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-primary-foreground",
                      )}
                    >
                      <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-sidebar-primary" : "text-sidebar-foreground/60 group-hover:text-sidebar-primary")} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            {user.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">{user.name}</div>
            <div className="truncate text-[11px] text-sidebar-foreground/60">{user.title}</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-primary-foreground"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" /> Sign out
        </Button>
      </div>
    </aside>
  );
}
