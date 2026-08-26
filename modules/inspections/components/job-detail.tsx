"use client"

import * as React from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeftIcon, CameraIcon, FileTextIcon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import { env } from "@/lib/config/env"
import { ROUTES } from "@/lib/constants/routes"
import { getErrorMessage } from "@/lib/api/errors"
import { useJob } from "@/modules/inspections/hooks/use-job"
import { jobService } from "@/modules/inspections/services/job.service"
import {
  canCancelJob,
  jobStatusLabel,
  jobStatusVariant,
  nextJobStatuses,
  type JobStatus,
} from "@/modules/inspections/types/job.types"
import { useStaff } from "@/modules/staff/hooks/use-staff"

function formatDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function mediaHref(url?: string) {
  if (!url) return ""
  if (url.startsWith("http")) return url
  const base = env.apiUrl.replace(/\/api\/?$/, "")
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`
}

export default function JobDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { data: job, isLoading, error, reload } = useJob(params.id)
  const { data: staff = [] } = useStaff()
  const inspectors = staff.filter((member) => member.status === "active")
  const inspectorItems = React.useMemo(
    () => [
      { value: "unassigned", label: "Unassigned" },
      ...inspectors.map((member) => ({ value: member.id, label: member.name })),
    ],
    [inspectors],
  )
  const priorityItems = React.useMemo(
    () => [
      { value: "low", label: "Low" },
      { value: "normal", label: "Normal" },
      { value: "high", label: "High" },
      { value: "urgent", label: "Urgent" },
    ],
    [],
  )

  const [assignId, setAssignId] = React.useState("unassigned")
  const [priority, setPriority] = React.useState("normal")
  const [dueDate, setDueDate] = React.useState("")
  const [busy, setBusy] = React.useState(false)
  const [confirmKind, setConfirmKind] = React.useState<"cancel" | "delete" | null>(null)

  React.useEffect(() => {
    if (!job) return
    setAssignId(job.assignedTo || "unassigned")
    setPriority(job.priority || "normal")
    setDueDate(job.dueDate ? String(job.dueDate).slice(0, 10) : "")
  }, [job])

  if (isLoading) return <LoadingState label="Loading job…" />
  if (error) return <ErrorState message={error} />

  if (!job) {
    return (
      <Empty className="border py-20">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <CameraIcon />
          </EmptyMedia>
          <EmptyTitle>Job not found</EmptyTitle>
          <EmptyDescription>That job id is not in this company workspace.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button variant="outline" onClick={() => router.push(ROUTES.company.jobs)}>
            Back to jobs
          </Button>
        </EmptyContent>
      </Empty>
    )
  }

  const transitions = nextJobStatuses(job.status).filter((status) => status !== "rejected")
  const canCancel = canCancelJob(job.status) && Boolean(job.assignedTo || job.status !== "draft")
  const photos = job.photos || []
  const progress = job.progress

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true)
    try {
      await action()
      toast.success(success)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  async function confirmDestructive() {
    if (!confirmKind) return
    if (confirmKind === "cancel") {
      setConfirmKind(null)
      await run(
        () => jobService.cancel(job.id),
        "Job cancelled — inspector unassigned. You can reassign now.",
      )
      return
    }
    setBusy(true)
    try {
      await jobService.remove(job.id)
      toast.success("Job deleted")
      router.push(ROUTES.company.jobs)
    } catch (err) {
      toast.error(getErrorMessage(err))
      setBusy(false)
    } finally {
      setConfirmKind(null)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Jobs"
        title={job.title || job.addressLine || job.jobNumber}
        description={`${job.customerName || "Homeowner"} · ${job.jobNumber} · ${job.inspector}`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => router.push(ROUTES.company.jobs)}>
              <ArrowLeftIcon data-icon="inline-start" />
              Back
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                router.push(`${ROUTES.company.reports}?jobId=${encodeURIComponent(job.id)}`)
              }
            >
              <FileTextIcon data-icon="inline-start" />
              View report
            </Button>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={jobStatusVariant(job.status)} label={jobStatusLabel(job.status)} />
        {progress?.notStarted ? <StatusBadge status="draft" label="Not started" /> : null}
        {progress?.inProgress ? <StatusBadge status="in_progress" label="In progress" /> : null}
        {progress?.review ? <StatusBadge status="submitted" label="Review" /> : null}
        {progress?.completed ? <StatusBadge status="completed" label="Completed" /> : null}
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
          <CardDescription>Track created, due, submission, review, and completion dates.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <p className="text-muted-foreground">Current status</p>
            <p className="font-medium">{jobStatusLabel(job.status)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Assigned inspector</p>
            <p className="font-medium">{job.inspector}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Created date</p>
            <p className="font-medium">{formatDate(job.createdAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Due date</p>
            <p className="font-medium">{formatDate(job.dueDate)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Submission date</p>
            <p className="font-medium">{formatDate(job.submittedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Review date</p>
            <p className="font-medium">{formatDate(job.reviewedAt)}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Completion date</p>
            <p className="font-medium">{formatDate(job.completedAt)}</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Property & claim</CardTitle>
            <CardDescription>Details captured when the job was created.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 text-sm">
            <div>
              <p className="text-muted-foreground">Homeowner</p>
              <p className="font-medium">{job.customerName || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone / email</p>
              <p className="font-medium">
                {job.customer?.phone || "—"} · {job.customer?.email || "—"}
              </p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Property address</p>
              <p className="font-medium">{job.addressLine || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Claim number</p>
              <p className="font-medium">{job.claim?.claimNumber || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Policy number</p>
              <p className="font-medium">{job.claim?.policyNumber || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Date of loss</p>
              <p className="font-medium">{formatDate(job.claim?.dateOfLoss)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Carrier name</p>
              <p className="font-medium">{job.claim?.insuranceCompany || "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Priority</p>
              <p className="font-medium capitalize">{job.priority || "normal"}</p>
            </div>
            <div className="sm:col-span-2">
              <p className="text-muted-foreground">Notes</p>
              <p className="font-medium whitespace-pre-wrap">{job.notes || "—"}</p>
            </div>
            {(job.attachments || []).length > 0 ? (
              <div className="sm:col-span-2">
                <p className="text-muted-foreground">Attachments</p>
                <ul className="mt-1 space-y-1">
                  {job.attachments?.map((item) => (
                    <li key={`${item.name}-${item.url}`}>
                      <a className="text-terracotta underline" href={item.url} target="_blank" rel="noreferrer">
                        {item.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assignment & status</CardTitle>
            <CardDescription>Reassign inspectors and advance the job workflow.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Inspector</Label>
              <Select
                value={assignId}
                onValueChange={(value) => setAssignId(value || "unassigned")}
                items={inspectorItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectorItems.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  if (assignId === "unassigned") {
                    await jobService.unassign(job.id)
                  } else {
                    await jobService.assign(job.id, assignId, {
                      dueDate: dueDate || null,
                      priority: priority as "low" | "normal" | "high" | "urgent",
                    })
                  }
                }, job.assignedTo && assignId !== "unassigned" ? "Job reassigned" : "Assignment updated")
              }
            >
              {job.assignedTo && assignId !== "unassigned" && assignId !== job.assignedTo
                ? "Reassign inspector"
                : assignId === "unassigned"
                  ? "Unassign inspector"
                  : job.assignedTo
                    ? "Save assignment"
                    : "Assign inspector"}
            </Button>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label>Priority</Label>
                <Select
                  value={priority}
                  onValueChange={(value) => setPriority(value || "normal")}
                  items={priorityItems}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {priorityItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Due date</Label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
            <Button
              variant="outline"
              disabled={busy}
              onClick={() =>
                run(
                  () =>
                    jobService.update(job.id, {
                      priority: priority as "low" | "normal" | "high" | "urgent",
                      dueDate: dueDate || null,
                    }),
                  "Priority / due date saved",
                )
              }
            >
              Save priority & due date
            </Button>

            {transitions.length > 0 ? (
              <div className="flex flex-col gap-2">
                <Label>Advance status</Label>
                {transitions.map((status) => (
                  <Button
                    key={status}
                    variant="secondary"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => jobService.setStatus(job.id, status as JobStatus),
                        `Moved to ${jobStatusLabel(status)}`,
                      )
                    }
                  >
                    Mark {jobStatusLabel(status)}
                  </Button>
                ))}
              </div>
            ) : null}

            {canCancel ? (
              <Button
                variant="destructive"
                disabled={busy}
                onClick={() => setConfirmKind("cancel")}
              >
                Cancel & unassign
              </Button>
            ) : null}

            <Button
              variant="outline"
              disabled={busy}
              onClick={() => setConfirmKind("delete")}
            >
              Delete job
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Photos & notes</CardTitle>
          <CardDescription>Evidence captured for this job. Report approve/reject lives on the Reports tab.</CardDescription>
        </CardHeader>
        <CardContent>
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No photos synced yet. Inspectors upload evidence from the mobile app.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {photos.map((photo) => (
                <div key={photo.id} className="rounded-lg border p-3 text-sm">
                  <p className="font-medium">{photo.caption || photo.subjectType || "Photo"}</p>
                  <p className="text-xs text-muted-foreground">{photo.status}</p>
                  {photo.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaHref(photo.url)}
                      alt={photo.caption || "Evidence"}
                      className="mt-2 max-h-48 w-full rounded-md object-cover"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}
          {job.inspection?.summary?.overallNotes ? (
            <div className="mt-4 rounded-md bg-muted/50 p-3 text-sm">
              <p className="font-medium">Inspector notes</p>
              <p className="mt-1 whitespace-pre-wrap">{job.inspection.summary.overallNotes}</p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Dialog
        open={!!confirmKind}
        onOpenChange={(next) => {
          if (!next && !busy) setConfirmKind(null)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {confirmKind === "delete" ? "Delete job?" : "Cancel job?"}
            </DialogTitle>
            <DialogDescription>
              {confirmKind === "delete"
                ? `${job.jobNumber} will be removed from the jobs list.`
                : `${job.jobNumber} — inspector will be unassigned. You can reassign someone else.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" disabled={busy} onClick={() => setConfirmKind(null)}>
              Keep job
            </Button>
            <Button
              variant="destructive"
              disabled={busy}
              onClick={() => void confirmDestructive()}
            >
              {busy
                ? confirmKind === "delete"
                  ? "Deleting…"
                  : "Cancelling…"
                : confirmKind === "delete"
                  ? "Delete job"
                  : "Cancel & unassign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
