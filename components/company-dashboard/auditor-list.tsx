"use client"

import { cn } from "@/lib/utils"

export type AuditorRow = {
  id: string
  name: string
  role: string
  audits: number
}

const TONES = [
  "bg-[#063728] text-white",
  "bg-[#8CE0B0] text-[#063728]",
  "bg-[#C7C4F5] text-[#2B2670]",
] as const

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return "?"
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}

const FALLBACK: AuditorRow[] = [
  { id: "sc", name: "Sarah Chen", role: "Lead Security Architect", audits: 142 },
  { id: "mv", name: "Marcus Vance", role: "Staff Quality Engineer", audits: 118 },
]

export function AuditorList({
  auditors,
  className,
}: {
  auditors?: AuditorRow[]
  className?: string
}) {
  const rows = auditors && auditors.length > 0 ? auditors.slice(0, 3) : FALLBACK
  const top = Math.max(...rows.map((r) => r.audits), 0)

  return (
    <div className={className}>
      <p className="mb-1.5 text-[11px] font-bold tracking-[0.09em] text-muted-foreground uppercase">
        Top auditors
      </p>
      <ul className="m-0 flex list-none flex-col gap-1 p-0">
        {rows.map((row, i) => (
          <li
            key={row.id}
            className="-mx-2.5 flex items-center gap-3 rounded-xl p-2.5 transition-colors duration-200 hover:bg-muted/60"
          >
            <span
              className={cn(
                "grid size-[38px] shrink-0 place-items-center rounded-full text-xs font-bold tracking-[0.02em]",
                TONES[i % TONES.length],
              )}
            >
              {initials(row.name)}
            </span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-sm font-semibold text-foreground">{row.name}</b>
              <small className="block truncate text-[12.5px] text-muted-foreground">{row.role}</small>
              <div className="mt-1.5 h-1 overflow-hidden rounded bg-muted">
                <i
                  className="block h-full rounded-[inherit] bg-linear-to-r from-[#2FBF6B] to-[#8CE0B0] transition-[width] duration-700 ease-out"
                  style={{ width: `${top > 0 ? (row.audits / top) * 100 : 0}%` }}
                />
              </div>
            </div>
            <div className="text-right">
              <b className="block text-lg leading-none font-extrabold tabular-nums text-foreground">
                {row.audits}
              </b>
              <small className="text-[11.5px] text-muted-foreground">Audits</small>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
