import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  Pencil,
  Trash2,
  ChevronDown,
  Download,
  Printer,
  Eye,
  MapPinned,FileDown,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

import { DataTableSkeleton } from "@/components/common/DataTable/DataTableSkeleton";
import { PageContainer } from "@/components/common/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, DataTablePageSize, DataTablePagination } from "@/components/common/DataTable";
import type { DataTableColumn } from "@/components/common/DataTable";
import { KpiCard } from "@/components/common/KpiCard/KpiCard";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RefreshButton } from "@/components/common/RefreshButton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import StateForm from "./StateForm";
import DistrictForm from "./DistrictForm";
import TalukaForm from "./TalukaForm";

import {
  getStates,
  getDistricts,
  getTalukas,
  getAllStates,
  getAllDistricts,
  updateState,
  updateDistrict,
  updateTaluka,
  deleteState,
  deleteDistrict,
  deleteTaluka,
} from "./location.service";

import type { State, District, Taluka } from "./location.types";

type LocationTab = "states" | "districts" | "talukas";
type StatusFilter = "all" | "active" | "inactive";
type LocationRecord = State | District | Taluka;

function getRelationId(value: string | State | District | null | undefined): string {
  return typeof value === "string" ? value : (value?._id ?? "");
}

function getRelationName(
  value: string | State | District | null | undefined,
  records: Array<State | District>,
): string {
  if (typeof value !== "string") {
    return value?.name ?? "—";
  }

  return records.find((record) => record._id === value)?.name ?? "—";
}

function formatDate(dateValue?: string | Date | null): string {
  if (!dateValue) return "—";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ isActive }: { isActive: boolean }) {
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
      <p className="break-words text-sm font-medium">
        {value === null || value === undefined || value === "" ? "—" : value}
      </p>
    </div>
  );
}

function getErrorMessage(error: unknown, fallback: string): string {
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

    if (response?.data?.message) return response.data.message;
    if (response?.data?.errors?.length) {
      return response.data.errors.join(", ");
    }
  }

  if (error instanceof Error) return error.message;

  return fallback;
}

