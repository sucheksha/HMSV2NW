import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, MapPin, FileCheck, Award, Upload, Save, X } from "lucide-react";
import { toast } from "sonner";

import { TopBar } from "@/components/hms/TopBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getHospitalProfile,
  updateHospitalProfile,
  type HospitalProfile,
  type UpdateHospitalProfilePayload,
} from "@/services/hospital.service";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/module/hospital")({
  component: HospitalProfilePage,
});

function HospitalProfilePage() {
  const { user } = useAuth();

  const [hospital, setHospital] = useState<HospitalProfile | null>(null);
  const [form, setForm] = useState<UpdateHospitalProfilePayload>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isHospitalAdmin = user?.role === "HOSPITAL_ADMIN";

  // ==========================================
  // Load Hospital Profile
  // ==========================================

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);

        const data = await getHospitalProfile();

        setHospital(data);

        setForm({
          hospitalName: data.hospitalName ?? "",
          hospitalType: data.hospitalType,
          establishedDate: data.establishedDate ? data.establishedDate.substring(0, 10) : null,
          description: data.description ?? "",

          email: data.email ?? "",
          phone: data.phone ?? "",
          telephone: data.telephone ?? "",
          website: data.website ?? "",
          googleMaps: data.googleMaps ?? "",

          address: {
            line1: data.address?.line1 ?? "",
            line2: data.address?.line2 ?? "",
            city: data.address?.city ?? "",
            district: data.address?.district ?? "",
            state: data.address?.state ?? "",
            country: data.address?.country ?? "",
            pincode: data.address?.pincode ?? "",
          },

          registrationNumber: data.registrationNumber ?? "",
          registrationCertificate: data.registrationCertificate ?? null,
          registrationDate: data.registrationDate ? data.registrationDate.substring(0, 10) : null,
          registrationExpiryDate: data.registrationExpiryDate
            ? data.registrationExpiryDate.substring(0, 10)
            : null,

          logo: data.logo ?? null,

          nabhAccredited: data.nabhAccredited ?? false,
          nabhNumber: data.nabhNumber ?? "",
        });
      } catch (error) {
        console.error("Failed to load hospital profile:", error);

        toast.error("Unable to load hospital profile.");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  // ==========================================
  // Form Helpers
  // ==========================================

  const updateField = (field: keyof UpdateHospitalProfilePayload, value: unknown) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const updateAddress = (
    field: keyof NonNullable<UpdateHospitalProfilePayload["address"]>,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      address: {
        ...previous.address,
        [field]: value,
      },
    }));
  };

  // ==========================================
  // Save
  // ==========================================

  const handleSave = async () => {
    if (!isHospitalAdmin) {
      toast.error("You do not have permission to edit hospital profile.");
      return;
    }

    try {
      setSaving(true);

      const updated = await updateHospitalProfile(form);

      setHospital(updated);

      toast.success("Hospital profile updated successfully.");
    } catch (error) {
      console.error("Failed to update hospital profile:", error);

      toast.error("Unable to update hospital profile.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Cancel
  // ==========================================

  const handleCancel = () => {
    if (!hospital) return;

    setForm({
      hospitalName: hospital.hospitalName ?? "",
      hospitalType: hospital.hospitalType,
      establishedDate: hospital.establishedDate ? hospital.establishedDate.substring(0, 10) : null,
      description: hospital.description ?? "",

      email: hospital.email ?? "",
      phone: hospital.phone ?? "",
      telephone: hospital.telephone ?? "",
      website: hospital.website ?? "",
      googleMaps: hospital.googleMaps ?? "",

      address: {
        line1: hospital.address?.line1 ?? "",
        line2: hospital.address?.line2 ?? "",
        city: hospital.address?.city ?? "",
        district: hospital.address?.district ?? "",
        state: hospital.address?.state ?? "",
        country: hospital.address?.country ?? "",
        pincode: hospital.address?.pincode ?? "",
      },

      registrationNumber: hospital.registrationNumber ?? "",
      registrationCertificate: hospital.registrationCertificate ?? null,
      registrationDate: hospital.registrationDate
        ? hospital.registrationDate.substring(0, 10)
        : null,
      registrationExpiryDate: hospital.registrationExpiryDate
        ? hospital.registrationExpiryDate.substring(0, 10)
        : null,

      logo: hospital.logo ?? null,

      nabhAccredited: hospital.nabhAccredited ?? false,
      nabhNumber: hospital.nabhNumber ?? "",
    });

    toast.info("Changes discarded.");
  };

  if (loading) {
    return (
      <>
        <TopBar title="Hospital Profile" subtitle="Hospital information and registration details" />

        <main className="flex-1 px-6 py-6">
          <div className="mx-auto max-w-6xl">
            <div className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">
              Loading hospital profile...
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <TopBar title="Hospital Profile" subtitle="Hospital information and registration details" />

      <main className="flex-1 px-6 py-6">
        <div className="mx-auto max-w-6xl space-y-6">
          {/* ==========================================
              BASIC INFORMATION
          ========================================== */}

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-6 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Building2 className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-[16px] font-semibold text-foreground">Basic Information</h2>

                <p className="text-[13px] text-muted-foreground">
                  General information about the hospital.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Hospital Name</label>

                <Input
                  value={form.hospitalName ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("hospitalName", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Hospital Type</label>

                <select
                  value={form.hospitalType ?? "PRIVATE"}
                  disabled={!isHospitalAdmin}
                  onChange={(e) =>
                    updateField("hospitalType", e.target.value as HospitalProfile["hospitalType"])
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="PRIVATE">Private</option>
                  <option value="GOVERNMENT">Government</option>
                  <option value="TRUST">Trust</option>
                  <option value="CORPORATE">Corporate</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Established Date</label>

                <Input
                  type="date"
                  value={form.establishedDate ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("establishedDate", e.target.value || null)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Hospital Logo</label>

                <Input
                  type="text"
                  placeholder="Logo URL"
                  value={form.logo ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("logo", e.target.value || null)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Description</label>

                <Textarea
                  rows={4}
                  value={form.description ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("description", e.target.value)}
                  placeholder="Enter a short description about the hospital..."
                />
              </div>
            </div>
          </section>

          {/* ==========================================
              CONTACT & LOCATION
          ========================================== */}

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-6 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <MapPin className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-[16px] font-semibold">Contact & Location</h2>

                <p className="text-[13px] text-muted-foreground">
                  Hospital address and contact information.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Address</label>

                <Input
                  value={form.address?.line1 ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateAddress("line1", e.target.value)}
                  placeholder="Address line 1"
                />
              </div>

              <div className="md:col-span-2">
                <Input
                  value={form.address?.line2 ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateAddress("line2", e.target.value)}
                  placeholder="Address line 2"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">City</label>

                <Input
                  value={form.address?.city ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateAddress("city", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">District</label>

                <Input
                  value={form.address?.district ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateAddress("district", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">State</label>

                <Input
                  value={form.address?.state ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateAddress("state", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Country</label>

                <Input
                  value={form.address?.country ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateAddress("country", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Pin Code</label>

                <Input
                  value={form.address?.pincode ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateAddress("pincode", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Phone Number</label>

                <Input
                  value={form.phone ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("phone", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Telephone</label>

                <Input
                  value={form.telephone ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("telephone", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Email</label>

                <Input
                  type="email"
                  value={form.email ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Website</label>

                <Input
                  value={form.website ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("website", e.target.value)}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">Google Maps</label>

                <Input
                  value={form.googleMaps ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("googleMaps", e.target.value)}
                  placeholder="Google Maps URL"
                />
              </div>
            </div>
          </section>

          {/* ==========================================
              GOVERNMENT REGISTRATION
          ========================================== */}

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-6 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <FileCheck className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-[16px] font-semibold">
                  Government Registration / Verification
                </h2>

                <p className="text-[13px] text-muted-foreground">
                  Registration and verification details.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Hospital Registration Number
                </label>

                <Input
                  value={form.registrationNumber ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("registrationNumber", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Registration Certificate</label>

                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Certificate file reference"
                    value={form.registrationCertificate ?? ""}
                    disabled={!isHospitalAdmin}
                    onChange={(e) => updateField("registrationCertificate", e.target.value || null)}
                  />

                  <Button type="button" variant="outline" disabled={!isHospitalAdmin}>
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Registration Date</label>

                <Input
                  type="date"
                  value={form.registrationDate ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("registrationDate", e.target.value || null)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Validity / Expiry Date</label>

                <Input
                  type="date"
                  value={form.registrationExpiryDate ?? ""}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("registrationExpiryDate", e.target.value || null)}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium">Verification Status</label>

                <Input value={hospital?.verificationStatus ?? "PENDING"} disabled />

                <p className="mt-1 text-xs text-muted-foreground">
                  Verification status is controlled by the verification process.
                </p>
              </div>
            </div>
          </section>

          {/* ==========================================
              ACCREDITATION
          ========================================== */}

          <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="mb-6 flex items-start gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <Award className="h-5 w-5" />
              </div>

              <div>
                <h2 className="text-[16px] font-semibold">Accreditation</h2>

                <p className="text-[13px] text-muted-foreground">
                  Hospital accreditation information.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">NABH Accreditation</label>

                <select
                  value={form.nabhAccredited ? "YES" : "NO"}
                  disabled={!isHospitalAdmin}
                  onChange={(e) => updateField("nabhAccredited", e.target.value === "YES")}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="NO">No</option>
                  <option value="YES">Yes</option>
                </select>
              </div>

              {form.nabhAccredited && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium">NABH Number</label>

                  <Input
                    value={form.nabhNumber ?? ""}
                    disabled={!isHospitalAdmin}
                    onChange={(e) => updateField("nabhNumber", e.target.value)}
                  />
                </div>
              )}
            </div>
          </section>

          {/* ==========================================
              ACTIONS
          ========================================== */}

          {isHospitalAdmin && (
            <div className="flex justify-end gap-3 pb-6">
              <Button type="button" variant="outline" onClick={handleCancel} disabled={saving}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>

              <Button type="button" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />

                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
