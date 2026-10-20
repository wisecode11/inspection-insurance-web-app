"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/* Building blocks for the company list-page cards (Jobs, Staff, Reports). */

export type ListTone = { bar: string; pill: string; dot: string }

export const LIST_TONES = {
  gray: {
    bar: "bg-[#8A9892]",
    pill: "bg-[#F1F4F2] text-[#6B7A73] dark:bg-muted dark:text-muted-foreground",
    dot: "bg-[#8A9892]",
  },
  amber: {
    bar: "bg-[#D9820F]",
    pill: "bg-[#FFF4E2] text-[#C2700A] dark:bg-[#D9820F]/18 dark:text-[#FBBF24]",
    dot: "bg-[#D9820F]",
  },
  blue: {
    bar: "bg-[#2563EB]",
    pill: "bg-[#EAF2FF] text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#93C5FD]",
    dot: "bg-[#2563EB]",
  },
  green: {
    bar: "bg-[#1FB86A]",
    pill: "bg-[#E3F6EC] text-[#14965A] dark:bg-[#1FB86A]/18 dark:text-[#9BEBC0]",
    dot: "bg-[#1FB86A]",
  },
  teal: {
    bar: "bg-[#0D9488]",
    pill: "bg-[#DDF5F2] text-[#0D9488] dark:bg-[#0D9488]/20 dark:text-[#5EEAD4]",
    dot: "bg-[#0D9488]",
  },
  forest: {
    bar: "bg-[#155A45]",
    pill: "bg-[#E3F6EC] text-[#155A45] dark:bg-[#1FB86A]/18 dark:text-[#9BEBC0]",
    dot: "bg-[#155A45]",
  },
  red: {
    bar: "bg-[#DC2626]",
    pill: "bg-[#FDECEC] text-[#DC2626] dark:bg-[#DC2626]/20 dark:text-[#FCA5A5]",
    dot: "bg-[#DC2626]",
  },
} as const satisfies Record<string, ListTone>

/** Card grid used under the DataTable "panel" toolbar. */
export const LIST_CARD_GRID_CLASS = "grid gap-5 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6"

/** Select trigger styling for filters inside the panel toolbar. */
export const LIST_FILTER_TRIGGER_CLASS =
  "rounded-xl border-border bg-card font-semibold text-foreground"

/**
 * Card shell: status bar on the left (40% opacity, full on hover/focus/select),
 * lift on hover, optional click-to-open.
 */
export function ListCard({
  accent,
  onOpen,
  selected = false,
  label,
  className,
  children,
}: {
  accent: string
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
        "group relative flex flex-col overflow-hidden rounded-[18px] border border-border bg-card p-4 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_10px_28px_-20px_rgba(14,27,22,0.22)] transition-[transform,box-shadow,border-color] duration-200 outline-none sm:px-5 sm:py-4 dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_10px_28px_-20px_rgba(0,0,0,0.45)]",
        "hover:-translate-y-0.5 hover:border-[#D3DED8] hover:shadow-[0_2px_4px_rgba(14,27,22,0.04),0_20px_40px_-22px_rgba(14,27,22,0.3)] dark:hover:border-primary/35 dark:hover:shadow-[0_2px_4px_rgba(0,0,0,0.35),0_20px_40px_-22px_rgba(0,0,0,0.55)]",
        interactive && "cursor-pointer focus-visible:ring-2 focus-visible:ring-[#1FB86A]",
        selected && "border-[#1FB86A] ring-2 ring-[#1FB86A]/40",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-3 left-0 w-1 rounded-r-full opacity-40 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100",
          selected && "opacity-100",
          accent,
        )}
      />
      {children}
    </article>
  )
}

/** Monospace ID chip, e.g. JOB-0036. */
export function CodeChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-lg border border-border bg-muted px-2 py-[3px] font-mono text-[12px] font-semibold tracking-wide text-foreground">
      {children}
    </span>
  )
}

/** Neutral label chip, e.g. "Inspector" or "v2". */
export function TagChip({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "rounded-lg border border-border bg-muted px-2 py-[3px] text-[12px] font-semibold text-foreground",
        className,
      )}
    >
      {children}
    </span>
  )
}

export function StatusPill({ tone, children, className }: { tone: ListTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12.5px] font-semibold",
        tone.pill,
        className,
      )}
    >
      <i className={cn("size-1.5 rounded-full", tone.dot)} />
      {children}
    </span>
  )
}

/** Small tinted info box: uppercase label, bold value, optional sub line. */
export function FactBox({
  label,
  value,
  sub,
  mono,
  className,
}: {
  label: string
  value: React.ReactNode
  sub?: string
  mono?: boolean
  className?: string
}) {
  return (
    <div className={cn("flex min-w-0 flex-col rounded-xl border border-border bg-muted/50 px-3 py-2", className)}>
      <dt className="truncate text-[10px] font-bold tracking-[0.12em] text-muted-foreground uppercase">{label}</dt>
      <dd
        className={cn("mt-0.5 truncate text-sm font-semibold text-foreground", mono && "font-mono tracking-tight")}
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

/** Dark rounded-square initials avatar. */
export function SquareAvatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-[10px] bg-[#0A3326] text-[11px] font-bold text-white",
        className,
      )}
    >
      {initials || "?"}
    </span>
  )
}

/** Dashed divider footer row. */
export function ListCardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <footer
      className={cn(
        "mt-3 flex items-center justify-between gap-3 border-t border-dashed border-border pt-3",
        className,
      )}
    >
      {children}
    </footer>
  )
}
