import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useFormDirty } from "@/hooks/useFormDirty";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createDiagnosis, updateDiagnosis } from "./diagnosis.service";

import type { Diagnosis, CreateDiagnosisRequest, UpdateDiagnosisRequest } from "./diagnosis.types";

type DiagnosisFormProps = {
  diagnosis?: Diagnosis | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FormErrors = {
  diagnosisName?: string;
  diagnosisCode?: string;
  diagnosisCategory?: string;
  diagnosisType?: string;
  icdCode?: string;
  icdVersion?: string;
  shortName?: string;
  description?: string;
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

export function DiagnosisForm({ diagnosis, onSuccess, onCancel }: DiagnosisFormProps) {
  const isEditMode = Boolean(diagnosis);

  const [diagnosisName, setDiagnosisName] = useState("");
  const [diagnosisCode, setDiagnosisCode] = useState("");
  const [diagnosisCategory, setDiagnosisCategory] = useState("");
  const [diagnosisType, setDiagnosisType] = useState("");
  const [icdCode, setIcdCode] = useState("");
  const [icdVersion, setIcdVersion] = useState("");
  const [shortName, setShortName] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  /*
   * The form is considered dirty when the user changes
   * any field from its original value.
   */
  const initialFormData = {
    diagnosisName: diagnosis?.diagnosisName ?? "",
    diagnosisCode: diagnosis?.diagnosisCode ?? "",
    diagnosisCategory: diagnosis?.diagnosisCategory ?? "",
    diagnosisType: diagnosis?.diagnosisType ?? "",
    icdCode: diagnosis?.icdCode ?? "",
    icdVersion: diagnosis?.icdVersion ?? "",
    shortName: diagnosis?.shortName ?? "",
    description: diagnosis?.description ?? "",
  };

  const currentFormData = {
    diagnosisName,
    diagnosisCode,
    diagnosisCategory,
    diagnosisType,
    icdCode,
    icdVersion,
    shortName,
    description,
  };

  const isDirty = useFormDirty(initialFormData, currentFormData);

  useEffect(() => {
    if (diagnosis) {
      setDiagnosisName(diagnosis.diagnosisName ?? "");
      setDiagnosisCode(diagnosis.diagnosisCode ?? "");
      setDiagnosisCategory(diagnosis.diagnosisCategory ?? "");
      setDiagnosisType(diagnosis.diagnosisType ?? "");
      setIcdCode(diagnosis.icdCode ?? "");
      setIcdVersion(diagnosis.icdVersion ?? "");
      setShortName(diagnosis.shortName ?? "");
      setDescription(diagnosis.description ?? "");
    } else {
      setDiagnosisName("");
      setDiagnosisCode("");
      setDiagnosisCategory("");
      setDiagnosisType("");
      setIcdCode("");
      setIcdVersion("");
      setShortName("");
      setDescription("");
    }

    setErrors({});
  }, [diagnosis]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedName = diagnosisName.trim();
    const trimmedCode = diagnosisCode.trim();

    if (!trimmedName) {
      newErrors.diagnosisName = "Diagnosis name is required.";
    } else if (trimmedName.length < 2) {
      newErrors.diagnosisName = "Diagnosis name must be at least 2 characters.";
    } else if (trimmedName.length > 150) {
      newErrors.diagnosisName = "Diagnosis name cannot exceed 150 characters.";
    }

    if (!trimmedCode) {
      newErrors.diagnosisCode = "Diagnosis code is required.";
    } else if (trimmedCode.length < 2) {
      newErrors.diagnosisCode = "Diagnosis code must be at least 2 characters.";
    } else if (trimmedCode.length > 30) {
      newErrors.diagnosisCode = "Diagnosis code cannot exceed 30 characters.";
    }

    if (diagnosisCategory.trim().length > 100) {
      newErrors.diagnosisCategory = "Diagnosis category cannot exceed 100 characters.";
    }

    if (diagnosisType.trim().length > 100) {
      newErrors.diagnosisType = "Diagnosis type cannot exceed 100 characters.";
    }

    if (icdCode.trim().length > 30) {
      newErrors.icdCode = "ICD code cannot exceed 30 characters.";
    }

    if (icdVersion.trim().length > 30) {
      newErrors.icdVersion = "ICD version cannot exceed 30 characters.";
    }

    if (shortName.trim().length > 100) {
      newErrors.shortName = "Short name cannot exceed 100 characters.";
    }

    if (description.trim().length > 500) {
      newErrors.description = "Description cannot exceed 500 characters.";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isDirty) {
      return;
    }

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      if (isEditMode && diagnosis) {
        const updateData: UpdateDiagnosisRequest = {
          diagnosisName: diagnosisName.trim(),
          diagnosisCode: diagnosisCode.trim().toUpperCase(),
          diagnosisCategory: diagnosisCategory.trim() || null,
          diagnosisType: diagnosisType.trim() || null,
          icdCode: icdCode.trim() ? icdCode.trim().toUpperCase() : null,
          icdVersion: icdVersion.trim() || null,
          shortName: shortName.trim() || null,
          description: description.trim() || null,
        };

        await updateDiagnosis(diagnosis._id, updateData);

        toast.success("Diagnosis updated successfully.");
      } else {
        const createData: CreateDiagnosisRequest = {
          diagnosisName: diagnosisName.trim(),
          diagnosisCode: diagnosisCode.trim().toUpperCase(),
          diagnosisCategory: diagnosisCategory.trim() || null,
          diagnosisType: diagnosisType.trim() || null,
          icdCode: icdCode.trim() ? icdCode.trim().toUpperCase() : null,
          icdVersion: icdVersion.trim() || null,
          shortName: shortName.trim() || null,
          description: description.trim() || null,
        };

        await createDiagnosis(createData);

        toast.success("Diagnosis created successfully.");
      }

      onSuccess();
    } catch (error: unknown) {
      const message = getErrorMessage(error);

      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (
          error as {
            response?: {
              status?: number;
            };
          }
        ).response;

        if (response?.status === 409) {
          toast.error("Diagnosis code already exists in this hospital.");

          setErrors({
            diagnosisCode: "This diagnosis code already exists.",
          });

          return;
        }

        if (response?.status === 403) {
          toast.error("You do not have permission to manage diagnoses.");

          return;
        }

        if (response?.status === 400 || response?.status === 422) {
          toast.error(message);
          return;
        }
      }

      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="diagnosisName" className="text-sm font-medium">
            Diagnosis Name <span className="text-destructive">*</span>
          </label>

          <Input
            id="diagnosisName"
            value={diagnosisName}
            onChange={(event) => setDiagnosisName(event.target.value)}
            placeholder="Enter diagnosis name"
            disabled={saving}
          />

          {errors.diagnosisName && (
            <p className="text-sm text-destructive">{errors.diagnosisName}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="diagnosisCode" className="text-sm font-medium">
            Diagnosis Code <span className="text-destructive">*</span>
          </label>

          <Input
            id="diagnosisCode"
            value={diagnosisCode}
            onChange={(event) => setDiagnosisCode(event.target.value.toUpperCase())}
            placeholder="Enter diagnosis code"
            disabled={saving}
          />

          {errors.diagnosisCode && (
            <p className="text-sm text-destructive">{errors.diagnosisCode}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="diagnosisCategory" className="text-sm font-medium">
            Diagnosis Category
          </label>

          <Input
            id="diagnosisCategory"
            value={diagnosisCategory}
            onChange={(event) => setDiagnosisCategory(event.target.value)}
            placeholder="e.g. Infectious Disease"
            disabled={saving}
          />

          {errors.diagnosisCategory && (
            <p className="text-sm text-destructive">{errors.diagnosisCategory}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="diagnosisType" className="text-sm font-medium">
            Diagnosis Type
          </label>

          <Input
            id="diagnosisType"
            value={diagnosisType}
            onChange={(event) => setDiagnosisType(event.target.value)}
            placeholder="e.g. Clinical"
            disabled={saving}
          />

          {errors.diagnosisType && (
            <p className="text-sm text-destructive">{errors.diagnosisType}</p>
          )}
        </div>

        <div className="space-y-2">
          <label htmlFor="icdCode" className="text-sm font-medium">
            ICD Code
          </label>

          <Input
            id="icdCode"
            value={icdCode}
            onChange={(event) => setIcdCode(event.target.value.toUpperCase())}
            placeholder="Enter ICD code"
            disabled={saving}
          />

          {errors.icdCode && <p className="text-sm text-destructive">{errors.icdCode}</p>}
        </div>

        <div className="space-y-2">
          <label htmlFor="icdVersion" className="text-sm font-medium">
            ICD Version
          </label>

          <Input
            id="icdVersion"
            value={icdVersion}
            onChange={(event) => setIcdVersion(event.target.value)}
            placeholder="e.g. ICD-10"
            disabled={saving}
          />

          {errors.icdVersion && <p className="text-sm text-destructive">{errors.icdVersion}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="shortName" className="text-sm font-medium">
            Short Name
          </label>

          <Input
            id="shortName"
            value={shortName}
            onChange={(event) => setShortName(event.target.value)}
            placeholder="Enter short name"
            disabled={saving}
          />

          {errors.shortName && <p className="text-sm text-destructive">{errors.shortName}</p>}
        </div>

        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>

          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter diagnosis description"
            rows={4}
            maxLength={500}
            disabled={saving}
          />

          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">{description.length}/500</span>
          </div>

          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button type="submit" disabled={saving || !isDirty}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {isEditMode ? "Update Diagnosis" : "Save Diagnosis"}
        </Button>
      </div>
    </form>
  );
}