export default function LocationPage() {
  const [activeTab, setActiveTab] = useState<LocationTab>("states");

  // Current page records returned by the backend.
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);

  // Complete lists used by relationship dropdowns and table labels.
  const [stateOptions, setStateOptions] = useState<State[]>([]);
  const [districtOptions, setDistrictOptions] = useState<District[]>([]);

  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(false);
  const [referenceLoading, setReferenceLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);
  const requestId = useRef(0);

  const [stateFormOpen, setStateFormOpen] = useState(false);
  const [districtFormOpen, setDistrictFormOpen] = useState(false);
  const [talukaFormOpen, setTalukaFormOpen] = useState(false);

  const [editingState, setEditingState] = useState<State | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [editingTaluka, setEditingTaluka] = useState<Taluka | null>(null);

  const [viewRecord, setViewRecord] = useState<LocationRecord | null>(null);
  const [viewRecordType, setViewRecordType] = useState<LocationTab | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    name: string;
    type: LocationTab;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  const [statusItem, setStatusItem] = useState<{
    id: string;
    name: string;
    type: LocationTab;
    isActive: boolean;
  } | null>(null);

  // Load reference options in requests of at most 100 records.
  const loadReferenceData = useCallback(async () => {
    setReferenceLoading(true);

    try {
      const [allStates, allDistricts] = await Promise.all([getAllStates(), getAllDistricts()]);

      setStateOptions(allStates);
      setDistrictOptions(allDistricts);
    } catch (error) {
      const message = getErrorMessage(error, "Unable to load State and District options.");
      setLoadError(message);
      toast.error(message);
    } finally {
      setReferenceLoading(false);
    }
  }, []);

  // Debounce search to avoid a request on every keystroke.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 300);

    return () => window.clearTimeout(timer);
  }, [search]);

  // Fetch the selected table page from the backend.
  const loadActiveData = useCallback(async () => {
    const currentRequestId = ++requestId.current;

    setLoading(true);
    setLoadError("");

    const commonParams = {
      page,
      limit: pageSize,
      sortBy: "name" as const,
      sortOrder: "asc" as const,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(statusFilter !== "all" ? { isActive: statusFilter === "active" } : {}),
    };

    try {
      if (activeTab === "states") {
        const result = await getStates(commonParams);

        if (currentRequestId !== requestId.current) return;

        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }

        setStates(result.states);
        setTotalCount(result.total);
        setTotalPages(Math.max(1, result.totalPages));
      } else if (activeTab === "districts") {
        const result = await getDistricts({
          ...commonParams,
          ...(stateFilter ? { state: stateFilter } : {}),
        });

        if (currentRequestId !== requestId.current) return;

        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }

        setDistricts(result.districts);
        setTotalCount(result.total);
        setTotalPages(Math.max(1, result.totalPages));
      } else {
        const result = await getTalukas({
          ...commonParams,
          ...(districtFilter ? { district: districtFilter } : {}),
        });

        if (currentRequestId !== requestId.current) return;

        if (result.totalPages > 0 && page > result.totalPages) {
          setPage(result.totalPages);
          return;
        }

        setTalukas(result.talukas);
        setTotalCount(result.total);
        setTotalPages(Math.max(1, result.totalPages));
      }
    } catch (error) {
      if (currentRequestId !== requestId.current) return;

      const message = getErrorMessage(error, `Unable to load ${activeTab}.`);

      setLoadError(message);
      toast.error(message);
    } finally {
      if (currentRequestId === requestId.current) {
        setLoading(false);
      }
    }
  }, [activeTab, page, pageSize, debouncedSearch, statusFilter, stateFilter, districtFilter]);

  useEffect(() => {
    void loadReferenceData();
  }, [loadReferenceData]);

  useEffect(() => {
    void loadActiveData();

    return () => {
      requestId.current += 1;
    };
  }, [loadActiveData]);

  function handleTabChange(value: string) {
    setActiveTab(value as LocationTab);
    setSelectedLocationIds([]);
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("all");
    setStateFilter("");
    setDistrictFilter("");
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function handleStatusFilterChange(value: string) {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }

  function handlePageSizeChange(value: number) {
    setPageSize(value);
    setPage(1);
  }

  async function refreshData() {
    await Promise.all([loadReferenceData(), loadActiveData()]);
  }

  const activeCount = useMemo(() => {
    if (activeTab === "states") {
      return stateOptions.filter((item) => item.isActive).length;
    }

    if (activeTab === "districts") {
      return districtOptions.filter((item) => item.isActive).length;
    }

    return null;
  }, [activeTab, stateOptions, districtOptions]);

  const inactiveCount = useMemo(() => {
    if (activeTab === "states") {
      return stateOptions.filter((item) => !item.isActive).length;
    }

    if (activeTab === "districts") {
      return districtOptions.filter((item) => !item.isActive).length;
    }

    return null;
  }, [activeTab, stateOptions, districtOptions]);

  const currentRecords: LocationRecord[] =
    activeTab === "states" ? states : activeTab === "districts" ? districts : talukas;
  const allCurrentPageSelected =
    currentRecords.length > 0 &&
    currentRecords.every((record) => selectedLocationIds.includes(record._id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const currentIds = currentRecords.map((record) => record._id);

      setSelectedLocationIds((previous) => Array.from(new Set([...previous, ...currentIds])));
    } else {
      const currentIds = new Set(currentRecords.map((record) => record._id));

      setSelectedLocationIds((previous) => previous.filter((id) => !currentIds.has(id)));
    }
  };

  const handleSelectRow = (locationId: string, checked: boolean) => {
    if (checked) {
      setSelectedLocationIds((previous) =>
        previous.includes(locationId) ? previous : [...previous, locationId],
      );
    } else {
      setSelectedLocationIds((previous) => previous.filter((id) => id !== locationId));
    }
  };
  function openAddForm() {
    if (activeTab === "states") {
      setEditingState(null);
      setStateFormOpen(true);
    } else if (activeTab === "districts") {
      setEditingDistrict(null);
      setDistrictFormOpen(true);
    } else {
      setEditingTaluka(null);
      setTalukaFormOpen(true);
    }
  }

  function openView(record: LocationRecord, type: LocationTab) {
    setViewRecord(record);
    setViewRecordType(type);
    setViewDialogOpen(true);
  }

  function openEdit(record: LocationRecord, type: LocationTab) {
    setViewDialogOpen(false);

    if (type === "states") {
      setEditingState(record as State);
      setStateFormOpen(true);
    } else if (type === "districts") {
      setEditingDistrict(record as District);
      setDistrictFormOpen(true);
    } else {
      setEditingTaluka(record as Taluka);
      setTalukaFormOpen(true);
    }
  }

  function requestDelete(type: LocationTab, id: string, name: string) {
    setDeletingItem({ type, id, name });
    setDeleteDialogOpen(true);
  }

  async function confirmDelete() {
    if (!deletingItem) return;

    setDeleting(true);

    try {
      if (deletingItem.type === "states") {
        await deleteState(deletingItem.id);
      } else if (deletingItem.type === "districts") {
        await deleteDistrict(deletingItem.id);
      } else {
        await deleteTaluka(deletingItem.id);
      }

      toast.success(`${deletingItem.name} deleted successfully.`);
      setDeleteDialogOpen(false);
      setDeletingItem(null);

      // Return to the first page so deleted records cannot leave an empty page.
      setPage(1);
      await loadReferenceData();
      await loadActiveData();
    } catch (error) {
      toast.error(getErrorMessage(error, `Unable to delete ${deletingItem.name}.`));
    } finally {
      setDeleting(false);
    }
  }
  function openBulkDeleteDialog() {
    if (selectedLocationIds.length === 0) return;
    setBulkDeleteDialogOpen(true);
  }

  async function confirmBulkDelete() {
    if (selectedLocationIds.length === 0) return;

    setBulkDeleting(true);

    try {
      const deleteFunction =
        activeTab === "states"
          ? deleteState
          : activeTab === "districts"
            ? deleteDistrict
            : deleteTaluka;

      const results = await Promise.allSettled(selectedLocationIds.map((id) => deleteFunction(id)));

      const successfulIds = selectedLocationIds.filter(
        (_, index) => results[index].status === "fulfilled",
      );

      const failedCount = results.length - successfulIds.length;

      if (successfulIds.length > 0) {
        toast.success(`${successfulIds.length} ${activeTab} deleted successfully.`);
      }

      if (failedCount > 0) {
        toast.error(`${failedCount} ${activeTab} could not be deleted.`);
      }

      setSelectedLocationIds((previous) => previous.filter((id) => !successfulIds.includes(id)));

      setBulkDeleteDialogOpen(false);
      setPage(1);

      await loadReferenceData();
      await loadActiveData();
    } catch (error) {
      toast.error(getErrorMessage(error, `Unable to delete selected ${activeTab}.`));
    } finally {
      setBulkDeleting(false);
    }
  }
  function requestStatusChange(type: LocationTab, id: string, name: string, isActive: boolean) {
    setStatusItem({ type, id, name, isActive });
    setStatusDialogOpen(true);
  }

  async function confirmStatusChange() {
    if (!statusItem) return;

    setStatusChanging(true);

    try {
      const newIsActive = !statusItem.isActive;

      if (statusItem.type === "states") {
        await updateState(statusItem.id, { isActive: newIsActive });
      } else if (statusItem.type === "districts") {
        await updateDistrict(statusItem.id, { isActive: newIsActive });
      } else {
        await updateTaluka(statusItem.id, { isActive: newIsActive });
      }

      toast.success(
        `${statusItem.name} ${newIsActive ? "activated" : "deactivated"} successfully.`,
      );

      setStatusDialogOpen(false);
      setStatusItem(null);

      await loadReferenceData();
      await loadActiveData();
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to update the record status."));
    } finally {
      setStatusChanging(false);
    }
  }

  // Export all records matching the current filters, not just the visible page.
  async function exportExcel() {
    try {
      const rows: LocationRecord[] = [];
      const filters = {
        limit: 100,
        sortBy: "name" as const,
        sortOrder: "asc" as const,
        ...(debouncedSearch ? { search: debouncedSearch } : {}),
        ...(statusFilter !== "all" ? { isActive: statusFilter === "active" } : {}),
      };

      if (activeTab === "states") {
        const first = await getStates({ ...filters, page: 1 });
        rows.push(...first.states);

        for (let p = 2; p <= first.totalPages; p += 1) {
          const result = await getStates({ ...filters, page: p });
          rows.push(...result.states);
        }
      } else if (activeTab === "districts") {
        const districtParams = {
          ...filters,
          ...(stateFilter ? { state: stateFilter } : {}),
        };

        const first = await getDistricts({
          ...districtParams,
          page: 1,
        });
        rows.push(...first.districts);

        for (let p = 2; p <= first.totalPages; p += 1) {
          const result = await getDistricts({
            ...districtParams,
            page: p,
          });
          rows.push(...result.districts);
        }
      } else {
        const talukaParams = {
          ...filters,
          ...(districtFilter ? { district: districtFilter } : {}),
        };

        const first = await getTalukas({ ...talukaParams, page: 1 });
        rows.push(...first.talukas);

        for (let p = 2; p <= first.totalPages; p += 1) {
          const result = await getTalukas({ ...talukaParams, page: p });
          rows.push(...result.talukas);
        }
      }

      if (rows.length === 0) {
        toast.error("There are no location records to export.");
        return;
      }

      const exportRows = rows.map((record) => {
        const base = {
          Name: record.name,
          Status: record.isActive ? "Active" : "Inactive",
          "Created Date": formatDate(record.createdAt),
        };

        if (activeTab === "states") {
          const state = record as State;

          return {
            ...base,
            Code: state.code,
          };
        }

        if (activeTab === "districts") {
          const district = record as District;

          return {
            ...base,
            State: getRelationName(district.state, stateOptions),
          };
        }

        const taluka = record as Taluka;

        return {
          ...base,
          District: getRelationName(taluka.district, districtOptions),
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        activeTab.charAt(0).toUpperCase() + activeTab.slice(1),
      );

      XLSX.writeFile(workbook, `${activeTab}-report.xlsx`);
      toast.success("Excel report exported successfully.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Unable to export the Excel report."));
    }
  }

  function printReport() {
    window.print();
  }

  const stateColumns: DataTableColumn<State>[] = [
    {
      key: "select",
      header: "",
      render: (row) => (
        <Checkbox
          checked={selectedLocationIds.includes(row._id)}
          onCheckedChange={(checked) => handleSelectRow(row._id, checked === true)}
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "serialNumber",
      header: "S.No.",
      render: (row) =>
        (page - 1) * pageSize + currentRecords.findIndex((record) => record._id === row._id) + 1,
    },
    {
      key: "name",
      header: "State Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "code",
      header: "Code",
      render: (row) => row.code,
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <button
          type="button"
          onClick={() => requestStatusChange("states", row._id, row.name, row.isActive)}
          className="cursor-pointer"
          title="Change status"
        >
          <StatusBadge isActive={row.isActive} />
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (row) => <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Actions for ${row.name}`}
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => openView(row, "states")}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(row, "states")}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => requestDelete("states", row._id, row.name)}
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

  const districtColumns: DataTableColumn<District>[] = [
    {
      key: "select",
      header: "",
      render: (row) => (
        <Checkbox
          checked={selectedLocationIds.includes(row._id)}
          onCheckedChange={(checked) => handleSelectRow(row._id, checked === true)}
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "serialNumber",
      header: "S.No.",
      render: (row) =>
        (page - 1) * pageSize + currentRecords.findIndex((record) => record._id === row._id) + 1,
    },
    {
      key: "name",
      header: "District Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "state",
      header: "State",
      render: (row) => getRelationName(row.state, stateOptions),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <button
          type="button"
          onClick={() => requestStatusChange("districts", row._id, row.name, row.isActive)}
          className="cursor-pointer"
          title="Change status"
        >
          <StatusBadge isActive={row.isActive} />
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (row) => <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Actions for ${row.name}`}
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => openView(row, "districts")}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(row, "districts")}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => requestDelete("districts", row._id, row.name)}
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

  const talukaColumns: DataTableColumn<Taluka>[] = [
    {
      key: "select",
      header: "",
      render: (row) => (
        <Checkbox
          checked={selectedLocationIds.includes(row._id)}
          onCheckedChange={(checked) => handleSelectRow(row._id, checked === true)}
          aria-label={`Select ${row.name}`}
        />
      ),
    },
    {
      key: "serialNumber",
      header: "S.No.",
      render: (row) =>
        (page - 1) * pageSize + currentRecords.findIndex((record) => record._id === row._id) + 1,
    },
    {
      key: "name",
      header: "Taluka Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "district",
      header: "District",
      render: (row) => getRelationName(row.district, districtOptions),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <button
          type="button"
          onClick={() => requestStatusChange("talukas", row._id, row.name, row.isActive)}
          className="cursor-pointer"
          title="Change status"
        >
          <StatusBadge isActive={row.isActive} />
        </button>
      ),
    },
    {
      key: "createdAt",
      header: "Created Date",
      render: (row) => <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (row) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Actions for ${row.name}`}
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => openView(row, "talukas")}>
                <Eye className="mr-2 h-4 w-4" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(row, "talukas")}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => requestDelete("talukas", row._id, row.name)}
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
  const activeTabLabel =
    activeTab === "states" ? "State" : activeTab === "districts" ? "District" : "Taluka";
  return (
    <PageContainer>
      {loading && currentRecords.length === 0 ? (
        <DataTableSkeleton rows={8} columns={5} statCards={3} showHeader showTabs showToolbar />
      ) : (
        <div className="print-area space-y-6">
          {/* 1. PAGE HEADER WITH ICON */}
          <div className=" flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <MapPinned className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">Location Master</h1>
                <p className="text-sm text-muted-foreground">
                  Manage states, districts, and talukas.
                </p>
              </div>
            </div>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <KpiCard
              title="Matching Records"
              value={totalCount}
              description={`Records matching current ${activeTab} filters`}
              icon={MapPin}
              className="border-sky-200 bg-sky-50/60"
              iconClassName="bg-sky-100 text-sky-600"
            />
            <KpiCard
              title="Active"
              value={activeCount ?? 0}
              description={
                activeTab === "talukas"
                  ? "Overall count not provided by the list API"
                  : `Active ${activeTab} records`
              }
              icon={CheckCircle2}
              className="border-emerald-200 bg-emerald-50/60"
              iconClassName="bg-emerald-100 text-emerald-600"
            />
            <KpiCard
              title="Inactive"
              value={inactiveCount ?? 0}
              description={
                activeTab === "talukas"
                  ? "Overall count not provided by the list API"
                  : `Inactive ${activeTab} records`
              }
              icon={XCircle}
              className="border-rose-200 bg-rose-50/60"
              iconClassName="bg-rose-100 text-rose-600"
            />
          </div>

          {/* LIST SECTION - SAME STRUCTURE AS DIAGNOSIS */}
          <section className="overflow-hidden rounded-xl border border-slate-200 bg-background shadow-sm">
            {/* 2. LIST HEADER AND TOOLBAR BUTTONS */}
            <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
              <div>
                <h2 className="text-lg font-semibold">{activeTabLabel} List</h2>
                <p className="text-sm text-muted-foreground">Total Records: {totalCount}</p>
              </div>

              <div className="print-hide flex flex-wrap items-center gap-2">
                {selectedLocationIds.length > 0 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={openBulkDeleteDialog}
                    disabled={bulkDeleting || deleting}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Selected ({selectedLocationIds.length})
                  </Button>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => void exportExcel()}
                  disabled={loading}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>

                <Button type="button" variant="outline" size="sm" onClick={printReport}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </Button>

                <RefreshButton
                  onRefresh={() => void refreshData()}
                  loading={loading || referenceLoading}
                />

                <Button type="button" size="sm" onClick={openAddForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add New {activeTabLabel}
                </Button>
              </div>
            </div>

            {/* SEARCH AND FILTER BAR */}
            <div className="border-b border-slate-200 px-5 py-4 print:hidden">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <SearchInput
                  value={search}
                  onChange={handleSearchChange}
                  placeholder={`Search ${activeTab}...`}
                  containerClassName="w-full sm:max-w-md"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => handleStatusFilterChange(event.target.value)}
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                  aria-label="Filter by status"
                >
                  <option value="all">All statuses</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                {activeTab === "districts" && (
                  <select
                    value={stateFilter}
                    onChange={(event) => {
                      setStateFilter(event.target.value);
                      setPage(1);
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Filter by State"
                  >
                    <option value="">All states</option>
                    {stateOptions.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                )}

                {activeTab === "talukas" && (
                  <select
                    value={districtFilter}
                    onChange={(event) => {
                      setDistrictFilter(event.target.value);
                      setPage(1);
                    }}
                    className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                    aria-label="Filter by District"
                    disabled={referenceLoading}
                  >
                    <option value="">All districts</option>
                    {districtOptions.map((district) => (
                      <option key={district._id} value={district._id}>
                        {district.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* TABS AND COMMON DATATABLE */}
            <div className=" px-5">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="mt-4 grid h-auto w-full grid-cols-3 rounded-md border border-yellow-200 bg-yellow-50 sm:w-[420px]">
                  <TabsTrigger value="states">States</TabsTrigger>
                  <TabsTrigger value="districts">Districts</TabsTrigger>
                  <TabsTrigger value="talukas">Talukas</TabsTrigger>
                </TabsList>
                {!loading && currentRecords.length > 0 && (
                  <div className="print-hide flex items-center gap-2 border-t border-slate-200 px-5 py-3">
                    <Checkbox
                      checked={allCurrentPageSelected}
                      onCheckedChange={(checked) => handleSelectAll(checked === true)}
                      aria-label={`Select all ${activeTab} on this page`}
                    />

                    <span className="text-sm text-muted-foreground">Select all on this page</span>
                  </div>
                )}
                {loadError && (
                  <div className="my-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
                    <p className="text-sm text-destructive">{loadError}</p>
                    <Button
                      className="mt-2"
                      variant="outline"
                      size="sm"
                      onClick={() => void loadActiveData()}
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {!loadError && (
                  <>
                    <TabsContent value="states" className="mt-4">
                      <DataTable
                        columns={stateColumns}
                        data={states}
                        getRowKey={(row) => row._id}
                        loading={loading}
                        emptyMessage="No states found."
                      />
                    </TabsContent>

                    <TabsContent value="districts" className="mt-4">
                      <DataTable
                        columns={districtColumns}
                        data={districts}
                        getRowKey={(row) => row._id}
                        loading={loading}
                        emptyMessage="No districts found."
                      />
                    </TabsContent>

                    <TabsContent value="talukas" className="mt-4">
                      <DataTable
                        columns={talukaColumns}
                        data={talukas}
                        getRowKey={(row) => row._id}
                        loading={loading}
                        emptyMessage="No talukas found."
                      />
                    </TabsContent>
                  </>
                )}
              </Tabs>
            </div>

            {/* 7. SHARED PAGINATION */}
            {/* SHARED PAGINATION */}
            {!loadError && (
              <div className="print-hide flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
                {/* LEFT: ROWS PER PAGE */}
                <DataTablePageSize value={pageSize} onChange={handlePageSizeChange} />

                {/* RIGHT: COMMON PAGINATION */}
                <DataTablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </section>
        </div>
      )}
      {/* VIEW RECORD DETAILS */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {viewRecordType === "states"
                ? "State Details"
                : viewRecordType === "districts"
                  ? "District Details"
                  : "Taluka Details"}
            </DialogTitle>
            <DialogDescription>View the saved location master record.</DialogDescription>
          </DialogHeader>

          {viewRecord && viewRecordType && (
            <div className="space-y-5">
              <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 bg-muted/20 p-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {activeTabLabel}
                  </p>
                  <h3 className="mt-1 text-xl font-semibold">{viewRecord.name}</h3>
                </div>
                <StatusBadge isActive={viewRecord.isActive} />
              </div>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <DetailItem label="Name" value={viewRecord.name} />

                {viewRecordType === "states" && (
                  <DetailItem label="Code" value={(viewRecord as State).code} />
                )}

                {viewRecordType === "districts" && (
                  <DetailItem
                    label="State"
                    value={getRelationName((viewRecord as District).state, stateOptions)}
                  />
                )}

                {viewRecordType === "talukas" && (
                  <DetailItem
                    label="District"
                    value={getRelationName((viewRecord as Taluka).district, districtOptions)}
                  />
                )}

                <DetailItem label="Status" value={viewRecord.isActive ? "Active" : "Inactive"} />
                <DetailItem label="Created Date" value={formatDate(viewRecord.createdAt)} />
                <DetailItem label="Updated Date" value={formatDate(viewRecord.updatedAt)} />
              </div>
            </div>
          )}

          <DialogFooter>
            {viewRecord && viewRecordType && (
              <Button type="button" onClick={() => openEdit(viewRecord, viewRecordType)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit {activeTabLabel}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD / EDIT FORMS */}
      <StateForm
        open={stateFormOpen}
        onOpenChange={setStateFormOpen}
        editingState={editingState}
        onSaved={() => {
          setPage(1);
          void loadReferenceData();
          void loadActiveData();
        }}
      />

      <DistrictForm
        open={districtFormOpen}
        onOpenChange={setDistrictFormOpen}
        editingDistrict={editingDistrict}
        onSaved={() => {
          setPage(1);
          void loadReferenceData();
          void loadActiveData();
        }}
      />

      <TalukaForm
        open={talukaFormOpen}
        onOpenChange={setTalukaFormOpen}
        editingTaluka={editingTaluka}
        onSaved={() => {
          setPage(1);
          void loadActiveData();
        }}
      />

      {/* DELETE CONFIRMATION */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Location Record"
        description={
          deletingItem
            ? `Are you sure you want to delete "${deletingItem.name}"?`
            : "Are you sure you want to delete this record?"
        }
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
      />
      {/* BULK DELETE CONFIRMATION */}
      <ConfirmDialog
        open={bulkDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!bulkDeleting) {
            setBulkDeleteDialogOpen(open);
          }
        }}
        title={`Delete Selected ${activeTabLabel}s`}
        description={`Are you sure you want to delete ${selectedLocationIds.length} selected ${activeTab} records?`}
        confirmText="Delete Selected"
        cancelText="Cancel"
        destructive
        loading={bulkDeleting}
        onConfirm={confirmBulkDelete}
      />
      {/* ACTIVATE / DEACTIVATE CONFIRMATION */}
      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!statusChanging) {
            setStatusDialogOpen(open);
            if (!open) setStatusItem(null);
          }
        }}
        title={statusItem?.isActive ? "Deactivate Location Record" : "Activate Location Record"}
        description={
          statusItem
            ? `Are you sure you want to ${
                statusItem.isActive ? "deactivate" : "activate"
              } "${statusItem.name}"?`
            : "Are you sure you want to change this record's status?"
        }
        confirmText={statusItem?.isActive ? "Deactivate" : "Activate"}
        cancelText="Cancel"
        destructive={Boolean(statusItem?.isActive)}
        loading={statusChanging}
        onConfirm={confirmStatusChange}
      />
    </PageContainer>
  );
}
