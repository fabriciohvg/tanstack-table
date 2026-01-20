# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a learning project for mastering TanStack Table + TypeScript + Next.js patterns. The goal is to convert the Vite-based examples in `table/examples/` to Next.js 16 App Router patterns.

Tech stack: Next.js 16, React 19, TypeScript, Tailwind CSS 4, @tanstack/react-table, Bun.

## Commands

- `bun dev` - Start development server
- `bun run build` - Build for production
- `bun lint` - Run ESLint
- `bun add <package>` - Install a dependency

## Project Structure

- `app/` - Next.js App Router pages and layouts
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
