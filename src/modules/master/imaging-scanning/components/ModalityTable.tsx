import { Eye, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable/DataTable";

import type { Modality } from "../imagingScanning.types";

type ModalityTableProps = {
  modalities: Modality[];
  loading: boolean;
  onView: (modality: Modality) => void;
  onEdit: (modality: Modality) => void;
  onDelete: (modality: Modality) => void;
};

export function ModalityTable({
  modalities,
  loading,
  onView,
  onEdit,
  onDelete,
}: ModalityTableProps) {
  const columns: DataTableColumn<Modality>[] = [
    {
      key: "modalityCode",
      header: "Code",
      headerClassName: "w-[140px] font-semibold",
      cellClassName: "font-medium",
      render: (modality) => modality.modalityCode,
    },
    {
      key: "modalityName",
      header: "Name",
      headerClassName: "font-semibold",
      render: (modality) => (
        <div>
          <p className="font-medium">{modality.modalityName}</p>
          {modality.description && (
            <p className="mt-1 max-w-md truncate text-xs text-muted-foreground">
              {modality.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "w-[140px] font-semibold",
      render: (modality) => (
        <Badge
          variant={modality.status === "ACTIVE" ? "default" : "secondary"}
          className={
            modality.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              : ""
          }
        >
          {modality.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "w-[150px] text-right font-semibold",
      cellClassName: "text-right",
      render: (modality) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="View modality"
            aria-label={`View ${modality.modalityName}`}
            onClick={() => onView(modality)}
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Edit modality"
            aria-label={`Edit ${modality.modalityName}`}
            onClick={() => onEdit(modality)}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Delete modality"
            aria-label={`Delete ${modality.modalityName}`}
            className="text-destructive hover:text-destructive"
            onClick={() => onDelete(modality)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={modalities}
      getRowKey={(modality) => modality._id}
      loading={loading}
      emptyMessage="No modalities found. Create your first modality to get started."
    />
  );
}
