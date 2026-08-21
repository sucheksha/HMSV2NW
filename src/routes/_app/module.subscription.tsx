import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, Sparkles, Send, CreditCard, Building2, Zap } from "lucide-react";
import { toast } from "sonner";

import { TopBar } from "@/components/hms/TopBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

import {
  getSubscription,
  updateSubscription,
  type SubscriptionResponse,
  type SubscriptionUpdatePayload,
} from "@/services/subscription.service";

export const Route = createFileRoute("/_app/module/subscription")({
  component: SubscriptionPage,
});

interface Plan {
  id: "starter" | "professional" | "enterprise";
  name: string;
  tagline: string;
  icon: typeof CreditCard;
  monthly: number;
  annual: number;
  features: string[];
  highlight?: boolean;
}

const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    tagline: "Suitable for small clinics",
    icon: CreditCard,
    monthly: 4999,
    annual: 49990,
    features: [
      "Basic Patient Management",
      "Appointments",
      "Billing",
      "Reports",
      "Up to 5 staff accounts",
      "Email support",
    ],
  },
  {
    id: "professional",
    name: "Professional",
    tagline: "Suitable for medium hospitals",
    icon: Building2,
    monthly: 12999,
    annual: 129990,
    highlight: true,
    features: [
      "Everything in Starter",
      "Pharmacy & Laboratory",
      "IPD & OPD workflows",
      "Staff Management",
      "Up to 50 staff accounts",
      "Priority email support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    tagline: "Suitable for large hospitals",
    icon: Zap,
    monthly: 29999,
    annual: 299990,
    features: [
      "Everything in Professional",
      "AI Voice Assistant",
      "Analytics Dashboard",
      "Predictive Reports",
      "Multi-branch support",
      "API integration & SSO",
      "24×7 priority support",
    ],
  },
];

const ADDONS = [
  "AI Voice Assistant",
  "Custom Dashboard",
  "Mobile App",
  "Website",
  "SMS Integration",
  "WhatsApp Integration",
  "AI Reports",
  "API Integration",
  "Training",
  "Data Migration",
];

type ModuleKey =
  | "patients"
  | "appointments"
  | "opd"
  | "ipd"
  | "laboratory"
  | "pharmacy"
  | "inventory"
  | "diagnosis"
  | "billing"
  | "expenses"
  | "reports"
  | "analytics"
  | "staff"
  | "doctors"
  | "departments"
  | "wards"
  | "rooms"
  | "beds"
  | "masterData";

const ALL_MODULES: ModuleKey[] = [
  "patients",
  "appointments",
  "opd",
  "ipd",
  "laboratory",
  "pharmacy",
  "inventory",
  "diagnosis",
  "billing",
  "expenses",
  "reports",
  "analytics",
  "staff",
  "doctors",
  "departments",
  "wards",
  "rooms",
  "beds",
  "masterData",
];

