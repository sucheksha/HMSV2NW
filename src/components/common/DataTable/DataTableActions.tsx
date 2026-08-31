import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

type DataTableActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  customActions?: ReactNode;
};

export function DataTableActions({
  onView,
  onEdit,
  onDelete,
  customActions,
}: DataTableActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      {onView && (
        <Button type="button" variant="ghost" size="sm" onClick={onView}>
          View
        </Button>
      )}

      {onEdit && (
        <Button type="button" variant="ghost" size="sm" onClick={onEdit}>
          Edit
        </Button>
      )}

      {onDelete && (
        <Button type="button" variant="ghost" size="sm" onClick={onDelete}>
          Delete
        </Button>
      )}

      {customActions}
    </div>
  );
}
