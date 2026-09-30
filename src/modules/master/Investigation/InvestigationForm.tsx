import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useFormDirty } from "@/hooks/useFormDirty";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { createInvestigation, updateInvestigation } from "./investigation.service";

import type {
  Investigation,
  CreateInvestigationRequest,
  UpdateInvestigationRequest,
} from "./investigation.types";

type InvestigationFormProps = {
  investigation?: Investigation | null;
  onSuccess: () => void;
  onCancel: () => void;
};

type FormErrors = {
  investigationName?: string;
  investigationCode?: string;
  loincCode?: string;
  category?: string;
  type?: string;
  sampleType?: string;
  turnaroundTime?: string;
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

export function InvestigationForm({ investigation, onSuccess, onCancel }: InvestigationFormProps) {
  const isEditMode = Boolean(investigation);

  const [investigationName, setInvestigationName] = useState("");
  const [investigationCode, setInvestigationCode] = useState("");
  const [loincCode, setLoincCode] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [sampleType, setSampleType] = useState("");
  const [turnaroundTime, setTurnaroundTime] = useState("");
  const [description, setDescription] = useState("");

  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const initialFormData = {
    investigationName: investigation?.investigationName ?? "",
    investigationCode: investigation?.investigationCode ?? "",
    loincCode: investigation?.loincCode ?? "",
    category: investigation?.category ?? "",
    type: investigation?.type ?? "",
    sampleType: investigation?.sampleType ?? "",
    turnaroundTime:
      investigation?.turnaroundTime === null || investigation?.turnaroundTime === undefined
        ? ""
        : String(investigation.turnaroundTime),
    description: investigation?.description ?? "",
  };

  const currentFormData = {
    investigationName,
    investigationCode,
    loincCode,
    category,
    type,
    sampleType,
    turnaroundTime,
    description,
  };

  const isDirty = useFormDirty(initialFormData, currentFormData);

  useEffect(() => {
    if (investigation) {
      setInvestigationName(investigation.investigationName ?? "");
      setInvestigationCode(investigation.investigationCode ?? "");
      setLoincCode(investigation.loincCode ?? "");
      setCategory(investigation.category ?? "");
      setType(investigation.type ?? "");
      setSampleType(investigation.sampleType ?? "");
      setTurnaroundTime(
        investigation.turnaroundTime === null || investigation.turnaroundTime === undefined
          ? ""
          : String(investigation.turnaroundTime),
      );
      setDescription(investigation.description ?? "");
    } else {
      setInvestigationName("");
      setInvestigationCode("");
      setLoincCode("");
      setCategory("");
      setType("");
      setSampleType("");
      setTurnaroundTime("");
      setDescription("");
    }

    setErrors({});
  }, [investigation]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const trimmedName = investigationName.trim();
    const trimmedCode = investigationCode.trim();
    const trimmedCategory = category.trim();
    const trimmedType = type.trim();
    const trimmedTurnaroundTime = turnaroundTime.trim();

    if (!trimmedName) {
      newErrors.investigationName = "Investigation name is required.";
    }

    if (!trimmedCode) {
      newErrors.investigationCode = "Investigation code is required.";
    }

    if (!trimmedCategory) {
      newErrors.category = "Investigation category is required.";
    }

    if (!trimmedType) {
      newErrors.type = "Investigation type is required.";
    }

    if (trimmedTurnaroundTime) {
      const numericTurnaroundTime = Number(trimmedTurnaroundTime);

      if (!Number.isInteger(numericTurnaroundTime)) {
        newErrors.turnaroundTime = "Turnaround time must be a whole number.";
      } else if (numericTurnaroundTime < 0) {
        newErrors.turnaroundTime = "Turnaround time cannot be negative.";
      }
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
      const trimmedTurnaroundTime = turnaroundTime.trim();

      const parsedTurnaroundTime = trimmedTurnaroundTime ? Number(trimmedTurnaroundTime) : null;

      if (isEditMode && investigation) {
        const updateData: UpdateInvestigationRequest = {
          investigationName: investigationName.trim(),
          investigationCode: investigationCode.trim().toUpperCase(),
          loincCode: loincCode.trim() || null,
          category: category.trim(),
          type: type.trim(),
          turnaroundTime: parsedTurnaroundTime,
          sampleType: sampleType.trim(),
          description: description.trim(),
        };

        await updateInvestigation(investigation._id, updateData);

        toast.success("Investigation updated successfully.");
      } else {
        const createData: CreateInvestigationRequest = {
          investigationName: investigationName.trim(),
          investigationCode: investigationCode.trim().toUpperCase(),
          loincCode: loincCode.trim() || null,
          category: category.trim(),
          type: type.trim(),
          turnaroundTime: parsedTurnaroundTime,
          sampleType: sampleType.trim(),
          description: description.trim(),
        };

        await createInvestigation(createData);

        toast.success("Investigation created successfully.");
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
          toast.error("Investigation code already exists in this hospital.");

          setErrors({
            investigationCode: "This investigation code already exists.",
          });

          return;
        }

        if (response?.status === 403) {
          toast.error("You do not have permission to manage investigations.");

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
        {/* INVESTIGATION NAME */}
        <div className="space-y-2">
          <label htmlFor="investigationName" className="text-sm font-medium">
            Investigation Name <span className="text-destructive">*</span>
          </label>

          <Input
            id="investigationName"
            value={investigationName}
            onChange={(event) => setInvestigationName(event.target.value)}
            placeholder="Enter investigation name"
            disabled={saving}
          />

          {errors.investigationName && (
            <p className="text-sm text-destructive">{errors.investigationName}</p>
          )}
        </div>

        {/* INVESTIGATION CODE */}
        <div className="space-y-2">
          <label htmlFor="investigationCode" className="text-sm font-medium">
            Investigation Code <span className="text-destructive">*</span>
          </label>

          <Input
            id="investigationCode"
            value={investigationCode}
            onChange={(event) => setInvestigationCode(event.target.value.toUpperCase())}
            placeholder="Enter investigation code"
            disabled={saving}
          />

          {errors.investigationCode && (
            <p className="text-sm text-destructive">{errors.investigationCode}</p>
          )}
        </div>

        {/* LOINC CODE */}
        <div className="space-y-2">
          <label htmlFor="loincCode" className="text-sm font-medium">
            LOINC Code
          </label>

          <Input
            id="loincCode"
            value={loincCode}
            onChange={(event) => setLoincCode(event.target.value)}
            placeholder="Enter LOINC code"
            disabled={saving}
          />

          {errors.loincCode && <p className="text-sm text-destructive">{errors.loincCode}</p>}
        </div>

        {/* CATEGORY */}
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category <span className="text-destructive">*</span>
          </label>

          <Input
            id="category"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            placeholder="e.g. Laboratory"
            disabled={saving}
          />

          {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
        </div>

        {/* TYPE */}
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium">
            Type <span className="text-destructive">*</span>
          </label>

          <Input
            id="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            placeholder="e.g. Hematology"
            disabled={saving}
          />

          {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
        </div>

        {/* SAMPLE TYPE */}
        <div className="space-y-2">
          <label htmlFor="sampleType" className="text-sm font-medium">
            Sample Type
          </label>

          <Input
            id="sampleType"
            value={sampleType}
            onChange={(event) => setSampleType(event.target.value)}
            placeholder="e.g. EDTA Blood"
            disabled={saving}
          />

          {errors.sampleType && <p className="text-sm text-destructive">{errors.sampleType}</p>}
        </div>

        {/* TURNAROUND TIME */}
        <div className="space-y-2">
          <label htmlFor="turnaroundTime" className="text-sm font-medium">
            Turnaround Time (minutes)
          </label>

          <Input
            id="turnaroundTime"
            type="number"
            min="0"
            step="1"
            value={turnaroundTime}
            onChange={(event) => setTurnaroundTime(event.target.value)}
            placeholder="e.g. 60"
            disabled={saving}
          />

          {errors.turnaroundTime && (
            <p className="text-sm text-destructive">{errors.turnaroundTime}</p>
          )}
        </div>

        {/* DESCRIPTION */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>

          <Textarea
            id="description"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Enter investigation description"
            rows={4}
            disabled={saving}
          />

          {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 border-t pt-5">
        <Button type="button" variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>

        <Button type="submit" disabled={saving || !isDirty}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}

          {isEditMode ? "Update Investigation" : "Save Investigation"}
        </Button>
      </div>
    </form>
  );
}
