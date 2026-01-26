"use client";

import { forwardRef, useMemo, useState, useSyncExternalStore } from "react";
import {
  SortableTree,
  TreeItemComponentProps,
  TreeItems,
  SimpleTreeItemWrapper,
} from "dnd-kit-sortable-tree";
import type { WbsItemData } from "./page";

// Client-only rendering hook (avoids hydration mismatch with dnd-kit)
const emptySubscribe = () => () => {};
function useIsClient() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

// Compute WBS numbers from tree structure
function computeWbsNumbers<T extends Record<string, unknown>>(
  items: TreeItems<T>,
  prefix = ""
): Map<string | number, string> {
  const map = new Map<string | number, string>();
  items.forEach((item, index) => {
    const wbs = prefix ? `${prefix}.${index + 1}` : `${index + 1}`;
    map.set(item.id, wbs);
    if (item.children) {
      const childMap = computeWbsNumbers(item.children, wbs);
      childMap.forEach((v, k) => map.set(k, v));
    }
  });
  return map;
}

// Status badge component
function StatusBadge({ status }: { status: WbsItemData["status"] }) {
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
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}

// Progress bar component
function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
        <div
          className={`h-full rounded-full transition-all ${
            progress >= 70
              ? "bg-green-500"
              : progress >= 30
                ? "bg-yellow-500"
                : "bg-zinc-400"
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
      <span className="w-8 text-xs text-zinc-500 dark:text-zinc-400">{progress}%</span>
    </div>
  );
}

// Custom tree item component
type WbsTreeItemProps = TreeItemComponentProps<WbsItemData> & {
  wbsNumber?: string;
};

const WbsTreeItem = forwardRef<HTMLDivElement, WbsTreeItemProps>(
  function WbsTreeItem(props, ref) {
    const { wbsNumber, ...treeItemProps } = props;

    return (
      <SimpleTreeItemWrapper {...treeItemProps} ref={ref}>
        <div className="flex flex-1 items-center gap-4 py-1">
          {/* WBS Number */}
          <span className="w-16 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {wbsNumber}
          </span>

          {/* Task Name */}
          <span className="flex-1 text-sm font-medium text-zinc-900 dark:text-zinc-100">
            {treeItemProps.item.name}
          </span>

          {/* Status */}
          <StatusBadge status={treeItemProps.item.status} />

          {/* Progress */}
          <ProgressBar progress={treeItemProps.item.progress} />
        </div>
      </SimpleTreeItemWrapper>
    );
  }
);

type DataTableProps = {
  initialData: TreeItems<WbsItemData>;
};

export function DataTable({ initialData }: DataTableProps) {
  // Prevent hydration mismatch - dnd-kit generates different IDs on server vs client
  const isClient = useIsClient();

  const [data, setData] = useState<TreeItems<WbsItemData>>(initialData);

  // Compute WBS numbers whenever data changes
  const wbsNumbers = useMemo(() => computeWbsNumbers(data), [data]);

  // Handle tree changes (reorder, reparent, collapse/expand)
  const handleItemsChanged = (
    newItems: TreeItems<WbsItemData>,
    reason: { type: string }
  ) => {
    setData(newItems);
    console.log("Tree changed:", reason.type);
  };

  // Reset to initial data
  const resetData = () => setData(initialData);

  // Custom TreeItem that passes WBS number
  const TreeItemWithWbs = useMemo(() => {
    const Component = forwardRef<HTMLDivElement, TreeItemComponentProps<WbsItemData>>(
      function TreeItemWithWbs(props, ref) {
        const wbsNumber = wbsNumbers.get(props.item.id as string) ?? "";
        return <WbsTreeItem {...props} ref={ref} wbsNumber={wbsNumber} />;
      }
    );
    return Component;
  }, [wbsNumbers]);

  // Static placeholder for SSR
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            disabled
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700"
          >
            Reset
          </button>
        </div>
        <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
          <p className="text-sm text-zinc-500">Loading tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={resetData}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Reset
        </button>
      </div>

      {/* Tree */}
      <div className="rounded-lg border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
        <SortableTree
          items={data}
          onItemsChanged={handleItemsChanged}
          TreeItemComponent={TreeItemWithWbs}
          indentationWidth={24}
        />
      </div>

      {/* Info Panel */}
      <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
        <h3 className="mb-2 text-sm font-medium text-zinc-900 dark:text-zinc-100">
          Drag & Drop Features
        </h3>
        <ul className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400">
          <li>• <strong>Reorder:</strong> Drag vertically to change position among siblings</li>
          <li>• <strong>Reparent:</strong> Drag onto another item to make it a child</li>
          <li>• <strong>Indent/Outdent:</strong> Drag horizontally to change nesting level</li>
          <li>• <strong>Collapse/Expand:</strong> Click the arrow to toggle children visibility</li>
        </ul>
      </div>
    </div>
  );
}
