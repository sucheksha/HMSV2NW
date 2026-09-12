import { useEffect, useMemo, useRef, useState } from "react";
import { KpiCard } from "@/components/common/KpiCard/KpiCard";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Building2,
  CalendarDays,
  Check,
  ChevronUp,
  Edit3,
  Filter,
  Loader2,
  Plus,
  Search,
  Trash2,
  ToggleLeft,
  UserRound,
  Users,
  X,
} from "lucide-react";

import { toast } from "sonner";

import {
  deleteDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
} from "./department.service";

import type { Department } from "./department.types";

import DepartmentForm from "./DepartmentForm";

import { getApiErrorMessage } from "@/lib/apiErrorMessage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");

  // =========================================================
  // FILTERS
  // =========================================================

  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);

  const filterRef = useRef<HTMLDivElement>(null);

  // =========================================================
  // SCROLL TO TOP
  // =========================================================

  const [showScrollTop, setShowScrollTop] = useState(false);

  // =========================================================
  // ADD / EDIT
  // =========================================================

  const [formOpen, setFormOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const [detailsLoadingId, setDetailsLoadingId] = useState<string | null>(null);

  // =========================================================
  // STATUS TOGGLE
  // =========================================================

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);

  // =========================================================
  // DELETE / SELECTION
  // =========================================================

  const [selectionMode, setSelectionMode] = useState(false);

  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [deleteError, setDeleteError] = useState("");

  // =========================================================
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1);

  const departmentsPerPage = 8;

  // =========================================================
  // LOAD DEPARTMENTS
  // =========================================================

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setLoadError("");

      const data = await getDepartments();

      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load departments:", error);

      const message = getApiErrorMessage(error, "Unable to load departments. Please try again.");

      setLoadError(message);

      if (!errorHasResponse(error)) {
        toast.error("Unable to connect to the server.", {
          description: "Please check your network connection and try again.",
          action: {
            label: "Retry",
            onClick: () => {
              void loadDepartments();
            },
          },
        });
      } else {
        toast.error("Unable to load departments.", {
          description: message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    void loadDepartments();
  }, []);

  // =========================================================
  // SCROLL LISTENER
  // =========================================================

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 450);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================================================
  // RESET PAGINATION
  // =========================================================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFilters]);

  // =========================================================
  // FILTER OUTSIDE CLICK
  // =========================================================

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setFilterOpen(false);
      }
    };

    if (filterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  // =========================================================
  // FILTER HELPERS
  // =========================================================

  const toggleFilter = (filter: string) => {
    setSelectedFilters((current) => {
      if (current.includes(filter)) {
        return current.filter((item) => item !== filter);
      }

      return [...current, filter];
    });
  };

  const clearFilters = () => {
    setSelectedFilters([]);
  };

  // =========================================================
  // FILTER DEPARTMENTS
  // =========================================================

  const filteredDepartments = useMemo(() => {
    const searchText = search.toLowerCase().trim();

    const hasActiveFilter = selectedFilters.includes("ACTIVE");
    const hasInactiveFilter = selectedFilters.includes("INACTIVE");

    const hasStaffFilter = selectedFilters.includes("HAS_STAFF");
    const noStaffFilter = selectedFilters.includes("NO_STAFF");

    const hasFloorFilter = selectedFilters.includes("HAS_FLOOR");
    const hasRoomFilter = selectedFilters.includes("HAS_ROOM");

    return departments.filter((department) => {
      const matchesSearch =
        department.departmentName?.toLowerCase().includes(searchText) ||
        department.departmentCode?.toLowerCase().includes(searchText);

      let matchesStatus = true;

      if (hasActiveFilter || hasInactiveFilter) {
        matchesStatus =
          (hasActiveFilter && department.status === "ACTIVE") ||
          (hasInactiveFilter && department.status === "INACTIVE");
      }

      let matchesStaff = true;

      if (hasStaffFilter || noStaffFilter) {
        const staffCount = Number(department.staffCount ?? 0);

        matchesStaff = (hasStaffFilter && staffCount > 0) || (noStaffFilter && staffCount === 0);
      }

      const matchesFloor = !hasFloorFilter || !!department.floor?.trim();

      const matchesRoom = !hasRoomFilter || !!department.roomNumber?.trim();

      return matchesSearch && matchesStatus && matchesStaff && matchesFloor && matchesRoom;
    });
  }, [departments, search, selectedFilters]);

  // =========================================================
  // KPI DATA
  // =========================================================

  const totalDepartments = departments.length;

  const activeDepartments = departments.filter(
    (department) => department.status === "ACTIVE",
  ).length;

  const inactiveDepartments = departments.filter(
    (department) => department.status === "INACTIVE",
  ).length;

  const totalStaff = departments.reduce((total, department) => {
    const count = Number(department.staffCount ?? 0);

    return total + (Number.isFinite(count) ? count : 0);
  }, 0);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

  const startIndex = (currentPage - 1) * departmentsPerPage;

  const paginatedDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + departmentsPerPage,
  );

  // =========================================================
  // SEARCH
  // =========================================================

  const handleClearSearch = () => {
    setSearch("");
  };

  // =========================================================
  // VIEW DETAILS
  // =========================================================

  const handleViewDetails = async (departmentId: string) => {
    if (detailsLoadingId) {
      return;
    }

    try {
      setDetailsLoadingId(departmentId);

      const department = await getDepartmentById(departmentId);

      setSelectedDepartment(department);
    } catch (error) {
      console.error("Failed to load department details:", error);

      const message = getApiErrorMessage(
        error,
        "Unable to load department details. Please try again.",
      );

      if (!errorHasResponse(error)) {
        toast.error("Unable to connect to the server.", {
          description: "Please check your network connection and try again.",
          action: {
            label: "Retry",
            onClick: () => {
              void handleViewDetails(departmentId);
            },
          },
        });
      } else {
        toast.error("Unable to load department details.", {
          description: message,
        });
      }
    } finally {
      setDetailsLoadingId(null);
    }
  };

  // =========================================================
  // STATUS TOGGLE
  // =========================================================

  const handleStatusToggleRequest = () => {
    if (!selectedDepartment || statusChanging) {
      return;
    }

    setStatusDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedDepartment || statusChanging) {
      return;
    }

    const departmentId = selectedDepartment._id;

    const currentStatus = selectedDepartment.status;

    const newStatus: "ACTIVE" | "INACTIVE" = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      setStatusChanging(true);

      const response = await updateDepartment(departmentId, {
        status: newStatus,
      });

      const updatedDepartment = response.data;

      setDepartments((currentDepartments) =>
        currentDepartments.map((department) =>
          department._id === departmentId ? updatedDepartment : department,
        ),
      );

      setSelectedDepartment(updatedDepartment);

      setStatusDialogOpen(false);

      toast.success(
        newStatus === "ACTIVE"
          ? "Department activated successfully."
          : "Department deactivated successfully.",
      );
    } catch (error) {
      console.error("Failed to change department status:", error);

      const message = getApiErrorMessage(
        error,
        `Unable to ${
          newStatus === "ACTIVE" ? "activate" : "deactivate"
        } the department. Please try again.`,
      );

      if (!errorHasResponse(error)) {
        toast.error("Unable to connect to the server.", {
          description: "Please check your network connection and try again.",
        });
      } else {
        toast.error("Unable to change department status.", {
          description: message,
        });
      }
    } finally {
      setStatusChanging(false);
    }
  };

  // =========================================================
  // ADD
  // =========================================================

  const handleAddDepartment = () => {
    setEditDepartment(null);
    setFormOpen(true);
  };

  // =========================================================
  // EDIT
  // =========================================================

  const handleEditDepartment = () => {
    if (!selectedDepartment) {
      return;
    }

    setSelectedDepartment(null);
    setEditDepartment(selectedDepartment);
    setFormOpen(true);
  };

  // =========================================================
  // FORM SUCCESS
  // =========================================================

  const handleFormSuccess = async () => {
    setFormOpen(false);
    setEditDepartment(null);

    await loadDepartments();
  };

  // =========================================================
  // FORM CANCEL
  // =========================================================

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditDepartment(null);
  };

  // =========================================================
  // DELETE / SELECTION
  // =========================================================

  const handleStartSelection = () => {
    if (deleting) {
      return;
    }

    setSelectionMode(true);
    setSelectedDepartmentIds([]);
  };

  const handleToggleSelection = (departmentId: string) => {
    if (deleting) {
      return;
    }

    setSelectedDepartmentIds((current) => {
      if (current.includes(departmentId)) {
        return current.filter((id) => id !== departmentId);
      }

      return [...current, departmentId];
    });
  };

  const handleSelectAll = () => {
    if (deleting) {
      return;
    }

    const visibleIds = filteredDepartments.map((department) => department._id);

    const allSelected =
      visibleIds.length > 0 && visibleIds.every((id) => selectedDepartmentIds.includes(id));

    if (allSelected) {
      setSelectedDepartmentIds([]);
      return;
    }

    setSelectedDepartmentIds(visibleIds);
  };

  const handleCancelSelection = () => {
    if (deleting) {
      return;
    }

    setSelectionMode(false);
    setSelectedDepartmentIds([]);
    setDeleteError("");
  };

  // =========================================================
  // DELETE
  // =========================================================

  const handleDeleteSelected = async () => {
    if (selectedDepartmentIds.length === 0 || deleting) {
      return;
    }

    const departmentIdsToDelete = [...selectedDepartmentIds];

    const selectedCount = departmentIdsToDelete.length;

    try {
      setDeleting(true);
      setDeleteError("");

      const results = await Promise.all(
        departmentIdsToDelete.map((departmentId) => deleteDepartment(departmentId)),
      );

      setDeleteDialogOpen(false);
      setSelectedDepartmentIds([]);
      setSelectionMode(false);

      const successMessage =
        selectedCount === 1
          ? results[0]?.message || "Department deleted successfully."
          : `${selectedCount} departments deleted successfully.`;

      toast.success(successMessage);

      await loadDepartments();

      setCurrentPage(1);
    } catch (error) {
      console.error("Failed to delete departments:", error);

      const message = getApiErrorMessage(
        error,
        "Could not delete the department. Please try again.",
      );

      setDeleteError(message);

      if (!errorHasResponse(error)) {
        toast.error("Unable to connect to the server.", {
          description: "Please check your network connection and try again.",
          action: {
            label: "Retry",
            onClick: () => {
              void handleDeleteSelected();
            },
          },
        });

        return;
      }

      toast.error("Unable to delete department.", {
        description: message,
      });
    } finally {
      setDeleting(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-full space-y-7 p-4 sm:p-6">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className="
              mt-0.5
              flex h-10 w-10 shrink-0
              items-center justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
            aria-hidden="true"
          >
            <Building2 className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage hospital departments and their operational status.
            </p>
          </div>
        </div>

        <p className="text-sm text-muted-foreground">
          {totalDepartments} {totalDepartments === 1 ? "department" : "departments"} configured
        </p>
      </div>

      {/* =====================================================
          SEARCH / FILTER / ACTION BAR
      ====================================================== */}

      <div
        className="
          rounded-2xl
          border
          bg-card
          p-3 sm:p-4
          shadow-sm
        "
      >
        <div
          className="
            flex flex-col gap-3
            xl:flex-row
            xl:items-center
            xl:justify-between
          "
        >
          {/* SEARCH + FILTER */}

          <div className="flex w-full flex-col gap-3 sm:flex-row">
            {/* SEARCH */}

            <div className="relative w-full sm:max-w-[390px]">
              <Search
                className="
                  pointer-events-none
                  absolute left-3 top-1/2
                  h-4 w-4
                  -translate-y-1/2
                  text-blue-500
                "
                aria-hidden="true"
              />

              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search departments..."
                className="
                  h-10
                  border-blue-100
                  bg-blue-50/40
                  pl-9 pr-9
                  focus-visible:ring-blue-400
                "
                aria-label="Search departments by name or code"
              />

              {search && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="
                    absolute right-2 top-1/2
                    flex h-7 w-7
                    -translate-y-1/2
                    items-center justify-center
                    rounded-md
                    text-muted-foreground
                    hover:bg-blue-100
                    hover:text-foreground
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-primary
                  "
                  aria-label="Clear department search"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* FILTER */}

            <div ref={filterRef} className="relative">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFilterOpen((open) => !open)}
                className="
                  h-10
                  min-w-[120px]
                  justify-center
                  gap-2
                  border-blue-100
                  bg-blue-50/30
                "
                aria-expanded={filterOpen}
                aria-haspopup="menu"
              >
                <Filter className="h-4 w-4" aria-hidden="true" />
                Filter
                {selectedFilters.length > 0 && (
                  <span
                    className="
                      flex h-5 min-w-5
                      items-center justify-center
                      rounded-full
                      bg-primary
                      px-1.5
                      text-[10px]
                      font-semibold
                      text-primary-foreground
                    "
                    aria-label={`${selectedFilters.length} filters selected`}
                  >
                    {selectedFilters.length}
                  </span>
                )}
              </Button>

              {filterOpen && (
                <div
                  className="
                    absolute left-0 top-12 z-50
                    w-[270px]
                    max-w-[calc(100vw-2rem)]
                    rounded-xl
                    border
                    bg-background
                    p-3
                    shadow-xl
                  "
                  role="menu"
                  aria-label="Department filters"
                >
                  <div className="flex items-start justify-between border-b pb-3">
                    <div>
                      <p className="text-sm font-semibold">Filter departments</p>

                      <p className="text-xs text-muted-foreground">Select one or more options</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => setFilterOpen(false)}
                      className="
                        flex h-7 w-7
                        items-center justify-center
                        rounded-md
                        text-muted-foreground
                        hover:bg-muted
                        hover:text-foreground
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-primary
                      "
                      aria-label="Close filter menu"
                      title="Close filter menu"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  {/* STATUS */}

                  <div className="border-b py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Status
                    </p>

                    <FilterCheckbox
                      label="Active"
                      checked={selectedFilters.includes("ACTIVE")}
                      onChange={() => toggleFilter("ACTIVE")}
                    />

                    <FilterCheckbox
                      label="Inactive"
                      checked={selectedFilters.includes("INACTIVE")}
                      onChange={() => toggleFilter("INACTIVE")}
                    />
                  </div>

                  {/* STAFF */}

                  <div className="border-b py-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Staff
                    </p>

                    <FilterCheckbox
                      label="Staff assigned"
                      checked={selectedFilters.includes("HAS_STAFF")}
                      onChange={() => toggleFilter("HAS_STAFF")}
                    />

                    <FilterCheckbox
                      label="No staff assigned"
                      checked={selectedFilters.includes("NO_STAFF")}
                      onChange={() => toggleFilter("NO_STAFF")}
                    />
                  </div>

                  {/* LOCATION */}

                  <div className="pt-3">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Location
                    </p>

                    <FilterCheckbox
                      label="Floor assigned"
                      checked={selectedFilters.includes("HAS_FLOOR")}
                      onChange={() => toggleFilter("HAS_FLOOR")}
                    />

                    <FilterCheckbox
                      label="Room assigned"
                      checked={selectedFilters.includes("HAS_ROOM")}
                      onChange={() => toggleFilter("HAS_ROOM")}
                    />
                  </div>

                  <div className="mt-3 border-t pt-3">
                    <Button
                      type="button"
                      size="sm"
                      className="w-full"
                      onClick={() => setFilterOpen(false)}
                    >
                      Apply filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ACTION BUTTONS */}

          <div className="flex w-full items-center gap-2 xl:w-auto">
            <Button
              type="button"
              variant="outline"
              onClick={handleStartSelection}
              disabled={selectionMode || deleting}
              className="gap-2"
              aria-label="Select departments for deletion"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              Delete
            </Button>

            <Button
              type="button"
              onClick={handleAddDepartment}
              disabled={deleting}
              className="gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              Add Department
            </Button>
          </div>
        </div>

        {/* =================================================
            SELECTION CONTROLS
        ================================================== */}

        {selectionMode && (
          <div
            className="
              mt-4
              flex flex-wrap
              items-center
              gap-2
              border-t
              pt-4
            "
          >
            <div
              className="
                flex items-center gap-2
                rounded-lg
                border
                bg-muted/30
                px-3 py-2
              "
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" aria-hidden="true" />

              <span className="text-sm font-medium">{selectedDepartmentIds.length} selected</span>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              disabled={filteredDepartments.length === 0 || deleting}
              className="gap-1.5"
            >
              <Check className="h-3.5 w-3.5" aria-hidden="true" />

              {filteredDepartments.length > 0 &&
              filteredDepartments.every((department) =>
                selectedDepartmentIds.includes(department._id),
              )
                ? "Clear all"
                : "Select all"}
            </Button>

            {selectedDepartmentIds.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setDeleteDialogOpen(true)}
                disabled={deleting}
                className="gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                Delete selected
              </Button>
            )}

            <button
              type="button"
              onClick={handleCancelSelection}
              disabled={deleting}
              className="
                ml-auto
                flex h-9 w-9
                items-center justify-center
                rounded-lg
                border
                border-slate-300
                bg-white
                text-slate-600
                transition-colors
                hover:bg-slate-100
                hover:text-slate-900
                disabled:cursor-not-allowed
                disabled:opacity-50
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-primary
              "
              aria-label="Cancel delete selection"
              title="Cancel delete selection"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ACTIVE FILTERS */}

        {(search || selectedFilters.length > 0) && (
          <div
            className="
              mt-4
              flex flex-wrap
              items-center
              gap-2
              border-t
              pt-3
            "
          >
            <span className="text-xs font-medium text-muted-foreground">Active filters:</span>

            {search && <FilterBadge label={`Search: ${search}`} onRemove={handleClearSearch} />}

            {selectedFilters.map((filter) => (
              <FilterBadge
                key={filter}
                label={getFilterLabel(filter)}
                onRemove={() => toggleFilter(filter)}
              />
            ))}
          </div>
        )}
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      {loading ? (
        <>
          <DepartmentKpiLoadingState />
          <DepartmentLoadingState />
        </>
      ) : loadError ? (
        <DepartmentErrorState
          message={loadError}
          onRetry={() => {
            void loadDepartments();
          }}
        />
      ) : (
        <>
          {/* KPI CARDS */}

          <div
            className="
              grid grid-cols-1 gap-4
              sm:grid-cols-2
              xl:grid-cols-4
            "
          >
            <KpiCard
              title="Total Departments"
              value={totalDepartments}
              description="All departments"
              icon={Building2}
              className="bg-blue-50/70 border-blue-100"
              iconClassName="bg-blue-100 text-blue-700"
            />

            <KpiCard
              title="Active Departments"
              value={activeDepartments}
              description="Currently operational"
              icon={Activity}
              className="bg-green-50/70 border-green-100"
              iconClassName="bg-green-100 text-green-700"
            />

            <KpiCard
              title="Inactive Departments"
              value={inactiveDepartments}
              description="Currently inactive"
              icon={ToggleLeft}
              className="bg-slate-50/80 border-slate-200"
              iconClassName="bg-slate-100 text-slate-600"
            />

            <KpiCard
              title="Total Staff"
              value={totalStaff}
              description="Across all departments"
              icon={Users}
              className="bg-violet-50/70 border-violet-100"
              iconClassName="bg-violet-100 text-violet-700"
            />
          </div>

          {/* DIRECTORY HEADER */}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Department Directory</h2>

              <p className="text-xs text-muted-foreground">
                {filteredDepartments.length}{" "}
                {filteredDepartments.length === 1 ? "department" : "departments"} shown
              </p>
            </div>

            {selectionMode && (
              <p className="text-xs text-muted-foreground">Select departments to delete</p>
            )}
          </div>

          {/* CARDS */}

          {filteredDepartments.length === 0 ? (
            <DepartmentEmptyState
              hasFilters={!!search || selectedFilters.length > 0}
              onClearFilters={() => {
                setSearch("");
                clearFilters();
              }}
              onAddDepartment={handleAddDepartment}
            />
          ) : (
            <>
              <div
                className="
                  grid grid-cols-1 gap-5
                  sm:grid-cols-2
                  xl:grid-cols-3
                  2xl:grid-cols-4
                "
              >
                {paginatedDepartments.map((department) => (
                  <DepartmentCard
                    key={department._id}
                    department={department}
                    selectionMode={selectionMode}
                    selected={selectedDepartmentIds.includes(department._id)}
                    onSelect={() => handleToggleSelection(department._id)}
                    onViewDetails={() => void handleViewDetails(department._id)}
                    detailsLoading={detailsLoadingId === department._id}
                  />
                ))}
              </div>

              {/* PAGINATION */}

              {totalPages > 1 && (
                <div
                  className="
                    flex flex-col
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    bg-card
                    px-4 py-3
                    sm:flex-row
                  "
                >
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">
                      {startIndex + 1}–
                      {Math.min(startIndex + departmentsPerPage, filteredDepartments.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium text-foreground">
                      {filteredDepartments.length}
                    </span>
                  </p>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((page) => page - 1)}
                      className="gap-1"
                      aria-label="Go to previous page"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                      Previous
                    </Button>

                    <div className="flex items-center gap-1" aria-label="Department pages">
                      {Array.from(
                        {
                          length: totalPages,
                        },
                        (_, index) => index + 1,
                      ).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          className="h-8 w-8 p-0"
                          aria-label={`Go to page ${page}`}
                          aria-current={currentPage === page ? "page" : undefined}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((page) => page + 1)}
                      className="gap-1"
                      aria-label="Go to next page"
                    >
                      Next
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {/* =====================================================
          ADD / EDIT DIALOG
      ====================================================== */}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleFormCancel();
          }
        }}
      >
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-h-[90vh]
            max-w-lg
            overflow-y-auto
            rounded-xl
          "
        >
          <DialogHeader>
            <DialogTitle>{editDepartment ? "Edit Department" : "Add Department"}</DialogTitle>
          </DialogHeader>

          <DepartmentForm
            department={editDepartment}
            onSuccess={handleFormSuccess}
            onCancel={handleFormCancel}
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          DETAILS DIALOG
      ====================================================== */}

      <Dialog
        open={!!selectedDepartment}
        onOpenChange={(open) => {
          if (!open && !statusChanging) {
            setSelectedDepartment(null);
          }
        }}
      >
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-md
            overflow-hidden
            rounded-2xl
            p-0
          "
        >
          {selectedDepartment && (
            <>
              <div className="border-b bg-muted/20 px-6 py-5">
                <DialogHeader>
                  <div className="flex items-start gap-4">
                    <div
                      className="
                        flex h-12 w-12 shrink-0
                        items-center justify-center
                        rounded-xl
                        bg-primary/10
                        text-primary
                      "
                      aria-hidden="true"
                    >
                      <Building2 className="h-6 w-6" />
                    </div>

                    <div className="min-w-0">
                      <DialogTitle className="truncate text-xl">
                        {selectedDepartment.departmentName}
                      </DialogTitle>

                      <DialogDescription className="mt-1">
                        Department code:{" "}
                        <span className="font-medium text-foreground">
                          {selectedDepartment.departmentCode}
                        </span>
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
              </div>

              <div className="space-y-5 px-6 py-5">
                {/* STATUS */}

                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div
                        className={`
                          flex h-10 w-10 shrink-0
                          items-center justify-center
                          rounded-lg
                          ${
                            selectedDepartment.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-muted text-muted-foreground"
                          }
                        `}
                        aria-hidden="true"
                      >
                        <ToggleLeft className="h-5 w-5" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold">Department Status</p>

                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Control whether this department is active.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={selectedDepartment.status === "ACTIVE"}
                      aria-label="Toggle department status"
                      disabled={statusChanging}
                      onClick={handleStatusToggleRequest}
                      className={`
                        relative inline-flex
                        h-7 w-12 shrink-0
                        items-center
                        rounded-full
                        transition-all
                        disabled:opacity-60
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-primary
                        ${
                          selectedDepartment.status === "ACTIVE"
                            ? "bg-green-600"
                            : "bg-muted-foreground/30"
                        }
                      `}
                    >
                      <span
                        className={`
                          block h-5 w-5
                          rounded-full
                          bg-white
                          shadow-sm
                          transition-transform
                          ${
                            selectedDepartment.status === "ACTIVE"
                              ? "translate-x-5"
                              : "translate-x-1"
                          }
                        `}
                      />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">Current status</span>

                    <span
                      className={`
                        rounded-full px-2.5 py-1
                        text-xs font-semibold
                        ${
                          selectedDepartment.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      {selectedDepartment.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                {/* DATES */}

                <div className="grid grid-cols-2 gap-3">
                  <DetailItem
                    icon={CalendarDays}
                    label="Created"
                    value={formatDate(selectedDepartment.createdAt)}
                  />

                  <DetailItem
                    icon={CalendarDays}
                    label="Last Updated"
                    value={formatDate(selectedDepartment.updatedAt)}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t bg-muted/10 px-6 py-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedDepartment(null)}
                  disabled={statusChanging}
                >
                  Close
                </Button>

                <Button
                  type="button"
                  onClick={handleEditDepartment}
                  disabled={statusChanging}
                  className="gap-2"
                >
                  <Edit3 className="h-4 w-4" aria-hidden="true" />
                  Edit Department
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================
          STATUS CONFIRMATION
      ====================================================== */}

      <Dialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!statusChanging) {
            setStatusDialogOpen(open);
          }
        }}
      >
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-md
            rounded-2xl
          "
        >
          {selectedDepartment && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedDepartment.status === "ACTIVE"
                    ? "Deactivate Department?"
                    : "Activate Department?"}
                </DialogTitle>

                <DialogDescription>
                  You are about to{" "}
                  {selectedDepartment.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
                  <span className="font-medium text-foreground">
                    {selectedDepartment.departmentName}
                  </span>
                  .
                </DialogDescription>
              </DialogHeader>

              <div
                className={`
                  rounded-xl border p-4
                  ${
                    selectedDepartment.status === "ACTIVE"
                      ? "border-amber-200 bg-amber-50"
                      : "border-green-200 bg-green-50"
                  }
                `}
              >
                <p className="text-sm">
                  {selectedDepartment.status === "ACTIVE"
                    ? "The department will remain in the system, but its status will change to inactive."
                    : "The department will become active again and will be available as an active department."}
                </p>
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStatusDialogOpen(false)}
                  disabled={statusChanging}
                >
                  Cancel
                </Button>

                <Button
                  type="button"
                  variant={selectedDepartment.status === "ACTIVE" ? "destructive" : "default"}
                  onClick={handleConfirmStatusChange}
                  disabled={statusChanging}
                >
                  {statusChanging ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : selectedDepartment.status === "ACTIVE" ? (
                    "Deactivate"
                  ) : (
                    "Activate"
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================
          DELETE CONFIRMATION
      ====================================================== */}

      <Dialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) {
            setDeleteDialogOpen(open);

            if (!open) {
              setDeleteError("");
            }
          }
        }}
      >
        <DialogContent
          className="
            w-[calc(100%-2rem)]
            max-w-md
            rounded-xl
          "
        >
          <DialogHeader>
            <DialogTitle>Delete Department</DialogTitle>

            <DialogDescription>Review this action before continuing.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                  <Trash2 className="h-4 w-4" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Delete {selectedDepartmentIds.length} department
                    {selectedDepartmentIds.length !== 1 ? "s" : ""}?
                  </p>

                  <p className="mt-1 text-sm text-red-700">
                    The selected department
                    {selectedDepartmentIds.length !== 1 ? "s" : ""} will be deactivated and removed
                    from the active department list.
                  </p>
                </div>
              </div>
            </div>

            {deleteError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={deleting}
              >
                Cancel
              </Button>

              <Button
                type="button"
                variant="destructive"
                onClick={handleDeleteSelected}
                disabled={deleting || selectedDepartmentIds.length === 0}
                className="gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Yes, Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* =====================================================
          PAGE UP BUTTON
      ====================================================== */}

      {showScrollTop && (
        <button
          type="button"
          onClick={handleScrollToTop}
          className="
            fixed
            bottom-5 right-5
            z-40
            flex h-11 w-11
            items-center justify-center
            rounded-full
            border
            border-slate-200
            bg-white
            text-slate-700
            shadow-lg
            transition-all
            duration-200
            hover:-translate-y-0.5
            hover:bg-slate-50
            hover:shadow-xl
            focus-visible:outline-none
            focus-visible:ring-2
            focus-visible:ring-primary
            focus-visible:ring-offset-2
            sm:bottom-7
            sm:right-7
          "
          aria-label="Scroll to top of page"
          title="Back to top"
        >
          <ChevronUp className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* =========================================================
   FILTER CHECKBOX
========================================================= */

function FilterCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="
        flex w-full
        items-center gap-3
        rounded-lg
        px-2 py-2
        text-left
        text-sm
        hover:bg-muted/60
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
      "
      role="menuitemcheckbox"
      aria-checked={checked}
    >
      <span
        className={`
          flex h-4 w-4
          shrink-0
          items-center justify-center
          rounded
          border
          ${
            checked
              ? "border-primary bg-primary text-primary-foreground"
              : "border-slate-700 bg-white"
          }
        `}
        aria-hidden="true"
      >
        {checked && <Check className="h-3 w-3" />}
      </span>

      <span>{label}</span>
    </button>
  );
}

/* =========================================================
   FILTER BADGE
========================================================= */

function FilterBadge({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="
        inline-flex
        items-center gap-1.5
        rounded-full
        border
        bg-blue-50
        px-2.5 py-1
        text-xs
        font-medium
        text-blue-700
        hover:bg-blue-100
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-primary
      "
      aria-label={`Remove ${label} filter`}
    >
      {label}

      <X className="h-3 w-3" aria-hidden="true" />
    </button>
  );
}

/* =========================================================
   FILTER LABEL
========================================================= */

function getFilterLabel(filter: string) {
  switch (filter) {
    case "ACTIVE":
      return "Active";

    case "INACTIVE":
      return "Inactive";

    case "HAS_STAFF":
      return "Staff assigned";

    case "NO_STAFF":
      return "No staff assigned";

    case "HAS_FLOOR":
      return "Floor assigned";

    case "HAS_ROOM":
      return "Room assigned";

    default:
      return filter;
  }
}

/* =========================================================
   DEPARTMENT CARD
========================================================= */

interface DepartmentCardProps {
  department: Department;
  selectionMode: boolean;
  selected: boolean;
  onSelect: () => void;
  onViewDetails: () => void;
  detailsLoading: boolean;
}

function DepartmentCard({
  department,
  selectionMode,
  selected,
  onSelect,
  onViewDetails,
  detailsLoading,
}: DepartmentCardProps) {
  const isActive = department.status === "ACTIVE";

  return (
    <div
      className={`
        group relative overflow-hidden
        rounded-2xl
        border
        bg-card
        shadow-sm
        transition-all
        duration-200
        hover:-translate-y-0.5
        hover:shadow-lg
        ${selected ? "ring-2 ring-primary ring-offset-2" : ""}
      `}
    >
      <div
        className={`
          h-1 w-full
          ${isActive ? "bg-green-500" : "bg-muted-foreground/30"}
        `}
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex h-12 w-12 shrink-0
              items-center justify-center
              rounded-xl
              bg-blue-50
              text-blue-600
            "
            aria-hidden="true"
          >
            <Building2 className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate font-semibold">{department.departmentName}</h2>

            <p className="mt-0.5 text-xs font-medium tracking-wide text-muted-foreground">
              {department.departmentCode}
            </p>
          </div>
        </div>

        {selectionMode && (
          <button
            type="button"
            onClick={onSelect}
            className={`
              mt-1
              flex h-5 w-5
              shrink-0
              items-center justify-center
              rounded
              border
              transition-colors
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-primary
              ${
                selected
                  ? "border-primary bg-primary text-white"
                  : "border-slate-800 bg-white hover:bg-slate-100"
              }
            `}
            role="checkbox"
            aria-checked={selected}
            aria-label={`Select ${department.departmentName}`}
          >
            {selected && <Check className="h-3.5 w-3.5" />}
          </button>
        )}
      </div>

      <div className="px-5">
        <span
          className={`
            inline-flex
            items-center gap-1.5
            rounded-full
            px-2.5 py-1
            text-xs font-semibold
            ${isActive ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}
          `}
        >
          <span
            className={`
              h-1.5 w-1.5 rounded-full
              ${isActive ? "bg-green-600" : "bg-muted-foreground"}
            `}
            aria-hidden="true"
          />

          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 p-5">
        <MiniDetail
          icon={UserRound}
          label="Staff"
          value={
            department.staffCount !== undefined && department.staffCount !== null
              ? String(department.staffCount)
              : "—"
          }
        />

        <MiniDetail icon={Building2} label="Floor" value={department.floor || "—"} />

        <MiniDetail icon={Building2} label="Room" value={department.roomNumber || "—"} />

        <MiniDetail
          icon={CalendarDays}
          label="Updated"
          value={formatShortDate(department.updatedAt)}
        />
      </div>

      <div className="border-t bg-muted/20 px-5 py-3">
        <Button
          type="button"
          variant="ghost"
          className="
            h-9 w-full
            justify-between
            px-2
            text-sm
            text-primary
            hover:bg-primary/5
            hover:text-primary
          "
          onClick={onViewDetails}
          disabled={selectionMode || detailsLoading}
          aria-label={`View details for ${department.departmentName}`}
        >
          {detailsLoading ? (
            <>
              Loading details...
              <Loader2 className="h-4 w-4 animate-spin" />
            </>
          ) : (
            <>
              View details
              <span
                className="transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              >
                →
              </span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   DETAIL ITEM
========================================================= */

function DetailItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-muted/20 p-3">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />

        <span className="text-xs text-muted-foreground">{label}</span>
      </div>

      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
}

/* =========================================================
   MINI DETAIL
========================================================= */

function MiniDetail({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof CalendarDays;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-lg p-1">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />

        <span>{label}</span>
      </div>

      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

/* =========================================================
   KPI LOADING
========================================================= */

function DepartmentKpiLoadingState() {
  return (
    <div
      className="
        grid grid-cols-1 gap-4
        sm:grid-cols-2
        xl:grid-cols-4
      "
    >
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-card p-5">
          <div className="animate-pulse">
            <div className="flex justify-between">
              <div className="space-y-3">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-8 w-16 rounded bg-muted" />
                <div className="h-3 w-32 rounded bg-muted" />
              </div>

              <div className="h-11 w-11 rounded-xl bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   DEPARTMENT LOADING
========================================================= */

function DepartmentLoadingState() {
  return (
    <div
      className="
        grid grid-cols-1 gap-5
        sm:grid-cols-2
        xl:grid-cols-3
        2xl:grid-cols-4
      "
    >
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-2xl border bg-card">
          <div className="h-1 bg-muted" />

          <div className="animate-pulse p-5">
            <div className="flex gap-3">
              <div className="h-12 w-12 rounded-xl bg-muted" />

              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>

            <div className="mt-5 h-5 w-16 rounded-full bg-muted" />

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="h-9 rounded bg-muted" />
              <div className="h-9 rounded bg-muted" />
              <div className="h-9 rounded bg-muted" />
              <div className="h-9 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   ERROR STATE
========================================================= */

function DepartmentErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-10 text-center">
      <div className="mx-auto max-w-md">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
          <X className="h-5 w-5" />
        </div>

        <h3 className="mt-4 text-sm font-semibold text-red-800">Unable to load departments</h3>

        <p className="mt-2 text-sm text-red-700">{message}</p>

        <Button type="button" variant="outline" className="mt-4" onClick={onRetry}>
          Retry
        </Button>
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function DepartmentEmptyState({
  hasFilters,
  onClearFilters,
  onAddDepartment,
}: {
  hasFilters: boolean;
  onClearFilters: () => void;
  onAddDepartment: () => void;
}) {
  return (
    <div className="rounded-2xl border bg-card px-6 py-14 text-center shadow-sm">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <Building2 className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-lg font-semibold">
        {hasFilters ? "No matching departments" : "No departments yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">
        {hasFilters
          ? "No departments match your current search or filters. Try adjusting your filters."
          : "Create your first department to start organizing and managing your hospital operations."}
      </p>

      <div className="mt-6 flex justify-center">
        {hasFilters ? (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        ) : (
          <Button type="button" onClick={onAddDepartment} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        )}
      </div>
    </div>
  );
}

/* =========================================================
   DATE HELPERS
========================================================= */
function formatDate(value?: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
function formatShortDate(value?: string) {
  if (!value) {
    return "—";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}
/* =========================================================
   ERROR HELPER
========================================================= */
function errorHasResponse(error: unknown): boolean {
  const axiosError = error as {
    response?: unknown;
  };
  return !!axiosError.response;
}
