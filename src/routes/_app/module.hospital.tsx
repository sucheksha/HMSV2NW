import { useEffect, useState } from "react";

import {
  getHospitalProfile,
  updateHospitalProfile,
  type HospitalAddress,
  type HospitalModules,
  type HospitalProfile,
  type UpdateHospitalProfileRequest,
} from "@/services/hospital.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ==========================================
// Editable Form State
// ==========================================

interface HospitalFormState {
  hospitalName: string;
  registrationNumber: string;
  establishedDate: string;
  email: string;
  phone: string;
  telephone: string;
  website: string;
  address: HospitalAddress;
  logo: string;
}

// ==========================================
// Initial Form State
// ==========================================

const emptyForm: HospitalFormState = {
  hospitalName: "",
  registrationNumber: "",
  establishedDate: "",
  email: "",
  phone: "",
  telephone: "",
  website: "",
  address: {
    line1: "",
    line2: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  },
  logo: "",
};

// ==========================================
// Module Labels
// ==========================================

const moduleLabels: Record<keyof HospitalModules, string> = {
  patients: "Patients",
  appointments: "Appointments",
  opd: "OPD",
  ipd: "IPD",
  laboratory: "Laboratory",
  pharmacy: "Pharmacy",
  inventory: "Inventory",
  diagnosis: "Diagnosis",
  billing: "Billing",
  expenses: "Expenses",
  reports: "Reports",
  analytics: "Analytics",
  staff: "Staff",
  doctors: "Doctors",
  departments: "Departments",
  wards: "Wards",
  rooms: "Rooms",
  beds: "Beds",
  masterData: "Master Data",
};

// ==========================================
// Helpers
// ==========================================

