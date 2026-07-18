import { createFileRoute } from "@tanstack/react-router";
import { useState, type ChangeEvent } from "react";
import { Save, Upload, X, Hospital } from "lucide-react";
import { toast } from "sonner";
import { TopBar } from "@/components/hms/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useHospitalProfile,
  saveHospitalProfile,
  type HospitalProfile,
} from "@/lib/hospital-profile";

export const Route = createFileRoute("/_app/module/hospital-profile")({
  component: HospitalProfilePage,
});

function HospitalProfilePage() {
  const [profile, setProfile] = useHospitalProfile();
  const [draft, setDraft] = useState<HospitalProfile>(profile);
  const [deptInput, setDeptInput] = useState("");

  function update<K extends keyof HospitalProfile>(key: K, value: HospitalProfile[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function handleImage(field: "logoUrl" | "coverUrl") {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => update(field, reader.result as string);
      reader.readAsDataURL(file);
    };
  }

  function addDept() {
    const v = deptInput.trim();
    if (!v) return;
    if (draft.departments.includes(v)) return;
    update("departments", [...draft.departments, v]);
    setDeptInput("");
  }

  function removeDept(d: string) {
    update("departments", draft.departments.filter((x) => x !== d));
  }

  function save() {
    saveHospitalProfile(draft);
    setProfile(draft);
    toast.success("Hospital profile updated. Login page will reflect changes.");
  }

  return (
    <>
      <TopBar title="Hospital Profile" subtitle="Personalize your login page and workspace" />
      <main className="flex-1 px-6 py-6">
        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[1fr_320px]">
          {/* Form */}
          <div className="space-y-6">
            <Section title="Branding" description="Displayed on the login page">
              <div className="grid gap-5 sm:grid-cols-2">
                <ImageField
                  label="Hospital Logo"
                  hint="Square PNG or SVG. Max 2MB."
                  value={draft.logoUrl}
                  onChange={handleImage("logoUrl")}
                  onClear={() => update("logoUrl", null)}
                  aspect="square"
                />
                <ImageField
                  label="Cover Image"
                  hint="Landscape photo of your hospital"
                  value={draft.coverUrl}
                  onChange={handleImage("coverUrl")}
                  onClear={() => update("coverUrl", "")}
                  aspect="landscape"
                />
              </div>
            </Section>

            <Section title="General information">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Hospital Name" required>
                  <Input value={draft.name} onChange={(e) => update("name", e.target.value)} />
                </Field>
                <Field label="Hospital Type">
                  <Input value={draft.type} onChange={(e) => update("type", e.target.value)} placeholder="Multispeciality, Clinic, etc." />
                </Field>
                <Field label="Welcome Message" className="sm:col-span-2">
                  <Input value={draft.welcomeMessage} onChange={(e) => update("welcomeMessage", e.target.value)} />
                </Field>
                <Field label="Description" className="sm:col-span-2">
                  <Textarea rows={3} value={draft.description} onChange={(e) => update("description", e.target.value)} />
                </Field>
              </div>
            </Section>

            <Section title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Address" className="sm:col-span-2">
                  <Input value={draft.address} onChange={(e) => update("address", e.target.value)} />
                </Field>
                <Field label="City">
                  <Input value={draft.city} onChange={(e) => update("city", e.target.value)} />
                </Field>
                <Field label="State">
                  <Input value={draft.state} onChange={(e) => update("state", e.target.value)} />
                </Field>
                <Field label="Country">
                  <Input value={draft.country} onChange={(e) => update("country", e.target.value)} />
                </Field>
                <Field label="Number of Beds">
                  <Input type="number" min={0} value={draft.beds} onChange={(e) => update("beds", Number(e.target.value) || 0)} />
                </Field>
                <Field label="Phone">
                  <Input value={draft.phone} onChange={(e) => update("phone", e.target.value)} />
                </Field>
                <Field label="Email">
                  <Input type="email" value={draft.email} onChange={(e) => update("email", e.target.value)} />
                </Field>
                <Field label="Website" className="sm:col-span-2">
                  <Input value={draft.website} onChange={(e) => update("website", e.target.value)} />
                </Field>
              </div>
            </Section>

            <Section title="Departments" description="Shown on internal directory">
              <div className="flex flex-wrap gap-2">
                {draft.departments.map((d) => (
                  <span key={d} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary/60 px-3 py-1 text-[12.5px] text-foreground">
                    {d}
                    <button type="button" onClick={() => removeDept(d)} aria-label={`Remove ${d}`} className="text-muted-foreground hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input
                  placeholder="Add department (e.g. Cardiology)"
                  value={deptInput}
                  onChange={(e) => setDeptInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addDept())}
                />
                <Button type="button" variant="secondary" onClick={addDept}>Add</Button>
              </div>
            </Section>

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setDraft(profile)}>Reset</Button>
              <Button onClick={save} className="gap-1.5"><Save className="h-4 w-4" /> Save changes</Button>
            </div>
          </div>

          {/* Live preview */}
          <aside className="sticky top-20 h-fit space-y-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Login preview</div>
            <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-card)]">
              <div className="relative h-40 bg-secondary">
                {draft.coverUrl ? (
                  <img src={draft.coverUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full place-items-center text-muted-foreground"><Hospital className="h-8 w-8" /></div>
                )}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/80 via-primary/55 to-accent/40" />
                {draft.logoUrl && (
                  <img src={draft.logoUrl} alt="" className="absolute left-4 top-4 h-10 w-10 rounded-lg border border-white/30 bg-white/10 object-contain p-1" />
                )}
              </div>
              <div className="p-4">
                <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{draft.welcomeMessage}</div>
                <div className="mt-1 text-lg font-bold leading-tight text-foreground">{draft.name || "Hospital Name"}</div>
                <p className="mt-1.5 line-clamp-3 text-[12.5px] text-muted-foreground">{draft.description}</p>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-5">
        <h3 className="text-[15px] font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-0.5 text-[12.5px] text-muted-foreground">{description}</p>}
      </div>
      {children}
    </section>
  );
}

function Field({ label, required, className, children }: { label: string; required?: boolean; className?: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <Label className="mb-1.5 block text-[12.5px] font-medium text-foreground">
        {label}{required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
    </div>
  );
}

function ImageField({
  label, hint, value, onChange, onClear, aspect,
}: {
  label: string; hint: string; value: string | null; onChange: (e: ChangeEvent<HTMLInputElement>) => void; onClear: () => void; aspect: "square" | "landscape";
}) {
  return (
    <div>
      <Label className="mb-1.5 block text-[12.5px] font-medium text-foreground">{label}</Label>
      <div className={`relative overflow-hidden rounded-xl border-2 border-dashed border-border bg-secondary/40 ${aspect === "square" ? "aspect-square max-w-[180px]" : "aspect-video"}`}>
        {value ? (
          <>
            <img src={value} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={onClear} className="absolute right-2 top-2 grid h-7 w-7 place-items-center rounded-full bg-background/90 text-foreground shadow hover:bg-background" aria-label="Remove image">
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <label className="flex h-full w-full cursor-pointer flex-col items-center justify-center gap-1 text-muted-foreground hover:text-foreground">
            <Upload className="h-5 w-5" />
            <span className="text-[12px]">Click to upload</span>
            <input type="file" accept="image/*" className="hidden" onChange={onChange} />
          </label>
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground">{hint}</p>
      {value && (
        <label className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-[12px] font-medium text-primary hover:underline">
          <Upload className="h-3.5 w-3.5" /> Replace
          <input type="file" accept="image/*" className="hidden" onChange={onChange} />
        </label>
      )}
    </div>
  );
}
