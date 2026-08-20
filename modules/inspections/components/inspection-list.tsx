"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ROUTES } from "@/lib/constants/routes"
import { getErrorMessage } from "@/lib/api/errors"
import { useJobs } from "@/modules/inspections/hooks/use-jobs"
import { jobService } from "@/modules/inspections/services/job.service"
import {
  JOB_PRIORITY_OPTIONS,
  JOB_STATUS_OPTIONS,
  jobStatusLabel,
  jobStatusVariant,
  type JobPriority,
  type JobRow,
  type JobStatus,
} from "@/modules/inspections/types/job.types"
import { useStaff } from "@/modules/staff/hooks/use-staff"

type StatusFilter = "all" | JobStatus

function formatJobDate(value?: string | null) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

const emptyForm = {
  title: "",
  priority: "normal" as JobPriority,
  dueDate: "",
  customerName: "",
  phone: "",
  email: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  claimNumber: "",
  policyNumber: "",
  dateOfLoss: "",
  insuranceCompany: "",
  notes: "",
  attachmentName: "",
  attachmentUrl: "",
  inspectorId: "unassigned",
}

export default function JobsPage() {
  const router = useRouter()
  const { data: jobs = [], isLoading, error, reload } = useJobs()
  const { data: staff = [] } = useStaff()
  const inspectors = staff.filter((member) => member.status === "active")

  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [open, setOpen] = React.useState(false)
  const [bulkOpen, setBulkOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [form, setForm] = React.useState(emptyForm)
  const [selectedIds, setSelectedIds] = React.useState<string[]>([])
  const [bulkInspectorId, setBulkInspectorId] = React.useState("")
  const [bulkDueDate, setBulkDueDate] = React.useState("")
  const [bulkPriority, setBulkPriority] = React.useState<JobPriority | "">("")

  const rows = React.useMemo(
    () => jobs.filter((row) => status === "all" || row.status === status),
    [jobs, status],
  )

  function setField<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function toggleSelected(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  function openCreate() {
    setForm(emptyForm)
    setOpen(true)
  }

  async function saveJob() {
    if (
      !form.title.trim()
      || !form.customerName.trim()
      || !form.phone.trim()
      || !form.email.trim()
      || !form.line1.trim()
      || !form.city.trim()
      || !form.state.trim()
      || !form.postalCode.trim()
      || !form.claimNumber.trim()
      || !form.policyNumber.trim()
      || !form.insuranceCompany.trim()
      || !form.dateOfLoss
    ) {
      toast.error("Fill all required property, homeowner, insurance, and job fields")
      return
    }

    setSaving(true)
    try {
      const attachments =
        form.attachmentName.trim() && form.attachmentUrl.trim()
          ? [{ name: form.attachmentName.trim(), url: form.attachmentUrl.trim() }]
          : []

      const job = await jobService.create({
        title: form.title.trim(),
        priority: form.priority,
        dueDate: form.dueDate || null,
        customer: {
          name: form.customerName.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
        },
        address: {
          line1: form.line1.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          postalCode: form.postalCode.trim(),
        },
        claim: {
          claimNumber: form.claimNumber.trim(),
          policyNumber: form.policyNumber.trim(),
          dateOfLoss: form.dateOfLoss,
          insuranceCompany: form.insuranceCompany.trim(),
        },
        notes: form.notes.trim() || undefined,
        attachments,
        inspectorId: form.inspectorId === "unassigned" ? undefined : form.inspectorId,
      })
      toast.success("Job created")
      await reload()
      setOpen(false)
      router.push(ROUTES.company.job(job.id))
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function saveBulkAssign() {
    if (!selectedIds.length || !bulkInspectorId) {
      toast.error("Select jobs and an inspector")
      return
    }
    setSaving(true)
    try {
      await jobService.bulkAssign(selectedIds, bulkInspectorId, {
        dueDate: bulkDueDate || null,
        priority: bulkPriority || undefined,
      })
      toast.success(`${selectedIds.length} job(s) assigned`)
      setSelectedIds([])
      setBulkOpen(false)
      await reload()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingState label="Loading jobs…" />
  if (error) return <ErrorState message={error} />

  const columns: Column<JobRow>[] = [
    {
      key: "select",
      header: "",
      cell: (row) => (
        <input
          type="checkbox"
          checked={selectedIds.includes(row.id)}
          onClick={(event) => event.stopPropagation()}
          onChange={() => toggleSelected(row.id)}
        />
      ),
    },
    {
      key: "jobNumber",
      header: "Job",
      sortable: true,
      accessor: (row) => row.jobNumber,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium tabular-nums">{row.jobNumber}</span>
          <span className="text-xs text-muted-foreground">{row.title || "Untitled"}</span>
        </div>
      ),
    },
    {
      key: "addressLine",
      header: "Property / homeowner",
      sortable: true,
      accessor: (row) => row.addressLine,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.addressLine || "—"}</span>
          <span className="text-xs text-muted-foreground">
            {row.customerName || "—"}
            {row.claim?.claimNumber ? ` · Claim ${row.claim.claimNumber}` : ""}
          </span>
        </div>
      ),
    },
    {
      key: "inspector",
      header: "Inspector",
      sortable: true,
      accessor: (row) => row.inspector,
    },
    {
      key: "priority",
      header: "Priority",
      cell: (row) => <span className="capitalize">{row.priority || "normal"}</span>,
    },
    {
      key: "dueDate",
      header: "Due",
      cell: (row) => (
        <span className="tabular-nums text-muted-foreground">{formatJobDate(row.dueDate)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => (
        <StatusBadge status={jobStatusVariant(row.status)} label={jobStatusLabel(row.status)} />
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company workspace"
        title="Jobs"
        description="Create jobs, assign inspectors, track due dates, and move work through the status workflow."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!selectedIds.length}
              onClick={() => {
                setBulkInspectorId(inspectors[0]?.id || "")
                setBulkOpen(true)
              }}
            >
              Bulk assign ({selectedIds.length})
            </Button>
            <Button onClick={openCreate}>
              <PlusIcon data-icon="inline-start" />
              New job
            </Button>
          </div>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search job, address, homeowner, or inspector…"
        searchKeys={["jobNumber", "title", "addressLine", "city", "inspector", "customerName"]}
        emptyTitle="No jobs yet"
        emptyDescription="Create a job with property, homeowner, and insurance details."
        onRowClick={(row) => router.push(ROUTES.company.job(row.id))}
        toolbar={
          <Select value={status} onValueChange={(value) => setStatus((value as StatusFilter) || "all")}>
            <SelectTrigger className="w-[190px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {JOB_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>New job</DialogTitle>
            <DialogDescription>
              Property, homeowner, insurance, and job details. Attachments are optional URL references.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Job title</Label>
              <Input value={form.title} onChange={(e) => setField("title", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(value) => setField("priority", (value as JobPriority) || "normal")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {JOB_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Due date</Label>
              <Input
                type="date"
                value={form.dueDate}
                onChange={(e) => setField("dueDate", e.target.value)}
              />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Property information
            </p>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Property address</Label>
              <Input value={form.line1} onChange={(e) => setField("line1", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>City</Label>
              <Input value={form.city} onChange={(e) => setField("city", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>State</Label>
              <Input value={form.state} onChange={(e) => setField("state", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Zip code</Label>
              <Input value={form.postalCode} onChange={(e) => setField("postalCode", e.target.value)} />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Homeowner information
            </p>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Homeowner name</Label>
              <Input value={form.customerName} onChange={(e) => setField("customerName", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Phone</Label>
              <Input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Email</Label>
              <Input type="email" value={form.email} onChange={(e) => setField("email", e.target.value)} />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Insurance information
            </p>
            <div className="flex flex-col gap-1.5">
              <Label>Claim number</Label>
              <Input value={form.claimNumber} onChange={(e) => setField("claimNumber", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Policy number</Label>
              <Input value={form.policyNumber} onChange={(e) => setField("policyNumber", e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Carrier name</Label>
              <Input
                value={form.insuranceCompany}
                onChange={(e) => setField("insuranceCompany", e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Date of loss</Label>
              <Input
                type="date"
                value={form.dateOfLoss}
                onChange={(e) => setField("dateOfLoss", e.target.value)}
              />
            </div>

            <p className="sm:col-span-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Assignment & notes
            </p>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Assign inspector</Label>
              <Select
                value={form.inspectorId}
                onValueChange={(value) => setField("inspectorId", value || "unassigned")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {inspectors.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label>Notes</Label>
              <Textarea value={form.notes} onChange={(e) => setField("notes", e.target.value)} rows={3} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Attachment name</Label>
              <Input
                value={form.attachmentName}
                onChange={(e) => setField("attachmentName", e.target.value)}
                placeholder="Policy PDF"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Attachment URL</Label>
              <Input
                value={form.attachmentUrl}
                onChange={(e) => setField("attachmentUrl", e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveJob} disabled={saving}>
              {saving ? "Creating…" : "Create job"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Bulk assign jobs</DialogTitle>
            <DialogDescription>
              Assign {selectedIds.length} selected job(s) to one inspector.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3">
            <div className="flex flex-col gap-1.5">
              <Label>Inspector</Label>
              <Select value={bulkInspectorId} onValueChange={(value) => setBulkInspectorId(value || "")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {inspectors.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Due date (optional)</Label>
              <Input type="date" value={bulkDueDate} onChange={(e) => setBulkDueDate(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Priority (optional)</Label>
              <Select
                value={bulkPriority || "keep"}
                onValueChange={(value) => setBulkPriority(value === "keep" ? "" : (value as JobPriority))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="keep">Keep existing</SelectItem>
                  {JOB_PRIORITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>
              Cancel
            </Button>
            <Button disabled={saving} onClick={saveBulkAssign}>
              {saving ? "Assigning…" : "Assign jobs"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
