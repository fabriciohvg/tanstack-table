# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a learning project for mastering TanStack Table + TypeScript + Next.js patterns. The goal is to convert the Vite-based examples in `table/examples/` to Next.js 16 App Router patterns.

Tech stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, @tanstack/react-table, @dnd-kit, Bun.

## Commands

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun lint` - Run ESLint
- `bun add <package>` - Install a dependency

## Project Structure

- `app/` - Next.js App Router pages and layouts
  - `app/<example>/page.tsx` - Server Component (data, layout)
  - `app/<example>/data-table.tsx` - Client Component (`"use client"`, TanStack Table logic)
- `table/docs/` - TanStack Table documentation (copied from the official repo for reference)
- `table/examples/react/` - TanStack Table React examples (Vite-based, for reference only)

## Key Patterns

### TanStack Table Usage

Tables are built using the headless `useReactTable` hook with these core concepts:

1. **Column definitions** - Define columns using `createColumnHelper<T>()` for type-safe accessor definitions
2. **Row models** - Import and pass row model functions (e.g., `getCoreRowModel`, `getSortedRowModel`, `getFilteredRowModel`)
3. **Rendering** - Use `flexRender()` to render cell/header content with proper context

Basic setup:
```tsx
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'

const columnHelper = createColumnHelper<MyDataType>()
const columns = [columnHelper.accessor('field', { header: 'Header', cell: info => info.getValue() })]

const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() })
```

### Styling

Uses Tailwind CSS 4 with CSS variables for theming. Dark mode is supported via `prefers-color-scheme` media query.

### Path Aliases

`@/*` maps to the project root (configured in tsconfig.json).

### Column Ordering with Drag & Drop

Uses @dnd-kit for drag and drop. Key components:
- `DndContext` - Wraps table (must be outside `<table>` as it creates divs)
- `SortableContext` - Wraps sortable items (headers, cells)
- `useSortable` - Hook for drag state on individual elements

### Column Filtering with Faceted Values

For dynamic filter options, use faceted row models:

```tsx
const table = useReactTable({
  // ... other options
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(), // for select/autocomplete options
  getFacetedMinMaxValues: getFacetedMinMaxValues(), // for range filter bounds
})
```

Extend `ColumnMeta` for custom filter variants (requires eslint-disable for unused generics):

```tsx
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    filterVariant?: "text" | "range" | "select";
  }
}
```

### Editable Cells with TableMeta

For inline editing, extend `TableMeta` to pass an update function through the table context:

```tsx
declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData extends RowData> {
    updateData: (rowIndex: number, columnId: string, value: unknown) => void;
  }
}

const table = useReactTable({
  // ...
  meta: {
    updateData: (rowIndex, columnId, value) => {
      setData((old) => old.map((row, i) =>
        i === rowIndex ? { ...row, [columnId]: value } : row
      ));
    },
  },
});
```

Use `defaultColumn` to make all cells editable by default:

```tsx
const defaultColumn: Partial<ColumnDef<Person>> = {
  cell: ({ getValue, row, column, table }) => {
    const [value, setValue] = useState(getValue());
    const onBlur = () => table.options.meta?.updateData(row.index, column.id, value);
    return <input value={value} onChange={e => setValue(e.target.value)} onBlur={onBlur} />;
  },
};
```

### Preventing Pagination Reset on Edit

Use the `useSkipper` pattern to prevent pagination from resetting when data changes:

```tsx
function useSkipper() {
  const shouldSkipRef = useRef(true);
  const skip = useCallback(() => { shouldSkipRef.current = false; }, []);
  useEffect(() => { shouldSkipRef.current = true; }); // Reset after render
  return [shouldSkipRef.current, skip] as const;
}

const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();
const table = useReactTable({
  autoResetPageIndex,
  meta: {
    updateData: (rowIndex, columnId, value) => {
      skipAutoResetPageIndex(); // Call before setData
      setData(/* ... */);
    },
  },
});
```

## Common Gotchas

### Hydration Mismatch with @dnd-kit

@dnd-kit generates different `aria-describedby` IDs on server vs client. Fix with a mounted guard:

```tsx
const [isMounted, setIsMounted] = useState(false);
useEffect(() => setIsMounted(true), []);

return isMounted ? <DnDTable /> : <StaticTable />;
```

### Tailwind `last:` in Tables

`last:` targets the last child within its parent:
- On `<td>`: last cell in row (last **column**) ❌
- On `<tr>`: last row in tbody ✅

```tsx
// Wrong - removes border from last COLUMN
<td className="border-b last:border-0">

// Right - removes border from last ROW
<tr className="last:[&>td]:border-b-0">
```

### React Compiler Warning with TanStack Table

TanStack Table's `useReactTable()` returns non-memoizable functions. Add `"use no memo"` directive to silence the warning:

```tsx
"use no memo";
"use client";
```

### Debounced Inputs Reset Pagination

TanStack Table resets pagination to page 0 when filters change. Debounced inputs can accidentally trigger this on every re-render if they call `onChange` even when the value hasn't changed.

```tsx
// Wrong - calls onChange on mount and every re-render
useEffect(() => {
  const timeout = setTimeout(() => onChange(value), debounce);
  return () => clearTimeout(timeout);
}, [value, debounce, onChange]);

// Right - only calls onChange when user has actually typed
useEffect(() => {
  if (value === controlledValue) return; // skip if no change
  const timeout = setTimeout(() => onChange(value), debounce);
  return () => clearTimeout(timeout);
}, [value, controlledValue, debounce, onChange]);
```

## Next.js 16 Breaking Changes

### Middleware → Proxy Rename

In Next.js 16, Middleware has been renamed to **Proxy**. Create `proxy.ts` (not `middleware.ts`) in the project root or `src/`:

```ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
  return NextResponse.redirect(new URL('/home', request.url))
}

export const config = {
  matcher: '/about/:path*',
}
```

The functionality remains the same—only the naming convention changed.

## Reference Material

The `table/` directory contains TanStack Table documentation and examples. These are Vite-based examples meant as reference - adapt them to Next.js App Router patterns (Server/Client Components) when implementing.

## Implemented Examples

- `/basic` - Basic table with column definitions and cell rendering
- `/column-ordering` - Column visibility toggles and shuffle/reset ordering
- `/column-dnd` - Drag and drop column reordering with @dnd-kit
- `/column-filters` - Faceted column filtering with text, range, and select variants
- `/row-dnd` - Drag and drop row reordering with @dnd-kit
- `/editable-data` - Inline cell editing with pagination-safe updates
