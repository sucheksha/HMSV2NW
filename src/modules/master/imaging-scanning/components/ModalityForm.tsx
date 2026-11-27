import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useFormDirty } from "@/hooks/useFormDirty";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createModality, updateModality } from "../imagingScanningService";

import type {
  Modality,
  ModalityStatus,
  CreateModalityRequest,
  UpdateModalityRequest,
} from "../imagingScanning.types";

type ModalityFormProps = {
  modality?: Modality | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FormErrors = {
  modalityName?: string;
  modalityCode?: string;
  description?: string;
};

export function ModalityForm({ modality, onSuccess, onCancel }: ModalityFormProps) {
  const isEditMode = Boolean(modality);

  const [modalityName, setModalityName] = useState("");
  const [modalityCode, setModalityCode] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<ModalityStatus>("ACTIVE");

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const initialFormData = {
    modalityName: modality?.modalityName ?? "",
    modalityCode: modality?.modalityCode ?? "",
    description: modality?.description ?? "",
    status: modality?.status ?? "ACTIVE",
  };

  const currentFormData = {
    modalityName,
    modalityCode,
    description,
    status,
  };

  const isDirty = useFormDirty(initialFormData, currentFormData);

  useEffect(() => {
    setModalityName(modality?.modalityName ?? "");
    setModalityCode(modality?.modalityCode ?? "");
    setDescription(modality?.description ?? "");
    setStatus(modality?.status ?? "ACTIVE");
    setErrors({});
  }, [modality]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (modalityName.trim().length < 2) {
      newErrors.modalityName = "Modality name must contain at least 2 characters.";
    } else if (modalityName.trim().length > 100) {
      newErrors.modalityName = "Modality name cannot exceed 100 characters.";
    }

    if (modalityCode.trim().length < 2) {
      newErrors.modalityCode = "Modality code must contain at least 2 characters.";
    } else if (modalityCode.trim().length > 20) {
      newErrors.modalityCode = "Modality code cannot exceed 20 characters.";
    }

    if (description.trim().length > 500) {
      newErrors.description = "Description cannot exceed 500 characters.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === "object" && error !== null && "response" in error) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string;
              errors?: string[];
            };
          };
        }
      ).response;

      if (response?.data?.message) {
        return response.data.message;
      }

      if (response?.data?.errors?.length) {
        return response.data.errors.join(", ");
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDirty || !validateForm()) {
      return;
    }

    setSaving(true);

    try {
      if (isEditMode && modality) {
        const updateData: UpdateModalityRequest = {
          modalityName: modalityName.trim(),
          modalityCode: modalityCode.trim().toUpperCase(),
          description: description.trim(),
          status,
        };

        await updateModality(modality._id, updateData);
        toast.success("Modality updated successfully.");
      } else {
        const createData: CreateModalityRequest = {
          modalityName: modalityName.trim(),
          modalityCode: modalityCode.trim().toUpperCase(),
          description: description.trim(),
          status,
        };

        await createModality(createData);
        toast.success("Modality created successfully.");
      }

      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);
      toast.error(message);

      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (
          error as {
            response?: {
              status?: number;
            };
          }
        ).response;

        if (response?.status === 409) {
          setErrors({
            modalityCode: "This modality code already exists.",
          });
        }

        if (response?.status === 403) {
          toast.error("You do not have permission to manage modalities.");
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="space-y-5">
        {/* MODALITY NAME */}
        <div className="space-y-2">
          <label htmlFor="modalityName" className="text-sm font-medium">
            Modality Name <span className="text-destructive">*</span>
          </label>

          <Input
            id="modalityName"
            value={modalityName}
            onChange={(event) => setModalityName(event.target.value)}
            placeholder="e.g. X-Ray, CT Scan, MRI"
            maxLength={100}
            disabled={saving}
          />

          {errors.modalityName && <p className="text-sm text-destructive">{errors.modalityName}</p>}
        </div>

        {/* MODALITY CODE */}
        <div className="space-y-2">
          <label htmlFor="modalityCode" className="text-sm font-medium">
            Modality Code <span className="text-destructive">*</span>
          </label>

          <Input
            id="modalityCode"
            value={modalityCode}
            onChange={(event) => setModalityCode(event.target.value.toUpperCase())}
            placeholder="e.g. XR, CT, MR, USG"
            maxLength={20}
            disabled={saving}
          />

          {errors.modalityCode && <p className="text-sm text-destructive">{errors.modalityCode}</p>}
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2">
          <label htmlFor="modalityDescription" className="text-sm font-medium">
            Description
          </label>

          <Textarea
            id="modalityDescription"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter modality description"
            rows={4}
            maxLength={500}
            disabled={saving}
          />

          <div className="flex justify-between gap-2">
            {errors.description ? (
              <p className="text-sm text-destructive">{errors.description}</p>
            ) : (
              <span />
            )}

            <span className="text-xs text-muted-foreground">{description.length}/500</span>
          </div>
        </div>

        {/* STATUS */}
        <div className="space-y-2">
          <label htmlFor="modalityStatus" className="text-sm font-medium">
            Status
          </label>

          <select
            id="modalityStatus"
            value={status}
            onChange={(event) => setStatus(event.target.value as ModalityStatus)}
            disabled={saving}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button type="submit" disabled={saving || !isDirty}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {isEditMode ? "Update Modality" : "Save Modality"}
        </Button>
      </div>
    </form>
  );
}
