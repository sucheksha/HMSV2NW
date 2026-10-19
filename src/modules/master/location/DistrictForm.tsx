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

import { createDistrict, getStates, updateDistrict } from "./location.service";
import type { District, State, DistrictFormValues } from "./location.types";

interface DistrictFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingDistrict: District | null;
  onSaved: () => void;
}

function getRelationId(value: string | State | District): string {
  return typeof value === "string" ? value : (value?._id ?? "");
}

export default function DistrictForm({
  open,
  onOpenChange,
  editingDistrict,
  onSaved,
}: DistrictFormProps) {
  const [name, setName] = useState("");
  const [stateId, setStateId] = useState("");
  const [states, setStates] = useState<State[]>([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    setName(editingDistrict?.name ?? "");
    setStateId(editingDistrict ? getRelationId(editingDistrict.state) : "");

    let cancelled = false;

    async function loadStates() {
      setLoadingStates(true);

      try {
        const result = await getStates({ limit: 1000 });
        if (!cancelled) {
          setStates(result.filter((state) => state.isActive));
        }
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message ?? "Unable to load states.");
        }
      } finally {
        if (!cancelled) setLoadingStates(false);
      }
    }

    void loadStates();

    return () => {
      cancelled = true;
    };
  }, [open, editingDistrict]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim() || !stateId) {
      toast.error("Please enter a district name and select a state.");
      return;
    }

    const payload: DistrictFormValues = {
      name: name.trim(),
      state: stateId,
    };

    setSaving(true);

    try {
      if (editingDistrict) {
        await updateDistrict(editingDistrict._id, payload);
        toast.success("District updated successfully.");
      } else {
        await createDistrict(payload);
        toast.success("District created successfully.");
      }

      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Unable to save district.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingDistrict ? "Edit District" : "Add District"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="district-name">District Name</Label>
            <Input
              id="district-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter district name"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="district-state">State</Label>
            <select
              id="district-state"
              value={stateId}
              onChange={(event) => setStateId(event.target.value)}
              disabled={loadingStates}
              required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value="">{loadingStates ? "Loading states..." : "Select state"}</option>
              {states.map((state) => (
                <option key={state._id} value={state._id}>
                  {state.name} ({state.code})
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
            <Button type="submit" disabled={saving || loadingStates}>
              {saving ? "Saving..." : editingDistrict ? "Update District" : "Save District"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
