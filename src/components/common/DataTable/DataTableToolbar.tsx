import type { ReactNode } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type DataTableToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  primaryAction?: ReactNode;
};

export function DataTableToolbar({
  searchValue = "",
  onSearchChange,
  searchPlaceholder = "Search...",
  primaryAction,
}: DataTableToolbarProps) {
  return (
    <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:max-w-sm">
        <Input
          value={searchValue}
          onChange={(event) => onSearchChange?.(event.target.value)}
          placeholder={searchPlaceholder}
        />
      </div>

      {primaryAction && <div className="flex items-center gap-2">{primaryAction}</div>}
    </div>
  );
}
