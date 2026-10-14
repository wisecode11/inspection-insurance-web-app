"use client"

import * as React from "react"
import {
  ArrowUpDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Icon3D, type Icon3DKey } from "@/components/shared/icon-3d"
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"

export type Column<T> = {
  key: string
  header: string
  sortable?: boolean
  className?: string
  align?: "left" | "right" | "center"
  accessor?: (row: T) => string | number
  cell?: (row: T) => React.ReactNode
}

type DataTableProps<T> = {
  data: T[]
  columns: Column<T>[]
  searchable?: boolean
  searchPlaceholder?: string
  searchKeys?: (keyof T)[]
  pageSize?: number
  onRowClick?: (row: T) => void
  rowKey?: (row: T) => string
  toolbar?: React.ReactNode
  emptyIcon?: React.ComponentType<{ className?: string }>
  emptyIcon3d?: Icon3DKey
  emptyTitle?: string
  emptyDescription?: string
  /** Render the current page as a custom layout (e.g. card grid) instead of table rows. */
  renderGrid?: (rows: T[]) => React.ReactNode
  /** "panel": search + toolbar sit in one raised white bar, with numbered pagination. */
  variant?: "default" | "panel"
}

/** Page indexes to show, with `null` for a gap: 0 … 4 5 6 … 11 */
function pageWindow(current: number, count: number): (number | null)[] {
  if (count <= 7) return Array.from({ length: count }, (_, i) => i)
  const pages = new Set([0, count - 1, current - 1, current, current + 1])
  const sorted = [...pages].filter((p) => p >= 0 && p < count).sort((a, b) => a - b)
  const out: (number | null)[] = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) out.push(null)
    out.push(p)
  })
  return out
}

function defaultRowKey<T>(row: T) {
  const record = row as { id?: string | number }
  if (record.id != null) return String(record.id)
  return JSON.stringify(row)
}

