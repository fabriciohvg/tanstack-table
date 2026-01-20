import { DataTable } from "./data-table";

export type Person = {
  userId: string; // Unique ID required for drag and drop
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const data: Person[] = [
  { userId: "user-1", firstName: "Tanner", lastName: "Linsley", age: 24, visits: 100, status: "In Relationship", progress: 50 },
  { userId: "user-2", firstName: "Tandy", lastName: "Miller", age: 40, visits: 40, status: "Single", progress: 80 },
  { userId: "user-3", firstName: "Joe", lastName: "Dirte", age: 45, visits: 20, status: "Complicated", progress: 10 },
  { userId: "user-4", firstName: "Jane", lastName: "Doe", age: 32, visits: 150, status: "Single", progress: 95 },
  { userId: "user-5", firstName: "John", lastName: "Smith", age: 28, visits: 75, status: "In Relationship", progress: 60 },
  { userId: "user-6", firstName: "Alice", lastName: "Johnson", age: 35, visits: 200, status: "Single", progress: 88 },
  { userId: "user-7", firstName: "Bob", lastName: "Williams", age: 52, visits: 30, status: "Complicated", progress: 25 },
  { userId: "user-8", firstName: "Carol", lastName: "Brown", age: 29, visits: 180, status: "In Relationship", progress: 72 },
];

export default function RowDndPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold text-black dark:text-zinc-50">
          Row Drag & Drop Example
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Drag rows using the handle to reorder them. The data array is updated in real-time.
        </p>
        <DataTable initialData={data} />
      </div>
    </div>
  );
}
