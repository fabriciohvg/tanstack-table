"use client";

import { useState } from "react";
import {
  ColumnDef,
  ColumnOrderState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const columns: ColumnDef<Person>[] = [
  {
    accessorKey: "firstName",
    header: "First Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "lastName",
    header: "Last Name",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "age",
    header: "Age",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "visits",
    header: "Visits",
    cell: (info) => info.getValue(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: (info) => info.getValue(),
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
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

type DataTableProps = {
  data: Person[];
};

export function DataTable({ data }: DataTableProps) {
  const [columnVisibility, setColumnVisibility] = useState({});
  const [columnOrder, setColumnOrder] = useState<ColumnOrderState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      columnOrder,
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    getCoreRowModel: getCoreRowModel(),
  });

  const shuffleColumns = () => {
    table.setColumnOrder(
      shuffleArray(table.getAllLeafColumns().map((col) => col.id))
    );
  };

  const resetOrder = () => {
    table.setColumnOrder([]);
  };

  return (
    <div className="space-y-4">
      {/* Column Visibility Controls */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <div className="mb-3 border-b border-zinc-200 pb-2 dark:border-zinc-800">
          <label className="flex items-center gap-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            <input
              type="checkbox"
              checked={table.getIsAllColumnsVisible()}
              onChange={table.getToggleAllColumnsVisibilityHandler()}
              className="h-4 w-4 rounded border-zinc-300"
            />
            Toggle All Columns
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
          {table.getAllLeafColumns().map((column) => (
            <label
              key={column.id}
              className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300"
            >
              <input
                type="checkbox"
                checked={column.getIsVisible()}
                onChange={column.getToggleVisibilityHandler()}
                className="h-4 w-4 rounded border-zinc-300"
              />
              {column.id}
            </label>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={shuffleColumns}
          className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          Shuffle Columns
        </button>
        <button
          onClick={resetOrder}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset Order
        </button>
      </div>

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
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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

      {/* Debug: Current Column Order */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Column Order State
        </h3>
        <pre className="text-xs text-zinc-600 dark:text-zinc-400">
          {JSON.stringify(
            columnOrder.length > 0
              ? columnOrder
              : "Default (empty array = original order)",
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
