"use no memo";
"use client";

import { CSSProperties, useEffect, useMemo, useState } from "react";
import {
  ColumnDef,
  ExpandedState,
  Row,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
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
import type { WbsItem } from "./page";

// Compute WBS numbers by traversing the data tree
function computeWbsNumbers(items: WbsItem[], prefix = ""): Map<string, string> {
  const map = new Map<string, string>();
  items.forEach((item, index) => {
    const wbs = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
    map.set(item.id, wbs);
    if (item.subRows) {
      const childMap = computeWbsNumbers(item.subRows, wbs);
      childMap.forEach((v, k) => map.set(k, v));
    }
  });
  return map;
}

// Reorder items within the tree at a specific parent level
function reorderInTree(
  items: WbsItem[],
  parentId: string | undefined,
  activeId: string,
  overId: string
): WbsItem[] {
  // If parentId is undefined, reorder at root level
  if (parentId === undefined) {
    const oldIndex = items.findIndex((item) => item.id === activeId);
    const newIndex = items.findIndex((item) => item.id === overId);
    if (oldIndex !== -1 && newIndex !== -1) {
      return arrayMove(items, oldIndex, newIndex);
    }
    return items;
  }

  // Otherwise, find the parent and reorder its subRows
  return items.map((item) => {
    if (item.id === parentId && item.subRows) {
      const oldIndex = item.subRows.findIndex((sub) => sub.id === activeId);
      const newIndex = item.subRows.findIndex((sub) => sub.id === overId);
      if (oldIndex !== -1 && newIndex !== -1) {
        return {
          ...item,
          subRows: arrayMove(item.subRows, oldIndex, newIndex),
        };
      }
    }
    if (item.subRows) {
      return {
        ...item,
        subRows: reorderInTree(item.subRows, parentId, activeId, overId),
      };
    }
    return item;
  });
}

// Drag handle cell
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

// Status badge component
function StatusBadge({ status }: { status: WbsItem["status"] }) {
  const styles = {
    "not-started": "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300",
    "in-progress": "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    completed: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
  };
  const labels = {
    "not-started": "Not Started",
    "in-progress": "In Progress",
    completed: "Completed",
  };

  return (
    <span className={`rounded-full px-2 py-1 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-20 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full ${
            progress >= 70
              ? "bg-green-500"
              : progress >= 30
                ? "bg-yellow-500"
                : "bg-zinc-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="text-xs text-zinc-500 dark:text-zinc-400">{progress}%</span>
    </div>
  );
}

// Draggable row component
function DraggableRow({
  row,
  wbsNumber,
}: {
  row: Row<WbsItem>;
  wbsNumber: string;
}) {
  const { transform, transition, setNodeRef, isDragging } = useSortable({
    id: row.original.id,
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
          {flexRender(cell.column.columnDef.cell, {
            ...cell.getContext(),
            wbsNumber,
          })}
        </td>
      ))}
    </tr>
  );
}

// Static row for SSR
function StaticRow({ row, wbsNumber }: { row: Row<WbsItem>; wbsNumber: string }) {
  return (
    <tr className="border-b border-zinc-200 last:border-0 dark:border-zinc-800">
      {row.getVisibleCells().map((cell) => (
        <td
          key={cell.id}
          className="px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300"
          style={{ width: cell.column.getSize() }}
        >
          {flexRender(cell.column.columnDef.cell, {
            ...cell.getContext(),
            wbsNumber,
          })}
        </td>
      ))}
    </tr>
  );
}

type DataTableProps = {
  initialData: WbsItem[];
};

export function DataTable({ initialData }: DataTableProps) {
  // Prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [data, setData] = useState(initialData);
  const [expanded, setExpanded] = useState<ExpandedState>(true); // Start fully expanded

  // Compute WBS numbers whenever data changes
  const wbsNumbers = useMemo(() => computeWbsNumbers(data), [data]);

  // Get all visible row IDs for SortableContext
  const columns = useMemo<ColumnDef<WbsItem>[]>(
    () => [
      {
        id: "drag-handle",
        header: "",
        cell: ({ row }) => <RowDragHandleCell rowId={row.original.id} />,
        size: 50,
      },
      {
        id: "wbs",
        header: "WBS",
        cell: ({ row }) => {
          const wbsNumber = wbsNumbers.get(row.original.id) ?? "";
          return <span className="font-mono text-zinc-500">{wbsNumber}</span>;
        },
        size: 80,
      },
      {
        accessorKey: "name",
        header: "Task Name",
        cell: ({ row }) => (
          <div
            style={{ paddingLeft: `${row.depth * 1.5}rem` }}
            className="flex items-center gap-2"
          >
            {row.getCanExpand() ? (
              <button
                onClick={row.getToggleExpandedHandler()}
                className="rounded p-0.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300"
              >
                {row.getIsExpanded() ? "▼" : "▶"}
              </button>
            ) : (
              <span className="w-5" /> // Spacer for alignment
            )}
            <span>{row.original.name}</span>
          </div>
        ),
        size: 300,
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
        size: 120,
      },
      {
        accessorKey: "progress",
        header: "Progress",
        cell: ({ row }) => <ProgressBar progress={row.original.progress} />,
        size: 150,
      },
    ],
    [wbsNumbers]
  );

  const table = useReactTable({
    data,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getSubRows: (row) => row.subRows,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowId: (row) => row.id,
  });

  // Get visible row IDs for SortableContext
  const rows = table.getRowModel().rows;
  const visibleRowIds = useMemo<UniqueIdentifier[]>(
    () => rows.map((row) => row.original.id),
    [rows]
  );

  // Handle drag end with same-level constraint
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over || active.id === over.id) return;

    const activeRow = table.getRowModel().rows.find(
      (row) => row.original.id === active.id
    );
    const overRow = table.getRowModel().rows.find(
      (row) => row.original.id === over.id
    );

    if (!activeRow || !overRow) return;

    // Same-level constraint: only allow drops on siblings (same parentId)
    if (activeRow.parentId !== overRow.parentId) {
      return; // Ignore cross-level drops
    }

    setData((currentData) =>
      reorderInTree(
        currentData,
        activeRow.parentId,
        active.id as string,
        over.id as string
      )
    );
  }

  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );

  const resetData = () => {
    setData(initialData);
    setExpanded(true);
  };

  const toggleExpandAll = () => {
    if (table.getIsAllRowsExpanded()) {
      setExpanded({});
    } else {
      table.toggleAllRowsExpanded(true);
    }
  };

  const tableHeader = (
    <thead>
      {table.getHeaderGroups().map((headerGroup) => (
        <tr
          key={headerGroup.id}
          className="border-b border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900"
        >
          {headerGroup.headers.map((header) => (
            <th
              key={header.id}
              className="px-4 py-3 text-left text-sm font-medium text-zinc-900 dark:text-zinc-100"
              style={{ width: header.column.getSize() }}
            >
              {header.isPlaceholder
                ? null
                : flexRender(header.column.columnDef.header, header.getContext())}
            </th>
          ))}
        </tr>
      ))}
    </thead>
  );

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={toggleExpandAll}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          {table.getIsAllRowsExpanded() ? "Collapse All" : "Expand All"}
        </button>
        <button
          onClick={resetData}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset
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
              {tableHeader}
              <tbody>
                <SortableContext
                  items={visibleRowIds}
                  strategy={verticalListSortingStrategy}
                >
                  {table.getRowModel().rows.map((row) => (
                    <DraggableRow
                      key={row.id}
                      row={row}
                      wbsNumber={wbsNumbers.get(row.original.id) ?? ""}
                    />
                  ))}
                </SortableContext>
              </tbody>
            </table>
          </div>
        </DndContext>
      ) : (
        <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
          <table className="w-full">
            {tableHeader}
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <StaticRow
                  key={row.id}
                  row={row}
                  wbsNumber={wbsNumbers.get(row.original.id) ?? ""}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Info Panel */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Drag & Drop Info
        </h3>
        <p className="text-xs text-zinc-600 dark:text-zinc-400">
          Rows can only be reordered within the same level (siblings). Dragging a task
          to a different parent level will be ignored.
        </p>
      </div>
    </div>
  );
}
