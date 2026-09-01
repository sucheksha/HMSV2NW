import { useEffect, useState } from "react";

import { createDepartment, updateDepartment } from "./department.service";

import type { Department } from "./department.types";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DepartmentFormProps {
  department?: Department | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function DepartmentForm({ department, onSuccess, onCancel }: DepartmentFormProps) {
  const isEditMode = !!department;

  const [departmentName, setDepartmentName] = useState("");
  const [departmentCode, setDepartmentCode] = useState("");
  const [staffCount, setStaffCount] = useState("");
  const [floor, setFloor] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [departmentHead, setDepartmentHead] = useState("");
  const [description, setDescription] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Load existing department when editing
  useEffect(() => {
    if (department) {
      setDepartmentName(department.departmentName || "");
      setDepartmentCode(department.departmentCode || "");

      setStaffCount(
        department.staffCount !== undefined && department.staffCount !== null
          ? String(department.staffCount)
          : "",
      );

      setFloor(department.floor || "");
      setRoomNumber(department.roomNumber || "");
      setDepartmentHead(department.departmentHead || "");
      setDescription(department.description || "");
    } else {
      // Clear form for Add
      setDepartmentName("");
      setDepartmentCode("");
      setStaffCount("");
      setFloor("");
      setRoomNumber("");
      setDepartmentHead("");
      setDescription("");
    }

    setError("");
  }, [department]);

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

      const data = {
        departmentName: departmentName.trim(),
        departmentCode: departmentCode.trim(),
        staffCount: staffCount ? Number(staffCount) : undefined,
        floor: floor.trim() || undefined,
        roomNumber: roomNumber.trim() || undefined,
        departmentHead: departmentHead.trim() || undefined,
        description: description.trim() || undefined,
      };

      if (isEditMode && department) {
        await updateDepartment(department._id, data);
      } else {
        await createDepartment(data);
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to save department:", error);

      setError(error?.response?.data?.message || "Failed to save department. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* NAME */}
      <div className="space-y-1.5">
        <Label htmlFor="departmentName">
          Department Name <span className="text-red-500">*</span>
        </Label>

        <Input
          id="departmentName"
          value={departmentName}
          onChange={(event) => setDepartmentName(event.target.value)}
          placeholder="e.g. Cardiology"
          disabled={saving}
        />
      </div>

      {/* CODE */}
      <div className="space-y-1.5">
        <Label htmlFor="departmentCode">
          Department Code <span className="text-red-500">*</span>
        </Label>

        <Input
          id="departmentCode"
          value={departmentCode}
          onChange={(event) => setDepartmentCode(event.target.value)}
          placeholder="e.g. CARD"
          disabled={saving}
        />
      </div>

      {/* STAFF COUNT */}
      <div className="space-y-1.5">
        <Label htmlFor="staffCount">
          Number of Staff <span className="text-muted-foreground">(Optional)</span>
        </Label>

        <Input
          id="staffCount"
          type="number"
          min="0"
          value={staffCount}
          onChange={(event) => setStaffCount(event.target.value)}
          placeholder="e.g. 25"
          disabled={saving}
        />
      </div>

      {/* FLOOR + ROOM */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="floor">
            Floor <span className="text-muted-foreground">(Optional)</span>
          </Label>

          <Input
            id="floor"
            value={floor}
            onChange={(event) => setFloor(event.target.value)}
            placeholder="e.g. 2nd Floor"
            disabled={saving}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="roomNumber">
            Room Number <span className="text-muted-foreground">(Optional)</span>
          </Label>

          <Input
            id="roomNumber"
            value={roomNumber}
            onChange={(event) => setRoomNumber(event.target.value)}
            placeholder="e.g. 204"
            disabled={saving}
          />
        </div>
      </div>

      {/* DEPARTMENT HEAD */}
      <div className="space-y-1.5">
        <Label htmlFor="departmentHead">
          Department Head <span className="text-muted-foreground">(Optional)</span>
        </Label>

        <Input
          id="departmentHead"
          value={departmentHead}
          onChange={(event) => setDepartmentHead(event.target.value)}
          placeholder="e.g. Dr. Ravi Kumar"
          disabled={saving}
        />
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-1.5">
        <Label htmlFor="description">
          Description <span className="text-muted-foreground">(Optional)</span>
        </Label>

        <textarea
          id="description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Brief description of this department..."
          disabled={saving}
          rows={4}
          className="
            flex w-full rounded-md border
            border-input bg-background px-3 py-2
            text-sm shadow-sm
            placeholder:text-muted-foreground
            focus-visible:outline-none
            focus-visible:ring-1
            focus-visible:ring-ring
            disabled:cursor-not-allowed
            disabled:opacity-50
            resize-none
          "
        />
      </div>

      {/* ERROR */}
      {error && (
        <div
          className="
            rounded-lg border border-red-200
            bg-red-50 px-3 py-2
            text-sm text-red-700
          "
        >
          {error}
        </div>
      )}

      {/* ACTIONS */}
      <div
        className="
          flex justify-end gap-2
          border-t pt-4
        "
      >
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : isEditMode ? "Update Department" : "Save Department"}
        </Button>
      </div>
    </form>
  );
}
