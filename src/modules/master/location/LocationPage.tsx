import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, CheckCircle2, XCircle, Plus, RefreshCw, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/common/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable, DataTablePageSize, DataTablePagination } from "@/components/common/DataTable";
import type { DataTableColumn } from "@/components/common/DataTable";
import { KpiCard } from "@/components/common/KpiCard/KpiCard";
import { SearchInput } from "@/components/common/SearchInput";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { RefreshButton } from "@/components/common/RefreshButton";
import StateForm from "./StateForm";
import DistrictForm from "./DistrictForm";
import TalukaForm from "./TalukaForm";

import {
  getStates,
  getDistricts,
  getTalukas,
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

function getRelationId(value: string | State | District): string {
  return typeof value === "string" ? value : (value?._id ?? "");
}

function getRelationName(
  value: string | State | District,
  records: Array<State | District>,
): string {
  if (typeof value !== "string") {
    return value?.name ?? "—";
  }

  return records.find((record) => record._id === value)?.name ?? "—";
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
  );
}

export default function LocationPage() {
  const [activeTab, setActiveTab] = useState<LocationTab>("states");

  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [stateFilter, setStateFilter] = useState("");
  const [districtFilter, setDistrictFilter] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [stateFormOpen, setStateFormOpen] = useState(false);
  const [districtFormOpen, setDistrictFormOpen] = useState(false);
  const [talukaFormOpen, setTalukaFormOpen] = useState(false);

  const [editingState, setEditingState] = useState<State | null>(null);
  const [editingDistrict, setEditingDistrict] = useState<District | null>(null);
  const [editingTaluka, setEditingTaluka] = useState<Taluka | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<{
    id: string;
    name: string;
    type: LocationTab;
  } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  const [statusItem, setStatusItem] = useState<{
    id: string;
    name: string;
    type: LocationTab;
    isActive: boolean;
  } | null>(null);
  const loadData = useCallback(async () => {
    setLoading(true);
    setLoadError("");

    try {
      const [stateRows, districtRows, talukaRows] = await Promise.all([
        getStates({
          page: 1,
          limit: 1000,
          sortBy: "name",
          sortOrder: "asc",
        }),
        getDistricts({
          page: 1,
          limit: 1000,
          sortBy: "name",
          sortOrder: "asc",
        }),
        getTalukas({
          page: 1,
          limit: 1000,
          sortBy: "name",
          sortOrder: "asc",
        }),
      ]);

      setStates(stateRows);
      setDistricts(districtRows);
      setTalukas(talukaRows);
    } catch (error: any) {
      const message = error?.response?.data?.message ?? "Unable to load location records.";

      setLoadError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [activeTab, search, statusFilter, stateFilter, districtFilter, pageSize]);

  useEffect(() => {
    setSearch("");
    setStatusFilter("all");
    setStateFilter("");
    setDistrictFilter("");
  }, [activeTab]);

  const filteredStates = useMemo(() => {
    const query = search.trim().toLowerCase();

    return states.filter((state) => {
      const matchesSearch =
        !query ||
        state.name.toLowerCase().includes(query) ||
        state.code.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && state.isActive) ||
        (statusFilter === "inactive" && !state.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [states, search, statusFilter]);

  const filteredDistricts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return districts.filter((district) => {
      const matchesSearch = !query || district.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && district.isActive) ||
        (statusFilter === "inactive" && !district.isActive);

      const matchesState = !stateFilter || getRelationId(district.state) === stateFilter;

      return matchesSearch && matchesStatus && matchesState;
    });
  }, [districts, search, statusFilter, stateFilter]);

  const filteredTalukas = useMemo(() => {
    const query = search.trim().toLowerCase();

    return talukas.filter((taluka) => {
      const matchesSearch = !query || taluka.name.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && taluka.isActive) ||
        (statusFilter === "inactive" && !taluka.isActive);

      const matchesDistrict = !districtFilter || getRelationId(taluka.district) === districtFilter;

      return matchesSearch && matchesStatus && matchesDistrict;
    });
  }, [talukas, search, statusFilter, districtFilter]);

  const records =
    activeTab === "states"
      ? filteredStates
      : activeTab === "districts"
        ? filteredDistricts
        : filteredTalukas;

  const totalCount =
    activeTab === "states"
      ? states.length
      : activeTab === "districts"
        ? districts.length
        : talukas.length;

  const activeCount =
    activeTab === "states"
      ? states.filter((item) => item.isActive).length
      : activeTab === "districts"
        ? districts.filter((item) => item.isActive).length
        : talukas.filter((item) => item.isActive).length;

  const inactiveCount = totalCount - activeCount;
  const totalPages = Math.max(1, Math.ceil(records.length / pageSize));
  const paginatedRecords = records.slice((page - 1) * pageSize, page * pageSize);

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

      await loadData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message ?? `Unable to delete ${deletingItem.name}.`);
    } finally {
      setDeleting(false);
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

      await loadData();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message ?? `Unable to update the status of ${statusItem.name}.`,
      );
    } finally {
      setStatusChanging(false);
    }
  }
  const stateColumns: DataTableColumn<State>[] = [
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
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${row.name}`}
            onClick={() => {
              setEditingState(row);
              setStateFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${row.name}`}
            onClick={() => requestDelete("states", row._id, row.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const districtColumns: DataTableColumn<District>[] = [
    {
      key: "name",
      header: "District Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "state",
      header: "State",
      render: (row) => getRelationName(row.state, states),
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
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${row.name}`}
            onClick={() => {
              setEditingDistrict(row);
              setDistrictFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${row.name}`}
            onClick={() => requestDelete("districts", row._id, row.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const talukaColumns: DataTableColumn<Taluka>[] = [
    {
      key: "name",
      header: "Taluka Name",
      render: (row) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: "district",
      header: "District",
      render: (row) => getRelationName(row.district, districts),
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
      key: "actions",
      header: "Actions",
      render: (row) => (
        <div className="flex justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Edit ${row.name}`}
            onClick={() => {
              setEditingTaluka(row);
              setTalukaFormOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            aria-label={`Delete ${row.name}`}
            onClick={() => requestDelete("talukas", row._id, row.name)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Location Master</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage states, districts, and talukas.
            </p>
          </div>

          <div className="flex gap-2">
            <RefreshButton onRefresh={() => void loadData()} loading={loading} />

            <Button onClick={openAddForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add{" "}
              {activeTab === "states" ? "State" : activeTab === "districts" ? "District" : "Taluka"}
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <KpiCard
            title="Total"
            value={totalCount}
            description="Total location records"
            icon={MapPin}
          />

          <KpiCard
            title="Active"
            value={activeCount}
            description="Currently active records"
            icon={CheckCircle2}
          />

          <KpiCard
            title="Inactive"
            value={inactiveCount}
            description="Currently inactive records"
            icon={XCircle}
          />
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LocationTab)}>
          <TabsList className="grid h-auto w-full grid-cols-3 sm:w-[420px]">
            <TabsTrigger value="states">States</TabsTrigger>
            <TabsTrigger value="districts">Districts</TabsTrigger>
            <TabsTrigger value="talukas">Talukas</TabsTrigger>
          </TabsList>

          <div className="mt-4 flex flex-col gap-3 lg:flex-row lg:items-center">
            <div className="w-full lg:max-w-sm">
              <SearchInput
                value={search}
                onChange={setSearch}
                placeholder={`Search ${activeTab}...`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
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
                onChange={(event) => setStateFilter(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by state"
              >
                <option value="">All states</option>
                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </select>
            )}

            {activeTab === "talukas" && (
              <select
                value={districtFilter}
                onChange={(event) => setDistrictFilter(event.target.value)}
                className="h-10 rounded-md border border-input bg-background px-3 text-sm"
                aria-label="Filter by district"
              >
                <option value="">All districts</option>
                {districts.map((district) => (
                  <option key={district._id} value={district._id}>
                    {district.name}
                  </option>
                ))}
              </select>
            )}

            <p className="text-sm text-muted-foreground lg:ml-auto">
              Showing {records.length} records
            </p>
          </div>

          {loadError && (
            <div className="mt-4 rounded-lg border border-destructive/30 p-4">
              <p className="text-sm text-destructive">{loadError}</p>
              <Button className="mt-2" variant="outline" size="sm" onClick={() => void loadData()}>
                Retry
              </Button>
            </div>
          )}

          {loading ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Loading location records...
            </p>
          ) : !loadError ? (
            <>
              <TabsContent value="states">
                <DataTable
                  columns={stateColumns}
                  data={paginatedRecords as State[]}
                  getRowKey={(row) => row._id}
                  emptyMessage="No states found."
                />
              </TabsContent>

              <TabsContent value="districts">
                <DataTable
                  columns={districtColumns}
                  data={paginatedRecords as District[]}
                  getRowKey={(row) => row._id}
                  emptyMessage="No districts found."
                />
              </TabsContent>

              <TabsContent value="talukas">
                <DataTable
                  columns={talukaColumns}
                  data={paginatedRecords as Taluka[]}
                  getRowKey={(row) => row._id}
                  emptyMessage="No talukas found."
                />
              </TabsContent>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <DataTablePageSize
                  value={pageSize}
                  onChange={setPageSize}
                  options={[10, 25, 50, 100]}
                />

                <DataTablePagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </div>
            </>
          ) : null}
        </Tabs>
      </div>

      <StateForm
        open={stateFormOpen}
        onOpenChange={setStateFormOpen}
        editingState={editingState}
        onSaved={() => void loadData()}
      />

      <DistrictForm
        open={districtFormOpen}
        onOpenChange={setDistrictFormOpen}
        editingDistrict={editingDistrict}
        onSaved={() => void loadData()}
      />

      <TalukaForm
        open={talukaFormOpen}
        onOpenChange={setTalukaFormOpen}
        editingTaluka={editingTaluka}
        onSaved={() => void loadData()}
      />

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
      <ConfirmDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!statusChanging) {
            setStatusDialogOpen(open);

            if (!open) {
              setStatusItem(null);
            }
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