export function DataTable<T>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search…",
  searchKeys,
  pageSize = 8,
  onRowClick,
  rowKey = defaultRowKey,
  toolbar,
  emptyIcon: EmptyIcon = SearchIcon,
  emptyIcon3d,
  emptyTitle = "No results found",
  emptyDescription = "Try adjusting your search or filters.",
  renderGrid,
  variant = "default",
}: DataTableProps<T>) {
  const panel = variant === "panel"
  const [query, setQuery] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("asc")
  const [page, setPage] = React.useState(0)

  const filtered = React.useMemo(() => {
    if (!query.trim()) return data
    const q = query.toLowerCase()
    const keys = searchKeys
    return data.filter((row) => {
      if (keys) {
        return keys.some((k) => String(row[k] ?? "").toLowerCase().includes(q))
      }
      return Object.values(row as Record<string, unknown>).some((v) =>
        String(v ?? "").toLowerCase().includes(q),
      )
    })
  }, [data, query, searchKeys])

  const sorted = React.useMemo(() => {
    if (!sortKey) return filtered
    const col = columns.find((c) => c.key === sortKey)
    if (!col?.accessor) return filtered
    const accessor = col.accessor
    return [...filtered].sort((a, b) => {
      const av = accessor(a)
      const bv = accessor(b)
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
  }, [filtered, sortKey, sortDir, columns])

  const pageCount = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, pageCount - 1)
  const paged = sorted.slice(currentPage * pageSize, currentPage * pageSize + pageSize)

  const emptyContent = (
    <Empty className="py-12">
      <EmptyHeader>
        {emptyIcon3d ? (
          <EmptyMedia variant="icon" className="size-14 rounded-xl bg-transparent shadow-none">
            <Icon3D
              name={emptyIcon3d}
              size={48}
              className="drop-shadow-[0_8px_14px_rgba(16,24,40,0.14)]"
            />
          </EmptyMedia>
        ) : (
          <EmptyMedia variant="icon">
            <EmptyIcon className="size-5" />
          </EmptyMedia>
        )}
        <EmptyTitle>{emptyTitle}</EmptyTitle>
        <EmptyDescription>{emptyDescription}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  )

  function toggleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  return (
    <div className={cn("flex flex-col", panel ? "gap-6" : "gap-3")}>
      {(searchable || toolbar) && (
        <div
          className={cn(
            "flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-stretch sm:gap-3",
            panel &&
              "relative z-10 rounded-2xl border border-[#E4EBE7] bg-white p-2 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_16px_36px_-20px_rgba(6,36,27,0.35)] sm:items-center sm:gap-2 sm:pl-3",
          )}
        >
          {searchable ? (
            <div
              className={cn(
                "relative min-w-0 w-full flex-1",
                panel ? "sm:min-w-[14rem]" : "sm:min-w-[14rem] sm:max-w-md",
              )}
            >
              <SearchIcon
                className={cn(
                  "pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2",
                  panel ? "text-[#6B7A73]" : "text-muted-foreground",
                )}
              />
              <Input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setPage(0)
                }}
                placeholder={searchPlaceholder}
                className={cn(
                  "h-10 w-full bg-card pl-9",
                  panel &&
                    "h-11 border-0 bg-transparent pl-10 text-[15px] shadow-none placeholder:text-[#7B8A83] focus-visible:ring-0",
                )}
              />
            </div>
          ) : null}
          {toolbar ? (
            <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:justify-end [&_[data-slot=select-trigger]]:h-10 [&_[data-slot=select-trigger]]:w-full [&_[data-slot=select-trigger]]:min-w-[11rem] [&_[data-slot=select-trigger]]:justify-between [&_[data-slot=select-trigger]]:bg-card sm:[&_[data-slot=select-trigger]]:w-[12.5rem]">
              {toolbar}
            </div>
          ) : null}
        </div>
      )}

      {renderGrid ? (
        paged.length === 0 ? (
          <div className="rounded-2xl border border-[#E4EBE7] bg-white shadow-[0_1px_2px_rgba(14,27,22,0.04),0_12px_32px_-22px_rgba(14,27,22,0.22)]">
            {emptyContent}
          </div>
        ) : (
          renderGrid(paged)
        )
      ) : (
      <div className="overflow-hidden rounded-md border border-[#E4EBE7] bg-white shadow-[0_1px_2px_rgba(14,27,22,0.04),0_12px_32px_-22px_rgba(14,27,22,0.22)]">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    "h-11",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                    col.className,
                  )}
                >
                  {col.sortable ? (
                    <button
                      type="button"
                      onClick={() => toggleSort(col.key)}
                      className={cn(
                        "inline-flex items-center gap-1 uppercase transition-colors hover:text-white",
                        col.align === "right" && "flex-row-reverse",
                      )}
                    >
                      {col.header}
                      <ArrowUpDownIcon
                        className={cn(
                          "size-3",
                          sortKey === col.key ? "text-[#8CE0B0]" : "text-white/50",
                        )}
                      />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {paged.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="p-0">
                  {emptyContent}
                </TableCell>
              </TableRow>
            ) : (
              paged.map((row, index) => (
                <TableRow
                  key={
                    typeof rowKey === "function"
                      ? rowKey(row)
                      : String((row as { id?: string }).id ?? index)
                  }
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  className={cn(onRowClick && "cursor-pointer hover:bg-[#EEF8F2]")}
                >
                  {columns.map((col) => (
                    <TableCell
                      key={col.key}
                      className={cn(
                        "py-3.5",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className,
                      )}
                    >
                      {col.cell
                        ? col.cell(row)
                        : col.accessor
                          ? col.accessor(row)
                          : String((row as Record<string, unknown>)[col.key] ?? "")}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      )}

      {sorted.length > pageSize && panel && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-[#6B7A73]">
            Showing{" "}
            <b className="font-semibold text-[#0E1B16] tabular-nums">
              {currentPage * pageSize + 1}–{Math.min((currentPage + 1) * pageSize, sorted.length)}
            </b>{" "}
            of <b className="font-semibold text-[#0E1B16] tabular-nums">{sorted.length}</b>
          </p>
          <nav aria-label="Pagination" className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E4EBE7] bg-white px-3.5 text-sm font-semibold text-[#0E1B16] transition-colors hover:border-[#1FB86A] disabled:pointer-events-none disabled:bg-transparent disabled:text-[#A6B2AC]"
            >
              <ChevronLeftIcon className="size-4" />
              Previous
            </button>
            {pageWindow(currentPage, pageCount).map((p, i) =>
              p === null ? (
                <span key={`gap-${i}`} className="px-1 text-sm text-[#8A9892]">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  aria-current={p === currentPage ? "page" : undefined}
                  onClick={() => setPage(p)}
                  className={cn(
                    "grid size-10 place-items-center rounded-xl text-sm font-semibold tabular-nums transition-colors",
                    p === currentPage
                      ? "bg-[#0A3326] text-white shadow-[0_6px_14px_-8px_rgba(6,36,27,0.7)]"
                      : "text-[#3B4A44] hover:bg-white hover:text-[#0E1B16]",
                  )}
                >
                  {p + 1}
                </button>
              ),
            )}
            <button
              type="button"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E4EBE7] bg-white px-3.5 text-sm font-semibold text-[#0E1B16] transition-colors hover:border-[#1FB86A] disabled:pointer-events-none disabled:bg-transparent disabled:text-[#A6B2AC]"
            >
              Next
              <ChevronRightIcon className="size-4" />
            </button>
          </nav>
        </div>
      )}

      {sorted.length > pageSize && !panel && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            Showing {currentPage * pageSize + 1}–
            {Math.min((currentPage + 1) * pageSize, sorted.length)} of {sorted.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeftIcon data-icon="inline-start" />
              Previous
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              {currentPage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= pageCount - 1}
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            >
              Next
              <ChevronRightIcon data-icon="inline-end" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
