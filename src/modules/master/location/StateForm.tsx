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

import { createState, updateState } from "./location.service";
import type { State, StateFormValues } from "./location.types";

interface StateFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingState: State | null;
  onSaved: () => void;
}

export default function StateForm({ open, onOpenChange, editingState, onSaved }: StateFormProps) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setName(editingState?.name ?? "");
    setCode(editingState?.code ?? "");
  }, [editingState, open]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload: StateFormValues = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
    };

    if (!payload.name || !payload.code) {
      toast.error("Please enter both state name and code.");
      return;
    }

    setSaving(true);

    try {
      if (editingState) {
        await updateState(editingState._id, payload);
        toast.success("State updated successfully.");
      } else {
        await createState(payload);
        toast.success("State created successfully.");
      }

      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? "Unable to save state.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingState ? "Edit State" : "Add State"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="state-name">State Name</Label>
            <Input
              id="state-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter state name"
              maxLength={100}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state-code">State Code</Label>
            <Input
              id="state-code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter state code"
              maxLength={20}
              required
            />
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
            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : editingState ? "Update State" : "Save State"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
