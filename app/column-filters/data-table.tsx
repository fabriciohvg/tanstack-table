"use no memo";
"use client";

import { useEffect, useState } from "react";
import {
  Column,
  ColumnDef,
  ColumnFiltersState,
  RowData,
  flexRender,
  getCoreRowModel,
  getFacetedMinMaxValues,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { Person } from "./page";

// Extend TanStack Table's ColumnMeta to support filter variants
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: (info) => info.getValue(),
    meta: { filterVariant: "text" },
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: (info) => info.getValue(),
    meta: { filterVariant: "text" },
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: (info) => info.getValue(),
    meta: { filterVariant: "range" },
  },
  {
    accessorKey: "visits",
    header: "Visits",
    cell: (info) => info.getValue(),
    meta: { filterVariant: "range" },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
    meta: { filterVariant: "select" },
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: (info) => {
      const value = info.getValue() as number;
      return (
        <div className="flex items-center gap-2">
          <div className="h-2 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
            <div
              className={`h-full rounded-full ${
                value >= 70
                  ? "bg-green-500"
                  : value >= 30
                    ? "bg-yellow-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${value}%` }}
            />
          </div>
          <span className="text-xs text-zinc-500">{value}%</span>
        </div>
      );
    },
    meta: { filterVariant: "range" },
  },
];

// Debounced input to prevent excessive re-renders during typing
function DebouncedInput({
  value: controlledValue,
  onChange,
  debounce = 300,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = useState(controlledValue);

  // Sync internal state when controlled value changes externally
  useEffect(() => {
    setValue(controlledValue);
  }, [controlledValue]);

  // Only call onChange when user has actually changed the value
  useEffect(() => {
    // Skip if value matches controlled value (no user input yet)
    if (value === controlledValue) return;

    const timeout = setTimeout(() => {
      onChange(value);
    }, debounce);

    return () => clearTimeout(timeout);
  }, [value, controlledValue, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  );
}

// Filter component renders different UIs based on column.columnDef.meta.filterVariant
function Filter({ column }: { column: Column<Person, unknown> }) {
  const filterVariant = column.columnDef.meta?.filterVariant;
  const columnFilterValue = column.getFilterValue();

  // Get sorted unique values for select/text filters (skip for range)
  const sortedUniqueValues =
    filterVariant === "range"
      ? []
      : Array.from(column.getFacetedUniqueValues().keys()).sort();

  const inputClassName =
    "w-full rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";

  // Range filter: two number inputs for min/max
  if (filterVariant === "range") {
    const minMaxValues = column.getFacetedMinMaxValues();
    const min = minMaxValues?.[0];
    const max = minMaxValues?.[1];

    return (
      <div className="mt-1 flex gap-1">
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={(columnFilterValue as [number, number])?.[0] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [value, old?.[1]])
          }
          placeholder={min !== undefined ? `Min (${min})` : "Min"}
          className={`${inputClassName} w-20`}
        />
        <DebouncedInput
          type="number"
          min={min}
          max={max}
          value={(columnFilterValue as [number, number])?.[1] ?? ""}
          onChange={(value) =>
            column.setFilterValue((old: [number, number]) => [old?.[0], value])
          }
          placeholder={max !== undefined ? `Max (${max})` : "Max"}
          className={`${inputClassName} w-20`}
        />
      </div>
    );
  }

  // Select filter: dropdown with unique values
  if (filterVariant === "select") {
    return (
      <select
        value={(columnFilterValue ?? "") as string}
        onChange={(e) => column.setFilterValue(e.target.value)}
        className={`${inputClassName} mt-1`}
      >
        <option value="">All</option>
        {sortedUniqueValues.map((value) => (
          <option key={String(value)} value={String(value)}>
            {String(value)}
          </option>
        ))}
      </select>
    );
  }

  // Text filter (default): input with datalist autocomplete
  return (
    <div className="mt-1">
      <datalist id={`${column.id}-list`}>
        {sortedUniqueValues.map((value) => (
          <option key={String(value)} value={String(value)} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? "") as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search (${column.getFacetedUniqueValues().size})`}
        list={`${column.id}-list`}
        className={inputClassName}
      />
    </div>
  );
}

type DataTableProps = {
  data: Person[];
};

export function DataTable({ data }: DataTableProps) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnFilters,
    },
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFacetedMinMaxValues: getFacetedMinMaxValues(),
  });

  return (
    <div className="space-y-4">
      {/* Clear Filters Button */}
      {columnFilters.length > 0 && (
        <button
          onClick={() => setColumnFilters([])}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Clear All Filters ({columnFilters.length})
        </button>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr
                key={headerGroup.id}
                className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
              >
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
                  >
                    {header.isPlaceholder ? null : (
                      <>
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                        {header.column.getCanFilter() ? (
                          <Filter column={header.column} />
                        ) : null}
                      </>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr
                key={row.id}
                className="border-b border-zinc-200 last:border-0 dark:border-zinc-800"
              >
                {row.getVisibleCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
                  >
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-zinc-600 dark:text-zinc-400">
          {table.getFilteredRowModel().rows.length} of {data.length} rows
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="rounded border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            {"<<"}
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="rounded border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            {"<"}
          </button>
          <span className="text-sm text-zinc-600 dark:text-zinc-400">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="rounded border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            {">"}
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="rounded border border-zinc-300 px-2 py-1 text-sm disabled:opacity-50 dark:border-zinc-700"
          >
            {">>"}
          </button>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="rounded border border-zinc-300 px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            {[10, 20, 50].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Debug: Filter State */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Column Filters State
        </h3>
        <pre className="text-xs text-zinc-600 dark:text-zinc-400">
          {JSON.stringify(
            columnFilters.length > 0 ? columnFilters : "No active filters",
            null,
            2,
          )}
        </pre>
      </div>
    </div>
  );
}
