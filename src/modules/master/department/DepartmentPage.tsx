import { useEffect, useState } from "react";
import { Plus, Search, Building2 } from "lucide-react";

import { getDepartments, getDepartmentById } from "./department.service";

import type { Department } from "./department.types";

import DepartmentForm from "./DepartmentForm";
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
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "INACTIVE">("ALL");
  // Add/Edit form dialog
  const [formOpen, setFormOpen] = useState(false);
  const [editDepartment, setEditDepartment] = useState<Department | null>(null);

  // Details dialog
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const loadDepartments = async () => {
    try {
      setLoading(true);

      const data = await getDepartments();

      setDepartments(data);
    } catch (error) {
      console.error("Failed to load departments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDepartments();
  }, []);

  const handleViewDetails = async (departmentId: string) => {
    try {
      const department = await getDepartmentById(departmentId);

      setSelectedDepartment(department);
    } catch (error) {
      console.error("Failed to load department details:", error);
    }
  };

  // ADD
  const handleAddDepartment = () => {
    setEditDepartment(null);
    setFormOpen(true);
  };

  // EDIT
  const handleEditDepartment = () => {
    if (!selectedDepartment) return;

    // Close details popup first
    setSelectedDepartment(null);

    // Open edit form
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

  const filteredDepartments = departments.filter((department) => {
    const searchText = search.toLowerCase().trim();

    const matchesSearch =
      department.departmentName.toLowerCase().includes(searchText) ||
      department.departmentCode.toLowerCase().includes(searchText);

    const matchesStatus = statusFilter === "ALL" || department.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 p-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Departments</h1>

        <p className="text-sm text-muted-foreground">Manage hospital departments.</p>
      </div>

      {/* SEARCH + ADD */}
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:max-w-2xl">
        {/* SEARCH */}
        <div className="relative w-full sm:max-w-md">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4
        -translate-y-1/2 text-muted-foreground"
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

        {/* ADD BUTTON */}
        <Button className="gap-2" onClick={handleAddDepartment}>
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* ============================= */}
      {/* ADD / EDIT DEPARTMENT DIALOG */}
      {/* ============================= */}

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleFormCancel();
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-lg max-h-[90vh] overflow-y-auto rounded-xl">
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

      {/* ============================= */}
      {/* DEPARTMENT DETAILS DIALOG */}
      {/* ============================= */}

      <Dialog
        open={!!selectedDepartment}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedDepartment(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-xl">
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

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Created</span>

                  <span className="text-sm">
                    {new Date(selectedDepartment.createdAt).toLocaleDateString()}
                  </span>
                </div>

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

      {/* ============================= */}
      {/* DEPARTMENT CARDS */}
      {/* ============================= */}

      {loading ? (
        <div className="py-12 text-center text-sm text-muted-foreground">
          Loading departments...
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <Building2 className="mx-auto h-10 w-10 text-muted-foreground" />

          <h3 className="mt-4 text-sm font-semibold">No departments found</h3>

          <p className="mt-1 text-sm text-muted-foreground">
            {search ? "Try changing your search." : "No departments have been created yet."}
          </p>
        </div>
      ) : (
        <div
          className="
            grid grid-cols-1 gap-5
            sm:grid-cols-2
            xl:grid-cols-3
            2xl:grid-cols-4
          "
        >
          {filteredDepartments.map((department) => (
            <div
              key={department._id}
              className="
                group overflow-hidden rounded-xl
                border bg-card transition-shadow
                hover:shadow-md
              "
            >
              {/* IMAGE / HEADER */}
              <div className="flex h-32 items-center justify-center bg-muted">
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
              </div>

              {/* CONTENT */}
              <div className="space-y-3 p-4">
                <div>
                  <h2 className="truncate font-semibold">{department.departmentName}</h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Code: {department.departmentCode}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      department.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {department.status}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleViewDetails(department._id)}
                    className="text-sm text-primary hover:underline"
                  >
                    View details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
