
import { ChevronDown, Edit, Eye, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  DataTable,
  type DataTableColumn,
} from "@/components/common/DataTable";

import type { Modality } from "../imagingScanning.types";

type ModalityTableProps = {
  modalities: Modality[];
  loading: boolean;
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onView: (modality: Modality) => void;
  onEdit: (modality: Modality) => void;
  onDelete: (modality: Modality) => void;
  onStatusClick: (modality: Modality) => void;
};

export function ModalityTable({
  modalities,
  loading,
  selectedIds,
  onSelectionChange,
  onView,
  onEdit,
  onDelete,
  onStatusClick,
}: ModalityTableProps) {
  const handleSelectRow = (modalityId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange(
        selectedIds.includes(modalityId)
          ? selectedIds
          : [...selectedIds, modalityId],
      );
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== modalityId));
    }
  };

  const columns: DataTableColumn<Modality>[] = [
    {
      key: "select",
      header: "",
      headerClassName: "print:hidden",
      cellClassName: "print:hidden",
      render: (modality) => (
        <Checkbox
          checked={selectedIds.includes(modality._id)}
          onCheckedChange={(checked) =>
            handleSelectRow(modality._id, checked === true)
          }
          aria-label={`Select ${modality.modalityName}`}
        />
      ),
    },
    {
      key: "modalityCode",
      header: "Code",
      render: (modality) => (
        <span className="font-medium">{modality.modalityCode}</span>
      ),
    },
    {
      key: "modalityName",
      header: "Name",
      render: (modality) => (
        <div className="min-w-[160px]">
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
      render: (modality) => (
        <button
          type="button"
          onClick={() => onStatusClick(modality)}
          className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label={`Change status of ${modality.modalityName}`}
        >
          <Badge
            variant="outline"
            className={
              modality.status === "ACTIVE"
                ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                : "border-red-400 bg-red-50 text-red-600"
            }
          >
            {modality.status === "ACTIVE" ? "Active" : "Inactive"}
          </Badge>
        </button>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center print:hidden",
      cellClassName: "text-center print:hidden",
      render: (modality) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Actions for ${modality.modalityName}`}
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onView(modality)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => onEdit(modality)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => onDelete(modality)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
      emptyMessage="No modality records found."
    />
  );
}
