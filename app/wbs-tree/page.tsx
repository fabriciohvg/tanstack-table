import { DataTable } from "./data-table";

export type WbsItemData = {
  name: string;
  status: "not-started" | "in-progress" | "completed";
  progress: number;
};

// TreeItem type from dnd-kit-sortable-tree adds: id, children, collapsed, canHaveChildren
export type { TreeItem, TreeItems } from "dnd-kit-sortable-tree";

const initialData = [
  {
    id: "wbs-1",
    name: "Project Planning",
    status: "completed" as const,
    progress: 100,
    children: [
      {
        id: "wbs-1-1",
        name: "Requirements Gathering",
        status: "completed" as const,
        progress: 100,
        children: [
          { id: "wbs-1-1-1", name: "Stakeholder Interviews", status: "completed" as const, progress: 100 },
          { id: "wbs-1-1-2", name: "Document Requirements", status: "completed" as const, progress: 100 },
        ],
      },
      {
        id: "wbs-1-2",
        name: "Technical Design",
        status: "completed" as const,
        progress: 100,
      },
    ],
  },
  {
    id: "wbs-2",
    name: "Development",
    status: "in-progress" as const,
    progress: 60,
    children: [
      { id: "wbs-2-1", name: "Frontend Implementation", status: "completed" as const, progress: 100 },
      { id: "wbs-2-2", name: "Backend Implementation", status: "in-progress" as const, progress: 70 },
      { id: "wbs-2-3", name: "Integration", status: "not-started" as const, progress: 0 },
    ],
  },
  {
    id: "wbs-3",
    name: "Testing & Deployment",
    status: "not-started" as const,
    progress: 0,
    children: [
      { id: "wbs-3-1", name: "QA Testing", status: "not-started" as const, progress: 0 },
      { id: "wbs-3-2", name: "Deployment", status: "not-started" as const, progress: 0 },
    ],
  },
];

export default function WbsTreePage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-2 text-2xl font-semibold text-black dark:text-zinc-50">
          WBS Tree (Full Drag & Drop)
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Drag tasks to reorder or reparent them. Drag horizontally to indent/outdent.
          Uses <code className="rounded bg-zinc-200 px-1 dark:bg-zinc-800">dnd-kit-sortable-tree</code>.
        </p>
        <DataTable initialData={initialData} />
      </div>
    </div>
  );
}
