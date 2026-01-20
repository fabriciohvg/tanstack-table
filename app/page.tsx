import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center py-32 px-16 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Tanstack Table Learning with Claude Code.
          </h1>
        </div>

        <nav className="mt-12 w-full">
          <h2 className="mb-4 text-lg font-medium text-zinc-900 dark:text-zinc-100">
            Examples
          </h2>
          <ul className="space-y-2">
            <li>
              <Link
                href="/basic"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Basic Table
              </Link>
            </li>
            <li>
              <Link
                href="/column-ordering"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Column Ordering
              </Link>
            </li>
            <li>
              <Link
                href="/column-dnd"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Column Drag & Drop
              </Link>
            </li>
            <li>
              <Link
                href="/column-filters"
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                Column Filters
              </Link>
            </li>
          </ul>
        </nav>
      </main>
    </div>
  );
}
