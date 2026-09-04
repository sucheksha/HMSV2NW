import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  CalendarClock,
  UserCog,
  Stethoscope,
  Building2,
  ShieldCheck,
  Hospital,
  FlaskConical,
  Pill,
  PackageSearch,
  HeartPulse,
  DoorOpen,
  BedDouble,
  ClipboardList,
  Receipt,
  Wallet,
  LineChart,
  PieChart,
  CreditCard,
  Settings,
  Bell,
  User,
  ListChecks,
  FileText,
  ClipboardCheck,
  CalendarDays,
  Activity,
  UploadCloud,
  CheckCircle2,
  LogOut,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  type LucideIcon,
} from "lucide-react";

import { useState } from "react";

import type { Role } from "@/auth/auth";
import { useAuth } from "@/auth/auth";
import { JeevixLogo } from "@/components/layout/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavGroup {
  label?: string;
  items: NavItem[];
}

const ADMIN_NAV: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        to: "/admin",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Operations",
    items: [
      {
        label: "Patients",
        to: "/module/patients",
        icon: Users,
      },
      {
        label: "Appointments",
        to: "/module/appointments",
        icon: CalendarClock,
      },
      {
        label: "OPD",
        to: "/module/opd",
        icon: Stethoscope,
      },
      {
        label: "IPD",
        to: "/module/ipd",
        icon: HeartPulse,
      },
    ],
  },
  {
    label: "Clinical",
    items: [
      {
        label: "Laboratory",
        to: "/module/laboratory",
        icon: FlaskConical,
      },
      {
        label: "Pharmacy",
        to: "/module/pharmacy",
        icon: Pill,
      },
      {
        label: "Medicines",
        to: "/module/medicines",
        icon: PackageSearch,
      },
      {
        label: "Diagnosis",
        to: "/module/diagnosis",
        icon: ClipboardList,
      },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      {
        label: "Wards",
        to: "/module/wards",
        icon: Building2,
      },
      {
        label: "Rooms",
        to: "/module/rooms",
        icon: DoorOpen,
      },
      {
        label: "Beds",
        to: "/module/beds",
        icon: BedDouble,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        label: "Staff",
        to: "/module/staff",
        icon: UserCog,
      },
      {
        label: "Doctors",
        to: "/module/doctors",
        icon: Stethoscope,
      },
    ],
  },
  {
    label: "Master",
    items: [
      {
        label: "Department",
        to: "/module/departments",
        icon: Hospital,
      },
      {
        label: "Roles",
        to: "/module/roles",
        icon: ShieldCheck,
      },
    ],
  },
  {
    label: "Finance & Insights",
    items: [
      {
        label: "Billing",
        to: "/module/billing",
        icon: Receipt,
      },
      {
        label: "Expenses",
        to: "/module/expenses",
        icon: Wallet,
      },
      {
        label: "Reports",
        to: "/module/reports",
        icon: LineChart,
      },
      {
        label: "Analytics",
        to: "/module/analytics",
        icon: PieChart,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Hospital Profile",
        to: "/module/hospital",
        icon: Hospital,
      },
      {
        label: "Subscription",
        to: "/module/subscription",
        icon: CreditCard,
      },
      {
        label: "Settings",
        to: "/module/settings",
        icon: Settings,
      },
    ],
  },
];

const DOCTOR_NAV: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        to: "/doctor",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Today",
    items: [
      {
        label: "Appointments",
        to: "/module/doc-appointments",
        icon: CalendarClock,
      },
      {
        label: "Consultation Queue",
        to: "/module/doc-queue",
        icon: ListChecks,
      },
      {
        label: "Follow-ups",
        to: "/module/doc-followups",
        icon: CalendarDays,
      },
    ],
  },
  {
    label: "Clinical",
    items: [
      {
        label: "Patient Records",
        to: "/module/doc-records",
        icon: FileText,
      },
      {
        label: "Consultations",
        to: "/module/doc-consultations",
        icon: Stethoscope,
      },
      {
        label: "Digital Prescription",
        to: "/module/doc-prescription",
        icon: ClipboardCheck,
      },
      {
        label: "Lab Requests",
        to: "/module/doc-labs",
        icon: FlaskConical,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Calendar",
        to: "/module/doc-calendar",
        icon: CalendarDays,
      },
      {
        label: "Notifications",
        to: "/module/doc-notifications",
        icon: Bell,
      },
      {
        label: "Profile",
        to: "/module/doc-profile",
        icon: User,
      },
      {
        label: "Settings",
        to: "/module/doc-settings",
        icon: Settings,
      },
    ],
  },
];

