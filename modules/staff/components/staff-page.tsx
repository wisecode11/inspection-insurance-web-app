"use client"

import * as React from "react"
import { MoreHorizontalIcon, UserPlusIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { staffService } from "@/modules/staff/services/staff.service"
import { useStaff } from "@/modules/staff/hooks/use-staff"
import type { StaffMember } from "@/modules/staff/types/staff.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation()
}

export default function StaffPage() {
  const { data, isLoading, error, reload } = useStaff()
  const rows = data ?? []
  const [open, setOpen] = React.useState(false)
  const [editing, setEditing] = React.useState<StaffMember | null>(null)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [role, setRole] = React.useState<StaffMember["role"]>("Inspector")

  function openInvite() {
    setEditing(null)
    setName("")
    setEmail("")
    setRole("Inspector")
    setOpen(true)
  }

  function openEdit(member: StaffMember) {
    setEditing(member)
    setName(member.name)
    setEmail(member.email)
    setRole(member.role)
    setOpen(true)
  }

  async function saveMember() {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required")
      return
    }
    if (editing) {
      await staffService.update(editing.id, { name, email, role })
      toast.success("Inspector updated")
    } else {
      await staffService.create({ name, email, role })
      toast.success(`Invite sent to ${email}`)
    }
    await reload()
    setOpen(false)
  }

  if (isLoading) return <LoadingState label="Loading staff…" />
  if (error) return <ErrorState message={error} />

  const columns: Column<StaffMember>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      accessor: (s) => s.name,
      cell: (s) => (
        <div className="flex flex-col">
          <span className="font-medium">{s.name}</span>
          <span className="text-xs text-muted-foreground">{s.email}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      accessor: (s) => s.email,
      className: "hidden md:table-cell",
    },
    { key: "role", header: "Role", sortable: true, accessor: (s) => s.role },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (s) => s.status,
      cell: (s) => <StatusBadge status={s.status} />,
    },
    {
      key: "jobsCompleted",
      header: "Jobs completed",
      sortable: true,
      accessor: (s) => s.jobsCompleted,
      align: "right",
      cell: (s) => <span className="tabular-nums">{s.jobsCompleted}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (s) => (
        <div onClick={stopRowClick}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontalIcon />
              <span className="sr-only">Row actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => openEdit(s)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  await staffService.disable(s.id)
                  await reload()
                  toast.message(`${s.name} disabled`)
                }}
              >
                Disable
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ]

  return (
    <>
      <PageHeader
        eyebrow="Company admin"
        title="Staff"
        description="Inspector accounts for Summit Ridge Roofing. Invite, edit, or disable access."
        actions={
          <Button onClick={openInvite}>
            <UserPlusIcon data-icon="inline-start" />
            Invite inspector
          </Button>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(s) => s.id}
        searchPlaceholder="Search staff…"
        searchKeys={["name", "email", "role"]}
        emptyTitle="No inspectors yet"
        emptyDescription="Invite your first inspector to start assigning jobs."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit inspector" : "Invite inspector"}</DialogTitle>
            <DialogDescription>
              {editing
                ? "Update this account’s name, email, and role."
                : "They’ll receive an email to join the Summit Ridge workspace."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-name">Name</Label>
              <Input id="staff-name" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label>Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as StaffMember["role"])}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lead inspector">Lead inspector</SelectItem>
                  <SelectItem value="Inspector">Inspector</SelectItem>
                  <SelectItem value="Reviewer">Reviewer</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={saveMember}>{editing ? "Save" : "Send invite"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
