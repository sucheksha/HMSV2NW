import { useEffect, useState } from "react";
import { toast } from "sonner";

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

  /**
   * Performs the actual create/update operation.
   *
   * This is kept separate from handleSubmit so that
   * the Retry button can call the operation again.
   */
  const saveDepartment = async () => {
    try {
      setSaving(true);
      setError("");

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
        const response = await updateDepartment(department._id, data);

        toast.success(response.message || "Department updated successfully.");
      } else {
        const response = await createDepartment(data);

        toast.success(response.message || "Department added successfully.");
      }

      onSuccess();
    } catch (error: any) {
      console.error("Failed to save department:", error);

      const status = error?.response?.status;
      const backendMessage = error?.response?.data?.message;

      // Network error
      if (!error?.response) {
        const message =
          "Unable to connect to the server. Please check your network connection and try again.";

        setError(message);

        toast.error("Unable to connect to the server.", {
          description: "Please check your network connection and try again.",
          action: {
            label: "Retry",
            onClick: () => {
              void saveDepartment();
            },
          },
        });

        return;
      }

      // Permission error
      if (status === 403) {
        const message = backendMessage || "You don't have permission to perform this action.";

        setError(message);
        toast.error(message);

        return;
      }

      // Validation / bad request
      if (status === 400 || status === 422) {
        const message = backendMessage || "Please correct the highlighted fields.";

        setError(message);
        toast.error(message);

        return;
      }

      // Conflict - duplicate department code etc.
      if (status === 409) {
        const message = backendMessage || "This department already exists.";

        setError(message);
        toast.error(message);

        return;
      }

      // Other backend/server errors
      const message = backendMessage || "Could not save the department. Please try again.";

      setError(message);

      toast.error(message, {
        action: {
          label: "Close",
          onClick: () => {},
        },
      });
    } finally {
      setSaving(false);
    }
  };

  /**
   * Handles form submission.
   *
   * handleSubmit remains the function used by
   * <form onSubmit={handleSubmit}>.
   */
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    // Required field validation
    if (!departmentName.trim()) {
      setError("Department name is required.");

      toast.error("Please enter the department name.");

      return;
    }

    if (!departmentCode.trim()) {
      setError("Department code is required.");

      toast.error("Please enter the department code.");

      return;
    }

    // Staff count validation
    if (staffCount && Number(staffCount) < 0) {
      setError("Number of staff cannot be negative.");

      toast.error("Please enter a valid number of staff.");

      return;
    }

    // Perform create/update
    await saveDepartment();
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
