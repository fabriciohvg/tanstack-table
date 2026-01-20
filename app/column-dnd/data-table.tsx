"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  Cell,
  ColumnDef,
  Header,
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
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

// Draggable table header component
function DraggableTableHeader({ header }: { header: Header<Person, unknown> }) {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: "width transform 0.2s ease-in-out",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <th
      colSpan={header.colSpan}
      ref={setNodeRef}
      style={style}
      className="border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
    >
      <div className="flex items-center gap-2">
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none rounded p-1 text-zinc-400 hover:bg-zinc-200 hover:text-zinc-600 active:cursor-grabbing dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
        >
          ⠿
        </button>
      </div>
    </th>
  );
}

// Cell that moves along with its column during drag
function DragAlongCell({ cell }: { cell: Cell<Person, unknown> }) {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform),
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <td
      style={style}
      ref={setNodeRef}
      className="border-b border-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
    >
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
}

type DataTableProps = {
  data: Person[];
};

export function DataTable({ data }: DataTableProps) {
  // Prevent hydration mismatch - DnD kit generates different IDs on server vs client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const columns = useMemo<ColumnDef<Person>[]>(
    () => [
      {
        accessorKey: "firstName",
        header: "First Name",
        cell: (info) => info.getValue(),
        id: "firstName",
        size: 150,
      },
      {
        accessorKey: "lastName",
        header: "Last Name",
        cell: (info) => info.getValue(),
        id: "lastName",
        size: 150,
      },
      {
        accessorKey: "age",
        header: "Age",
        cell: (info) => info.getValue(),
        id: "age",
        size: 100,
      },
      {
        accessorKey: "visits",
        header: "Visits",
        cell: (info) => info.getValue(),
        id: "visits",
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (info) => info.getValue(),
        id: "status",
        size: 150,
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
        id: "progress",
        size: 180,
      },
    ],
    []
  );

  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id!)
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnOrder,
    },
    onColumnOrderChange: setColumnOrder,
  });

  // Handle drag end - reorder columns
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (active && over && active.id !== over.id) {
      setColumnOrder((columnOrder) => {
        const oldIndex = columnOrder.indexOf(active.id as string);
        const newIndex = columnOrder.indexOf(over.id as string);
        return arrayMove(columnOrder, oldIndex, newIndex);
      });
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  // Static table for SSR (no DnD)
  const staticTable = (
    <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full">
        <thead>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th
                  key={header.id}
                  colSpan={header.colSpan}
                  className="border-b border-zinc-200 bg-zinc-100 px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  <div className="flex items-center gap-2">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    <span className="cursor-grab rounded p-1 text-zinc-400">
                      ⠿
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <td
                  key={cell.id}
                  className="border-b border-zinc-200 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:text-zinc-300"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // DnD-enabled table (client only)
  const dndTable = (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                <SortableContext
                  items={columnOrder}
                  strategy={horizontalListSortingStrategy}
                >
                  {headerGroup.headers.map((header) => (
                    <DraggableTableHeader key={header.id} header={header} />
                  ))}
                </SortableContext>
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <SortableContext
                    key={cell.id}
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    <DragAlongCell cell={cell} />
                  </SortableContext>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DndContext>
  );

  return (
    <div className="space-y-4">
      {isMounted ? dndTable : staticTable}

      {/* Debug: Current Column Order */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Column Order State
        </h3>
        <pre className="text-xs text-zinc-600 dark:text-zinc-400">
          {JSON.stringify(columnOrder, null, 2)}
        </pre>
      </div>
    </div>
  );
}
