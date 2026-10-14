"use client"

import * as React from "react"
import { AlertTriangleIcon, ClockIcon, FileCheck2Icon, FileClockIcon, MapPinIcon } from "lucide-react"

import { GridCardActions, initialsOf } from "@/components/shared/grid-card"
import {
  CodeChip,
  FactBox,
  LIST_TONES,
  ListCard,
  ListCardFooter,
  SquareAvatar,
  StatusPill,
  TagChip,
  type ListTone,
} from "@/components/shared/list-card"
import { reportStatusLabel, type CompanyReport } from "@/modules/reports/types/report.types"

const toneByStatus: Record<string, ListTone> = {
  draft: LIST_TONES.gray,
  submitted: LIST_TONES.blue,
  under_review: LIST_TONES.amber,
  approved: LIST_TONES.green,
  rejected: LIST_TONES.red,
}

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
}

export function ReportCard({
  report,
  onOpen,
  actions,
}: {
  report: CompanyReport
  onOpen: () => void
  actions: React.ReactNode
}) {
  const status = report.status || "draft"
  const tone = toneByStatus[status] ?? LIST_TONES.gray
  const warnings = report.warnings?.length ?? 0
  const pdfReady = Boolean(report.pdfUrl)
  const title = report.title || "Assessment report"

  return (
    <ListCard accent={tone.bar} onOpen={onOpen} label={title}>
      <header className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {report.jobNumber ? <CodeChip>{report.jobNumber}</CodeChip> : null}
          <StatusPill tone={tone}>{reportStatusLabel(status)}</StatusPill>
          {report.version > 1 ? <TagChip>v{report.version}</TagChip> : null}
          {warnings ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-[#FFF4E2] px-2.5 py-[3px] text-xs font-semibold text-[#C2700A]">
              <AlertTriangleIcon className="size-3" aria-hidden />
              {warnings}
            </span>
          ) : null}
        </div>
        <GridCardActions className="mt-0 -mr-1.5">{actions}</GridCardActions>
      </header>

      <h3 className="mt-3 line-clamp-1 text-base font-bold tracking-[-0.02em] text-[#0E1B16]" title={title}>
        {title}
      </h3>
      <p className="mt-1 flex min-h-[2.5rem] items-start gap-1.5 text-[13px] leading-[1.5] text-[#5B6B64]">
        <MapPinIcon className="mt-[3px] size-3.5 shrink-0 text-[#8A9892]" aria-hidden />
        <span className="line-clamp-2 min-w-0 break-words" title={report.propertyAddress}>
          {report.propertyAddress || "No property address"}
        </span>
      </p>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        <FactBox label="Customer" value={report.customerName || "—"} sub={report.jobTitle || undefined} />
        <FactBox label="Claim" value={report.claimNumber || "—"} mono />
      </dl>

      <ListCardFooter>
        <div className="flex min-w-0 items-center gap-3">
          <SquareAvatar initials={initialsOf(report.inspectorName || "")} />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-semibold text-[#0E1B16] capitalize">
              {report.inspectorName || "Unknown"}
            </span>
            <span className="text-xs text-[#6B7A73]">Inspector</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5 text-[13px]">
          <span
            className={
              pdfReady
                ? "inline-flex items-center text-[#14965A]"
                : "inline-flex items-center text-[#8A9892]"
            }
            title={pdfReady ? "PDF ready" : "PDF pending"}
          >
            {pdfReady ? <FileCheck2Icon className="size-4" aria-hidden /> : <FileClockIcon className="size-4" aria-hidden />}
            <span className="sr-only">{pdfReady ? "PDF ready" : "PDF pending"}</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-[#6B7A73] tabular-nums" title="Submitted">
            <ClockIcon className="size-3.5" aria-hidden />
            {formatDate(report.submittedAt || report.updatedAt)}
          </span>
        </div>
      </ListCardFooter>
    </ListCard>
  )
}
