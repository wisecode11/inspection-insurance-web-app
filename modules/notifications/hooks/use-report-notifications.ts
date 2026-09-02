"use client"

import * as React from "react"

import { getErrorMessage } from "@/lib/api/errors"
import { formatRelativeTime } from "@/lib/notifications/format-relative-time"
import { getReadReportIds, markReportsRead } from "@/lib/notifications/storage"
import { ROUTES } from "@/lib/constants/routes"
import { companyReportService } from "@/modules/reports/services/company-report.service"
import type { CompanyReport } from "@/modules/reports/types/report.types"
import { useSessionUser } from "@/modules/auth/hooks/use-session-user"

const POLL_MS = 45_000

export type ReportNotification = {
  id: string
  reportId: string
  jobId: string
  title: string
  message: string
  time: string
  submittedAt: string
  href: string
  unread: boolean
}

function toNotification(report: CompanyReport, readIds: Set<string>): ReportNotification | null {
  if (report.status !== "submitted") return null

  const jobId = report.job?.id || report.jobId
  if (!jobId) return null

  const inspector = report.inspectorName?.trim() || "An inspector"
  const jobLabel = report.jobNumber || report.jobTitle || "a job"

  return {
    id: report.id,
    reportId: report.id,
    jobId,
    title: "Report submitted",
    message: `${inspector} submitted a report for ${jobLabel}.`,
    time: formatRelativeTime(report.submittedAt || report.updatedAt),
    submittedAt: report.submittedAt || report.updatedAt || "",
    href: `${ROUTES.company.reports}?jobId=${jobId}`,
    unread: !readIds.has(report.id),
  }
}

export function useReportNotifications() {
  const user = useSessionUser()
  const userId = user?.id ?? ""
  const [items, setItems] = React.useState<ReportNotification[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")
  const [open, setOpen] = React.useState(false)
  const [readVersion, setReadVersion] = React.useState(0)

  const refresh = React.useCallback(async () => {
    if (!userId) {
      setItems([])
      setLoading(false)
      return
    }

    try {
      const reports = await companyReportService.list("submitted")
      const readIds = getReadReportIds(userId)
      const next = reports
        .map((report) => toNotification(report, readIds))
        .filter((item): item is ReportNotification => item != null)
        .sort(
          (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
        )
      setItems(next)
      setError("")
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [userId])

  React.useEffect(() => {
    void refresh()
    const timer = window.setInterval(() => {
      void refresh()
    }, POLL_MS)
    return () => window.clearInterval(timer)
  }, [refresh, readVersion])

  const unreadCount = items.filter((item) => item.unread).length

  const markAllRead = React.useCallback(() => {
    if (!userId || items.length === 0) return
    markReportsRead(
      userId,
      items.map((item) => item.reportId),
    )
    setReadVersion((v) => v + 1)
  }, [items, userId])

  const markOneRead = React.useCallback(
    (reportId: string) => {
      if (!userId) return
      markReportsRead(userId, [reportId])
      setReadVersion((v) => v + 1)
    },
    [userId],
  )

  return {
    items,
    unreadCount,
    loading,
    error,
    open,
    setOpen,
    markAllRead,
    markOneRead,
    refresh,
  }
}