function SubscriptionPage() {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isHospitalAdmin = user?.role === "HOSPITAL_ADMIN";

  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  /*
   * This is the plan currently stored in MongoDB.
   * null means no plan has been assigned.
   */
  const [activePlan, setActivePlan] = useState<Plan["id"] | null>(null);

  /*
   * This is the plan the Super Admin has selected
   * but has NOT confirmed yet.
   */
  const [selectedPlan, setSelectedPlan] = useState<Plan["id"] | null>(null);

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const [notes, setNotes] = useState("");

  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * Load subscription from MongoDB.
   */
  useEffect(() => {
    const loadSubscription = async () => {
      if (!user?.hospitalId) {
        setError("Hospital information is not available.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getSubscription(user.hospitalId);

        setSubscription(data);

        /*
         * Backend is the source of truth.
         * Do NOT default to professional.
         */
        const backendPlan = data.subscription?.plan?.toLowerCase();

        if (
          backendPlan === "starter" ||
          backendPlan === "professional" ||
          backendPlan === "enterprise"
        ) {
          setActivePlan(backendPlan);
        } else {
          setActivePlan(null);
        }

        /*
         * Initially nothing is pending.
         */
        setSelectedPlan(null);
      } catch (err) {
        console.error("Failed to load subscription:", err);
        setError("Unable to load subscription details.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user?.hospitalId]);

  /*
   * Modules currently stored in MongoDB.
   */
  const enabledModules = subscription?.subscription?.modules ?? {};

  /*
   * Select a plan.
   *
   * IMPORTANT:
   * This does NOT update MongoDB.
   * It only marks the plan as pending until
   * the Super Admin confirms it.
   */
  function selectPlan(planId: Plan["id"]) {
    if (!isSuperAdmin) return;

    setSelectedPlan(planId);
  }

  /*
   * Convert selected plan into backend module configuration.
   *
   * These values are what will be stored in:
   *
   * hospital.subscription.modules
   */
  function getModulesForPlan(planId: Plan["id"]): Record<ModuleKey, boolean> {
    const modules: Record<ModuleKey, boolean> = Object.fromEntries(
      ALL_MODULES.map((module) => [module, false]),
    ) as Record<ModuleKey, boolean>;

    if (planId === "starter") {
      modules.patients = true;
      modules.appointments = true;
      modules.billing = true;
      modules.reports = true;
    }

    if (planId === "professional") {
      modules.patients = true;
      modules.appointments = true;
      modules.opd = true;
      modules.ipd = true;
      modules.laboratory = true;
      modules.pharmacy = true;
      modules.inventory = true;
      modules.billing = true;
      modules.reports = true;
      modules.staff = true;
      modules.doctors = true;
      modules.departments = true;
      modules.wards = true;
      modules.rooms = true;
      modules.beds = true;
    }

    if (planId === "enterprise") {
      ALL_MODULES.forEach((module) => {
        modules[module] = true;
      });
    }

    return modules;
  }

  /*
   * CONFIRM PLAN
   *
   * This is the important function.
   *
   * Flow:
   *
   * Super Admin selects plan
   *       ↓
   * clicks Confirm
   *       ↓
   * PUT /hospitals/:hospitalId/subscription
   *       ↓
   * backend updates MongoDB
   *       ↓
   * frontend updates from backend response
   */
  async function confirmPlan() {
    if (!isSuperAdmin) return;

    if (!user?.hospitalId) {
      toast.error("Hospital information is not available.");
      return;
    }

    if (!selectedPlan) {
      toast.error("Please select a subscription plan.");
      return;
    }

    try {
      setSaving(true);

      const modules = getModulesForPlan(selectedPlan);

      const payload: SubscriptionUpdatePayload = {
        plan: selectedPlan.toUpperCase() as "STARTER" | "PROFESSIONAL" | "ENTERPRISE",

        status: "ACTIVE",

        /*
         * If an existing subscription has dates,
         * preserve them.
         *
         * Otherwise start today.
         */
        startDate: subscription?.subscription?.startDate ?? new Date().toISOString(),

        endDate: subscription?.subscription?.endDate ?? null,

        modules,

        limits: subscription?.subscription?.limits ?? {
          maxStaff: null,
          maxDoctors: null,
          maxPatients: null,
          maxStorage: null,
        },
      };

      const updated = await updateSubscription(user.hospitalId, payload);

      /*
       * Backend response becomes the new source of truth.
       */
      setSubscription(updated);

      const updatedPlan = updated.subscription?.plan?.toLowerCase();

      if (
        updatedPlan === "starter" ||
        updatedPlan === "professional" ||
        updatedPlan === "enterprise"
      ) {
        setActivePlan(updatedPlan);
      }

      setSelectedPlan(null);

      toast.success(
        `${PLANS.find((p) => p.id === activePlan)?.name ?? "Subscription"} updated successfully.`,
      );
    } catch (err) {
      console.error("Failed to update subscription:", err);

      toast.error("Failed to update subscription. Please check the server response.");
    } finally {
      setSaving(false);
    }
  }

  function toggleAddon(addon: string) {
    if (!isSuperAdmin) return;

    setSelectedAddons((current) =>
      current.includes(addon) ? current.filter((item) => item !== addon) : [...current, addon],
    );
  }

  function submitRequest() {
    if (selectedAddons.length === 0) {
      toast.error("Select at least one service to request.");
      return;
    }

    toast.success(`Request submitted · ${selectedAddons.length} service(s).`);

    setSelectedAddons([]);
    setNotes("");
  }

  /*
   * Displayed current plan.
   *
   * This comes from MongoDB, not a hardcoded
   * "professional" value.
   */
  const currentPlan = PLANS.find((plan) => plan.id === activePlan) ?? null;

  /*
   * Plan currently waiting for confirmation.
   */
  const pendingPlan = PLANS.find((plan) => plan.id === selectedPlan) ?? null;

  if (loading) {
    return (
      <>
        <TopBar title="Subscription" subtitle="Plans, billing and add-on services" />

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              Loading subscription...
            </div>
          </div>
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <TopBar title="Subscription" subtitle="Plans, billing and add-on services" />

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive">
              {error}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Subscription" subtitle="Plans, billing and add-on services" />

      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* =====================================================
              CURRENT PLAN
             ===================================================== */}

          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                {currentPlan ? (
                  <currentPlan.icon className="h-6 w-6" />
                ) : (
                  <CreditCard className="h-6 w-6" />
                )}
              </div>

              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Current plan
                </div>

                <div className="text-lg font-semibold text-foreground">
                  {currentPlan?.name ?? "No plan assigned"}
                </div>

                <div className="text-[13px] text-muted-foreground">
                  {currentPlan
                    ? `${currentPlan.tagline} · Billed ${billing}`
                    : "No subscription plan is currently assigned"}
                </div>
              </div>
            </div>

            {currentPlan && (
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  ₹
                  {(billing === "monthly"
                    ? currentPlan.monthly
                    : currentPlan.annual
                  ).toLocaleString("en-IN")}
                </div>

                <div className="text-[12px] text-muted-foreground">
                  / {billing === "monthly" ? "month" : "year"}
                </div>
              </div>
            )}
          </section>

          {/* =====================================================
              PENDING CHANGE
             ===================================================== */}

          {isSuperAdmin && pendingPlan && (
            <section className="rounded-2xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                    Pending subscription change
                  </div>

                  <div className="mt-1 text-base font-semibold text-foreground">
                    {pendingPlan.name}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Click Confirm to save this plan to the hospital subscription.
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedPlan(null)} disabled={saving}>
                    Cancel
                  </Button>

                  <Button onClick={confirmPlan} disabled={saving}>
                    {saving ? "Saving..." : `Confirm ${pendingPlan.name}`}
                  </Button>
                </div>
              </div>
            </section>
          )}

          {/* =====================================================
              PLANS
             ===================================================== */}

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold text-foreground">Subscription Plans</h2>

                <p className="text-[13px] text-muted-foreground">
                  {isSuperAdmin
                    ? "Select a plan and confirm the change for your hospital."
                    : "View the subscription plan assigned to your hospital."}
                </p>
              </div>

              <div className="inline-flex rounded-full border border-border bg-secondary/50 p-1">
                {(["monthly", "annual"] as const).map((period) => (
                  <button
                    key={period}
                    onClick={() => setBilling(period)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[12.5px] font-medium capitalize transition",
                      billing === period
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {period}

                    {period === "annual" && (
                      <span className="ml-1.5 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                        -16%
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {PLANS.map((plan) => {
                const active = plan.id === activePlan;

                const pending = plan.id === selectedPlan;

                const price = billing === "monthly" ? plan.monthly : plan.annual;

                const Icon = plan.icon;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition",
                      plan.highlight ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
                      active && "ring-2 ring-primary",
                      pending && "border-primary ring-2 ring-primary/40",
                    )}
                  >
                    {plan.highlight && (
                      <span className="absolute -top-2.5 left-6 rounded-full bg-primary px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary-foreground">
                        Most popular
                      </span>
                    )}

                    <div className="mb-4 flex items-center gap-3">
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </div>

                      <div>
                        <div className="text-[15px] font-semibold text-foreground">{plan.name}</div>

                        <div className="text-[12px] text-muted-foreground">{plan.tagline}</div>
                      </div>
                    </div>

                    <div className="mb-5">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold text-foreground">
                          ₹{price.toLocaleString("en-IN")}
                        </span>

                        <span className="text-[12.5px] text-muted-foreground">
                          / {billing === "monthly" ? "mo" : "yr"}
                        </span>
                      </div>
                    </div>

                    <ul className="mb-6 flex-1 space-y-2.5">
                      {plan.features.map((feature) => (
                        <li
                          key={feature}
                          className="flex items-start gap-2 text-[13px] text-foreground"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={active ? "secondary" : plan.highlight ? "default" : "outline"}
                      disabled={!isSuperAdmin || saving || active}
                      onClick={() => selectPlan(plan.id)}
                      className="w-full"
                    >
                      {active
                        ? "Current plan"
                        : isSuperAdmin
                          ? pending
                            ? "Selected"
                            : `Select ${plan.name}`
                          : "View plan"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =====================================================
              ENABLED MODULES
             ===================================================== */}

          <section className="rounded-2xl border border-border bg-card p-6">
            <div className="mb-4">
              <h2 className="text-[16px] font-semibold text-foreground">Enabled Modules</h2>

              <p className="text-[13px] text-muted-foreground">
                Modules currently enabled for this hospital.
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {ALL_MODULES.map((module) => {
                const enabled = Boolean(enabledModules[module as keyof typeof enabledModules]);

                return (
                  <div
                    key={module}
                    className={cn(
                      "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
                      enabled ? "border-primary/30 bg-primary/5" : "border-border bg-background",
                    )}
                  >
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full",
                        enabled ? "bg-primary" : "bg-muted-foreground/30",
                      )}
                    />

                    <span className="capitalize">{module.replace(/([A-Z])/g, " $1").trim()}</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* =====================================================
              ADDITIONAL SERVICES
             ===================================================== */}

          {isSuperAdmin && (
            <section className="rounded-2xl border border-border bg-card p-6">
              <div className="mb-4 flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-[16px] font-semibold text-foreground">
                    Request Additional Services
                  </h2>

                  <p className="text-[13px] text-muted-foreground">
                    Tell us what you need — our team will follow up within 24 hours.
                  </p>
                </div>
              </div>

              <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {ADDONS.map((addon) => {
                  const checked = selectedAddons.includes(addon);

                  return (
                    <label
                      key={addon}
                      className={cn(
                        "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] transition",
                        checked
                          ? "border-primary/50 bg-primary/5"
                          : "border-border hover:border-primary/30 hover:bg-secondary/50",
                      )}
                    >
                      <Checkbox checked={checked} onCheckedChange={() => toggleAddon(addon)} />

                      <span className="text-foreground">{addon}</span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4">
                <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">
                  Additional notes
                </label>

                <Textarea
                  rows={3}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Share timelines, integration requirements, or specific goals…"
                />
              </div>

              <div className="mt-4 flex justify-end">
                <Button onClick={submitRequest} className="gap-1.5">
                  <Send className="h-4 w-4" />
                  Submit request
                </Button>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
