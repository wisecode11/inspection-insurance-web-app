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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PasswordField } from "@/modules/auth/components/password-field"
import { staffService } from "@/modules/staff/services/staff.service"
import { useStaff } from "@/modules/staff/hooks/use-staff"
import type { StaffMember } from "@/modules/staff/types/staff.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { getErrorMessage } from "@/lib/api/errors"

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation()
}

export default function StaffPage() {
  const { data, isLoading, error, reload } = useStaff()
  const rows = data ?? []
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [name, setName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")

  function openAdd() {
    setName("")
    setEmail("")
    setPassword("")
    setOpen(true)
  }

  async function saveMember() {
    if (!name.trim() || !email.trim() || !password.trim()) {
      toast.error("Name, email, and password are required")
      return
    }
    if (password.trim().length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setSaving(true)
    try {
      const result = await staffService.create({
        name: name.trim(),
        email: email.trim(),
        password,
      })
      if (result.emailSent) {
        toast.success(`Inspector added. Login details sent to ${email.trim()}`)
      } else {
        toast.success("Inspector added. Share the password you set — they sign in on the mobile app.")
      }
      await reload()
      setOpen(false)
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
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
        <div className="flex flex-col gap-0.5">
          <span className="font-medium">{s.name}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      sortable: true,
      accessor: (s) => s.email,
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      accessor: (s) => s.role,
      cell: () => "Inspector",
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (s) => s.status,
      cell: (s) => (
        <StatusBadge
          status={s.status === "active" ? "active" : "suspended"}
          label={s.status === "active" ? "Active" : "Inactive"}
        />
      ),
    },
    {
      key: "actions",
      header: "Action",
      align: "right",
      className: "w-24",
      cell: (s) => (
        <div className="flex justify-end" onClick={stopRowClick}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontalIcon />
              <span className="sr-only">Manage inspector</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuGroup>
                <DropdownMenuLabel>User management</DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  Total jobs
                  <span className="ml-auto tabular-nums text-muted-foreground">{s.jobsTotal ?? 0}</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    const next = s.status === "active" ? "suspended" : "active"
                    await staffService.setStatus(s.id, next)
                    await reload()
                    toast.success(next === "active" ? `${s.name} is active` : `${s.name} is inactive`)
                  } catch (err) {
                    toast.error(getErrorMessage(err))
                  }
                }}
              >
                {s.status === "active" ? "Set inactive" : "Set active"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  if (!window.confirm(`Delete ${s.name}? They will lose mobile-app access.`)) return
                  try {
                    await staffService.remove(s.id)
                    await reload()
                    toast.success(`${s.name} deleted`)
                  } catch (err) {
                    toast.error(getErrorMessage(err))
                  }
                }}
              >
                Delete
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
        description="Add inspectors with an email and password. They use those credentials on the RoofClaim mobile app."
        actions={
          <Button onClick={openAdd}>
            <UserPlusIcon data-icon="inline-start" />
            Add inspector
          </Button>
        }
      />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(s) => s.id}
        searchPlaceholder="Search inspectors…"
        searchKeys={["name", "email"]}
        emptyTitle="No inspectors yet"
        emptyDescription="Add your first inspector. They’ll sign in on the mobile app with the email and password you set."
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add inspector</DialogTitle>
            <DialogDescription>
              Create a mobile-app account. We’ll email the login details to this person.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-name">Name</Label>
              <Input
                id="staff-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-email">Email</Label>
              <Input
                id="staff-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="staff-password">Password</Label>
              <PasswordField
                id="staff-password"
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={saveMember} disabled={saving}>
              {saving ? "Adding…" : "Add inspector"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
