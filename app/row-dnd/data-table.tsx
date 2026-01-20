"use no memo";
"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  Row,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  type UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Person } from "./page";

// Drag handle cell - provides the grab target for each row
function RowDragHandleCell({ rowId }: { rowId: string }) {
  const { attributes, listeners } = useSortable({ id: rowId });

  return (
    <button
      {...attributes}
      {...listeners}
      className="cursor-grab touch-none rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 active:cursor-grabbing dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
    >
      ⠿
    </button>
  );
}

// Draggable row component - wraps each <tr> with sortable behavior
function DraggableRow({ row }: { row: Row<Person> }) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.userId,
  });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1 : 0,
    position: "relative",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`border-b border-zinc-200 last:border-0 dark:border-zinc-800 ${
        isDragging ? "bg-zinc-100 dark:bg-zinc-800" : ""
      }`}
    >
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
          style={{ width: cell.column.getSize() }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

// Static row for SSR (no DnD)
function StaticRow({ row }: { row: Row<Person> }) {
  return (
    <tr className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
          style={{ width: cell.column.getSize() }}
        >
          {flexRender(cell.column.columnDef.cell, cell.getContext())}
        </td>
      ))}
    </tr>
  );
}

type DataTableProps = {
  initialData: Person[];
};

export function DataTable({ initialData }: DataTableProps) {
  // Prevent hydration mismatch - DnD kit generates different IDs on server vs client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Data state - we modify this when rows are reordered
  const [data, setData] = useState(initialData);

  // Memoize row IDs for SortableContext
  const dataIds = useMemo<UniqueIdentifier[]>(
    () => data.map((row) => row.userId),
    [data]
  );

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        id: "drag-handle",
        header: "",
        cell: ({ row }) => <RowDragHandleCell rowId={row.original.userId} />,
        size: 50,
      },
      {
        accessorKey: "firstName",
        header: "First Name",
        cell: (info) => info.getValue(),
        size: 120,
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        cell: (info) => info.getValue(),
        size: 120,
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: (info) => info.getValue(),
        size: 80,
      },
      {
        accessorKey: "visits",
        header: "Visits",
        cell: (info) => info.getValue(),
        size: 80,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => info.getValue(),
        size: 140,
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
        size: 150,
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row) => row.userId, // Required: maps rows to their unique IDs
  });

  // Handle drag end - reorder data array
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setData((currentData) => {
        const oldIndex = dataIds.indexOf(active.id);
        const newIndex = dataIds.indexOf(over.id);
        return arrayMove(currentData, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Reset data to initial order
  const resetOrder = () => setData(initialData);

  // Table content (shared between static and DnD versions)
  const tableContent = (
    <>
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
                style={{ width: header.column.getSize() }}
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
    </>
  );

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={resetOrder}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset Order
        </button>
      </div>

      {/* Table */}
      {isMounted ? (
        <DndContext
          collisionDetection={closestCenter}
          modifiers={[restrictToVerticalAxis]}
          onDragEnd={handleDragEnd}
          sensors={sensors}
        >
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full">
              {tableContent}
              <tbody>
                <SortableContext
                  items={dataIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow key={row.id} row={row} />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </DndContext>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full">
            {tableContent}
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <StaticRow key={row.id} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Debug: Current Data Order */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Row Order (userId)
        </h3>
        <pre className="text-xs text-zinc-600 dark:text-zinc-400">
          {JSON.stringify(dataIds, null, 2)}
        </pre>
      </div>
    </div>
  );
}
