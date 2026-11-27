import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ChevronDown,
  Download,
  Edit,
  Eye,
  FileText,
  Filter,
  FlaskConical,
  Plus,
  Printer,
  Trash2,
  X,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { SearchInput } from "@/components/common/SearchInput";
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
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { downloadTablePDF } from "@/components/common/pdfExport";
import { DataTableSkeleton } from "@/components/common/DataTable/DataTableSkeleton";
import {
  DataTable,
  DataTablePageSize,
  DataTablePagination,
  type DataTableColumn,
} from "@/components/common/DataTable";
import { FormDialog } from "@/components/common/FormDialog";
import { KpiCard } from "@/components/common/KpiCard/KpiCard";
import { PageContainer } from "@/components/common/PageContainer";
import { RefreshButton } from "@/components/common/RefreshButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  deleteInvestigation,
  getInvestigations,
  getInvestigationById,
  updateInvestigation,
} from "./investigation.service";

import type { Investigation, InvestigationStatus } from "./investigation.types";

import { InvestigationForm } from "./InvestigationForm";

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

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

    if (response?.data?.errors?.length) {
      return response.data.errors.join(", ");
    }

    if (response?.data?.message) {
      return response.data.message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
};

const formatDate = (dateValue?: string | null): string => {
  if (!dateValue) return "-";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};
const getModalityDetails = (value: Investigation["modalityId"]) => {
  if (!value || typeof value === "string") {
    return {
      name: "-",
      code: "-",
    };
  }

  return {
    name: value.modalityName || "-",
    code: value.modalityCode || "-",
  };
};
// --------------------------------------------------
// STATUS BADGE
// --------------------------------------------------

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

// --------------------------------------------------
// DETAILS ITEM
// --------------------------------------------------

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

// --------------------------------------------------
// MAIN PAGE
// --------------------------------------------------

