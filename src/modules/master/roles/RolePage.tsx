import { useCallback, useEffect, useRef, useState } from "react";
import {
  Activity,
  BriefcaseBusiness,
  ChevronDown,
  Download,
  Edit,
  FileText,
  Plus,
  Printer,
  Trash2,
  X,
  FileDown,
} from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import { DataTablePageSize } from "@/components/common/DataTable/DataTablePageSize";
import { DataTablePagination } from "@/components/common/DataTable/DataTablePagination";
import { downloadTablePDF } from "@/components/common/pdfExport";
import { PageContainer } from "@/components/common/PageContainer";
import { KpiCard } from "@/components/common/KpiCard/KpiCard";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { DataTableSkeleton } from "@/components/common/DataTable/DataTableSkeleton";
import { SearchInput } from "@/components/common/SearchInput";
import { RefreshButton } from "@/components/common/RefreshButton";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import { createRole, deleteRole, getRoles, updateRole } from "./role.service";
import type {
  Role,
  RoleListQuery,
  RoleStatus,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "./role.types";
import { RoleForm } from "./RoleForm";

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

    if (response?.data?.message) return response.data.message;
    if (response?.data?.errors?.length) return response.data.errors.join(", ");
  }

  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
};

const formatDate = (value?: string | null): string => {
  if (!value) return "-";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
};

