import { DataTable } from "./data-table";

export type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

// More sample data to make filtering meaningful
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
  { firstName: "Karen", lastName: "Lee", age: 44, visits: 70, status: "In Relationship", progress: 62 },
  { firstName: "Leo", lastName: "Walker", age: 30, visits: 140, status: "Single", progress: 90 },
  { firstName: "Mia", lastName: "Hall", age: 37, visits: 45, status: "Complicated", progress: 38 },
  { firstName: "Noah", lastName: "Allen", age: 25, visits: 185, status: "In Relationship", progress: 82 },
  { firstName: "Olivia", lastName: "Young", age: 42, visits: 60, status: "Single", progress: 48 },
];

export default function ColumnFiltersPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold text-black dark:text-zinc-50">
          Column Filters Example
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Filter columns using text search, numeric ranges, or select dropdowns.
          Filters are applied per-column with faceted values for smart suggestions.
        </p>
        <DataTable data={data} />
      </div>
    </div>
  );
}
