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
  "bg-[#0A4B37] text-white",
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

  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className="mb-2 text-[11px] font-semibold tracking-[0.12em] text-[#667085] uppercase">
        Top auditors
      </p>
      <ul className="flex flex-col gap-3">
        {rows.map((row, i) => (
          <li key={row.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-10 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                TONES[i % TONES.length],
              )}
            >
              {initials(row.name)}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[#101828]">{row.name}</p>
              <p className="truncate text-xs text-[#667085]">{row.role}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold tabular-nums text-[#101828]">{row.audits}</p>
              <p className="text-[10px] font-medium text-[#667085]">Audits</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
