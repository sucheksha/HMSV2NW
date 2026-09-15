import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  Plus,
  Printer,
  Search,
  Stethoscope,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

import {
  DataTable,
  DataTableActions,
  DataTablePageSize,
  DataTablePagination,
  DataTableToolbar,
  type DataTableColumn,
} from "@/components/common/DataTable";

import { KpiCard } from "@/components/common/KpiCard/KpiCard";

import {
  deleteDiagnosis,
  getDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
} from "./diagnosis.service";

import type { Diagnosis, DiagnosisStatus } from "./diagnosis.types";

import { DiagnosisForm } from "./DiagnosisForm";

const getApiErrorMessage = (error: unknown): string => {
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

const formatDate = (dateValue?: string | null): string => {
  if (!dateValue) {
    return "-";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

const formatDateForInput = (dateValue?: string | null): string => {
  if (!dateValue) {
    return "";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};

function StatusBadge({ status }: { status: DiagnosisStatus }) {
  const isActive = status === "ACTIVE";

  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-red-200 bg-red-50 text-red-700"
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function DetailItem({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">
        {value === null || value === undefined || value === "" ? "-" : value}
      </p>
    </div>
  );
}

export default function DiagnosisPage() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null);

  const [selectedDiagnosisIds, setSelectedDiagnosisIds] = useState<string[]>([]);

  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusDiagnosis, setStatusDiagnosis] = useState<Diagnosis | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Diagnosis | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formRef = useRef<HTMLDivElement | null>(null);

  const loadDiagnoses = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await getDiagnoses();

      setDiagnoses(data);
      setSelectedDiagnosisIds([]);
    } catch (error) {
      const message = getApiErrorMessage(error);

      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadDiagnoses();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        diagnoses
          .map((diagnosis) => diagnosis.diagnosisCategory)
          .filter((category): category is string => Boolean(category && category.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [diagnoses]);

  const types = useMemo(() => {
    return Array.from(
      new Set(
        diagnoses
          .map((diagnosis) => diagnosis.diagnosisType)
          .filter((type): type is string => Boolean(type && type.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [diagnoses]);

  const filteredDiagnoses = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return diagnoses.filter((diagnosis) => {
      const matchesSearch =
        !searchValue ||
        diagnosis.diagnosisName.toLowerCase().includes(searchValue) ||
        diagnosis.diagnosisCode.toLowerCase().includes(searchValue) ||
        (diagnosis.icdCode ?? "").toLowerCase().includes(searchValue) ||
        (diagnosis.shortName ?? "").toLowerCase().includes(searchValue);

      const matchesStatus = statusFilter === "ALL" || diagnosis.status === statusFilter;

      const matchesCategory =
        categoryFilter === "ALL" || diagnosis.diagnosisCategory === categoryFilter;

      const matchesType = typeFilter === "ALL" || diagnosis.diagnosisType === typeFilter;

      const diagnosisDate = new Date(diagnosis.createdAt);

      const matchesFromDate = !fromDate || diagnosisDate >= new Date(`${fromDate}T00:00:00`);

      const matchesToDate = !toDate || diagnosisDate <= new Date(`${toDate}T23:59:59`);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesType &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [diagnoses, search, statusFilter, categoryFilter, typeFilter, fromDate, toDate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, typeFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredDiagnoses.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedDiagnoses = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredDiagnoses.slice(startIndex, startIndex + pageSize);
  }, [filteredDiagnoses, currentPage, pageSize]);

  const totalDiagnoses = diagnoses.length;

  const activeDiagnoses = diagnoses.filter((diagnosis) => diagnosis.status === "ACTIVE").length;

  const inactiveDiagnoses = diagnoses.filter((diagnosis) => diagnosis.status === "INACTIVE").length;

  const icdMappedDiagnoses = diagnoses.filter((diagnosis) => Boolean(diagnosis.icdCode)).length;

  const allCurrentPageSelected =
    paginatedDiagnoses.length > 0 &&
    paginatedDiagnoses.every((diagnosis) => selectedDiagnosisIds.includes(diagnosis._id));

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setFromDate("");
    setToDate("");
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    fromDate !== "" ||
    toDate !== "";

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentIds = paginatedDiagnoses.map((diagnosis) => diagnosis._id);

      setSelectedDiagnosisIds((previous) => Array.from(new Set([...previous, ...currentIds])));
    } else {
      const currentIds = new Set(paginatedDiagnoses.map((diagnosis) => diagnosis._id));

      setSelectedDiagnosisIds((previous) => previous.filter((id) => !currentIds.has(id)));
    }
  };

  const handleSelectRow = (diagnosisId: string, checked: boolean) => {
    if (checked) {
      setSelectedDiagnosisIds((previous) =>
        previous.includes(diagnosisId) ? previous : [...previous, diagnosisId],
      );
    } else {
      setSelectedDiagnosisIds((previous) => previous.filter((id) => id !== diagnosisId));
    }
  };

  const handleView = async (diagnosisId: string) => {
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    setSelectedDiagnosis(null);

    try {
      const diagnosis = await getDiagnosisById(diagnosisId);

      setSelectedDiagnosis(diagnosis);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setDetailsDialogOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEdit = (diagnosis: Diagnosis) => {
    setEditingDiagnosis(diagnosis);
    setFormOpen(true);

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleAdd = () => {
    setEditingDiagnosis(null);
    setFormOpen(true);

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleFormSuccess = async () => {
    setFormOpen(false);
    setEditingDiagnosis(null);

    await loadDiagnoses();
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditingDiagnosis(null);
  };

  const openStatusDialog = (diagnosis: Diagnosis) => {
    setStatusDiagnosis(diagnosis);
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!statusDiagnosis) {
      return;
    }

    setStatusChanging(true);

    const newStatus: DiagnosisStatus = statusDiagnosis.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await updateDiagnosis(statusDiagnosis._id, {
        status: newStatus,
      });

      toast.success(
        `Diagnosis ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`,
      );

      setStatusDialogOpen(false);
      setStatusDiagnosis(null);

      await loadDiagnoses();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setStatusChanging(false);
    }
  };

  const openDeleteDialog = (diagnosis: Diagnosis) => {
    setDeleteTarget(diagnosis);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await deleteDiagnosis(deleteTarget._id);

      toast.success("Diagnosis deleted successfully.");

      setDeleteDialogOpen(false);
      setDeleteTarget(null);

      await loadDiagnoses();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDiagnosisIds.length === 0) {
      return;
    }

    setDeleting(true);

    try {
      await Promise.all(selectedDiagnosisIds.map((id) => deleteDiagnosis(id)));

      toast.success(
        `${selectedDiagnosisIds.length} diagnosis ${
          selectedDiagnosisIds.length === 1 ? "record" : "records"
        } deleted successfully.`,
      );

      setSelectedDiagnosisIds([]);

      await loadDiagnoses();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = () => {
    if (filteredDiagnoses.length === 0) {
      toast.error("There are no diagnosis records to export.");
      return;
    }

    const headers = [
      "Diagnosis Name",
      "Diagnosis Code",
      "ICD Code",
      "Category",
      "Type",
      "Short Name",
      "Status",
      "Created Date",
    ];

    const rows = filteredDiagnoses.map((diagnosis) => [
      diagnosis.diagnosisName,
      diagnosis.diagnosisCode,
      diagnosis.icdCode ?? "",
      diagnosis.diagnosisCategory ?? "",
      diagnosis.diagnosisType ?? "",
      diagnosis.shortName ?? "",
      diagnosis.status,
      formatDate(diagnosis.createdAt),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((value) => {
            const text = String(value ?? "");
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "diagnosis-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("Diagnosis CSV exported successfully.");
  };

  const printReport = () => {
    window.print();
  };

  const columns: DataTableColumn<Diagnosis>[] = [
    {
      key: "select",
      header: "",
      render: (diagnosis) => (
        <Checkbox
          checked={selectedDiagnosisIds.includes(diagnosis._id)}
          onCheckedChange={(checked) => handleSelectRow(diagnosis._id, checked === true)}
          aria-label={`Select ${diagnosis.diagnosisName}`}
        />
      ),
    },
    {
      key: "number",
      header: "#",
      render: (diagnosis) => {
        const index = filteredDiagnoses.findIndex((item) => item._id === diagnosis._id);

        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      key: "diagnosisName",
      header: "Diagnosis Name",
      render: (diagnosis) => (
        <div className="min-w-[180px]">
          <p className="font-medium">{diagnosis.diagnosisName}</p>

          {diagnosis.shortName && (
            <p className="text-xs text-muted-foreground">{diagnosis.shortName}</p>
          )}
        </div>
      ),
    },
    {
      key: "diagnosisCode",
      header: "Diagnosis Code",
      render: (diagnosis) => <span className="font-medium">{diagnosis.diagnosisCode}</span>,
    },
    {
      key: "icdCode",
      header: "ICD Code",
      render: (diagnosis) => diagnosis.icdCode || "-",
    },
    {
      key: "diagnosisCategory",
      header: "Category",
      render: (diagnosis) => diagnosis.diagnosisCategory || "-",
    },
    {
      key: "diagnosisType",
      header: "Type",
      render: (diagnosis) => diagnosis.diagnosisType || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (diagnosis) => (
        <button
          type="button"
          onClick={() => openStatusDialog(diagnosis)}
          className="cursor-pointer"
          title="Change status"
        >
          <StatusBadge status={diagnosis.status} />
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (diagnosis) => (
        <span className="whitespace-nowrap">{formatDate(diagnosis.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (diagnosis) => (
        <DataTableActions
          onView={() => void handleView(diagnosis._id)}
          onEdit={() => handleEdit(diagnosis)}
          onDelete={() => openDeleteDialog(diagnosis)}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Stethoscope className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Diagnosis Management</h1>

              <p className="text-sm text-muted-foreground">
                Manage diagnosis master data and clinical classification.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Diagnoses"
          value={totalDiagnoses}
          description="All diagnosis records"
          icon={FileText}
          iconClassName="bg-primary/10 text-primary"
        />

        <KpiCard
          title="Active"
          value={activeDiagnoses}
          description="Currently active"
          icon={Activity}
          iconClassName="bg-emerald-50 text-emerald-600"
        />

        <KpiCard
          title="Inactive"
          value={inactiveDiagnoses}
          description="Currently inactive"
          icon={X}
          iconClassName="bg-red-50 text-red-600"
        />

        <KpiCard
          title="ICD Mapped"
          value={icdMappedDiagnoses}
          description="Records with ICD code"
          icon={Stethoscope}
          iconClassName="bg-blue-50 text-blue-600"
        />
      </div>

      {/* DIAGNOSIS LIST */}
      <section className="overflow-hidden rounded-xl border bg-background shadow-sm">
        {/* LIST HEADER */}
        <div className="flex flex-col gap-4 border-b px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Diagnosis List</h2>

            <p className="text-sm text-muted-foreground">
              Total Records: {filteredDiagnoses.length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedDiagnosisIds.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => void handleBulkDelete()}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedDiagnosisIds.length})
              </Button>
            )}

            <Button type="button" variant="outline" size="sm" onClick={exportCsv}>
              <Download className="mr-2 h-4 w-4" />
              Export CSV
            </Button>

            <Button type="button" variant="outline" size="sm" onClick={printReport}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>

            <Button type="button" size="sm" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Diagnosis
            </Button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="border-b px-5 py-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-[2fr_1fr_1fr_1fr_1.4fr]">
            {/* SEARCH */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, code, ICD code..."
                className="pl-9"
              />
            </div>

            {/* STATUS */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Status</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* CATEGORY */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Categories</SelectItem>

                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* TYPE */}
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Types</SelectItem>

                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* DATE RANGE */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="date"
                  value={fromDate}
                  onChange={(event) => setFromDate(event.target.value)}
                  className="pl-9"
                  aria-label="From date"
                />
              </div>

              <span className="text-sm text-muted-foreground">-</span>

              <div className="relative flex-1">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                <Input
                  type="date"
                  value={toDate}
                  onChange={(event) => setToDate(event.target.value)}
                  className="pl-9"
                  aria-label="To date"
                />
              </div>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="h-4 w-4" />
                Filters applied
              </div>

              <Button type="button" variant="ghost" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="px-5">
          <DataTable
            columns={columns}
            data={paginatedDiagnoses}
            getRowKey={(row) => row._id}
            loading={loading}
            emptyMessage={
              hasActiveFilters
                ? "No diagnoses match the selected filters."
                : "No diagnosis records found."
            }
          />
        </div>

        {/* SELECT ALL */}
        {!loading && paginatedDiagnoses.length > 0 && (
          <div className="flex items-center gap-2 border-t px-5 py-3">
            <Checkbox
              checked={allCurrentPageSelected}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
              aria-label="Select all diagnoses on this page"
            />

            <span className="text-sm text-muted-foreground">Select all on this page</span>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredDiagnoses.length > 0 && (
          <div className="flex flex-col gap-3 border-t px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <DataTablePageSize
              value={pageSize}
              onChange={(value) => {
                setPageSize(value);
                setCurrentPage(1);
              }}
            />

            <DataTablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>

      {/* ERROR STATE */}
      {loadError && !loading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="font-medium text-destructive">Unable to load diagnoses</p>

          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void loadDiagnoses()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {formOpen && (
        <section
          ref={formRef}
          className="overflow-hidden rounded-xl border bg-background shadow-sm"
        >
          <div className="flex items-center justify-between border-b bg-muted/30 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">
                {editingDiagnosis ? "Edit Diagnosis" : "Add New Diagnosis"}
              </h2>

              <p className="text-sm text-muted-foreground">
                {editingDiagnosis
                  ? "Update the diagnosis master record."
                  : "Enter the diagnosis details to create a new master record."}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFormCancel}
              aria-label="Close diagnosis form"
            >
              {formOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </Button>
          </div>

          <div className="p-5">
            <DiagnosisForm
              diagnosis={editingDiagnosis}
              onSuccess={() => void handleFormSuccess()}
              onCancel={handleFormCancel}
            />
          </div>
        </section>
      )}

      {/* VIEW DETAILS */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Diagnosis Details</DialogTitle>

            <DialogDescription>View complete information for this diagnosis.</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading diagnosis details...</div>
            </div>
          ) : selectedDiagnosis ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 rounded-xl border bg-muted/20 p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Diagnosis
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">{selectedDiagnosis.diagnosisName}</h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedDiagnosis.diagnosisCode}
                  </p>
                </div>

                <StatusBadge status={selectedDiagnosis.status} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem label="Diagnosis Name" value={selectedDiagnosis.diagnosisName} />

                <DetailItem label="Diagnosis Code" value={selectedDiagnosis.diagnosisCode} />

                <DetailItem label="ICD Code" value={selectedDiagnosis.icdCode} />

                <DetailItem label="ICD Version" value={selectedDiagnosis.icdVersion} />

                <DetailItem label="Category" value={selectedDiagnosis.diagnosisCategory} />

                <DetailItem label="Type" value={selectedDiagnosis.diagnosisType} />

                <DetailItem label="Short Name" value={selectedDiagnosis.shortName} />

                <DetailItem label="Created Date" value={formatDate(selectedDiagnosis.createdAt)} />

                <DetailItem label="Updated Date" value={formatDate(selectedDiagnosis.updatedAt)} />
              </div>

              <div className="rounded-xl border p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6">
                  {selectedDiagnosis.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border p-4">
                <div>
                  <p className="font-medium">Diagnosis Status</p>

                  <p className="text-sm text-muted-foreground">
                    Activate or deactivate this diagnosis.
                  </p>
                </div>

                <Switch
                  checked={selectedDiagnosis.status === "ACTIVE"}
                  onCheckedChange={() => openStatusDialog(selectedDiagnosis)}
                />
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Diagnosis details could not be loaded.
            </div>
          )}

          <DialogFooter>
            {selectedDiagnosis && (
              <Button
                type="button"
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleEdit(selectedDiagnosis);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Diagnosis
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* STATUS CONFIRMATION */}
      <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {statusDiagnosis?.status === "ACTIVE"
                ? "Deactivate Diagnosis?"
                : "Activate Diagnosis?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {statusDiagnosis?.status === "ACTIVE"
                ? `Are you sure you want to deactivate "${statusDiagnosis?.diagnosisName}"?`
                : `Are you sure you want to activate "${statusDiagnosis?.diagnosisName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusChanging}>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={() => void handleStatusChange()} disabled={statusChanging}>
              {statusDiagnosis?.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Diagnosis?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.diagnosisName}</strong>? This
              will perform a soft delete and remove the record from the active diagnosis list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Diagnosis"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
