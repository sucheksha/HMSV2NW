import { useCallback, useEffect, useState } from "react";
import { Activity, AlertCircle, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { SearchInput } from "@/components/common/SearchInput";
import { DataTablePageSize } from "@/components/common/DataTable/DataTablePageSize";
import { DataTablePagination } from "@/components/common/DataTable/DataTablePagination";
import { DataTableSkeleton } from "@/components/common/DataTable/DataTableSkeleton";

import { DataTable, type DataTableColumn } from "@/components/common/DataTable/DataTable";

import { getModalities, getImagingInvestigations } from "../imagingScanningService";

import type { Modality, ImagingInvestigation, ModalityStatus } from "../imagingScanning.types";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

type ModalityTab = {
  id: string;
  name: string;
  code: string;
};

export function ImagingInvestigationTable() {
  // --------------------------------------------
  // MODALITY TABS
  // Fetch all modalities independently of the
  // Modality Master table's current page.
  // --------------------------------------------

  const [modalities, setModalities] = useState<Modality[]>([]);
  const [modalitiesLoading, setModalitiesLoading] = useState(true);
  const [selectedModalityId, setSelectedModalityId] = useState("");

  // --------------------------------------------
  // INVESTIGATION DATA
  // --------------------------------------------

  const [investigations, setInvestigations] = useState<ImagingInvestigation[]>([]);

  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --------------------------------------------
  // SERVER-SIDE PAGINATION
  // --------------------------------------------

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --------------------------------------------
  // SEARCH AND FILTER
  // --------------------------------------------

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  // --------------------------------------------
  // LOAD ALL MODALITIES
  // Backend supports maximum 100 per request.
  // Fetch subsequent pages if required.
  // --------------------------------------------

  const loadAllModalities = useCallback(async () => {
    setModalitiesLoading(true);

    try {
      const firstResult = await getModalities({
        page: 1,
        limit: 100,
        sortBy: "modalityName",
        sortOrder: "asc",
      });

      let allModalities = [...firstResult.modalities];

      // Fetch remaining pages if more than 100 exist.
      for (let currentPage = 2; currentPage <= firstResult.totalPages; currentPage++) {
        const result = await getModalities({
          page: currentPage,
          limit: 100,
          sortBy: "modalityName",
          sortOrder: "asc",
        });

        allModalities = [...allModalities, ...result.modalities];
      }

      setModalities(allModalities);

      // Select the first modality by default.
      if (allModalities.length > 0) {
        setSelectedModalityId((current) => {
          if (current && allModalities.some((item) => item._id === current)) {
            return current;
          }

          return allModalities[0]._id;
        });
      } else {
        setSelectedModalityId("");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load modalities.");

      setModalities([]);
    } finally {
      setModalitiesLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAllModalities();
  }, [loadAllModalities]);

  // --------------------------------------------
  // SEARCH DEBOUNCE
  // --------------------------------------------

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => window.clearTimeout(timer);
  }, [search]);

  // --------------------------------------------
  // LOAD INVESTIGATIONS
  // Always filter using the selected modality ID.
  // Pagination is performed by the backend.
  // --------------------------------------------

  const loadInvestigations = useCallback(async () => {
    if (!selectedModalityId) {
      setInvestigations([]);
      setTotalRecords(0);
      setTotalPages(0);
      setHasLoaded(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await getImagingInvestigations({
        page,
        limit,
        modalityId: selectedModalityId,
        search: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : (statusFilter as ModalityStatus),
        sortBy: "investigationName",
        sortOrder: "asc",
      });

      setInvestigations(result.investigations);
      setTotalRecords(result.pagination.totalRecords);
      setTotalPages(result.pagination.totalPages);

      // Correct the current page if records were removed.
      if (result.pagination.totalPages > 0 && page > result.pagination.totalPages) {
        setPage(result.pagination.totalPages);
      }

      setHasLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load imaging investigations.";

      setError(message);
      setInvestigations([]);
      setTotalRecords(0);
      setTotalPages(0);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  }, [selectedModalityId, page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadInvestigations();
  }, [loadInvestigations]);

  // --------------------------------------------
  // MODALITY TAB CHANGE
  // --------------------------------------------

  const handleModalityChange = (modalityId: string) => {
    setSelectedModalityId(modalityId);
    setPage(1);
    setSearch("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
  };

  // --------------------------------------------
  // PAGE SIZE CHANGE
  // --------------------------------------------

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // --------------------------------------------
  // TABLE COLUMNS
  // Read-only: no edit, delete or create actions.
  // --------------------------------------------

  const columns: DataTableColumn<ImagingInvestigation>[] = [
    {
      key: "investigationCode",
      header: "Code",
      headerClassName: "w-[130px] font-semibold",
      cellClassName: "font-medium",
      render: (investigation) => investigation.investigationCode,
    },
    {
      key: "investigationName",
      header: "Investigation Name",
      headerClassName: "min-w-[200px] font-semibold",
      render: (investigation) => (
        <div>
          <p className="font-medium">{investigation.investigationName}</p>

          {investigation.loincCode && (
            <p className="mt-1 text-xs text-muted-foreground">LOINC: {investigation.loincCode}</p>
          )}
        </div>
      ),
    },
    {
      key: "category",
      header: "Category",
      headerClassName: "font-semibold",
      render: (investigation) => investigation.category || "-",
    },
    {
      key: "type",
      header: "Type",
      headerClassName: "font-semibold",
      render: (investigation) => investigation.type || "-",
    },
    {
      key: "sampleType",
      header: "Sample Type",
      headerClassName: "font-semibold",
      render: (investigation) =>
        investigation.sampleType && investigation.sampleType !== "NOT_APPLICABLE"
          ? investigation.sampleType
          : "-",
    },
    {
      key: "turnaroundTime",
      header: "TAT",
      headerClassName: "w-[110px] font-semibold",
      render: (investigation) =>
        investigation.turnaroundTime != null ? `${investigation.turnaroundTime} min` : "-",
    },
    {
      key: "status",
      header: "Status",
      headerClassName: "w-[120px] font-semibold",
      render: (investigation) => (
        <Badge
          variant={investigation.status === "ACTIVE" ? "default" : "secondary"}
          className={
            investigation.status === "ACTIVE"
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              : ""
          }
        >
          {investigation.status === "ACTIVE" ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ];

  const selectedModality = modalities.find((modality) => modality._id === selectedModalityId);

  // --------------------------------------------
  // RENDER
  // --------------------------------------------

  return (
    <div className="space-y-5">
      {/* MODALITY TABS */}
      <div className="space-y-3">
        <div>
          <h3 className="text-base font-semibold">Select Modality</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            Choose a modality to view its linked investigations.
          </p>
        </div>

        {modalitiesLoading ? (
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-9 w-28 animate-pulse rounded-full bg-muted" />
            ))}
          </div>
        ) : modalities.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">No modalities available</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create a modality in Modality Master before viewing imaging investigations.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {modalities.map((modality) => {
              const isSelected = selectedModalityId === modality._id;

              return (
                <Button
                  key={modality._id}
                  type="button"
                  size="sm"
                  variant={isSelected ? "default" : "outline"}
                  className={
                    isSelected
                      ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                      : "rounded-full"
                  }
                  onClick={() => handleModalityChange(modality._id)}
                >
                  {modality.modalityCode} - {modality.modalityName}
                </Button>
              );
            })}
          </div>
        )}
      </div>

      {/* SELECTED MODALITY INFORMATION */}
      {selectedModality && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-muted/20 p-4">
          <div>
            <p className="text-sm text-muted-foreground">Selected Modality</p>

            <p className="font-semibold">
              {selectedModality.modalityName}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({selectedModality.modalityCode})
              </span>
            </p>
          </div>

          <Badge
            variant={selectedModality.status === "ACTIVE" ? "default" : "secondary"}
            className={
              selectedModality.status === "ACTIVE"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : ""
            }
          >
            {selectedModality.status}
          </Badge>
        </div>
      )}

      {/* INVESTIGATION LIST */}
      {selectedModalityId && (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Imaging Investigation List</h3>

              <p className="text-sm text-muted-foreground">
                {totalRecords} {totalRecords === 1 ? "investigation" : "investigations"} found
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void loadInvestigations()}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* SEARCH AND STATUS FILTER */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              placeholder="Search investigations..."
              containerClassName="w-full sm:max-w-sm"
            />

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* INVESTIGATION TABLE */}
          {error && !loading ? (
            <div className="rounded-lg border p-8 text-center">
              <AlertCircle className="mx-auto h-8 w-8 text-destructive" />

              <p className="mt-3 font-medium">Unable to load investigations</p>

              <p className="mt-1 text-sm text-muted-foreground">{error}</p>

              <Button
                type="button"
                variant="outline"
                className="mt-4"
                onClick={() => void loadInvestigations()}
              >
                Try Again
              </Button>
            </div>
          ) : !hasLoaded && loading ? (
            <DataTableSkeleton rows={8} columns={7} showHeader showToolbar={false} />
          ) : (
            <div className="overflow-hidden rounded-lg border">
              <DataTable
                columns={columns}
                data={investigations}
                getRowKey={(investigation) => investigation._id}
                loading={loading}
                emptyMessage="No investigations are linked to this modality."
              />

              {/* SERVER-SIDE PAGINATION */}
              <div className="flex flex-col gap-3 border-t p-3 sm:flex-row sm:items-center sm:justify-between">
                <DataTablePageSize
                  value={limit}
                  options={PAGE_SIZE_OPTIONS}
                  onChange={handlePageSizeChange}
                />

                <DataTablePagination
                  currentPage={page}
                  totalPages={Math.max(1, totalPages)}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
