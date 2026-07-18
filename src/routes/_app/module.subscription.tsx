import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, Send, CreditCard, Building2, Zap } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/hms/TopBar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

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

function SubscriptionPage() {
  const [billing, setBilling] = useState<"monthly" | "annual">("annual");
  const [activePlan, setActivePlan] = useState<Plan["id"]>("professional");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [notes, setNotes] = useState("");

  function toggleAddon(a: string) {
    setSelectedAddons((s) => (s.includes(a) ? s.filter((x) => x !== a) : [...s, a]));
  }

  function upgrade(planId: Plan["id"]) {
    setActivePlan(planId);
    toast.success(`Upgrade request submitted for ${PLANS.find((p) => p.id === planId)?.name}.`);
  }

  function submitRequest() {
    if (selectedAddons.length === 0) return toast.error("Select at least one service to request.");
    toast.success(`Request submitted · ${selectedAddons.length} service(s). Our team will contact you.`);
    setSelectedAddons([]);
    setNotes("");
  }

  const currentPlan = PLANS.find((p) => p.id === activePlan)!;

  return (
    <>
      <TopBar title="Subscription" subtitle="Plans, billing and add-on services" />
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* Current plan summary */}
          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <currentPlan.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current plan</div>
                <div className="text-lg font-semibold text-foreground">{currentPlan.name}</div>
                <div className="text-[13px] text-muted-foreground">{currentPlan.tagline} · Billed {billing}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-foreground">
                ₹{(billing === "monthly" ? currentPlan.monthly : currentPlan.annual).toLocaleString("en-IN")}
              </div>
              <div className="text-[12px] text-muted-foreground">/ {billing === "monthly" ? "month" : "year"}</div>
            </div>
          </section>

          {/* Plans */}
          <section>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-[18px] font-semibold text-foreground">Subscription Plans</h2>
                <p className="text-[13px] text-muted-foreground">Choose the plan that fits your hospital.</p>
              </div>
              <div className="inline-flex rounded-full border border-border bg-secondary/50 p-1">
                {(["monthly", "annual"] as const).map((b) => (
                  <button
                    key={b}
                    onClick={() => setBilling(b)}
                    className={cn(
                      "rounded-full px-4 py-1.5 text-[12.5px] font-medium capitalize transition",
                      billing === b ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {b}
                    {b === "annual" && <span className="ml-1.5 rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">-16%</span>}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {PLANS.map((plan) => {
                const active = plan.id === activePlan;
                const price = billing === "monthly" ? plan.monthly : plan.annual;
                const Icon = plan.icon;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative flex flex-col rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)] transition",
                      plan.highlight ? "border-primary/40 ring-1 ring-primary/20" : "border-border",
                      active && "ring-2 ring-primary",
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
                        <span className="text-3xl font-bold text-foreground">₹{price.toLocaleString("en-IN")}</span>
                        <span className="text-[12.5px] text-muted-foreground">/ {billing === "monthly" ? "mo" : "yr"}</span>
                      </div>
                    </div>
                    <ul className="mb-6 flex-1 space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-[13px] text-foreground">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={active ? "secondary" : plan.highlight ? "default" : "outline"}
                      disabled={active}
                      onClick={() => upgrade(plan.id)}
                      className="w-full"
                    >
                      {active ? "Current plan" : `Upgrade to ${plan.name}`}
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Request add-ons */}
          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-accent">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[16px] font-semibold text-foreground">Request Additional Services</h2>
                <p className="text-[13px] text-muted-foreground">Tell us what you need — our team will follow up within 24 hours.</p>
              </div>
            </div>
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
              {ADDONS.map((a) => {
                const checked = selectedAddons.includes(a);
                return (
                  <label
                    key={a}
                    className={cn(
                      "flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-[13px] transition",
                      checked ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/30 hover:bg-secondary/50",
                    )}
                  >
                    <Checkbox checked={checked} onCheckedChange={() => toggleAddon(a)} />
                    <span className="text-foreground">{a}</span>
                  </label>
                );
              })}
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-[12.5px] font-medium text-foreground">Additional notes</label>
              <Textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share timelines, integration requirements, or specific goals…"
              />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={submitRequest} className="gap-1.5"><Send className="h-4 w-4" /> Submit request</Button>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