const formatDateForInput = (date: string | null | undefined): string => {
  if (!date) {
    return "";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return parsedDate.toISOString().split("T")[0];
};

const formatDisplayDate = (date: string | null | undefined): string => {
  if (!date) {
    return "Not available";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Not available";
  }

  return parsedDate.toLocaleDateString();
};

// ==========================================
// Component
// ==========================================

export default function HospitalModule() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);

  const [form, setForm] = useState<HospitalFormState>(emptyForm);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ==========================================
  // Load Hospital Profile
  // ==========================================

  const loadHospitalProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await getHospitalProfile();

      setProfile(data);

      setForm({
        hospitalName: data.hospitalName ?? "",
        registrationNumber: data.registrationNumber ?? "",
        establishedDate: formatDateForInput(data.establishedDate),
        email: data.email ?? "",
        phone: data.phone ?? "",
        telephone: data.telephone ?? "",
        website: data.website ?? "",
        address: {
          line1: data.address?.line1 ?? "",
          line2: data.address?.line2 ?? "",
          city: data.address?.city ?? "",
          state: data.address?.state ?? "",
          country: data.address?.country ?? "",
          pincode: data.address?.pincode ?? "",
        },
        logo: data.logo ?? "",
      });
    } catch (err) {
      console.error("Failed to load hospital profile:", err);

      setError("Unable to load hospital profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadHospitalProfile();
  }, []);

  // ==========================================
  // Form Handlers
  // ==========================================

  const updateField = (field: keyof Omit<HospitalFormState, "address">, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const updateAddressField = (field: keyof HospitalAddress, value: string) => {
    setForm((current) => ({
      ...current,
      address: {
        ...current.address,
        [field]: value,
      },
    }));
  };

  // ==========================================
  // Save Profile
  // ==========================================

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccessMessage(null);

      const payload: UpdateHospitalProfileRequest = {
        hospitalName: form.hospitalName,
        registrationNumber: form.registrationNumber,
        establishedDate: form.establishedDate || null,
        email: form.email,
        phone: form.phone,
        telephone: form.telephone,
        website: form.website,
        address: form.address,
        logo: form.logo || null,
      };

      const updatedProfile = await updateHospitalProfile(payload);

      setProfile(updatedProfile);

      setForm({
        hospitalName: updatedProfile.hospitalName ?? "",
        registrationNumber: updatedProfile.registrationNumber ?? "",
        establishedDate: formatDateForInput(updatedProfile.establishedDate),
        email: updatedProfile.email ?? "",
        phone: updatedProfile.phone ?? "",
        telephone: updatedProfile.telephone ?? "",
        website: updatedProfile.website ?? "",
        address: {
          line1: updatedProfile.address?.line1 ?? "",
          line2: updatedProfile.address?.line2 ?? "",
          city: updatedProfile.address?.city ?? "",
          state: updatedProfile.address?.state ?? "",
          country: updatedProfile.address?.country ?? "",
          pincode: updatedProfile.address?.pincode ?? "",
        },
        logo: updatedProfile.logo ?? "",
      });

      setSuccessMessage("Hospital profile updated successfully.");
    } catch (err) {
      console.error("Failed to update hospital profile:", err);

      setError("Unable to update hospital profile.");
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // Loading
  // ==========================================

  if (loading) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm text-muted-foreground">Loading hospital profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // Error Without Profile
  // ==========================================

  if (!profile) {
    return (
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Hospital Profile</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-sm text-destructive">
              {error ?? "Hospital profile could not be loaded."}
            </p>

            <Button onClick={() => void loadHospitalProfile()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ==========================================
  // Render
  // ==========================================

  return (
    <div className="space-y-6 p-6">
      {/* ====================================== */}
      {/* Page Header */}
      {/* ====================================== */}

      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Hospital Profile</h1>

        <p className="text-sm text-muted-foreground">
          View and update hospital profile information.
        </p>
      </div>

      {/* ====================================== */}
      {/* Messages */}
      {/* ====================================== */}

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {successMessage && (
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-green-600">{successMessage}</p>
          </CardContent>
        </Card>
      )}

      {/* ====================================== */}
      {/* Hospital Identification */}
      {/* Read Only */}
      {/* ====================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Hospital Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Hospital ID</Label>

            <Input value={profile.hospitalId} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label>Hospital Code</Label>

            <Input value={profile.hospitalCode} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label>Hospital Type</Label>

            <Input value={profile.hospitalType} readOnly disabled />
          </div>

          <div className="space-y-2">
            <Label>Account Status</Label>

            <div className="flex h-10 items-center">
              <Badge variant={profile.status === "ACTIVE" ? "default" : "secondary"}>
                {profile.status}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================== */}
      {/* Editable Hospital Information */}
      {/* ====================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Hospital Name */}

            <div className="space-y-2">
              <Label htmlFor="hospitalName">Hospital Name</Label>

              <Input
                id="hospitalName"
                value={form.hospitalName}
                onChange={(event) => updateField("hospitalName", event.target.value)}
              />
            </div>

            {/* Registration Number */}

            <div className="space-y-2">
              <Label htmlFor="registrationNumber">Registration Number</Label>

              <Input
                id="registrationNumber"
                value={form.registrationNumber}
                onChange={(event) => updateField("registrationNumber", event.target.value)}
              />
            </div>

            {/* Established Date */}

            <div className="space-y-2">
              <Label htmlFor="establishedDate">Established Date</Label>

              <Input
                id="establishedDate"
                type="date"
                value={form.establishedDate}
                onChange={(event) => updateField("establishedDate", event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================== */}
      {/* Contact Information */}
      {/* ====================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>

            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>

            <Input
              id="phone"
              value={form.phone}
              onChange={(event) => updateField("phone", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telephone">Telephone</Label>

            <Input
              id="telephone"
              value={form.telephone}
              onChange={(event) => updateField("telephone", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>

            <Input
              id="website"
              type="url"
              value={form.website}
              onChange={(event) => updateField("website", event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* ====================================== */}
      {/* Address */}
      {/* ====================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine1">Address Line 1</Label>

              <Input
                id="addressLine1"
                value={form.address.line1}
                onChange={(event) => updateAddressField("line1", event.target.value)}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="addressLine2">Address Line 2</Label>

              <Input
                id="addressLine2"
                value={form.address.line2}
                onChange={(event) => updateAddressField("line2", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>

              <Input
                id="city"
                value={form.address.city}
                onChange={(event) => updateAddressField("city", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>

              <Input
                id="state"
                value={form.address.state}
                onChange={(event) => updateAddressField("state", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>

              <Input
                id="country"
                value={form.address.country}
                onChange={(event) => updateAddressField("country", event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>

              <Input
                id="pincode"
                value={form.address.pincode}
                onChange={(event) => updateAddressField("pincode", event.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================== */}
      {/* Hospital Logo */}
      {/* ====================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Hospital Logo</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="logo">Logo</Label>

            <Input
              id="logo"
              value={form.logo}
              placeholder="Logo URL"
              onChange={(event) => updateField("logo", event.target.value)}
            />

            <p className="text-xs text-muted-foreground">
              Enter the logo value used by the backend.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ====================================== */}
      {/* Subscription */}
      {/* Read Only - Hospital Admin */}
      {/* ====================================== */}

      <Card>
        <CardHeader>
          <CardTitle>Subscription</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Status / Dates */}

          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Status</Label>

              <div className="flex h-10 items-center">
                <Badge variant={profile.subscription.status === "ACTIVE" ? "default" : "secondary"}>
                  {profile.subscription.status ?? "Not available"}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Start Date</Label>

              <Input value={formatDisplayDate(profile.subscription.startDate)} readOnly disabled />
            </div>

            <div className="space-y-2">
              <Label>End Date</Label>

              <Input value={formatDisplayDate(profile.subscription.endDate)} readOnly disabled />
            </div>
          </div>

          {/* Modules */}

          <div>
            <h3 className="mb-4 text-sm font-medium">Enabled Modules</h3>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(moduleLabels) as Array<keyof HospitalModules>).map((moduleKey) => {
                const enabled = profile.subscription.modules?.[moduleKey] ?? false;

                return (
                  <div
                    key={moduleKey}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="text-sm">{moduleLabels[moduleKey]}</span>

                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Limits */}

          <div>
            <h3 className="mb-4 text-sm font-medium">Subscription Limits</h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Maximum Staff</p>

                <p className="mt-1 text-lg font-semibold">
                  {profile.subscription.limits.maxStaff ?? "Unlimited"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Maximum Doctors</p>

                <p className="mt-1 text-lg font-semibold">
                  {profile.subscription.limits.maxDoctors ?? "Unlimited"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Maximum Patients</p>

                <p className="mt-1 text-lg font-semibold">
                  {profile.subscription.limits.maxPatients ?? "Unlimited"}
                </p>
              </div>

              <div className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">Maximum Storage</p>

                <p className="mt-1 text-lg font-semibold">
                  {profile.subscription.limits.maxStorage ?? "Unlimited"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ====================================== */}
      {/* Save */}
      {/* ====================================== */}

      <div className="flex justify-end">
        <Button onClick={() => void handleSave()} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
