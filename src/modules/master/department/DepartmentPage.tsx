import { useEffect, useState } from "react";
import { Plus, Search, Building2 } from "lucide-react";
import { toast } from "sonner";

import { getDepartments, getDepartmentById, deleteDepartment } from "./department.service";
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

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");

  // Add/Edit form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);

  // Details dialog
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  // Selection / Delete
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDepartmentIds, setSelectedDepartmentIds] = useState<string[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const departmentsPerPage = 8;

  // =============================
  // LOAD DEPARTMENTS
  // =============================

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

      // Network error gets Retry
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

  // =============================
  // LOAD WHEN PAGE OPENS
  // =============================

  useEffect(() => {
    void loadDepartments();
  }, []);

  // =============================
  // RESET PAGINATION
  // =============================

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  // =============================
  // VIEW DEPARTMENT DETAILS
  // =============================

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

  // =============================
  // ADD
  // =============================

  const handleAddDepartment = () => {
    setEditDepartment(null);
    setFormOpen(true);
  };

  // =============================
  // EDIT
  // =============================

  const handleEditDepartment = () => {
    if (!selectedDepartment) {
      return;
    }

    // Close details popup
    setSelectedDepartment(null);

    // Open edit form
    setEditDepartment(selectedDepartment);
    setFormOpen(true);
  };

  // =============================
  // FORM SUCCESS
  // =============================

  const handleFormSuccess = async () => {
    setFormOpen(false);
    setEditDepartment(null);

    await loadDepartments();
  };

  // =============================
  // FORM CANCEL
  // =============================

  const handleFormCancel = () => {
    setFormOpen(false);
    setEditDepartment(null);
  };

  // =============================
  // SELECTION
  // =============================

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

  // =============================
  // DELETE SELECTED DEPARTMENTS
  // =============================

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

      // Network error → Retry
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

      // Other backend errors → show message, no Retry
      toast.error("Unable to delete department.", {
        description: message,
      });
    } finally {
      setDeleting(false);
    }
  };

  // =============================
  // SEARCH + FILTER
  // =============================

  const filteredDepartments = departments.filter((department) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      department.departmentName.toLowerCase().includes(searchText) ||
      department.departmentCode.toLowerCase().includes(searchText);

    const matchesStatus = statusFilter === "ALL" || department.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // =============================
  // PAGINATION
  // =============================

  const totalPages = Math.ceil(filteredDepartments.length / departmentsPerPage);

  const startIndex = (currentPage - 1) * departmentsPerPage;

  const paginatedDepartments = filteredDepartments.slice(
    startIndex,
    startIndex + departmentsPerPage,
  );

  return (
    <div className="space-y-6 p-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Departments</h1>

        <p className="text-sm text-muted-foreground">Manage hospital departments.</p>
      </div>

      {/* SEARCH + FILTER + ADD */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* LEFT CONTROLS */}
        <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          {/* SEARCH */}
          <div className="relative w-full sm:w-[360px]">
            <Search
              className="
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
              className="pl-9"
            />
          </div>

          {/* STATUS FILTER */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as "ALL" | "ACTIVE" | "INACTIVE")}
          >
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>

              <SelectItem value="ACTIVE">Active</SelectItem>

              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* RIGHT ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* SELECTION TOOLBAR */}
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

          {/* SELECT */}
          {!selectionMode && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setSelectionMode(true)}
              className="gap-2"
            >
              Select
            </Button>
          )}

          {/* ADD */}
          <Button type="button" onClick={handleAddDepartment} className="gap-2 shadow-sm">
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        </div>
      </div>

      {/* ADD / EDIT DEPARTMENT DIALOG */}
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

      {/* DEPARTMENT DETAILS DIALOG */}
      <Dialog
        open={!!selectedDepartment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDepartment(null);
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
            <DialogTitle>Department Details</DialogTitle>
          </DialogHeader>

          {selectedDepartment && (
            <div className="space-y-5">
              {/* NAME */}
              <div>
                <h3 className="text-xl font-semibold">{selectedDepartment.departmentName}</h3>

                <p className="mt-1 text-sm text-muted-foreground">
                  Code: {selectedDepartment.departmentCode}
                </p>
              </div>

              {/* DETAILS */}
              <div className="space-y-3 rounded-lg border p-4">
                {/* STATUS */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      selectedDepartment.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {selectedDepartment.status}
                  </span>
                </div>

                {/* CREATED */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>

                  <span className="text-sm">
                    {new Date(selectedDepartment.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {/* UPDATED */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Updated</span>

                  <span className="text-sm">
                    {new Date(selectedDepartment.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* EDIT */}
              <div className="flex justify-end">
                <Button type="button" onClick={handleEditDepartment}>
                  Edit Department
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
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
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
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

            {/* ERROR */}
            {deleteError && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {deleteError}
              </div>
            )}

            {/* ACTIONS */}
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
                {deleting ? "Deleting..." : "Yes, Delete"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* DEPARTMENT CONTENT */}
      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading departments...
        </div>
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
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Building2
            className="
              mx-auto h-10 w-10
              text-muted-foreground
            "
          />

          <h3 className="mt-4 text-sm font-semibold">No departments found</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {search || statusFilter !== "ALL"
              ? "Try changing your search or filter."
              : "No departments have been created yet."}
          </p>
        </div>
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
              <div
                key={department._id}
                className={`
                    group relative overflow-hidden
                    rounded-xl border
                    bg-card
                    transition-shadow
                    hover:shadow-md
                    ${
                      selectionMode && selectedDepartmentIds.includes(department._id)
                        ? "ring-2 ring-primary"
                        : ""
                    }
                  `}
              >
                {/* IMAGE / HEADER */}
                <div
                  className="
                      relative flex h-32
                      items-center
                      justify-center
                      bg-muted
                    "
                >
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedDepartmentIds.includes(department._id)}
                      onChange={() => handleToggleSelection(department._id)}
                      className="
                          absolute left-3 top-3
                          h-5 w-5
                          cursor-pointer
                          accent-primary
                        "
                      aria-label={`Select ${department.departmentName}`}
                    />
                  )}

                  <Building2
                    className="
                        h-12 w-12
                        text-muted-foreground/50
                      "
                  />
                </div>

                {/* CARD CONTENT */}
                <div className="space-y-3 p-4">
                  <div>
                    <h2 className="truncate font-semibold">{department.departmentName}</h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Code: {department.departmentCode}
                    </p>
                  </div>

                  <div className="flex items-center justify-between">
                    {/* STATUS */}
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        department.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {department.status}
                    </span>

                    {/* VIEW DETAILS */}
                    <button
                      type="button"
                      onClick={() => handleViewDetails(department._id)}
                      className="
                          text-sm text-primary
                          hover:underline
                        "
                    >
                      View details
                    </button>
                  </div>
                </div>
              </div>
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
              {/* RESULT COUNT */}
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1}–
                {Math.min(startIndex + departmentsPerPage, filteredDepartments.length)} of{" "}
                {filteredDepartments.length}
              </p>

              {/* PAGINATION BUTTONS */}
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

/**
 * Returns true when Axios received an HTTP response.
 *
 * This lets us distinguish:
 * - Network/server unreachable → Retry
 * - Backend returned 400/403/404/etc. → show backend message
 */
function errorHasResponse(error: unknown): boolean {
  const axiosError = error as {
    response?: unknown;
  };

  return !!axiosError.response;
}
