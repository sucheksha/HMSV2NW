import { useEffect, useState } from "react";
import { Plus, Search, Building2 } from "lucide-react";

import { getDepartments } from "./department.service";
import type { Department } from "./department.types";
import DepartmentForm from "./DepartmentForm";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
export default function DepartmentPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showDepartmentForm, setShowDepartmentForm] = useState(false);
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

  const filteredDepartments = departments.filter((department) => {
    const searchText = search.toLowerCase();

    return (
      department.departmentName.toLowerCase().includes(searchText) ||
      department.departmentCode.toLowerCase().includes(searchText)
    );
  });

  return (
    <div className="space-y-6 p-6">
      {/* PAGE HEADER */}
      <div>
        <h1 className="text-2xl font-semibold">Departments</h1>

        <p className="text-sm text-muted-foreground">Manage hospital departments.</p>
      </div>

      {/* TOP CONTROL BAR */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* SEARCH */}
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search departments..."
            className="pl-9"
          />
        </div>

        {/* ADD DEPARTMENT */}
        <Button className="gap-2" onClick={() => setShowDepartmentForm(true)}>
          <Plus className="h-4 w-4" />
          Add Department
        </Button>
        <Dialog open={showDepartmentForm} onOpenChange={setShowDepartmentForm}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Department</DialogTitle>
            </DialogHeader>

            <DepartmentForm
              onSuccess={() => {
                setShowDepartmentForm(false);
                loadDepartments();
              }}
              onCancel={() => setShowDepartmentForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* DEPARTMENT CARDS */}
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
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredDepartments.map((department) => (
            <div
              key={department._id}
              className="group cursor-pointer overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              {/* CARD HEADER / IMAGE AREA */}
              <div className="flex h-32 items-center justify-center bg-muted">
                <Building2 className="h-12 w-12 text-muted-foreground/50" />
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
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      department.status === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {department.status}
                  </span>

                  <span className="text-xs text-muted-foreground">View details</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