export default function InvestigationPage() {
  // --------------------------------------------------
  // DATA
  // --------------------------------------------------

  const [investigations, setInvestigations] = useState<Investigation[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  // --------------------------------------------------
  // SERVER-SIDE PAGINATION
  // --------------------------------------------------

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // --------------------------------------------------
  // FILTERS
  // --------------------------------------------------

  const [filterOpen, setFilterOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvestigationStatus | "ALL">("ALL");

  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sampleTypeFilter, setSampleTypeFilter] = useState("ALL");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

  const [formOpen, setFormOpen] = useState(false);

  const [editingInvestigation, setEditingInvestigation] = useState<Investigation | null>(null);

  // --------------------------------------------------
  // SELECTION
  // --------------------------------------------------

  const [selectedInvestigationIds, setSelectedInvestigationIds] = useState<string[]>([]);
  const [listStats, setListStats] = useState<{
    totalInvestigations: number;
    activeInvestigations: number;
    inactiveInvestigations: number;
    totalSampleTypes: number;
  } | null>(null);
  // --------------------------------------------------
  // VIEW DETAILS
  // --------------------------------------------------

  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // --------------------------------------------------
  // STATUS
  // --------------------------------------------------

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const [statusInvestigation, setStatusInvestigation] = useState<Investigation | null>(null);

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Investigation | null>(null);

  const [deleting, setDeleting] = useState(false);

  const [deleteMode, setDeleteMode] = useState<"SINGLE" | "BULK">("SINGLE");

  const formRef = useRef<HTMLDivElement | null>(null);

  // Used to ignore responses from older requests if filters change quickly.
  const requestIdRef = useRef(0);

  // --------------------------------------------------
  // SERVER-SIDE DATA FETCHING
  // --------------------------------------------------

  const loadInvestigations = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    // Always send a valid 1-based page number.
    const safePage = Math.max(1, currentPage);
    const safeLimit = Math.max(1, Math.min(100, pageSize));

    setLoading(true);
    setLoadError("");

    try {
      const result = await getInvestigations({
        page: safePage,
        limit: safeLimit,
        search: debouncedSearch,
        status: statusFilter === "ALL" ? undefined : statusFilter,
        category: categoryFilter === "ALL" ? undefined : categoryFilter,
        type: typeFilter === "ALL" ? undefined : typeFilter,
        sampleType: sampleTypeFilter === "ALL" ? undefined : sampleTypeFilter,
        fromDate: fromDate || undefined,
        toDate: toDate || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Ignore an older response if a newer request has started.
      if (requestId !== requestIdRef.current) return;

      const records = result.investigations ?? [];
      const pagination = result.pagination;

      setInvestigations(records);
      setTotalRecords(pagination.totalRecords ?? 0);
      setTotalPages(pagination.totalPages ?? 0);
      setListStats(result.stats ?? null);

      setSelectedInvestigationIds([]);

      // If the current page no longer exists, go back to the last
      // available page. The next effect will fetch that page.
      if (pagination.totalPages > 0 && safePage > pagination.totalPages) {
        setCurrentPage(pagination.totalPages);
      }

      // If no records remain, keep the page number at 1.
      if (pagination.totalPages === 0 && currentPage !== 1) {
        setCurrentPage(1);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      const message = getApiErrorMessage(error);

      setLoadError(message);
      setInvestigations([]);
      setTotalRecords(0);
      setTotalPages(0);
      setListStats(null);
      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
        setHasLoaded(true);
      }
    }
  }, [
    currentPage,
    pageSize,
    debouncedSearch,
    statusFilter,
    categoryFilter,
    typeFilter,
    sampleTypeFilter,
    fromDate,
    toDate,
  ]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);
  // Automatically fetch whenever pagination or filters change.
  useEffect(() => {
    void loadInvestigations();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadInvestigations]);

  // --------------------------------------------------
  // FILTER OPTIONS
  // --------------------------------------------------

  // These options are derived from the currently loaded page.
  // A separate filter-options API can provide all available values.
  const categories = useMemo(() => {
    return Array.from(
      new Set(
        investigations
          .map((item) => item.category)
          .filter((value): value is string => Boolean(value && value.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [investigations]);

  const types = useMemo(() => {
    return Array.from(
      new Set(
        investigations
          .map((item) => item.type)
          .filter((value): value is string => Boolean(value && value.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [investigations]);

  const sampleTypes = useMemo(() => {
    return Array.from(
      new Set(
        investigations
          .map((item) => item.sampleType)
          .filter((value): value is string => Boolean(value && value.trim())),
      ),
    ).sort((a, b) => a.localeCompare(b));
  }, [investigations]);

  // Server already returns the current page.
  const paginatedInvestigations = investigations;

  // --------------------------------------------------
  // KPI COUNTS
  // --------------------------------------------------
  const totalInvestigations = totalRecords;

  const activeInvestigations = listStats?.activeInvestigations ?? 0;
  const inactiveInvestigations = listStats?.inactiveInvestigations ?? 0;
  const totalSampleTypes = listStats?.totalSampleTypes ?? 0;

  // --------------------------------------------------
  // FILTER STATUS
  // --------------------------------------------------

  const hasActiveFilters =
    statusFilter !== "ALL" ||
    categoryFilter !== "ALL" ||
    typeFilter !== "ALL" ||
    sampleTypeFilter !== "ALL" ||
    Boolean(fromDate) ||
    Boolean(toDate);

  const resetToFirstPage = () => {
    setCurrentPage(1);
  };

  const closeAndClearFilters = () => {
    setStatusFilter("ALL");
    setCategoryFilter("ALL");
    setTypeFilter("ALL");
    setSampleTypeFilter("ALL");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
    setFilterOpen(false);
  };

  const clearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setCurrentPage(1);
  };

  // --------------------------------------------------
  // SELECTION
  // --------------------------------------------------

  const allCurrentPageSelected =
    paginatedInvestigations.length > 0 &&
    paginatedInvestigations.every((item) => selectedInvestigationIds.includes(item._id));

  const handleSelectAll = (checked: boolean) => {
    const currentIds = paginatedInvestigations.map((item) => item._id);

    if (checked) {
      setSelectedInvestigationIds((previous) => Array.from(new Set([...previous, ...currentIds])));
    } else {
      const currentIdSet = new Set(currentIds);

      setSelectedInvestigationIds((previous) => previous.filter((id) => !currentIdSet.has(id)));
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

  // --------------------------------------------------
  // VIEW DETAILS
  // --------------------------------------------------

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

  // --------------------------------------------------
  // FORM
  // --------------------------------------------------

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

    setCurrentPage(1);
    await loadInvestigations();
  };

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditingInvestigation(null);
  };

  // --------------------------------------------------
  // STATUS CHANGE
  // --------------------------------------------------

  const openStatusDialog = (investigation: Investigation) => {
    setStatusInvestigation(investigation);
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!statusInvestigation) return;

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

  // --------------------------------------------------
  // DELETE
  // --------------------------------------------------

  const openDeleteDialog = (investigation: Investigation) => {
    setDeleteTarget(investigation);
    setDeleteMode("SINGLE");
    setDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    if (selectedInvestigationIds.length === 0) return;

    setDeleteTarget(null);
    setDeleteMode("BULK");
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

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
    if (selectedInvestigationIds.length === 0) return;

    setDeleting(true);

    try {
      await Promise.all(selectedInvestigationIds.map((id) => deleteInvestigation(id)));

      toast.success(
        `${selectedInvestigationIds.length} investigation ${
          selectedInvestigationIds.length === 1 ? "record" : "records"
        } deleted successfully.`,
      );

      setSelectedInvestigationIds([]);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);

      await loadInvestigations();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------------
  // EXCEL EXPORT
  // --------------------------------------------------
  const exportExcel = () => {
    if (investigations.length === 0) {
      toast.error("There are no investigation records on this page to export.");
      return;
    }

    const rows = investigations.map((item, index) => {
      const modality = getModalityDetails(item.modalityId);

      return {
        "Sr. No.": (currentPage - 1) * pageSize + index + 1,
        "Investigation Name": item.investigationName,
        "Investigation Code": item.investigationCode,
        "LOINC Code": item.loincCode ?? "-",
        Category: item.category ?? "-",
        Type: item.type ?? "-",
        "Sample Type": item.sampleType ?? "-",
        Modality: modality.name,
        "Modality Code": modality.code,
        "Turnaround Time": item.turnaroundTime != null ? `${item.turnaroundTime} minutes` : "-",
        Status: item.status,
        "Created Date": formatDate(item.createdAt),
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Investigations");

    worksheet["!cols"] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 20 },
      { wch: 16 },
      { wch: 20 },
      { wch: 20 },
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 22 },
      { wch: 15 },
      { wch: 18 },
    ];

    XLSX.writeFile(workbook, "investigation-report.xlsx");

    toast.success("Current page exported to Excel successfully.");
  };

  // --------------------------------------------------
  // PDF EXPORT
  // --------------------------------------------------

  const exportPDF = () => {
    if (investigations.length === 0) {
      toast.error("No investigation records available to download.");
      return;
    }

    try {
      downloadTablePDF<Investigation>({
        title: "Investigation Management Report",
        fileName: "investigation-report",
        orientation: "landscape",

        columns: [
          {
            header: "Sr. No.",
            value: (item) => {
              const index = investigations.findIndex((record) => record._id === item._id);

              return (currentPage - 1) * pageSize + index + 1;
            },
          },
          {
            header: "Investigation Name",
            value: (item) => item.investigationName,
          },
          {
            header: "Investigation Code",
            value: (item) => item.investigationCode,
          },
          {
            header: "LOINC Code",
            value: (item) => item.loincCode,
          },
          {
            header: "Category",
            value: (item) => item.category,
          },
          {
            header: "Type",
            value: (item) => item.type,
          },
          {
            header: "Sample Type",
            value: (item) => item.sampleType,
          },
          {
            header: "Modality",
            value: (item) => getModalityDetails(item.modalityId).name,
          },
          {
            header: "Modality Code",
            value: (item) => getModalityDetails(item.modalityId).code,
          },
          {
            header: "Turnaround Time",
            value: (item) => (item.turnaroundTime != null ? `${item.turnaroundTime} minutes` : "-"),
          },
          {
            header: "Status",
            value: (item) => item.status,
          },
          {
            header: "Created Date",
            value: (item) => formatDate(item.createdAt),
          },
        ],

        rows: investigations,
      });

      toast.success("Current page PDF downloaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate investigation PDF.");
    }
  };

  const printReport = () => {
    window.print();
  };

  // --------------------------------------------------
  // TABLE COLUMNS
  // --------------------------------------------------

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
      header: "S.No.",
      render: (investigation) => {
        const index = paginatedInvestigations.findIndex((item) => item._id === investigation._id);

        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      key: "investigationName",
      header: "Investigation Name",
      render: (investigation) => (
        <div className="min-w-[180px]">
          <p className="font-medium">{investigation.investigationName}</p>
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
      key: "loincCode",
      header: "LOINC Code",
      render: (investigation) => investigation.loincCode || "-",
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
      key: "sampleType",
      header: "Sample Type",
      render: (investigation) => investigation.sampleType || "-",
    },
    {
      key: "modality",
      header: "Modality",
      render: (investigation) => {
        const modality = getModalityDetails(investigation.modalityId);

        return (
          <div className="min-w-[130px]">
            <p className="font-medium">{modality.name}</p>
            {modality.code !== "-" && (
              <p className="text-xs text-muted-foreground">{modality.code}</p>
            )}
          </div>
        );
      },
    },
    {
      key: "turnaroundTime",
      header: "Turnaround Time",
      render: (investigation) =>
        investigation.turnaroundTime != null ? `${investigation.turnaroundTime} minutes` : "-",
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
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                aria-label={`Actions for ${investigation.investigationName}`}
                className="h-8 gap-1 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => void handleView(investigation._id)}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => handleEdit(investigation)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => openDeleteDialog(investigation)}
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

  // --------------------------------------------------
  // RENDER
  // --------------------------------------------------

  return (
    <PageContainer>
      {loading && !hasLoaded ? (
        <DataTableSkeleton rows={8} columns={13} statCards={4} showHeader showToolbar />
      ) : (
        <div className="print-area space-y-6">
          {/* PAGE HEADER */}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <FlaskConical className="h-5 w-5" />
              </div>

              <div>
                <h1 className="border-zinc-200 bg-zinc-50 text-2xl font-semibold tracking-tight">
                  Investigation Management
                </h1>

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
              description="All matching investigation records"
              icon={FileText}
              className="border-sky-200 bg-sky-50/60"
              iconClassName="bg-sky-100 text-sky-600"
            />

            <KpiCard
              title="Active"
              value={activeInvestigations}
              description="On current page"
              icon={Activity}
              className="border-emerald-200 bg-emerald-50/60"
              iconClassName="bg-emerald-100 text-emerald-600"
            />

            <KpiCard
              title="Inactive"
              value={inactiveInvestigations}
              description="On current page"
              icon={X}
              className="border-rose-200 bg-rose-50/60"
              iconClassName="bg-rose-100 text-rose-600"
            />

            <KpiCard
              title="Records with Sample Type"
              value={totalSampleTypes}
              description="On current page"
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

                <p className="text-sm text-muted-foreground">Total Records: {totalRecords}</p>
              </div>

              <div className="print-hide flex flex-wrap items-center gap-2">
                {selectedInvestigationIds.length > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={openBulkDeleteDialog}
                    disabled={deleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedInvestigationIds.length})
                  </Button>
                )}

                <Button type="button" variant="outline" size="sm" onClick={exportExcel}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={exportPDF}
                  disabled={loading || investigations.length === 0}
                >
                  <FileDown className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>

                <Button type="button" variant="outline" size="sm" onClick={printReport}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </Button>

                <div className="flex items-center gap-2">
                  <RefreshButton onRefresh={() => void loadInvestigations()} loading={loading} />

                  <Button type="button" size="sm" onClick={handleAdd}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add New Investigation
                  </Button>
                </div>
              </div>
            </div>

            {/* FILTER BAR */}

            <div className="print-hide border-b border-slate-200 px-5 py-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
                <SearchInput
                  value={search}
                  onChange={(value) => {
                    setSearch(value);
                    setCurrentPage(1);
                  }}
                  onClear={clearSearch}
                  placeholder="Search by name, code..."
                  containerClassName="lg:max-w-md"
                />

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
                        <Select
                          value={statusFilter}
                          onValueChange={(value) => {
                            setStatusFilter(value as InvestigationStatus | "ALL");
                            resetToFirstPage();
                          }}
                        >
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
                            onClick={() => {
                              setStatusFilter("ALL");
                              resetToFirstPage();
                            }}
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
                        <Select
                          value={categoryFilter}
                          onValueChange={(value) => {
                            setCategoryFilter(value);
                            resetToFirstPage();
                          }}
                        >
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
                            onClick={() => {
                              setCategoryFilter("ALL");
                              resetToFirstPage();
                            }}
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
                        <Select
                          value={typeFilter}
                          onValueChange={(value) => {
                            setTypeFilter(value);
                            resetToFirstPage();
                          }}
                        >
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
                            onClick={() => {
                              setTypeFilter("ALL");
                              resetToFirstPage();
                            }}
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
                        <Select
                          value={sampleTypeFilter}
                          onValueChange={(value) => {
                            setSampleTypeFilter(value);
                            resetToFirstPage();
                          }}
                        >
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
                            onClick={() => {
                              setSampleTypeFilter("ALL");
                              resetToFirstPage();
                            }}
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
                          max={toDate || undefined}
                          onChange={(event) => {
                            setFromDate(event.target.value);
                            resetToFirstPage();
                          }}
                          className="flex-1"
                        />

                        {fromDate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Clear from date"
                            aria-label="Clear from date"
                            onClick={() => {
                              setFromDate("");
                              resetToFirstPage();
                            }}
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
                          min={fromDate || undefined}
                          onChange={(event) => {
                            setToDate(event.target.value);
                            resetToFirstPage();
                          }}
                          className="flex-1"
                        />

                        {toDate && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            title="Clear to date"
                            aria-label="Clear to date"
                            onClick={() => {
                              setToDate("");
                              resetToFirstPage();
                            }}
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
              {/* SELECT ALL */}

              {!loading && paginatedInvestigations.length > 0 && (
                <div className="print-hide flex items-center gap-2 border-t border-slate-200 px-5 py-3">
                  <Checkbox
                    checked={allCurrentPageSelected}
                    onCheckedChange={(checked) => handleSelectAll(checked === true)}
                    aria-label="Select all investigations on this page"
                  />

                  <span className="text-sm text-muted-foreground">Select all on this page</span>
                </div>
              )}

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

            {/* PAGINATION */}

            {!loading && totalRecords > 0 && (
              <div className="print-hide flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
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
                  onPageChange={(page) => {
                    // Protect the backend from page=0.
                    const safePage = Math.max(1, Math.min(page, totalPages || 1));

                    setCurrentPage(safePage);
                  }}
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

          <FormDialog
            open={formOpen}
            onOpenChange={(open) => {
              if (!open) handleFormCancel();
            }}
            title={editingInvestigation ? "Edit Investigation" : "Add New Investigation"}
            description={
              editingInvestigation
                ? "Update the investigation master record."
                : "Enter the investigation details to create a new master record."
            }
          >
            <InvestigationForm
              investigation={editingInvestigation}
              onSuccess={() => void handleFormSuccess()}
              onCancel={handleFormCancel}
            />
          </FormDialog>

          {/* VIEW DETAILS */}

          <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Investigation Details</DialogTitle>

                <DialogDescription>
                  View complete information for this investigation.
                </DialogDescription>
              </DialogHeader>

              {detailsLoading ? (
                <div className="flex min-h-[220px] items-center justify-center">
                  <div className="text-sm text-muted-foreground">
                    Loading investigation details...
                  </div>
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
                      label="Modality"
                      value={getModalityDetails(selectedInvestigation.modalityId).name}
                    />

                    <DetailItem
                      label="Modality Code"
                      value={getModalityDetails(selectedInvestigation.modalityId).code}
                    />

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

                <AlertDialogAction
                  onClick={() => void handleStatusChange()}
                  disabled={statusChanging}
                >
                  {statusInvestigation?.status === "ACTIVE" ? "Deactivate" : "Activate"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* DELETE CONFIRMATION */}

          <ConfirmDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            title={
              deleteMode === "BULK"
                ? `Delete ${selectedInvestigationIds.length} Investigations?`
                : "Delete Investigation?"
            }
            description={
              deleteMode === "BULK"
                ? `Are you sure you want to delete ${selectedInvestigationIds.length} selected investigation ${
                    selectedInvestigationIds.length === 1 ? "record" : "records"
                  }? This will perform a soft delete and remove them from the active investigation list.`
                : `Are you sure you want to delete ${
                    deleteTarget?.investigationName ?? "this investigation"
                  }? This will perform a soft delete and remove the record from the active investigation list.`
            }
            confirmText={deleting ? "Deleting..." : "Delete"}
            cancelText="Cancel"
            onConfirm={() => (deleteMode === "BULK" ? handleBulkDelete() : handleDelete())}
            destructive
            loading={deleting}
          />
        </div>
      )}
    </PageContainer>
  );
}
