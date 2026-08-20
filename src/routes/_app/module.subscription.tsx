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
  type SubscriptionPlan,
  type SubscriptionResponse,
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

const PLAN_TO_BACKEND: Record<Plan["id"], SubscriptionPlan> = {
  starter: "STARTER",
  professional: "PROFESSIONAL",
  enterprise: "ENTERPRISE",
};

const BACKEND_TO_PLAN: Record<SubscriptionPlan, Plan["id"]> = {
  STARTER: "starter",
  PROFESSIONAL: "professional",
  ENTERPRISE: "enterprise",
};

function SubscriptionPage() {
  const { user } = useAuth();

  const isSuperAdmin = user?.role === "SUPER_ADMIN";
  const isHospitalAdmin = user?.role === "HOSPITAL_ADMIN";

  const [billing, setBilling] = useState<"monthly" | "annual">("annual");

  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [updatingPlan, setUpdatingPlan] = useState<Plan["id"] | null>(null);

  const [error, setError] = useState<string | null>(null);

  /*
   * Load subscription from backend.
   *
   * The hospitalId comes from the logged-in user.
   * There is no hardcoded hospital ID.
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
      } catch (error) {
        console.error("Failed to load subscription:", error);
        setError("Unable to load subscription details.");
      } finally {
        setLoading(false);
      }
    };

    loadSubscription();
  }, [user?.hospitalId]);

  /*
   * The backend stores:
   *
   * STARTER
   * PROFESSIONAL
   * ENTERPRISE
   *
   * The UI uses:
   *
   * starter
   * professional
   * enterprise
   */
  const activePlan: Plan["id"] | null = subscription?.subscription?.plan
    ? BACKEND_TO_PLAN[subscription.subscription.plan]
    : null;

  const currentPlan = activePlan ? PLANS.find((plan) => plan.id === activePlan) : null;

  function toggleAddon(addon: string) {
    setSelectedAddons((current) =>
      current.includes(addon) ? current.filter((item) => item !== addon) : [...current, addon],
    );
  }

  /*
   * Super Admin changes the actual subscription.
   *
   * This is NOT a request to the team.
   *
   * It directly updates MongoDB through:
   *
   * PUT /hospitals/:hospitalId/subscription
   */
  async function changePlan(planId: Plan["id"]) {
    if (!isSuperAdmin) {
      return;
    }

    if (!user?.hospitalId) {
      toast.error("Hospital information is not available.");
      return;
    }

    const currentSubscription = subscription?.subscription;

    if (!currentSubscription) {
      toast.error("No subscription information is available.");
      return;
    }

    try {
      setUpdatingPlan(planId);

      const updatedSubscription = await updateSubscription(user.hospitalId, {
        /*
         * Only the plan is changing.
         * Existing subscription information is preserved
         * because the backend replaces the whole subscription object.
         */
        plan: PLAN_TO_BACKEND[planId],

        status: currentSubscription.status ?? "ACTIVE",

        startDate: currentSubscription.startDate,

        endDate: currentSubscription.endDate,

        modules: currentSubscription.modules,

        limits: currentSubscription.limits,
      });

      /*
       * Use the backend response as the new source of truth.
       */
      setSubscription(updatedSubscription);

      const selectedPlan = PLANS.find((plan) => plan.id === planId);

      toast.success(`${selectedPlan?.name ?? "Subscription"} plan selected successfully.`);
    } catch (error) {
      console.error("Failed to update subscription:", error);

      toast.error("Unable to update subscription plan.");
    } finally {
      setUpdatingPlan(null);
    }
  }

  function submitRequest() {
    if (selectedAddons.length === 0) {
      return toast.error("Select at least one service to request.");
    }

    toast.success(
      `Request submitted · ${selectedAddons.length} service(s). Our team will contact you.`,
    );

    setSelectedAddons([]);
    setNotes("");
  }

  /*
   * Loading state
   */
  if (loading) {
    return (
      <>
        <TopBar title="Subscription" subtitle="Plans, billing and add-on services" />

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
              Loading subscription details...
            </div>
          </div>
        </main>
      </>
    );
  }

  /*
   * Error state
   */
  if (error) {
    return (
      <>
        <TopBar title="Subscription" subtitle="Plans, billing and add-on services" />

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-destructive/30 bg-card p-8 text-center text-sm text-destructive">
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
          {/* ==========================================
              Current Plan
          ========================================== */}

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
                  {currentPlan?.tagline ?? "No subscription plan is currently assigned"}
                  {currentPlan && <> · Billed {billing}</>}
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

          {/* ==========================================
              Subscription Plans
          ========================================== */}

          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold text-foreground">Subscription Plans</h2>

                <p className="text-[13px] text-muted-foreground">
                  {isSuperAdmin
                    ? "Choose the plan that fits your hospital."
                    : "View the subscription plan assigned to your hospital."}
                </p>
              </div>

              {/* Billing selector */}
              <div className="inline-flex rounded-full border border-border bg-secondary/50 p-1">
                {(["monthly", "annual"] as const).map((billingOption) => (
                  <button
                    key={billingOption}
                    onClick={() => setBilling(billingOption)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[12.5px] font-medium capitalize transition",
                      billing === billingOption
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {billingOption}

                    {billingOption === "annual" && (
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

                const price = billing === "monthly" ? plan.monthly : plan.annual;

                const Icon = plan.icon;

                const isUpdating = updatingPlan === plan.id;

                /*
                 * Hospital Admin:
                 * - Current plan remains visible normally.
                 * - Other plans are visually frozen/grey.
                 *
                 * Super Admin:
                 * - All plans remain selectable.
                 */
                const frozenForAdmin = isHospitalAdmin && !active;

                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition",

                      plan.highlight ? "border-primary/40 ring-1 ring-primary/20" : "border-border",

                      active && "ring-2 ring-primary",

                      frozenForAdmin && "opacity-60",
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
                      disabled={active || !isSuperAdmin || updatingPlan !== null}
                      onClick={() => changePlan(plan.id)}
                      className="w-full"
                    >
                      {active
                        ? "Current plan"
                        : isHospitalAdmin
                          ? "View plan"
                          : isUpdating
                            ? "Updating..."
                            : `Select ${plan.name}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* ==========================================
              Additional Services
              Super Admin only
          ========================================== */}

          {isSuperAdmin && (
            <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
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
