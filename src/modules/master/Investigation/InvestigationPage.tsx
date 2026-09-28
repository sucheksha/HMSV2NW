import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ChevronUp,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  FlaskConical,
  Plus,
  Printer,
  Search,
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
  DataTablePageSize,
  DataTablePagination,
  type DataTableColumn,
} from "@/components/common/DataTable";

import { KpiCard } from "@/components/common/KpiCard/KpiCard";

import {
  deleteInvestigation,
  getInvestigations,
  getInvestigationById,
  updateInvestigation,
} from "./investigation.service";

import type { Investigation, InvestigationStatus } from "./investigation.types";

import { InvestigationForm } from "./InvestigationForm";

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

function StatusBadge({ status }: { status: InvestigationStatus }) {
  const isActive = status === "ACTIVE";

  return (
    <Badge
      variant="outline"
      className={
        isActive
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-rose-300 bg-rose-50 text-rose-700"
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

export default function InvestigationPage() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sampleTypeFilter, setSampleTypeFilter] = useState("ALL");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingInvestigation, setEditingInvestigation] = useState<Investigation | null>(null);

  const [selectedInvestigationIds, setSelectedInvestigationIds] = useState<string[]>([]);

  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusInvestigation, setStatusInvestigation] = useState<Investigation | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Investigation | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const formRef = useRef<HTMLDivElement | null>(null);

  const loadInvestigations = async () => {
    setLoading(true);
    setLoadError("");

    try {
      const data = await getInvestigations();

      setInvestigations(data);
      setSelectedInvestigationIds([]);
    } catch (error) {
      const message = getApiErrorMessage(error);

      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadInvestigations();
  }, []);

  const categories = useMemo(() => {
    return Array.from(
      new Set(
        investigations
          .map((investigation) => investigation.category)
          .filter((category): category is string => Boolean(category && category.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [investigations]);

  const types = useMemo(() => {
    return Array.from(
      new Set(
        investigations
          .map((investigation) => investigation.type)
          .filter((type): type is string => Boolean(type && type.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [investigations]);

  const sampleTypes = useMemo(() => {
    return Array.from(
      new Set(
        investigations
          .map((investigation) => investigation.sampleType)
          .filter((sampleType): sampleType is string => Boolean(sampleType && sampleType.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [investigations]);

  const filteredInvestigations = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    return investigations.filter((investigation) => {
      const matchesSearch =
        !searchValue ||
        investigation.investigationName.toLowerCase().includes(searchValue) ||
        investigation.investigationCode.toLowerCase().includes(searchValue) ||
        (investigation.loincCode ?? "").toLowerCase().includes(searchValue) ||
        (investigation.sampleType ?? "").toLowerCase().includes(searchValue);

      const matchesStatus = statusFilter === "ALL" || investigation.status === statusFilter;

      const matchesCategory = categoryFilter === "ALL" || investigation.category === categoryFilter;

      const matchesType = typeFilter === "ALL" || investigation.type === typeFilter;

      const matchesSampleType =
        sampleTypeFilter === "ALL" || investigation.sampleType === sampleTypeFilter;

      const investigationDate = new Date(investigation.createdAt);

      const matchesFromDate = !fromDate || investigationDate >= new Date(`${fromDate}T00:00:00`);

      const matchesToDate = !toDate || investigationDate <= new Date(`${toDate}T23:59:59`);

      return (
        matchesSearch &&
        matchesStatus &&
        matchesCategory &&
        matchesType &&
        matchesSampleType &&
        matchesFromDate &&
        matchesToDate
      );
    });
  }, [
    investigations,
    search,
    statusFilter,
    categoryFilter,
    typeFilter,
    sampleTypeFilter,
    fromDate,
    toDate,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, categoryFilter, typeFilter, sampleTypeFilter, fromDate, toDate]);

  const totalPages = Math.max(1, Math.ceil(filteredInvestigations.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedInvestigations = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredInvestigations.slice(startIndex, startIndex + pageSize);
  }, [filteredInvestigations, currentPage, pageSize]);

  const totalInvestigations = investigations.length;

  const activeInvestigations = investigations.filter(
    (investigation) => investigation.status === "ACTIVE",
  ).length;

  const inactiveInvestigations = investigations.filter(
    (investigation) => investigation.status === "INACTIVE",
  ).length;

  const totalSampleTypes = investigations.filter((investigation) =>
    Boolean(investigation.sampleType?.trim()),
  ).length;

  const allCurrentPageSelected =
    paginatedInvestigations.length > 0 &&
    paginatedInvestigations.every((investigation) =>
      selectedInvestigationIds.includes(investigation._id),
    );

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    sampleTypeFilter !== "ALL" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const closeAndClearFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setSampleTypeFilter("ALL");
    setFromDate("");
    setToDate("");
    setFilterOpen(false);
  };

  const clearSearch = () => {
    setSearch("");
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentIds = paginatedInvestigations.map((investigation) => investigation._id);

      setSelectedInvestigationIds((previous) => Array.from(new Set([...previous, ...currentIds])));
    } else {
      const currentIds = new Set(paginatedInvestigations.map((investigation) => investigation._id));

      setSelectedInvestigationIds((previous) => previous.filter((id) => !currentIds.has(id)));
    }
  };

  const handleSelectRow = (investigationId: string, checked: boolean) => {
    if (checked) {
      setSelectedInvestigationIds((previous) =>
        previous.includes(investigationId) ? previous : [...previous, investigationId],
      );
    } else {
      setSelectedInvestigationIds((previous) => previous.filter((id) => id !== investigationId));
    }
  };

  const handleView = async (investigationId: string) => {
    setDetailsDialogOpen(true);
    setDetailsLoading(true);
    setSelectedInvestigation(null);

    try {
      const investigation = await getInvestigationById(investigationId);

      setSelectedInvestigation(investigation);
    } catch (error) {
      toast.error(getApiErrorMessage(error));
      setDetailsDialogOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleEdit = (investigation: Investigation) => {
    setEditingInvestigation(investigation);
    setFormOpen(true);

    window.setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const handleAdd = () => {
    setEditingInvestigation(null);
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
    setEditingInvestigation(null);

    await loadInvestigations();
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditingInvestigation(null);
  };

  const openStatusDialog = (investigation: Investigation) => {
    setStatusInvestigation(investigation);
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!statusInvestigation) {
      return;
    }

    setStatusChanging(true);

    const newStatus: InvestigationStatus =
      statusInvestigation.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await updateInvestigation(statusInvestigation._id, {
        status: newStatus,
      });

      toast.success(
        `Investigation ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`,
      );

      setStatusDialogOpen(false);
      setStatusInvestigation(null);

      await loadInvestigations();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setStatusChanging(false);
    }
  };

  const openDeleteDialog = (investigation: Investigation) => {
    setDeleteTarget(investigation);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setDeleting(true);

    try {
      await deleteInvestigation(deleteTarget._id);

      toast.success("Investigation deleted successfully.");

      setDeleteDialogOpen(false);
      setDeleteTarget(null);

      await loadInvestigations();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedInvestigationIds.length === 0) {
      return;
    }

    setDeleting(true);

    try {
      await Promise.all(selectedInvestigationIds.map((id) => deleteInvestigation(id)));

      toast.success(
        `${selectedInvestigationIds.length} investigation ${
          selectedInvestigationIds.length === 1 ? "record" : "records"
        } deleted successfully.`,
      );

      setSelectedInvestigationIds([]);

      await loadInvestigations();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const exportCsv = () => {
    if (filteredInvestigations.length === 0) {
      toast.error("There are no investigation records to export.");
      return;
    }

    const headers = [
      "Investigation Name",
      "Investigation Code",
      "LOINC Code",
      "Category",
      "Type",
      "Sample Type",
      "Turnaround Time (minutes)",
      "Status",
      "Created Date",
    ];

    const rows = filteredInvestigations.map((investigation) => [
      investigation.investigationName,
      investigation.investigationCode,
      investigation.loincCode ?? "",
      investigation.category,
      investigation.type,
      investigation.sampleType ?? "",
      investigation.turnaroundTime ?? "",
      investigation.status,
      formatDate(investigation.createdAt),
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
    link.download = "investigation-report.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);

    toast.success("Investigation CSV exported successfully.");
  };

  const printReport = () => {
    window.print();
  };

  const columns: DataTableColumn<Investigation>[] = [
    {
      key: "select",
      header: "",
      render: (investigation) => (
        <Checkbox
          checked={selectedInvestigationIds.includes(investigation._id)}
          onCheckedChange={(checked) => handleSelectRow(investigation._id, checked === true)}
          aria-label={`Select ${investigation.investigationName}`}
        />
      ),
    },
    {
      key: "number",
      header: "#",
      render: (investigation) => {
        const index = filteredInvestigations.findIndex((item) => item._id === investigation._id);

        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      key: "investigationName",
      header: "Investigation Name",
      render: (investigation) => (
        <div className="min-w-[180px]">
          <p className="font-medium">{investigation.investigationName}</p>

          {investigation.loincCode && (
            <p className="text-xs text-muted-foreground">LOINC: {investigation.loincCode}</p>
          )}
        </div>
      ),
    },
    {
      key: "investigationCode",
      header: "Investigation Code",
      render: (investigation) => (
        <span className="font-medium">{investigation.investigationCode}</span>
      ),
    },
    {
      key: "category",
      header: "Category",
      render: (investigation) => investigation.category || "-",
    },
    {
      key: "type",
      header: "Type",
      render: (investigation) => investigation.type || "-",
    },
    {
      key: "status",
      header: "Status",
      render: (investigation) => (
        <button
          type="button"
          onClick={() => openStatusDialog(investigation)}
          className="cursor-pointer"
          title="Change status"
        >
          <StatusBadge status={investigation.status} />
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (investigation) => (
        <span className="whitespace-nowrap">{formatDate(investigation.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (investigation) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="View investigation"
            aria-label={`View ${investigation.investigationName}`}
            onClick={() => void handleView(investigation._id)}
            className="h-8 w-8 text-muted-foreground hover:bg-primary/10 hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Edit investigation"
            aria-label={`Edit ${investigation.investigationName}`}
            onClick={() => handleEdit(investigation)}
            className="h-8 w-8 text-muted-foreground hover:bg-amber-50 hover:text-amber-600"
          >
            <Edit className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            title="Delete investigation"
            aria-label={`Delete ${investigation.investigationName}`}
            onClick={() => openDeleteDialog(investigation)}
            className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <FlaskConical className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Investigation Management</h1>

            <p className="text-sm text-muted-foreground">
              Manage investigation and diagnostic test master data.
            </p>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Total Investigations"
          value={totalInvestigations}
          description="All investigation records"
          icon={FileText}
          className="border-sky-200 bg-sky-50/60"
          iconClassName="bg-sky-100 text-sky-600"
        />

        <KpiCard
          title="Active"
          value={activeInvestigations}
          description="Currently active"
          icon={Activity}
          className="border-emerald-200 bg-emerald-50/60"
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        <KpiCard
          title="Inactive"
          value={inactiveInvestigations}
          description="Currently inactive"
          icon={X}
          className="border-rose-200 bg-rose-50/60"
          iconClassName="bg-rose-100 text-rose-600"
        />

        <KpiCard
          title="Total Sample Types"
          value={totalSampleTypes}
          description="Records with sample type"
          icon={FlaskConical}
          className="border-violet-200 bg-violet-50/60"
          iconClassName="bg-violet-100 text-violet-600"
        />
      </div>

      {/* INVESTIGATION LIST */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-background shadow-sm">
        {/* LIST HEADER */}
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Investigation List</h2>

            <p className="text-sm text-muted-foreground">
              Total Records: {filteredInvestigations.length}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedInvestigationIds.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => void handleBulkDelete()}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedInvestigationIds.length})
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
              Add New Investigation
            </Button>
          </div>
        </div>

        {/* FILTER BAR */}
        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            {/* SEARCH */}
            <div className="relative w-full lg:max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, code, LOINC code..."
                className="pl-9 pr-9"
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  title="Clear search"
                  className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* FILTER BUTTON */}
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilterOpen((current) => !current)}
                className="shrink-0"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
                {hasActiveFilters && (
                  <span className="ml-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                    {
                      [
                        statusFilter !== "ALL",
                        categoryFilter !== "ALL",
                        typeFilter !== "ALL",
                        sampleTypeFilter !== "ALL",
                        Boolean(fromDate),
                        Boolean(toDate),
                      ].filter(Boolean).length
                    }
                  </span>
                )}
              </Button>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Clear all filters"
                  aria-label="Clear all filters"
                  onClick={closeAndClearFilters}
                  className="h-9 w-9 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          {/* FILTER PANEL */}
          {filterOpen && (
            <div className="mt-4 rounded-lg border border-slate-200 bg-muted/20 p-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-6">
                {/* STATUS */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>

                  <div className="flex items-center gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ALL">All Status</SelectItem>
                        <SelectItem value="ACTIVE">Active</SelectItem>
                        <SelectItem value="INACTIVE">Inactive</SelectItem>
                      </SelectContent>
                    </Select>

                    {statusFilter !== "ALL" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Clear status filter"
                        aria-label="Clear status filter"
                        onClick={() => setStatusFilter("ALL")}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* CATEGORY */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>

                  <div className="flex items-center gap-2">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
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

                    {categoryFilter !== "ALL" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Clear category filter"
                        aria-label="Clear category filter"
                        onClick={() => setCategoryFilter("ALL")}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* TYPE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Type</label>

                  <div className="flex items-center gap-2">
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
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

                    {typeFilter !== "ALL" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Clear type filter"
                        aria-label="Clear type filter"
                        onClick={() => setTypeFilter("ALL")}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* SAMPLE TYPE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Sample Type</label>

                  <div className="flex items-center gap-2">
                    <Select value={sampleTypeFilter} onValueChange={setSampleTypeFilter}>
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectItem value="ALL">All Sample Types</SelectItem>

                        {sampleTypes.map((sampleType) => (
                          <SelectItem key={sampleType} value={sampleType}>
                            {sampleType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {sampleTypeFilter !== "ALL" && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Clear sample type filter"
                        aria-label="Clear sample type filter"
                        onClick={() => setSampleTypeFilter("ALL")}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* FROM DATE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">From Date</label>

                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(event) => setFromDate(event.target.value)}
                      className="flex-1"
                    />

                    {fromDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Clear from date"
                        aria-label="Clear from date"
                        onClick={() => setFromDate("")}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>

                {/* TO DATE */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">To Date</label>

                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(event) => setToDate(event.target.value)}
                      className="flex-1"
                    />

                    {toDate && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        title="Clear to date"
                        aria-label="Clear to date"
                        onClick={() => setToDate("")}
                        className="h-9 w-9 shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="px-5">
          <DataTable
            columns={columns}
            data={paginatedInvestigations}
            getRowKey={(row) => row._id}
            loading={loading}
            emptyMessage={
              hasActiveFilters
                ? "No investigations match the selected filters."
                : "No investigation records found."
            }
          />
        </div>

        {/* SELECT ALL */}
        {!loading && paginatedInvestigations.length > 0 && (
          <div className="flex items-center gap-2 border-t border-slate-200 px-5 py-3">
            <Checkbox
              checked={allCurrentPageSelected}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
              aria-label="Select all investigations on this page"
            />

            <span className="text-sm text-muted-foreground">Select all on this page</span>
          </div>
        )}

        {/* PAGINATION */}
        {!loading && filteredInvestigations.length > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
          <p className="font-medium text-destructive">Unable to load investigations</p>

          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() => void loadInvestigations()}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ADD / EDIT FORM */}
      {formOpen && (
        <section
          ref={formRef}
          className="overflow-hidden rounded-xl border border-slate-200 bg-background shadow-sm"
        >
          <div className="flex items-center justify-between border-b border-slate-200 bg-muted/30 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold">
                {editingInvestigation ? "Edit Investigation" : "Add New Investigation"}
              </h2>

              <p className="text-sm text-muted-foreground">
                {editingInvestigation
                  ? "Update the investigation master record."
                  : "Enter the investigation details to create a new master record."}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleFormCancel}
              aria-label="Close investigation form"
            >
              <ChevronUp className="h-5 w-5" />
            </Button>
          </div>

          <div className="p-5">
            <InvestigationForm
              investigation={editingInvestigation}
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
            <DialogTitle>Investigation Details</DialogTitle>

            <DialogDescription>View complete information for this investigation.</DialogDescription>
          </DialogHeader>

          {detailsLoading ? (
            <div className="flex min-h-[220px] items-center justify-center">
              <div className="text-sm text-muted-foreground">Loading investigation details...</div>
            </div>
          ) : selectedInvestigation ? (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-muted/20 p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Investigation
                  </p>

                  <h3 className="mt-1 text-xl font-semibold">
                    {selectedInvestigation.investigationName}
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {selectedInvestigation.investigationCode}
                  </p>
                </div>

                <StatusBadge status={selectedInvestigation.status} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <DetailItem
                  label="Investigation Name"
                  value={selectedInvestigation.investigationName}
                />

                <DetailItem
                  label="Investigation Code"
                  value={selectedInvestigation.investigationCode}
                />

                <DetailItem label="LOINC Code" value={selectedInvestigation.loincCode} />

                <DetailItem label="Category" value={selectedInvestigation.category} />

                <DetailItem label="Type" value={selectedInvestigation.type} />

                <DetailItem label="Sample Type" value={selectedInvestigation.sampleType} />

                <DetailItem
                  label="Turnaround Time"
                  value={
                    selectedInvestigation.turnaroundTime !== null &&
                    selectedInvestigation.turnaroundTime !== undefined
                      ? `${selectedInvestigation.turnaroundTime} minutes`
                      : null
                  }
                />

                <DetailItem
                  label="Created Date"
                  value={formatDate(selectedInvestigation.createdAt)}
                />

                <DetailItem
                  label="Updated Date"
                  value={formatDate(selectedInvestigation.updatedAt)}
                />
              </div>

              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Description
                </p>

                <p className="mt-2 text-sm leading-6">
                  {selectedInvestigation.description || "No description provided."}
                </p>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div>
                  <p className="font-medium">Investigation Status</p>

                  <p className="text-sm text-muted-foreground">
                    Activate or deactivate this investigation.
                  </p>
                </div>

                <Switch
                  checked={selectedInvestigation.status === "ACTIVE"}
                  onCheckedChange={() => openStatusDialog(selectedInvestigation)}
                />
              </div>
            </div>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Investigation details could not be loaded.
            </div>
          )}

          <DialogFooter>
            {selectedInvestigation && (
              <Button
                type="button"
                onClick={() => {
                  setDetailsDialogOpen(false);
                  handleEdit(selectedInvestigation);
                }}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Investigation
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
              {statusInvestigation?.status === "ACTIVE"
                ? "Deactivate Investigation?"
                : "Activate Investigation?"}
            </AlertDialogTitle>

            <AlertDialogDescription>
              {statusInvestigation?.status === "ACTIVE"
                ? `Are you sure you want to deactivate "${statusInvestigation?.investigationName}"?`
                : `Are you sure you want to activate "${statusInvestigation?.investigationName}"?`}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={statusChanging}>Cancel</AlertDialogCancel>

            <AlertDialogAction onClick={() => void handleStatusChange()} disabled={statusChanging}>
              {statusInvestigation?.status === "ACTIVE" ? "Deactivate" : "Activate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Investigation?</AlertDialogTitle>

            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteTarget?.investigationName}</strong>?
              This will perform a soft delete and remove the record from the active investigation
              list.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>

            <AlertDialogAction
              onClick={() => void handleDelete()}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Investigation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
