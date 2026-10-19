import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { createTaluka, getDistricts, updateTaluka } from "./location.service";
import type { District, State, Taluka, TalukaFormValues } from "./location.types";

interface TalukaFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingTaluka: Taluka | null;
  onSaved: () => void;
}

function getRelationId(value: string | District | State): string {
  return typeof value === "string" ? value : (value?._id ?? "");
}

export default function TalukaForm({
  open,
  onOpenChange,
  editingTaluka,
  onSaved,
}: TalukaFormProps) {
  const [name, setName] = useState("");
  const [districtId, setDistrictId] = useState("");
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setName(editingTaluka?.name ?? "");
    setDistrictId(editingTaluka ? getRelationId(editingTaluka.district) : "");

    let cancelled = false;

    async function loadDistricts() {
      setLoadingDistricts(true);

      try {
        const result = await getDistricts({ limit: 1000 });
        if (!cancelled) {
          setDistricts(result.filter((district) => district.isActive));
        }
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message ?? "Unable to load districts.");
        }
      } finally {
        if (!cancelled) setLoadingDistricts(false);
      }
    }

    void loadDistricts();

    return () => {
      cancelled = true;
    };
  }, [open, editingTaluka]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !districtId) {
      toast.error("Please enter a taluka name and select a district.");
      return;
    }

    const payload: TalukaFormValues = {
      name: name.trim(),
      district: districtId,
    };

    setSaving(true);

    try {
      if (editingTaluka) {
        await updateTaluka(editingTaluka._id, payload);
        toast.success("Taluka updated successfully.");
      } else {
        await createTaluka(payload);
        toast.success("Taluka created successfully.");
      }

      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Unable to save taluka.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingTaluka ? "Edit Taluka" : "Add Taluka"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="taluka-name">Taluka Name</Label>
            <Input
              id="taluka-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter taluka name"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taluka-district">District</Label>
            <select
              id="taluka-district"
              value={districtId}
              onChange={(event) => setDistrictId(event.target.value)}
              disabled={loadingDistricts}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">
                {loadingDistricts ? "Loading districts..." : "Select district"}
              </option>
              {districts.map((district) => (
                <option key={district._id} value={district._id}>
                  {district.name}
                </option>
              ))}
            </select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving || loadingDistricts}>
              {saving ? "Saving..." : editingTaluka ? "Update Taluka" : "Save Taluka"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
