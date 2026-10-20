"use client"

import * as React from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import {
  ArrowLeftIcon,
  DownloadIcon,
  ExternalLinkIcon,
  FileTextIcon,
  HistoryIcon,
  ShieldCheckIcon,
} from "lucide-react"
import { toast } from "@/lib/toast"

import { CodeChip, FactBox, LIST_TONES, StatusPill, type ListTone } from "@/components/shared/list-card"
import { ListPageHero, heroGhostButtonClass } from "@/components/shared/list-page-hero"
import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { getErrorMessage } from "@/lib/api/errors"
import { ROUTES } from "@/lib/constants/routes"
import { useAsyncData } from "@/lib/hooks/use-async-data"
import { cn } from "@/lib/utils"
import { companyReportService } from "@/modules/reports/services/company-report.service"
import {
  reportStatusLabel,
  type ReportPdfVersion,
} from "@/modules/reports/types/report.types"

const REPORT_TONES: Record<string, ListTone> = {
  draft: LIST_TONES.gray,
  submitted: LIST_TONES.blue,
  under_review: LIST_TONES.amber,
  approved: LIST_TONES.green,
  rejected: LIST_TONES.red,
}

const SOURCE_LABEL: Record<string, string> = {
  inspector_mobile: "Inspector evidence package",
  server_summary: "Server summary",
}

const PANEL_CLASS =
  "rounded-2xl border border-border bg-card p-5 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_16px_36px_-22px_rgba(6,36,27,0.35)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_16px_36px_-22px_rgba(0,0,0,0.55)]"

