import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  BriefcaseBusiness,
  FileText,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { PageContainer } from "@/components/common/PageContainer";
import { KpiCard } from "@/components/common/KpiCard/KpiCard";
import { DataTable, type DataTableColumn } from "@/components/common/DataTable";
import { SearchInput } from "@/components/common/SearchInput";
import { RefreshButton } from "@/components/common/RefreshButton";
import { FormDialog } from "@/components/common/FormDialog";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createRole, deleteRole, getRoles, updateRole } from "./role.service";
import type {
  Role,
  RoleListQuery,
  RoleStatus,
  CreateRoleRequest,
  UpdateRoleRequest,
} from "./role.types";
import { RoleForm } from "./RoleForm";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

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

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function StatusBadge({ status }: { status: RoleStatus }) {
  const active = status === "ACTIVE";

  return (
    <Badge
      variant="outline"
      className={
        active
          ? "border-emerald-300 bg-emerald-50 text-emerald-700"
          : "border-rose-300 bg-rose-50 text-rose-700"
      }
    >
      {active ? "Active" : "Inactive"}
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

  const [formOpen, setFormOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Role | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  // DataTableColumn.header must be a string in the existing shared component.
  const renderSortHeader = (label: string, field: SortableField): string => {
    if (sortBy !== field) return `${label} ↕`;
    return `${label} ${sortOrder === "asc" ? "↑" : "↓"}`;
  };

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

  const openDeleteDialog = (role: Role) => {
    setDeleteTarget(role);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);

    try {
      await deleteRole(deleteTarget._id);
      toast.success("Role deleted successfully.");

      setDeleteDialogOpen(false);
      setDeleteTarget(null);

      // If the last row on a page was removed, go back one page.
      if (roles.length === 1 && currentPage > 1) {
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

  const columns: DataTableColumn<Role>[] = [
    {
      key: "number",
      header: "#",
      render: (role) => {
        const index = roles.findIndex((item) => item._id === role._id);
        return (currentPage - 1) * pageSize + index + 1;
      },
    },
    {
      key: "roleId",
      header: renderSortHeader("Role ID", "roleId"),
      render: (role) => <span className="font-medium">{role.roleId}</span>,
    },
    {
      key: "roleName",
      header: renderSortHeader("Role Name", "roleName"),
      render: (role) => (
        <div className="min-w-[150px]">
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
      render: (role) => <StatusBadge status={role.status} />,
    },
    {
      key: "createdAt",
      header: renderSortHeader("Created Date", "createdAt"),
      render: (role) => formatDate(role.createdAt),
    },
    {
      key: "actions",
      header: "Actions",
      headerClassName: "text-center",
      cellClassName: "text-center",
      render: (role) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(role)}
            aria-label={`Edit ${role.roleName}`}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive"
            onClick={() => openDeleteDialog(role)}
            aria-label={`Delete ${role.roleName}`}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const clearSearch = () => setSearch("");

  return (
    <PageContainer>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <Button type="button" onClick={handleAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Role
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <KpiCard
          title="Matching Roles"
          value={pagination.totalRecords}
          description="Records matching the current search and filters"
          icon={FileText}
          className="border-sky-200 bg-sky-50/60"
          iconClassName="bg-sky-100 text-sky-600"
        />

        <KpiCard
          title="Current Page"
          value={pagination.totalPages === 0 ? 0 : currentPage}
          description={`Page ${currentPage} of ${pagination.totalPages} · ${roles.length} records loaded`}
          icon={BriefcaseBusiness}
          className="border-violet-200 bg-violet-50/60"
          iconClassName="bg-violet-100 text-violet-600"
        />
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-background shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold">Role List</h2>
            <p className="text-sm text-muted-foreground">
              Total Records: {pagination.totalRecords}
            </p>
          </div>
          <RefreshButton onRefresh={() => void loadRoles()} loading={loading} />
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              value={search}
              onChange={setSearch}
              onClear={clearSearch}
              placeholder="Search role ID, name, or department category..."
              containerClassName="sm:max-w-md"
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
                  <SelectItem value="ALL">All statuses</SelectItem>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>

              {statusFilter !== "ALL" && (
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

        <div className="px-5">
          <DataTable
            columns={columns}
            data={roles}
            getRowKey={(role) => role._id}
            loading={loading}
            emptyMessage={
              loadError
                ? "Unable to load roles."
                : debouncedSearch || statusFilter !== "ALL"
                  ? "No roles match the current search or filters."
                  : "No role records found."
            }
          />
        </div>

        {!loading && pagination.totalRecords > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–
                {(currentPage - 1) * pageSize + roles.length} of {pagination.totalRecords}
              </span>

              <Select
                value={String(pageSize)}
                onValueChange={(value) => setPageSize(Number(value))}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size} / page
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || currentPage <= 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                Previous
              </Button>

              <span className="min-w-[100px] text-center text-sm">
                Page {currentPage} of {pagination.totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading || currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((page) => Math.min(pagination.totalPages, page + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </section>

      {loadError && !loading && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
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

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={(open) => {
          if (!deleting) setDeleteDialogOpen(open);
        }}
        title="Delete Role?"
        description={`Are you sure you want to delete "${deleteTarget?.roleName ?? "this role"}"? This will soft-delete the record and remove it from the active role list.`}
        confirmText={deleting ? "Deleting..." : "Delete"}
        cancelText="Cancel"
        onConfirm={() => void handleDelete()}
        destructive
        loading={deleting}
      />
    </PageContainer>
  );
}
