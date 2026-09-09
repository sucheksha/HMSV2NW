import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CalendarDays,
  Check,
  Edit3,
  Loader2,
  Plus,
  Search,
  ToggleLeft,
  UserRound,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  // ADD / EDIT
  const [formOpen, setFormOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  // STATUS TOGGLE
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusChanging, setStatusChanging] = useState(false);
  // SELECTION / DELETE
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const departmentsPerPage = 8;
  // LOAD DEPARTMENTS
  const loadDepartments = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const data = await getDepartments();
      setDepartments(data);
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
  // INITIAL LOAD
  useEffect(() => {
    void loadDepartments();
  }, []);
  // RESET PAGINATION WHEN SEARCH / FILTER CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);
  // FILTER DEPARTMENTS
  const filteredDepartments = useMemo(() => {
    const searchText = search.toLowerCase().trim();
    return departments.filter((department) => {
      const matchesSearch =
        department.departmentName.toLowerCase().includes(searchText) ||
        department.departmentCode.toLowerCase().includes(searchText);
      const matchesStatus = statusFilter === "ALL" || department.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [departments, search, statusFilter]);
  // PAGINATION
  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);
  const startIndex = (currentPage - 1) * departmentsPerPage;
  const paginatedDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + departmentsPerPage,
  );
  // VIEW DETAILS
  const handleViewDetails = async (departmentId: string) => {
    try {
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
    }
  };
  // STATUS TOGGLE - OPEN CONFIRMATION
  const handleStatusToggleRequest = () => {
    if (!selectedDepartment || statusChanging) {
      return;
    }
    setStatusDialogOpen(true);
  };
  // STATUS TOGGLE - CONFIRM
  const handleConfirmStatusChange = async () => {
    if (!selectedDepartment || statusChanging) {
      return;
    }
    const departmentId = selectedDepartment._id;
    const currentStatus = selectedDepartment.status;
    const newStatus: "ACTIVE" | "INACTIVE" = currentStatus === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    try {
      setStatusChanging(true);
      /* We reuse the existing production PATCH endpoint. ACTIVE -> INACTIVE INACTIVE -> ACTIVE */
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
      setStatusDialogOpen(false); // Close confirmation dialog
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
  // ADD DEPARTMENT
  const handleAddDepartment = () => {
    setEditDepartment(null);
    setFormOpen(true);
  };
  // EDIT DEPARTMENT
  const handleEditDepartment = () => {
    if (!selectedDepartment) {
      return;
    }
    setSelectedDepartment(null);
    setEditDepartment(selectedDepartment);
    setFormOpen(true);
  };
  // FORM SUCCESS
  const handleFormSuccess = async () => {
    setFormOpen(false);
    setEditDepartment(null);
    await loadDepartments();
  };
  // FORM CANCEL
  const handleFormCancel = () => {
    setFormOpen(false);
    setEditDepartment(null);
  };
  // SELECTION
  const handleToggleSelection = (departmentId: string) => {
    setSelectedDepartmentIds((current) => {
      if (current.includes(departmentId)) {
        return current.filter((id) => id !== departmentId);
      }
      return [...current, departmentId];
    });
  };
  const handleSelectAll = () => {
    if (
      filteredDepartments.length > 0 &&
      selectedDepartmentIds.length === filteredDepartments.length
    ) {
      setSelectedDepartmentIds([]);
      return;
    }
    setSelectedDepartmentIds(filteredDepartments.map((department) => department._id));
  };
  const handleCancelSelection = () => {
    setSelectionMode(false);
    setSelectedDepartmentIds([]);
    setDeleteError("");
  };
  // DELETE SELECTED
  const handleDeleteSelected = async () => {
    if (selectedDepartmentIds.length === 0) {
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
  // CLEAR SEARC
  const handleClearSearch = () => {
    setSearch("");
  };
  // RENDER
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Departments</h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Manage hospital departments and their operational status.
        </p>
      </div>
      {/* =====================================================
          SEARCH / FILTER / ACTIONS
      ====================================================== */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* SEARCH + FILTER */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* SEARCH */}
          <div className="relative w-full sm:w-[360px]">
            <Search
              className="
                pointer-events-none
                absolute left-3 top-1/2
                h-4 w-4
                -translate-y-1/2
                text-muted-foreground
              "
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search departments..."
              className="h-10 pl-9 pr-9"
              aria-label="Search departments"
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
                  transition-colors
                  hover:bg-muted
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
          {/* STATUS FILTER */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "ALL" | "ACTIVE" | "INACTIVE")}
          >
            <SelectTrigger className="h-10 w-full sm:w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>

              <SelectItem value="ACTIVE">Active</SelectItem>

              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          {selectionMode && (
            <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1 shadow-sm">
              <span className="px-3 text-sm font-medium text-muted-foreground">
                {selectedDepartmentIds.length} selected
              </span>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                disabled={filteredDepartments.length === 0}
                className="h-8"
              >
                {selectedDepartmentIds.length === filteredDepartments.length
                  ? "Clear all"
                  : "Select all"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                size="sm"
                disabled={selectedDepartmentIds.length === 0 || deleting}
                onClick={() => {
                  setDeleteError("");
                  setDeleteDialogOpen(true);
                }}
                className="h-8"
              >
                Delete
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCancelSelection}
                disabled={deleting}
                className="h-8"
              >
                Cancel
              </Button>
            </div>
          )}
          {!selectionMode && (
            <Button type="button" variant="outline" onClick={() => setSelectionMode(true)}>
              Select
            </Button>
          )}
          <Button type="button" onClick={handleAddDepartment} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>
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
          DEPARTMENT DETAILS DIALOG
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
              {/* HEADER */}
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
              {/* BODY */}
              <div className="space-y-5 px-6 py-5">
                {/* STATUS CONTROL */}
                <div className="rounded-xl border bg-card p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    {/* STATUS DESCRIPTION */}
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
                      >
                        <ToggleLeft className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Department Status</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Control whether this department is active.
                        </p>
                      </div>
                    </div>
                    {/* TOGGLE */}
                    <button
                      type="button"
                      role="switch"
                      aria-checked={selectedDepartment.status === "ACTIVE"}
                      aria-label={
                        selectedDepartment.status === "ACTIVE"
                          ? "Deactivate department"
                          : "Activate department"
                      }
                      disabled={statusChanging}
                      onClick={handleStatusToggleRequest}
                      className={`
                        relative inline-flex
                        h-7 w-12 shrink-0
                        items-center
                        rounded-full
                        border-2 border-transparent
                        transition-all duration-200
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-primary
                        focus-visible:ring-offset-2
                        disabled:cursor-not-allowed
                        disabled:opacity-60
                        ${
                          selectedDepartment.status === "ACTIVE"
                            ? "cursor-pointer bg-green-600"
                            : "cursor-pointer bg-muted-foreground/30"
                        }
                      `}
                    >
                      <span
                        className={`
                          pointer-events-none
                          block h-5 w-5
                          rounded-full
                          bg-white
                          shadow-sm
                          transition-transform duration-200
                          ${
                            selectedDepartment.status === "ACTIVE"
                              ? "translate-x-5"
                              : "translate-x-0"
                          }
                        `}
                      />
                    </button>
                  </div>
                  {/* STATUS LABEL */}
                  <div className="mt-3 flex items-center justify-between border-t pt-3">
                    <span className="text-xs text-muted-foreground">Current status</span>
                    <span
                      className={`
                        inline-flex
                        items-center gap-1.5
                        rounded-full
                        px-2.5 py-1
                        text-xs font-semibold
                        ${
                          selectedDepartment.status === "ACTIVE"
                            ? "bg-green-100 text-green-700"
                            : "bg-muted text-muted-foreground"
                        }
                      `}
                    >
                      <span
                        className={`
                          h-1.5 w-1.5 rounded-full
                          ${
                            selectedDepartment.status === "ACTIVE"
                              ? "bg-green-600"
                              : "bg-muted-foreground"
                          }
                        `}
                      />
                      {selectedDepartment.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
                {/* CREATED / UPDATED */}
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
              {/* FOOTER */}
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
                  <Edit3 className="h-4 w-4" />
                  Edit Department
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================
          STATUS CONFIRMATION DIALOG
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
                <div className="flex items-start gap-3">
                  <div
                    className={`
                      flex h-10 w-10 shrink-0
                      items-center justify-center
                      rounded-full
                      ${
                        selectedDepartment.status === "ACTIVE"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }
                    `}
                  >
                    {selectedDepartment.status === "ACTIVE" ? (
                      <ToggleLeft className="h-5 w-5" />
                    ) : (
                      <Check className="h-5 w-5" />
                    )}
                  </div>

                  <div>
                    <DialogTitle>
                      {selectedDepartment.status === "ACTIVE"
                        ? "Deactivate Department?"
                        : "Activate Department?"}
                    </DialogTitle>
                    <DialogDescription className="mt-2">
                      You are about to{" "}
                      {selectedDepartment.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
                      <span className="font-medium text-foreground">
                        {selectedDepartment.departmentName}
                      </span>
                      .{" "}
                    </DialogDescription>
                  </div>
                </div>
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
                <p
                  className={`
                    text-sm
                    ${selectedDepartment.status === "ACTIVE" ? "text-amber-800" : "text-green-800"}
                  `}
                >
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
                  className="min-w-[120px]"
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
          DELETE CONFIRMATION DIALOG
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
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-medium text-red-800">
                Are you sure you want to delete {selectedDepartmentIds.length} department
                {selectedDepartmentIds.length !== 1 ? "s" : ""}?
              </p>
              <p className="mt-1 text-sm text-red-700">
                This action will deactivate the selected department
                {selectedDepartmentIds.length !== 1 ? "s" : ""} from the department list.
              </p>
            </div>
            {deleteError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
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
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Yes, Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* =====================================================
          DEPARTMENT CONTENT
      ====================================================== */}
      {loading ? (
        <DepartmentLoadingState />
      ) : loadError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-10 text-center">
          <div className="mx-auto max-w-md">
            <h3 className="text-sm font-semibold text-red-800">Unable to load departments</h3>
            <p className="mt-2 text-sm text-red-700">{loadError}</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() => {
                void loadDepartments();
              }}
            >
              Retry
            </Button>
          </div>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <DepartmentEmptyState
          hasFilters={!!search || statusFilter !== "ALL"}
          onClearFilters={() => {
            setSearch("");
            setStatusFilter("ALL");
          }}
          onAddDepartment={handleAddDepartment}
        />
      ) : (
        <>
          {/* CARDS */}
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
                pt-2
                sm:flex-row
              "
            >
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}–
                {Math.min(startIndex + departmentsPerPage, filteredDepartments.length)} of{" "}
                {filteredDepartments.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => page - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
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
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
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
}
function DepartmentCard({
  department,
  selectionMode,
  selected,
  onSelect,
  onViewDetails,
}: DepartmentCardProps) {
  const isActive = department.status === "ACTIVE";
  return (
    <div
      className={`
        group relative overflow-hidden
        rounded-2xl border
        bg-card
        shadow-sm
        transition-all duration-200
        hover:-translate-y-0.5
        hover:shadow-lg
        ${selected ? "ring-2 ring-primary ring-offset-2" : ""}
      `}
    >
      {/* TOP STATUS ACCENT */}
      <div
        className={`
          h-1 w-full
          ${isActive ? "bg-green-500" : "bg-muted-foreground/30"}
        `}
      />
      {/* CARD HEADER */}
      <div className="flex items-start justify-between gap-3 p-5 pb-3">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex h-11 w-11 shrink-0
              items-center justify-center
              rounded-xl
              bg-primary/10
              text-primary
              transition-transform
              duration-200
              group-hover:scale-105
            "
          >
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="truncate font-semibold">{department.departmentName}</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">{department.departmentCode}</p>
          </div>
        </div>
        {selectionMode && (
          <input
            type="checkbox"
            checked={selected}
            onChange={onSelect}
            className="
              mt-1 h-4 w-4
              cursor-pointer
              accent-primary
            "
            aria-label={`Select ${department.departmentName}`}
          />
        )}
      </div>
      {/* STATUS */}
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
          />

          {isActive ? "Active" : "Inactive"}
        </span>
      </div>
      {/* CARD INFORMATION */}
      <div className="grid grid-cols-2 gap-4 p-5">
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
      {/* CARD FOOTER */}
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
        >
          View details
          <span className="transition-transform duration-200 group-hover:translate-x-1">→</span>
        </Button>
      </div>
    </div>
  );
} //Detail item component
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
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 text-sm font-medium">{value}</p>
    </div>
  );
} //MINI DETAIL
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
    <div className="min-w-0">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </div>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
//LOADING STATE
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
        <div
          key={index}
          className="
              overflow-hidden
              rounded-2xl
              border
              bg-card
            "
        >
          <div className="h-1 bg-muted" />
          <div className="animate-pulse p-5">
            <div className="flex gap-3">
              <div className="h-11 w-11 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
            <div className="mt-5 h-5 w-16 rounded-full bg-muted" />
            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="h-8 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
              <div className="h-8 rounded bg-muted" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
//EMPTY STATE
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
    <div className="rounded-2xl border border-dashed p-12 text-center">
      <div
        className="
          mx-auto flex h-14 w-14
          items-center justify-center
          rounded-2xl
          bg-primary/10
          text-primary
        "
      >
        <Building2 className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-semibold">No departments found</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "No departments match your current search or status filter."
          : "Create your first department to start managing your hospital departments."}
      </p>
      <div className="mt-5 flex justify-center gap-2">
        {hasFilters && (
          <Button type="button" variant="outline" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
        {!hasFilters && (
          <Button type="button" onClick={onAddDepartment} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        )}
      </div>
    </div>
  );
}
//DATE HELPERS
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
//AXIOS ERROR HELPER
function errorHasResponse(error: unknown): boolean {
  const axiosError = error as {
    response?: unknown;
  };
  return !!axiosError.response;
}
