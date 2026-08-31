import { useState } from "react";
import { createDepartment } from "./department.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DepartmentFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepartmentForm({ onSuccess, onCancel }: DepartmentFormProps) {
  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (!departmentName.trim()) {
      setError("Department name is required.");
      return;
    }

    if (!departmentCode.trim()) {
      setError("Department code is required.");
      return;
    }

    try {
      setSaving(true);

      await createDepartment({
        departmentName: departmentName.trim(),
        departmentCode: departmentCode.trim(),
      });

      onSuccess();
    } catch (error: any) {
      console.error("Failed to create department:", error);

      setError(error?.response?.data?.message || "Failed to create department. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Department Name */}
      <div className="space-y-2">
        <Label htmlFor="departmentName">Department Name</Label>

        <Input
          id="departmentName"
          value={departmentName}
          onChange={(event) => setDepartmentName(event.target.value)}
          placeholder="e.g. Cardiology"
          disabled={saving}
        />
      </div>

      {/* Department Code */}
      <div className="space-y-2">
        <Label htmlFor="departmentCode">Department Code</Label>

        <Input
          id="departmentCode"
          value={departmentCode}
          onChange={(event) => setDepartmentCode(event.target.value)}
          placeholder="e.g. CARD"
          disabled={saving}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Department"}
        </Button>
      </div>
    </form>
  );
}