const NURSE_NAV: NavGroup[] = [
  {
    items: [
      {
        label: "Dashboard",
        to: "/nurse",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    label: "Workflow",
    items: [
      {
        label: "Today's Queue",
        to: "/module/n-queue",
        icon: ListChecks,
      },
      {
        label: "Patient Verification",
        to: "/module/n-verify",
        icon: ShieldCheck,
      },
      {
        label: "Vitals",
        to: "/module/n-vitals",
        icon: Activity,
      },
      {
        label: "Medical History",
        to: "/module/n-history",
        icon: FileText,
      },
      {
        label: "Report Upload",
        to: "/module/n-reports",
        icon: UploadCloud,
      },
      {
        label: "Ready For Consultation",
        to: "/module/n-ready",
        icon: CheckCircle2,
      },
    ],
  },
  {
    label: "Account",
    items: [
      {
        label: "Notifications",
        to: "/module/n-notifications",
        icon: Bell,
      },
      {
        label: "Profile",
        to: "/module/n-profile",
        icon: User,
      },
      {
        label: "Settings",
        to: "/module/n-settings",
        icon: Settings,
      },
    ],
  },
];

function navFor(role: Role): NavGroup[] {
  const normalized = String(role ?? "")
    .trim()
    .toUpperCase()
    .replace(/-/g, "_");

  if (
    normalized === "SUPER_ADMIN" ||
    normalized === "HOSPITAL_ADMIN" ||
    normalized === "ADMIN" ||
    normalized === "ADMINISTRATOR"
  ) {
    return ADMIN_NAV;
  }

  if (normalized === "DOCTOR") return DOCTOR_NAV;
  return NURSE_NAV;
}

export function AppSidebar() {
  const { user, logout } = useAuth();

  const pathname = useRouterState({
    select: (s) => s.location.pathname,
  });

  // Mobile sidebar state
  const [mobileOpen, setMobileOpen] = useState(false);

  // Desktop sidebar collapse state
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const groups = navFor(user.role);

  const handleNavigation = () => {
    // Close sidebar after navigation on mobile
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      setMobileOpen(false);
    }
  };

  return (
    <>
      {/* ================================================= */}
      {/* MOBILE MENU BUTTON */}
      {/* ================================================= */}

      <div className="fixed left-3 top-3 z-[60] lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label="Open navigation menu"
          onClick={() => setMobileOpen(true)}
          className="h-10 w-10 bg-background shadow-sm"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* ================================================= */}
      {/* MOBILE OVERLAY */}
      {/* ================================================= */}

      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "bg-sidebar text-sidebar-foreground",
          "border-r border-sidebar-border",
          "transition-all duration-200 ease-in-out",

          // Mobile
          "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full",

          // Desktop
          "lg:static lg:z-auto lg:translate-x-0",

          // Desktop width
          collapsed ? "lg:w-20" : "lg:w-64",
        )}
      >
        {/* ================================================= */}
        {/* SIDEBAR HEADER */}
        {/* ================================================= */}

        <div
          className={cn(
            "flex h-16 shrink-0 items-center border-b border-sidebar-border",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          {/* Logo */}
          <div
            className={cn(
              "min-w-0 overflow-hidden transition-all",
              collapsed ? "w-0 lg:hidden" : "w-auto",
            )}
          >
            <JeevixLogo />
          </div>

          {/* Mobile close */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close navigation menu"
            onClick={() => setMobileOpen(false)}
            className="text-sidebar-foreground hover:bg-sidebar-accent lg:hidden"
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Desktop collapse button */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((current) => !current)}
            className="hidden shrink-0 text-sidebar-foreground hover:bg-sidebar-accent lg:flex"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-5 w-5" />
            ) : (
              <PanelLeftClose className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* ================================================= */}
        {/* NAVIGATION */}
        {/* ================================================= */}

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {groups.map((group, gi) => (
            <div key={gi} className={cn(gi > 0 && "mt-5")}>
              {/* Group title */}
              {group.label && !collapsed && (
                <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-sidebar-foreground/50">
                  {group.label}
                </div>
              )}

              {/* Navigation items */}
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const active = pathname === item.to;
                  const Icon = item.icon;

                  return (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        onClick={handleNavigation}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group flex items-center rounded-lg py-2 text-[14px] font-medium transition-colors",

                          collapsed ? "justify-center px-2" : "gap-3 px-3",

                          active
                            ? "bg-sidebar-accent text-sidebar-primary-foreground shadow-[inset_2px_0_0_var(--sidebar-primary)]"
                            : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-primary-foreground",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-[18px] w-[18px] shrink-0",

                            active
                              ? "text-sidebar-primary"
                              : "text-sidebar-foreground/60 group-hover:text-sidebar-primary",
                          )}
                        />

                        {/* Hide label when collapsed */}
                        {!collapsed && <span className="truncate">{item.label}</span>}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ================================================= */}
        {/* USER / LOGOUT */}
        {/* ================================================= */}

        <div className="shrink-0 border-t border-sidebar-border p-3">
          {/* User information */}
          <div
            className={cn(
              "mb-2 flex items-center rounded-lg py-2",
              collapsed ? "justify-center px-0" : "gap-3 px-2",
            )}
          >
            {/* Avatar */}
            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
              {user.name
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")}
            </div>

            {/* User details */}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{user.name}</div>

                <div className="truncate text-[11px] text-sidebar-foreground/60">
                  {user.title || user.role}
                </div>
              </div>
            )}
          </div>

          {/* Logout */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            title={collapsed ? "Sign out" : undefined}
            className={cn(
              "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-primary-foreground",
              collapsed ? "w-full justify-center px-0" : "w-full justify-start",
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4 shrink-0" />

            {!collapsed && <span className="ml-2">Sign out</span>}
          </Button>
        </div>
      </aside>
    </>
  );
}
