import type { ReactNode } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export type DataTableColumn<T> = {
  key: string;
  header: string;

  /**
   * Optional custom renderer for the column value.
   */
  render?: (row: T) => ReactNode;

  /**
   * Optional Tailwind classes for the table header cell.
   */
  headerClassName?: string;

  /**
   * Optional Tailwind classes for the table body cell.
   */
  cellClassName?: string;
};

type DataTableProps<T> = {
  columns: DataTableColumn<T>[];
  data: T[];
  getRowKey: (row: T) => string;
  loading?: boolean;
  emptyMessage?: string;
};

export function DataTable<T>({
  columns,
  data,
  getRowKey,
  loading = false,
  emptyMessage = "No records found.",
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <Table className="border-collapse">
        {/* TABLE HEADER */}
        <TableHeader>
          <TableRow className="border-b border-slate-300 bg-muted/30 hover:bg-muted/30">
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`border-r border-slate-200 last:border-r-0 ${column.headerClassName ?? ""}`}
              >
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* TABLE BODY */}
        <TableBody>
          {loading ? (
            <TableRow className="border-b border-slate-200">
              <TableCell colSpan={columns.length} className="h-24 border-r-0 text-center">
                Loading...
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow className="border-b border-slate-200">
              <TableCell colSpan={columns.length} className="h-24 border-r-0 text-center">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row) => (
              <TableRow key={getRowKey(row)} className="border-b border-slate-200 last:border-b-0">
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`border-r border-slate-200 last:border-r-0 ${column.cellClassName ?? ""}`}
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
