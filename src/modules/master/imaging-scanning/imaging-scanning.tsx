import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Microscope, Plus, ScanLine, Layers3 } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/common/PageContainer";
import { KpiCard } from "@/components/common/KpiCard/KpiCard";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { SearchInput } from "@/components/common/SearchInput";
import { RefreshButton } from "@/components/common/RefreshButton";
import { DataTablePageSize } from "@/components/common/DataTable/DataTablePageSize";
import { DataTablePagination } from "@/components/common/DataTable/DataTablePagination";
import { DataTableSkeleton } from "@/components/common/DataTable/DataTableSkeleton";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { ModalityTable } from "./components/ModalityTable";
import { ModalityForm } from "./components/ModalityForm";
import { ImagingInvestigationTable } from "./components/ImagingInvestigationTable";

import { getModalities, getModalityById, deleteModality } from "./imagingScanningService";

import type { Modality, ModalityStatus } from "./imagingScanning.types";

type MainTab = "MODALITIES" | "INVESTIGATIONS";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function ImagingScanningPage() {
  // --------------------------------------------
  // MAIN TAB
  // --------------------------------------------

  const [activeTab, setActiveTab] = useState<MainTab>("MODALITIES");

  // --------------------------------------------
  // MODALITY DATA
  // --------------------------------------------

  const [modalities, setModalities] = useState<Modality[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // --------------------------------------------
  // KPI COUNTS
  // --------------------------------------------

  const [totalModalities, setTotalModalities] = useState(0);
  const [activeModalities, setActiveModalities] = useState(0);

  // --------------------------------------------
  // DIALOGS
  // --------------------------------------------

  const [formOpen, setFormOpen] = useState(false);
  const [editingModality, setEditingModality] = useState<Modality | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingModality, setViewingModality] = useState<Modality | null>(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingModality, setDeletingModality] = useState<Modality | null>(null);
  const [deleting, setDeleting] = useState(false);

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
  // LOAD MODALITY KPI COUNTS
  // These queries are independent of the current
  // table search/status filter and page.
  // --------------------------------------------

  const loadModalityStats = useCallback(async () => {
    try {
      const [totalResult, activeResult] = await Promise.all([
        getModalities({
          page: 1,
          limit: 1,
        }),
        getModalities({
          page: 1,
          limit: 1,
          status: "ACTIVE",
        }),
      ]);

      setTotalModalities(totalResult.total);
      setActiveModalities(activeResult.total);
    } catch {
      // Do not replace the main table error with a KPI error.
      toast.error("Unable to load modality statistics.");
    }
  }, []);

  // --------------------------------------------
  // LOAD MODALITIES
  // Server-side pagination, search and filtering.
  // --------------------------------------------

  const loadModalities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await getModalities({
        page,
        limit,
        search: debouncedSearch || undefined,
        status: statusFilter === "ALL" ? undefined : (statusFilter as ModalityStatus),
        sortBy: "modalityName",
        sortOrder: "asc",
      });

      setModalities(result.modalities);
      setTotalRecords(result.total);
      setTotalPages(result.totalPages);

      // Handle a page that no longer exists after deletion.
      if (result.totalPages > 0 && page > result.totalPages) {
        setPage(result.totalPages);
      }

      setHasLoaded(true);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load modalities.";

      setError(message);
      setModalities([]);
      setTotalRecords(0);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, statusFilter]);

  useEffect(() => {
    void loadModalityStats();
  }, [loadModalityStats]);

  useEffect(() => {
    void loadModalities();
  }, [loadModalities]);

  // --------------------------------------------
  // REFRESH
  // --------------------------------------------

  const handleRefresh = () => {
    void loadModalities();
    void loadModalityStats();
  };

  // --------------------------------------------
  // ADD MODALITY
  // --------------------------------------------

  const handleAdd = () => {
    setEditingModality(null);
    setFormOpen(true);
  };

  // --------------------------------------------
  // EDIT MODALITY
  // --------------------------------------------

  const handleEdit = (modality: Modality) => {
    setEditingModality(modality);
    setFormOpen(true);
  };

  // --------------------------------------------
  // FORM SUCCESS
  // --------------------------------------------

  const handleFormSuccess = () => {
    setFormOpen(false);
    setEditingModality(null);
    setPage(1);

    void loadModalityStats();

    // If already on page 1, explicitly refresh.
    if (page === 1) {
      void loadModalities();
    }
  };

  // --------------------------------------------
  // VIEW MODALITY
  // --------------------------------------------

  const handleView = async (modality: Modality) => {
    setViewOpen(true);
    setViewLoading(true);
    setViewingModality(null);

    try {
      const result = await getModalityById(modality._id);
      setViewingModality(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to load modality details.");
      setViewOpen(false);
    } finally {
      setViewLoading(false);
    }
  };

  // --------------------------------------------
  // DELETE MODALITY
  // --------------------------------------------

  const handleDeleteRequest = (modality: Modality) => {
    setDeletingModality(modality);
    setDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingModality) return;

    setDeleting(true);

    try {
      await deleteModality(deletingModality._id);

      toast.success("Modality deleted successfully.");

      setDeleteOpen(false);
      setDeletingModality(null);

      await loadModalityStats();

      // If the current page has only one row, move back one page.
      if (modalities.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadModalities();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to delete modality.");
    } finally {
      setDeleting(false);
    }
  };

  // --------------------------------------------
  // PAGE SIZE
  // --------------------------------------------

  const handlePageSizeChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
  };

  // --------------------------------------------
  // TAB CHANGE
  // --------------------------------------------

  const handleTabChange = (tab: MainTab) => {
    setActiveTab(tab);
  };

  // --------------------------------------------
  // RENDER
  // --------------------------------------------

  return (
    <PageContainer>
      {/* PAGE HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Imaging &amp; Scanning</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage imaging modalities and view associated investigations.
          </p>
        </div>
      </div>

      {/* MAIN TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b pb-4">
        <Button
          type="button"
          variant={activeTab === "MODALITIES" ? "default" : "secondary"}
          className={
            activeTab === "MODALITIES"
              ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              : "rounded-full"
          }
          onClick={() => handleTabChange("MODALITIES")}
        >
          <Layers3 className="mr-2 h-4 w-4" />
          Modality Master
        </Button>

        <Button
          type="button"
          variant={activeTab === "INVESTIGATIONS" ? "default" : "secondary"}
          className={
            activeTab === "INVESTIGATIONS"
              ? "rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
              : "rounded-full"
          }
          onClick={() => handleTabChange("INVESTIGATIONS")}
        >
          <ScanLine className="mr-2 h-4 w-4" />
          Imaging Investigations
        </Button>
      </div>

      {/* ====================================== */}
      {/* MODALITY MASTER TAB */}
      {/* ====================================== */}

      {activeTab === "MODALITIES" && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold">Modality Master</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Create and manage imaging modalities available in your hospital.
            </p>
          </div>

          {/* KPI CARDS */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KpiCard
              title="Total Modalities"
              value={totalModalities}
              description="All registered modalities"
              icon={Layers3}
              className="bg-card"
              iconClassName="bg-blue-100 text-blue-700"
            />

            <KpiCard
              title="Active Modalities"
              value={activeModalities}
              description="Currently active modalities"
              icon={Activity}
              className="bg-card"
              iconClassName="bg-emerald-100 text-emerald-700"
            />
          </div>

          {/* MODALITY LIST */}
          <div className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold">Modality List</h2>
                <p className="text-sm text-muted-foreground">
                  {totalRecords} {totalRecords === 1 ? "record" : "records"}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <RefreshButton onRefresh={handleRefresh} loading={loading} />

                <Button type="button" onClick={handleAdd}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Modality
                </Button>
              </div>
            </div>

            {/* SEARCH AND FILTERS */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder="Search by modality name or code..."
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

            {/* TABLE */}
            {error && !hasLoaded ? (
              <div className="rounded-lg border p-8 text-center">
                <p className="font-medium text-destructive">Unable to load modalities</p>
                <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                <Button variant="outline" className="mt-4" onClick={handleRefresh}>
                  Try Again
                </Button>
              </div>
            ) : !hasLoaded && loading ? (
              <DataTableSkeleton rows={8} columns={4} showHeader showToolbar={false} />
            ) : (
              <div className="overflow-hidden rounded-lg border">
                <ModalityTable
                  modalities={modalities}
                  loading={loading}
                  onView={handleView}
                  onEdit={handleEdit}
                  onDelete={handleDeleteRequest}
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
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ====================================== */}
      {/* IMAGING INVESTIGATIONS TAB */}
      {/* READ ONLY - NO CRUD ACTIONS */}
      {/* ====================================== */}

      {activeTab === "INVESTIGATIONS" && (
        <div className="space-y-5">
          <div>
            <h2 className="text-xl font-semibold">Imaging Investigations</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              View existing investigations linked to imaging modalities. This section is read-only.
            </p>
          </div>

          <ImagingInvestigationTable />
        </div>
      )}

      {/* ====================================== */}
      {/* ADD / EDIT MODALITY FORM */}
      {/* ====================================== */}

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingModality(null);
        }}
        title={editingModality ? "Edit Modality" : "Add Modality"}
        description={
          editingModality
            ? "Update the modality information."
            : "Enter the details to create a new modality."
        }
      >
        <ModalityForm
          modality={editingModality}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setFormOpen(false);
            setEditingModality(null);
          }}
        />
      </FormDialog>

      {/* ====================================== */}
      {/* VIEW MODALITY */}
      {/* ====================================== */}

      <Dialog open={viewOpen} onOpenChange={setViewOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modality Details</DialogTitle>
            <DialogDescription>View the registered modality information.</DialogDescription>
          </DialogHeader>

          {viewLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading modality details...
            </div>
          ) : viewingModality ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Modality Code</p>
                  <p className="font-medium">{viewingModality.modalityCode}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Modality Name</p>
                  <p className="font-medium">{viewingModality.modalityName}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    className={
                      viewingModality.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : ""
                    }
                    variant={viewingModality.status === "ACTIVE" ? "default" : "secondary"}
                  >
                    {viewingModality.status}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="whitespace-pre-wrap text-sm">
                  {viewingModality.description || "No description provided."}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t pt-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Created At</p>
                  <p className="text-sm">
                    {new Date(viewingModality.createdAt).toLocaleString("en-IN")}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Last Updated</p>
                  <p className="text-sm">
                    {new Date(viewingModality.updatedAt).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* ====================================== */}
      {/* DELETE CONFIRMATION */}
      {/* ====================================== */}

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDeleteOpen(open);
            if (!open) setDeletingModality(null);
          }
        }}
        title="Delete Modality"
        description={
          deletingModality
            ? `Are you sure you want to delete ${deletingModality.modalityName} (${deletingModality.modalityCode})? This is a soft delete.`
            : "Are you sure you want to delete this modality?"
        }
        confirmText="Delete"
        destructive
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </PageContainer>
  );
}
