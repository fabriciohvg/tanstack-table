import { DataTable } from "./data-table";

export type WbsItem = {
  id: string;
  name: string;
  status: "not-started" | "in-progress" | "completed";
  progress: number; // 0-100
  subRows?: WbsItem[];
};

const data: WbsItem[] = [
  {
    id: "wbs-1",
    name: "Project Planning",
    status: "completed",
    progress: 100,
    subRows: [
      {
        id: "wbs-1-1",
        name: "Requirements Gathering",
        status: "completed",
        progress: 100,
        subRows: [
          { id: "wbs-1-1-1", name: "Stakeholder Interviews", status: "completed", progress: 100 },
          { id: "wbs-1-1-2", name: "Document Requirements", status: "completed", progress: 100 },
        ],
      },
      {
        id: "wbs-1-2",
        name: "Technical Design",
        status: "completed",
        progress: 100,
      },
    ],
  },
  {
    id: "wbs-2",
    name: "Development",
    status: "in-progress",
    progress: 60,
    subRows: [
      { id: "wbs-2-1", name: "Frontend Implementation", status: "completed", progress: 100 },
      { id: "wbs-2-2", name: "Backend Implementation", status: "in-progress", progress: 70 },
      { id: "wbs-2-3", name: "Integration", status: "not-started", progress: 0 },
    ],
  },
  {
    id: "wbs-3",
    name: "Testing & Deployment",
    status: "not-started",
    progress: 0,
    subRows: [
      { id: "wbs-3-1", name: "QA Testing", status: "not-started", progress: 0 },
      { id: "wbs-3-2", name: "Deployment", status: "not-started", progress: 0 },
    ],
  },
];

export default function WbsPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold text-black dark:text-zinc-50">
          WBS (Work Breakdown Structure)
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Hierarchical task structure with expand/collapse and same-level drag-and-drop reordering.
        </p>
        <DataTable initialData={data} />
      </div>
    </div>
  );
}
