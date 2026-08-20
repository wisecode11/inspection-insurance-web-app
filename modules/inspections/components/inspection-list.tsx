"use client"

import * as React from "react"
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
import { useJobs } from "@/modules/inspections/hooks/use-jobs"
import { jobService } from "@/modules/inspections/services/job.service"
import { jobStatusVariant, type JobRow, type JobStatus } from "@/modules/inspections/types/job.types"
import { useStaff } from "@/modules/staff/hooks/use-staff"
import { getErrorMessage } from "@/lib/api/errors"

type StatusFilter = "all" | JobStatus

function formatJobDate(value: string) {
  if (!value) return "—"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

export default function JobsPage() {
  const { data: jobs = [], isLoading, error, reload } = useJobs()
  const { data: staff = [] } = useStaff()
  const inspectors = staff.filter((member) => member.status === "active")

  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [customerName, setCustomerName] = React.useState("")
  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [line1, setLine1] = React.useState("")
  const [city, setCity] = React.useState("")
  const [state, setState] = React.useState("")
  const [postalCode, setPostalCode] = React.useState("")
  const [notes, setNotes] = React.useState("")
  const [inspectorId, setInspectorId] = React.useState("unassigned")

  const rows = React.useMemo(
    () => jobs.filter((row) => status === "all" || row.status === status),
    [jobs, status],
  )

  function openCreate() {
    setCustomerName("")
    setPhone("")
    setEmail("")
    setLine1("")
    setCity("")
    setState("")
    setPostalCode("")
    setNotes("")
    setInspectorId("unassigned")
    setOpen(true)
  }

  async function saveJob() {
    if (!customerName.trim() || !line1.trim() || !city.trim()) {
      toast.error("Customer name, street, and city are required")
      return
    }

    setSaving(true)
    try {
      await jobService.create({
        customer: {
          name: customerName.trim(),
          phone: phone.trim() || undefined,
          email: email.trim() || undefined,
        },
        address: {
          line1: line1.trim(),
          city: city.trim(),
          state: state.trim() || undefined,
          postalCode: postalCode.trim() || undefined,
        },
        notes: notes.trim() || undefined,
        inspectorId: inspectorId === "unassigned" ? undefined : inspectorId,
      })
      toast.success("Job created")
      await reload()
      setOpen(false)
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
      key: "jobNumber",
      header: "Job",
      sortable: true,
      accessor: (row) => row.jobNumber,
      cell: (row) => <span className="font-medium tabular-nums">{row.jobNumber}</span>,
    },
    {
      key: "addressLine",
      header: "Property address",
      sortable: true,
      accessor: (row) => row.addressLine,
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-medium">{row.addressLine || "—"}</span>
          <span className="text-xs text-muted-foreground">{row.city || row.customerName}</span>
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
      key: "createdAt",
      header: "Date",
      sortable: true,
      accessor: (row) => row.createdAt,
      cell: (row) => <span className="tabular-nums text-muted-foreground">{formatJobDate(row.createdAt)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (row) => row.status,
      cell: (row) => <StatusBadge status={jobStatusVariant(row.status)} />,
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Jobs & reports"
        description="Create a job with the property address and assign it to an inspector."
        actions={
          <Button onClick={openCreate}>
            <PlusIcon data-icon="inline-start" />
            New job
          </Button>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(row) => row.id}
        searchPlaceholder="Search job, address, or inspector…"
        searchKeys={["jobNumber", "addressLine", "city", "inspector", "customerName"]}
        emptyTitle="No jobs yet"
        emptyDescription="Create a job and assign an inspector to start an inspection."
        toolbar={
          <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="in_progress">In progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New job</DialogTitle>
            <DialogDescription>
              Add the property details, then assign an inspector from your staff.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="job-customer">Customer name</Label>
              <Input
                id="job-customer"
                value={customerName}
                onChange={(event) => setCustomerName(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-phone">Phone</Label>
              <Input id="job-phone" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-email">Email</Label>
              <Input
                id="job-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <Label htmlFor="job-street">Street address</Label>
              <Input id="job-street" value={line1} onChange={(event) => setLine1(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-city">City</Label>
              <Input id="job-city" value={city} onChange={(event) => setCity(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-state">State</Label>
              <Input id="job-state" value={state} onChange={(event) => setState(event.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="job-postal">Postal code</Label>
              <Input
                id="job-postal"
                value={postalCode}
                onChange={(event) => setPostalCode(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Assign inspector</Label>
              <Select value={inspectorId} onValueChange={setInspectorId}>
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
              <Label htmlFor="job-notes">Notes</Label>
              <Textarea
                id="job-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
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
    </>
  )
}