function StatusBadge({ status }: { status: RoleStatus }) {
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

type SortableField = NonNullable<RoleListQuery["sortBy"]>;

export default function RolePage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | RoleStatus>("ALL");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortableField>("roleName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleteMode, setDeleteMode] = useState<"SINGLE" | "BULK">("SINGLE");
  const [deleting, setDeleting] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusRole, setStatusRole] = useState<Role | null>(null);
  const [statusChanging, setStatusChanging] = useState(false);

  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const loadRoles = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setLoadError("");

    const params: RoleListQuery = {
      page: currentPage,
      limit: pageSize,
      search: debouncedSearch || undefined,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      sortBy,
      sortOrder,
    };

    try {
      const response = await getRoles(params);

      if (requestId !== requestIdRef.current) return;

      setRoles(response.data.roles);
      setPagination(response.data.pagination);
      setSelectedRoleIds([]);
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      const message = getApiErrorMessage(error);

      setLoadError(message);
      setRoles([]);
      setPagination({
        currentPage,
        pageSize,
        totalRecords: 0,
        totalPages: 0,
      });

      toast.error(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [currentPage, pageSize, debouncedSearch, statusFilter, sortBy, sortOrder]);

  useEffect(() => {
    void loadRoles();

    return () => {
      requestIdRef.current += 1;
    };
  }, [loadRoles]);

  const handleSort = (field: SortableField) => {
    if (sortBy === field) {
      setSortOrder((previous) => (previous === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }

    setCurrentPage(1);
  };

  // DataTableColumn.header is a string in the existing shared DataTable.
  const renderSortHeader = (label: string, field: SortableField): string => {
    if (sortBy !== field) return `${label} ↕`;
    return `${label} ${sortOrder === "asc" ? "↑" : "↓"}`;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRoleIds((previous) =>
        Array.from(new Set([...previous, ...roles.map((role) => role._id)])),
      );
    } else {
      const currentIds = new Set(roles.map((role) => role._id));
      setSelectedRoleIds((previous) => previous.filter((id) => !currentIds.has(id)));
    }
  };

  const handleSelectRow = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoleIds((previous) =>
        previous.includes(roleId) ? previous : [...previous, roleId],
      );
    } else {
      setSelectedRoleIds((previous) => previous.filter((id) => id !== roleId));
    }
  };

  const allCurrentPageSelected =
    roles.length > 0 && roles.every((role) => selectedRoleIds.includes(role._id));

  const handleAdd = () => {
    setEditingRole(null);
    setFormOpen(true);
  };

  const handleEdit = (role: Role) => {
    setEditingRole(role);
    setFormOpen(true);
  };

  const handleFormSuccess = async (data: CreateRoleRequest | UpdateRoleRequest) => {
    setSaving(true);

    try {
      if (editingRole) {
        await updateRole(editingRole._id, data as UpdateRoleRequest);
        toast.success("Role updated successfully.");
      } else {
        await createRole(data as CreateRoleRequest);
        toast.success("Role created successfully.");
        setCurrentPage(1);
      }

      setFormOpen(false);
      setEditingRole(null);
      await loadRoles();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const openStatusDialog = (role: Role) => {
    setStatusRole(role);
    setStatusDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!statusRole) return;

    setStatusChanging(true);

    const newStatus: RoleStatus = statusRole.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    try {
      await updateRole(statusRole._id, { status: newStatus });

      toast.success(`Role ${newStatus === "ACTIVE" ? "activated" : "deactivated"} successfully.`);

      setStatusDialogOpen(false);
      setStatusRole(null);
      await loadRoles();
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setStatusChanging(false);
    }
  };

  const openDeleteDialog = (role: Role) => {
    setDeleteTarget(role);
    setDeleteMode("SINGLE");
    setDeleteDialogOpen(true);
  };

  const openBulkDeleteDialog = () => {
    if (selectedRoleIds.length === 0) return;

    setDeleteTarget(null);
    setDeleteMode("BULK");
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    const ids = deleteMode === "BULK" ? selectedRoleIds : deleteTarget ? [deleteTarget._id] : [];

    if (ids.length === 0) return;

    setDeleting(true);

    try {
      // Each request is a normal, individually audited soft delete.
      const results = await Promise.allSettled(ids.map((id) => deleteRole(id)));

      const succeeded = results.filter((result) => result.status === "fulfilled").length;
      const failed = results.length - succeeded;

      if (succeeded > 0) {
        toast.success(
          `${succeeded} role ${succeeded === 1 ? "record" : "records"} deleted successfully.`,
        );
      }

      if (failed > 0) {
        toast.error(`${failed} role deletion(s) failed. Refreshing the list.`);
      }

      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setSelectedRoleIds([]);

      if (roles.length === ids.length && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        await loadRoles();
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error));
    } finally {
      setDeleting(false);
    }
  };

  const exportExcel = () => {
    if (roles.length === 0) {
      toast.error("There are no role records on this page to export.");
      return;
    }

    const rows = roles.map((role) => ({
      "Role ID": role.roleId,
      "Role Name": role.roleName,
      "Department Category": role.departmentCategory,
      Description: role.description ?? "",
      Status: role.status,
      "Created By": role.createdBy ?? "",
      "Created Date": formatDate(role.createdAt),
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Roles");

    worksheet["!cols"] = [
      { wch: 20 },
      { wch: 25 },
      { wch: 25 },
      { wch: 40 },
      { wch: 14 },
      { wch: 25 },
      { wch: 18 },
    ];

    XLSX.writeFile(workbook, "role-report.xlsx");
    toast.success("Role Excel file exported successfully.");
  };
  const exportPDF = () => {
    if (roles.length === 0) {
      toast.error("No role records available to download.");
      return;
    }

    try {
      downloadTablePDF<Role>({
        title: "Role Management Report",
        fileName: "role-report",
        orientation: "landscape",

        columns: [
          {
            header: "Sr. No.",
            value: (role) => {
              const index = roles.findIndex((item) => item._id === role._id);

              return (currentPage - 1) * pageSize + index + 1;
            },
          },
          {
            header: "Role ID",
            value: (role) => role.roleId,
          },
          {
            header: "Role Name",
            value: (role) => role.roleName,
          },
          {
            header: "Department Category",
            value: (role) => role.departmentCategory,
          },
          {
            header: "Status",
            value: (role) => role.status,
          },
          {
            header: "Created By",
            value: (role) => role.createdBy ?? "-",
          },
          {
            header: "Created Date",
            value: (role) => formatDate(role.createdAt),
          },
        ],

        rows: roles,
      });

      toast.success("Role PDF downloaded successfully.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to generate PDF.");
    }
  };
  const printReport = () => {
    window.print();
  };

  const columns: DataTableColumn<Role>[] = [
    {
      key: "select",
      header: "",
      headerClassName: "print:hidden",
      cellClassName: "print:hidden",
      render: (role) => (
        <Checkbox
          checked={selectedRoleIds.includes(role._id)}
          onCheckedChange={(checked) => handleSelectRow(role._id, checked === true)}
          aria-label={`Select ${role.roleName}`}
        />
      ),
    },
    {
      key: "number",
      header: "S.No.",
      render: (role) => {
        const index = roles.findIndex((item) => item._id === role._id);
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      key: "roleId",
      header: renderSortHeader("Role ID", "roleId"),
      render: (role) => <span className="whitespace-nowrap font-medium">{role.roleId}</span>,
    },
    {
      key: "roleName",
      header: renderSortHeader("Role Name", "roleName"),
      render: (role) => (
        <div className="min-w-[160px]">
          <p className="font-medium">{role.roleName}</p>
          {role.description && (
            <p className="mt-1 max-w-xs truncate text-xs text-muted-foreground">
              {role.description}
            </p>
          )}
        </div>
      ),
    },
    {
      key: "departmentCategory",
      header: renderSortHeader("Department Category", "departmentCategory"),
      render: (role) => role.departmentCategory || "-",
    },
    {
      key: "status",
      header: renderSortHeader("Status", "status"),
      render: (role) => (
        <button
          type="button"
          className="cursor-pointer"
          title="Change role status"
          onClick={() => openStatusDialog(role)}
        >
          <StatusBadge status={role.status} />
        </button>
      ),
    },
    {
      key: "createdBy",
      header: "Created By",
      render: (role) => role.createdBy || "-",
    },
    {
      key: "createdAt",
      header: renderSortHeader("Created Date", "createdAt"),
      render: (role) => <span className="whitespace-nowrap">{formatDate(role.createdAt)}</span>,
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center print:hidden",
      cellClassName: "text-center print:hidden",
      render: (role) => (
        <div className="flex items-center justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 gap-1 px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label={`Actions for ${role.roleName}`}
              >
                Actions
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handleEdit(role)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => openStatusDialog(role)}>
                <Activity className="mr-2 h-4 w-4" />
                {role.status === "ACTIVE" ? "Deactivate" : "Activate"}
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() => openDeleteDialog(role)}
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

  const hasActiveFilters = statusFilter !== "ALL";

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Role Management</h1>
            <p className="text-sm text-muted-foreground">
              Manage hospital roles and their department categories.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 role-no-print">
        <KpiCard
          title="Total Roles"
          value={pagination.totalRecords}
          description="Total records matching current filters"
          icon={FileText}
          className="border-sky-200 bg-sky-50/60"
          iconClassName="bg-sky-100 text-sky-600"
        />

        <KpiCard
          title="Active"
          value={roles.filter((role) => role.status === "ACTIVE").length}
          description="Active roles on this page"
          icon={Activity}
          className="border-emerald-200 bg-emerald-50/60"
          iconClassName="bg-emerald-100 text-emerald-600"
        />

        <KpiCard
          title="Inactive"
          value={roles.filter((role) => role.status === "INACTIVE").length}
          description="Inactive roles on this page"
          icon={X}
          className="border-rose-200 bg-rose-50/60"
          iconClassName="bg-rose-100 text-rose-600"
        />

        <KpiCard
          title="Current Page"
          value={currentPage}
          description={`Page ${currentPage} of ${pagination.totalPages}`}
          icon={BriefcaseBusiness}
          className="border-violet-200 bg-violet-50/60"
          iconClassName="bg-violet-100 text-violet-600"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-background shadow-sm print:border-0 print:shadow-none">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between print:hidden">
          <div>
            <h2 className="text-lg font-semibold">Role List</h2>
            <p className="text-sm text-muted-foreground">
              Total Records: {pagination.totalRecords}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {selectedRoleIds.length > 0 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={openBulkDeleteDialog}
                disabled={deleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Selected ({selectedRoleIds.length})
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
              disabled={loading || roles.length === 0}
              title="Download Role Report as PDF"
            >
              <FileDown className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={printReport}>
              <Printer className="mr-2 h-4 w-4" />
              Print Report
            </Button>

            <RefreshButton onRefresh={() => void loadRoles()} loading={loading} />

            <Button type="button" size="sm" onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Role
            </Button>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-4 print:hidden">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              onClear={() => setSearch("")}
              placeholder="Search role ID, name, department category..."
              containerClassName="lg:max-w-md"
            />

            <div className="flex items-center gap-2">
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as "ALL" | RoleStatus)}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  title="Clear status filter"
                  aria-label="Clear status filter"
                  onClick={() => setStatusFilter("ALL")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {!loading && roles.length > 0 && (
          <div className="flex items-center gap-2 border-b border-slate-200 px-5 py-3 ">
            <Checkbox
              checked={allCurrentPageSelected}
              onCheckedChange={(checked) => handleSelectAll(checked === true)}
              aria-label="Select all roles on this page"
            />
            <span className="text-sm text-muted-foreground">Select all on this page</span>
          </div>
        )}

        <div className="px-5 print:px-0">
          {loading ? (
            <DataTableSkeleton
              rows={pageSize > 10 ? 10 : pageSize}
              columns={8}
              statCards={0}
              showHeader={false}
              showTabs={false}
              showToolbar={false}
            />
          ) : (
            <DataTable
              columns={columns}
              data={roles}
              getRowKey={(role) => role._id}
              loading={false}
              emptyMessage={
                loadError
                  ? "Unable to load roles."
                  : debouncedSearch || statusFilter !== "ALL"
                    ? "No roles match the current search or filters."
                    : "No role records found."
              }
            />
          )}
        </div>

        {!loading && pagination.totalRecords > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between role-no-print">
            <div className="flex items-center gap-4">
              <DataTablePageSize
                value={pageSize}
                onChange={setPageSize}
                options={[10, 25, 50, 100]}
              />
            </div>

            <DataTablePagination
              currentPage={currentPage}
              totalPages={pagination.totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </section>

      {loadError && !loading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center print:hidden">
          <p className="font-medium text-destructive">Unable to load roles</p>
          <p className="mt-1 text-sm text-muted-foreground">{loadError}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => void loadRoles()}>
            Retry
          </Button>
        </div>
      )}

      <FormDialog
        open={formOpen}
        onOpenChange={(open) => {
          if (!saving) {
            setFormOpen(open);
            if (!open) setEditingRole(null);
          }
        }}
        title={editingRole ? "Edit Role" : "Add New Role"}
        description={
          editingRole ? "Update the role master record." : "Enter the details to create a new role."
        }
      >
        <RoleForm
          role={editingRole}
          saving={saving}
          onSubmit={handleFormSuccess}
          onCancel={() => {
            if (!saving) {
              setFormOpen(false);
              setEditingRole(null);
            }
          }}
        />
      </FormDialog>

      <Dialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!statusChanging) setStatusDialogOpen(open);
        }}
      >
        <DialogContent className="max-w-md">
          {statusRole && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {statusRole.status === "ACTIVE" ? "Deactivate Role?" : "Activate Role?"}
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to{" "}
                  {statusRole.status === "ACTIVE" ? "deactivate" : "activate"}{" "}
                  <span className="font-medium text-foreground">"{statusRole.roleName}"</span>?
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-xl border border-slate-200 bg-muted/20 p-4">
                <p className="text-sm">
                  {statusRole.status === "ACTIVE"
                    ? "This role will be marked inactive."
                    : "This role will be marked active again."}
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
                  variant={statusRole.status === "ACTIVE" ? "destructive" : "default"}
                  onClick={() => void handleStatusChange()}
                  disabled={statusChanging}
                >
                  {statusChanging
                    ? "Updating..."
                    : statusRole.status === "ACTIVE"
                      ? "Deactivate"
                      : "Activate"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) setDeleteDialogOpen(open);
        }}
        title={deleteMode === "BULK" ? `Delete ${selectedRoleIds.length} Roles?` : "Delete Role?"}
        description={
          deleteMode === "BULK"
            ? `Are you sure you want to delete ${selectedRoleIds.length} selected role records? This performs a soft delete.`
            : `Are you sure you want to delete "${deleteTarget?.roleName ?? "this role"}"? This performs a soft delete.`
        }
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleting}
      />
    </PageContainer>
  );
}
