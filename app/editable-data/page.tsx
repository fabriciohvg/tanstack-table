import { DataTable } from "./data-table";

export type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const data: Person[] = [
  { firstName: "Tanner", lastName: "Linsley", age: 24, visits: 100, status: "In Relationship", progress: 50 },
  { firstName: "Tandy", lastName: "Miller", age: 40, visits: 40, status: "Single", progress: 80 },
  { firstName: "Joe", lastName: "Dirte", age: 45, visits: 20, status: "Complicated", progress: 10 },
  { firstName: "Jane", lastName: "Doe", age: 32, visits: 150, status: "Single", progress: 95 },
  { firstName: "John", lastName: "Smith", age: 28, visits: 75, status: "In Relationship", progress: 60 },
  { firstName: "Alice", lastName: "Johnson", age: 35, visits: 200, status: "Single", progress: 88 },
  { firstName: "Bob", lastName: "Williams", age: 52, visits: 30, status: "Complicated", progress: 25 },
  { firstName: "Carol", lastName: "Brown", age: 29, visits: 180, status: "In Relationship", progress: 72 },
  { firstName: "David", lastName: "Jones", age: 41, visits: 90, status: "Single", progress: 45 },
  { firstName: "Eve", lastName: "Garcia", age: 27, visits: 120, status: "In Relationship", progress: 91 },
  { firstName: "Frank", lastName: "Martinez", age: 38, visits: 55, status: "Complicated", progress: 33 },
  { firstName: "Grace", lastName: "Robinson", age: 31, visits: 210, status: "Single", progress: 78 },
  { firstName: "Henry", lastName: "Clark", age: 48, visits: 15, status: "In Relationship", progress: 20 },
  { firstName: "Ivy", lastName: "Rodriguez", age: 26, visits: 165, status: "Single", progress: 85 },
  { firstName: "Jack", lastName: "Lewis", age: 33, visits: 95, status: "Complicated", progress: 55 },
];

export default function EditableDataPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold text-black dark:text-zinc-50">
          Editable Data Example
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Click on any cell to edit its value. Changes are applied when you blur the input (click elsewhere or press Tab).
        </p>
        <DataTable initialData={data} />
      </div>
    </div>
  );
}
