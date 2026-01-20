import { DataTable } from "./data-table";

type Person = {
  firstName: string;
  lastName: string;
  age: number;
  visits: number;
  status: string;
  progress: number;
};

const data: Person[] = [
  {
    firstName: "Tanner",
    lastName: "Linsley",
    age: 24,
    visits: 100,
    status: "In Relationship",
    progress: 50,
  },
  {
    firstName: "Tandy",
    lastName: "Miller",
    age: 40,
    visits: 40,
    status: "Single",
    progress: 80,
  },
  {
    firstName: "Joe",
    lastName: "Dirte",
    age: 45,
    visits: 20,
    status: "Complicated",
    progress: 10,
  },
  {
    firstName: "Jane",
    lastName: "Doe",
    age: 32,
    visits: 150,
    status: "Single",
    progress: 95,
  },
  {
    firstName: "John",
    lastName: "Smith",
    age: 28,
    visits: 75,
    status: "In Relationship",
    progress: 60,
  },
];

export default function ColumnDndPage() {
  return (
    <div className="min-h-screen bg-zinc-50 p-8 dark:bg-black">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-2 text-2xl font-semibold text-black dark:text-zinc-50">
          Column Drag & Drop Example
        </h1>
        <p className="mb-6 text-zinc-600 dark:text-zinc-400">
          Drag the ⠿ handle in column headers to reorder columns.
        </p>
        <DataTable data={data} />
      </div>
    </div>
  );
}