function formatWhen(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatSize(bytes: number) {
  if (!bytes) return "—"
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/**
 * PDF history for one report: the current PDF plus every earlier one it replaced.
 * Files are fetched with the signed-in session, so older versions open too.
 */
export default function ReportPdfHistoryPage() {
  const params = useParams<{ id: string }>()
  const reportId = params.id
  const { data, isLoading, error } = useAsyncData(
    () => companyReportService.pdfVersions(reportId),
    `report-pdfs-${reportId}`,
  )
  const [busyKey, setBusyKey] = React.useState<string | null>(null)

  async function openVersion(version: ReportPdfVersion, mode: "view" | "download") {
    const key = `${version.version}-${mode}`
    if (busyKey) return
    setBusyKey(key)
    // Open the tab synchronously so popup blockers allow it, then point it at the PDF.
    const tab = mode === "view" ? window.open("", "_blank") : null
    try {
      const blob = await companyReportService.pdfVersionBlob(reportId, version.version)
      const url = URL.createObjectURL(new Blob([blob], { type: "application/pdf" }))
      if (mode === "view") {
        if (tab) tab.location.href = url
        else window.location.assign(url)
      } else {
        const link = document.createElement("a")
        link.href = url
        link.download = version.fileName || `report-v${version.version}.pdf`
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
      // Give the tab / download time to read the blob before releasing it.
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (err) {
      tab?.close()
      toast.error(getErrorMessage(err))
    } finally {
      setBusyKey(null)
    }
  }

  if (isLoading) return <LoadingSkeleton rows={4} />
  if (error || !data) return <ErrorState message={error || "Unable to load PDF history"} />

  const { report, versions } = data
  const status = report.status || "draft"
  const replacedCount = versions.filter((v) => !v.isCurrent).length

  return (
    <>
      <ListPageHero
        eyebrow="Reports"
        title="PDF history"
        description={`Every PDF stored for ${report.title || "this report"}. Earlier versions are kept, never overwritten.`}
        actions={
          <Link href={ROUTES.company.reports} className={heroGhostButtonClass}>
            <ArrowLeftIcon className="size-4" />
            All reports
          </Link>
        }
      />

      <div className="relative z-10 grid items-start gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* Report summary */}
        <aside className={PANEL_CLASS}>
          <div className="flex flex-wrap items-center gap-2">
            {report.jobNumber ? <CodeChip>{report.jobNumber}</CodeChip> : null}
            <StatusPill tone={REPORT_TONES[status] ?? LIST_TONES.gray}>{reportStatusLabel(status)}</StatusPill>
          </div>
          <h2 className="mt-3 text-base font-bold tracking-[-0.02em] text-foreground">
            {report.title || "Assessment report"}
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-2">
            <FactBox label="Customer" value={report.customerName || "—"} />
            <FactBox label="Inspector" value={report.inspectorName || "—"} />
            <FactBox label="Claim" value={report.claimNumber || "—"} mono />
            <FactBox
              label="Stored PDFs"
              value={`${versions.length} total · ${replacedCount} earlier`}
            />
          </dl>
          {report.jobId ? (
            <Link
              href={ROUTES.company.job(report.jobId)}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#14965A] hover:underline dark:text-[#9BEBC0]"
            >
              Open job
              <ExternalLinkIcon className="size-3.5" />
            </Link>
          ) : null}
        </aside>

        {/* Versions timeline */}
        <section aria-label="PDF versions" className={cn(PANEL_CLASS, "sm:p-6")}>
          <div className="flex items-center gap-2">
            <HistoryIcon className="size-[18px] text-primary dark:text-[#9BEBC0]" />
            <h2 className="text-base font-bold text-foreground">Versions</h2>
            <span className="text-sm text-muted-foreground">newest first</span>
          </div>

          {versions.length === 0 ? (
            <p className="mt-5 rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-center text-sm text-muted-foreground">
              No PDF has been stored for this report yet.
            </p>
          ) : (
            <ol className="relative mt-5 flex flex-col gap-3">
              {/* timeline rail */}
              <span aria-hidden className="absolute top-4 bottom-4 left-[1.15rem] border-l border-dashed border-border" />
              {versions.map((version) => {
                const inspector = version.source === "inspector_mobile"
                return (
                  <li key={version.version} className="relative flex gap-4">
                    <span
                      className={cn(
                        "relative z-10 mt-3 grid size-9 shrink-0 place-items-center rounded-full border-2 bg-card",
                        version.isCurrent
                          ? "border-[#1FB86A] text-[#14965A] dark:text-[#9BEBC0]"
                          : "border-border text-muted-foreground",
                      )}
                    >
                      <FileTextIcon className="size-4" />
                    </span>

                    <div
                      className={cn(
                        "flex min-w-0 flex-1 flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between",
                        version.isCurrent
                          ? "border-[#1FB86A]/35 bg-[#1FB86A]/10 dark:border-[#1FB86A]/40 dark:bg-[#1FB86A]/12"
                          : "border-border bg-muted/40",
                      )}
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[13px] font-bold text-foreground">
                            Version {version.version}
                          </span>
                          {version.isCurrent ? (
                            <StatusPill tone={LIST_TONES.green}>Current</StatusPill>
                          ) : (
                            <StatusPill tone={LIST_TONES.gray}>Replaced {formatWhen(version.replacedAt)}</StatusPill>
                          )}
                          {version.source ? (
                            <span
                              className={cn(
                                "inline-flex items-center gap-1 rounded-full px-2.5 py-[3px] text-xs font-semibold",
                                inspector
                                  ? "bg-[#EAF2FF] text-[#2563EB] dark:bg-[#2563EB]/20 dark:text-[#93C5FD]"
                                  : "bg-muted text-muted-foreground",
                              )}
                            >
                              {inspector ? <ShieldCheckIcon className="size-3" /> : null}
                              {SOURCE_LABEL[version.source] ?? version.source}
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1.5 truncate text-sm text-foreground/80" title={version.fileName}>
                          {version.fileName}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                          Stored {formatWhen(version.storedAt)} · {formatSize(version.sizeBytes)}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          disabled={Boolean(busyKey)}
                          onClick={() => void openVersion(version, "view")}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-[13px] font-semibold text-foreground transition-colors hover:border-[#1FB86A] disabled:opacity-60"
                        >
                          <ExternalLinkIcon className="size-3.5" />
                          {busyKey === `${version.version}-view` ? "Opening…" : "Open"}
                        </button>
                        <button
                          type="button"
                          disabled={Boolean(busyKey)}
                          onClick={() => void openVersion(version, "download")}
                          className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0A3326] px-3 text-[13px] font-semibold text-white transition-colors hover:bg-[#0E4434] disabled:opacity-60"
                        >
                          <DownloadIcon className="size-3.5" />
                          {busyKey === `${version.version}-download` ? "Downloading…" : "Download"}
                        </button>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      </div>
    </>
  )
}
