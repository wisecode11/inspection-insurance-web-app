"use client"

import * as React from "react"
import { LayoutGridIcon, ListIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export type ListView = "grid" | "table"

/** Remembers the grid/table choice per page. Defaults to grid; storage failures fall back silently. */
export function useListView(storageKey: string) {
  const [view, setView] = React.useState<ListView>("grid")

  React.useEffect(() => {
    try {
      if (window.localStorage.getItem(storageKey) === "table") setView("table")
    } catch {
      // Storage can be blocked; keep the default.
    }
  }, [storageKey])

  const changeView = React.useCallback(
    (next: ListView) => {
      setView(next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // Storage can be blocked; the choice still applies for this visit.
      }
    },
    [storageKey],
  )

  return [view, changeView] as const
}

const VIEW_OPTIONS = [
  { value: "grid", label: "Cards", icon: LayoutGridIcon },
  { value: "table", label: "Table", icon: ListIcon },
] as const

export function ViewToggle({ view, onChange }: { view: ListView; onChange: (view: ListView) => void }) {
  return (
    <div
      role="group"
      aria-label="Display as"
      className="inline-flex h-10 shrink-0 items-center gap-0.5 rounded-[var(--button-radius)] bg-card p-1 ring-1 ring-primary/15"
    >
      {VIEW_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          aria-pressed={view === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-[calc(var(--button-radius)-2px)] px-3 text-sm font-medium transition-colors",
            view === option.value
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-primary-tint hover:text-primary-dark",
          )}
        >
          <option.icon className="size-4" aria-hidden />
          {option.label}
        </button>
      ))}
    </div>
  )
}

/** Responsive grid wrapper for DataTable's renderGrid. */
export function CardGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{children}</div>
}

/**
 * Card shell shared by list pages: status accent bar (half opacity, full on hover),
 * lift on hover, optional click-to-open and selected ring.
 */
export function GridCard({
  accent = "bg-primary",
  onOpen,
  selected = false,
  label,
  className,
  children,
}: {
  accent?: string
  onOpen?: () => void
  selected?: boolean
  label?: string
  className?: string
  children: React.ReactNode
}) {
  const interactive = Boolean(onOpen)
  return (
    <article
      role={interactive ? "link" : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={label}
      onClick={onOpen}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === "Enter") onOpen?.()
            }
          : undefined
      }
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04),0_8px_24px_-18px_rgba(19,58,66,0.35)] ring-1 ring-border/70 transition-all duration-200 outline-none",
        "hover:-translate-y-0.5 hover:shadow-[0_2px_4px_rgba(16,24,40,0.04),0_18px_36px_-18px_rgba(19,58,66,0.4)] hover:ring-primary/30",
        interactive && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring",
        selected && "ring-2 ring-primary hover:ring-primary",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "h-1 w-full opacity-50 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
          selected && "opacity-100",
          accent,
        )}
      />
      <div className="flex flex-1 flex-col gap-4 p-5">{children}</div>
    </article>
  )
}

/** Wraps menus/checkboxes inside a clickable card so they don't trigger onOpen. */
export function GridCardActions({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div
      className={cn("-mt-1 -mr-2 flex shrink-0 items-center gap-0.5", className)}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      {children}
    </div>
  )
}

/** Small uppercase label over a value, for the tinted facts panel. */
export function GridCardFact({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <dt className="text-[0.65rem] font-semibold tracking-wider text-muted-foreground/80 uppercase">
        {label}
      </dt>
      <dd
        className="truncate text-sm font-medium text-foreground"
        title={typeof value === "string" ? value : undefined}
      >
        {value}
      </dd>
      {sub ? (
        <dd className="truncate text-xs text-muted-foreground" title={sub}>
          {sub}
        </dd>
      ) : null}
    </div>
  )
}

export function GridCardFacts({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <dl className={cn("grid grid-cols-2 gap-3 rounded-xl bg-primary-tint/45 px-3.5 py-3", className)}>
      {children}
    </dl>
  )
}

export function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export function AvatarInitials({ name, className }: { name: string; className?: string }) {
  return (
    <span
      className={cn(
        "flex size-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark text-xs font-semibold text-primary-foreground ring-2 ring-card",
        className,
      )}
    >
      {initialsOf(name) || "?"}
    </span>
  )
}
