"use client";

import { Suspense, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
}

interface DynamicDataTableProps<T> {
  columns: Column[];
  data: T[] | undefined;
  isLoading?: boolean;
  emptyMessage?: string;
  renderCell: (item: T, columnKey: string) => React.ReactNode;
}

// Static table header that renders immediately
export function DataTableHeader({ columns }: { columns: Column[] }) {
  return (
    <TableHeader>
      <TableRow>
        {columns.map((column) => (
          <TableHead key={column.key} className="font-semibold">
            {column.label}
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}

// Dynamic table body that loads after data is available
export function DataTableBody<T>({
  columns,
  data,
  renderCell,
  emptyMessage = "No data available",
}: {
  columns: Column[];
  data: T[] | undefined;
  renderCell: (item: T, columnKey: string) => React.ReactNode;
  emptyMessage?: string;
}) {
  if (!data || data.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell
            colSpan={columns.length}
            className="text-center py-8 text-muted-foreground"
          >
            {emptyMessage}
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {data.map((item, index) => (
        <TableRow key={index}>
          {columns.map((column) => (
            <TableCell key={column.key}>
              {renderCell(item, column.key)}
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

// Loading skeleton for table body
export function DataTableSkeleton({
  columns,
  rows = 5,
}: {
  columns: Column[];
  rows?: number;
}) {
  return (
    <TableBody>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {columns.map((column) => (
            <TableCell key={column.key}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </TableBody>
  );
}

// Main PPR-optimized data table component
export function DynamicDataTable<T>({
  columns,
  data,
  isLoading = false,
  emptyMessage,
  renderCell,
}: DynamicDataTableProps<T>) {
  return (
    <div className="rounded-md border">
      <Table>
        {/* Static header renders immediately */}
        <DataTableHeader columns={columns} />

        {/* Dynamic body loads after */}
        <Suspense fallback={<DataTableSkeleton columns={columns} />}>
          {isLoading ? (
            <DataTableSkeleton columns={columns} />
          ) : (
            <DataTableBody
              columns={columns}
              data={data}
              renderCell={renderCell}
              emptyMessage={emptyMessage}
            />
          )}
        </Suspense>
      </Table>
    </div>
  );
}
