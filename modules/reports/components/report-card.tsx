"use client"

import * as React from "react"
import {
  AlertTriangleIcon,
  ChevronRightIcon,
  ClockIcon,
  FileCheck2Icon,
  FileClockIcon,
  MapPinIcon,
} from "lucide-react"

import {
  AvatarInitials,
  GridCard,
  GridCardActions,
  GridCardFact,
  GridCardFacts,
} from "@/components/shared/grid-card"
import { StatusBadge } from "@/components/shared/status-badge"
import {
  reportStatusLabel,
  reportStatusVariant,
  type CompanyReport,
} from "@/modules/reports/types/report.types"

const accentByStatus: Record<string, string> = {
  draft: "bg-muted-foreground/40",
  submitted: "bg-primary",
  under_review: "bg-warning",
  approved: "bg-success",
  rejected: "bg-danger",
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
  const warnings = report.warnings?.length ?? 0
  const pdfReady = Boolean(report.pdfUrl)

  return (
    <GridCard
      accent={accentByStatus[status] ?? "bg-primary"}
      onOpen={onOpen}
      label={report.title || "Assessment report"}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          {report.jobNumber ? (
            <span className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 font-mono text-[0.7rem] font-semibold tracking-wide text-muted-foreground">
              {report.jobNumber}
            </span>
          ) : null}
          <StatusBadge
            status={reportStatusVariant(status)}
            label={reportStatusLabel(status)}
            className="rounded-full"
          />
          {report.version > 1 ? (
            <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-xs font-medium text-muted-foreground">
              v{report.version}
            </span>
          ) : null}
        </div>
        <GridCardActions>{actions}</GridCardActions>
      </header>

      <div className="flex flex-col gap-1.5">
        <h3
          className="line-clamp-1 text-base font-semibold tracking-tight"
          title={report.title}
        >
          {report.title || "Assessment report"}
        </h3>
        {report.jobTitle ? (
          <p className="truncate text-xs text-muted-foreground">{report.jobTitle}</p>
        ) : null}
        <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
          <MapPinIcon className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          <span className="line-clamp-2 min-w-0 break-words" title={report.propertyAddress}>
            {report.propertyAddress || "No property address"}
          </span>
        </p>
      </div>

      <GridCardFacts>
        <GridCardFact label="Customer" value={report.customerName || "—"} />
        <GridCardFact label="Claim" value={report.claimNumber || "—"} />
      </GridCardFacts>

      <div className="flex flex-wrap items-center gap-1.5">
        <span
          className={
            pdfReady
              ? "inline-flex items-center gap-1 rounded-full bg-success/12 px-2 py-0.5 text-xs font-medium text-success"
              : "inline-flex items-center gap-1 rounded-full bg-foreground/[0.05] px-2 py-0.5 text-xs font-medium text-muted-foreground"
          }
        >
          {pdfReady ? (
            <FileCheck2Icon className="size-3" aria-hidden />
          ) : (
            <FileClockIcon className="size-3" aria-hidden />
          )}
          {pdfReady ? "PDF ready" : "PDF pending"}
        </span>
        {warnings ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-warning/14 px-2 py-0.5 text-xs font-medium text-warning">
            <AlertTriangleIcon className="size-3" aria-hidden />
            {warnings} warning{warnings === 1 ? "" : "s"}
          </span>
        ) : null}
      </div>

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <AvatarInitials name={report.inspectorName || "?"} />
          <div className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-sm font-medium capitalize">
              {report.inspectorName || "Unknown"}
            </span>
            <span className="text-xs text-muted-foreground">Inspector</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className="inline-flex items-center gap-1 rounded-full bg-primary-tint/70 px-2.5 py-1 text-xs font-medium text-muted-foreground tabular-nums"
            title="Submitted"
          >
            <ClockIcon className="size-3.5" aria-hidden />
            {formatDate(report.submittedAt || report.updatedAt)}
          </span>
          <ChevronRightIcon
            className="size-4 -translate-x-1 text-primary opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100"
            aria-hidden
          />
        </div>
      </footer>
    </GridCard>
  )
}
