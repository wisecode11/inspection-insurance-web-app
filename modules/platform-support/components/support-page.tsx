"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { SearchIcon } from "lucide-react"
import { toast } from "@/lib/toast"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useSupport } from "@/modules/platform-support/hooks/use-support"
import type { SupportTicket } from "@/modules/platform-support/types/support.types"
import type { Tenant } from "@/modules/platform-tenants/types/tenant.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"
import { ROUTES } from "@/lib/constants/routes"

const priorityStatus: Record<SupportTicket["priority"], StatusVariant> = {
  critical: "critical",
  pending: "pending",
  open: "open",
}

const columns: Column<SupportTicket>[] = [
  {
    key: "id",
    header: "Ticket",
    sortable: true,
    accessor: (t) => t.id,
    cell: (t) => <span className="font-medium tabular-nums">{t.id}</span>,
  },
  {
    key: "subject",
    header: "Subject",
    sortable: true,
    accessor: (t) => t.subject,
  },
  {
    key: "tenant",
    header: "Tenant",
    sortable: true,
    accessor: (t) => t.tenant,
  },
  {
    key: "priority",
    header: "Priority",
    cell: (t) => <StatusBadge status={priorityStatus[t.priority]} />,
  },
  {
    key: "status",
    header: "Status",
    cell: (t) => <StatusBadge status={t.status === "resolved" ? "resolved" : t.status === "pending" ? "pending" : "open"} />,
  },
  {
    key: "updated",
    header: "Updated",
    cell: (t) => <span className="text-muted-foreground">{t.updated}</span>,
  },
]

export default function SupportPage() {
  const router = useRouter()
  const { data, isLoading, error } = useSupport()
  const tenants = data?.tenants ?? []
  const supportTickets = data?.tickets ?? []
  const [query, setQuery] = React.useState("")
  const [picked, setPicked] = React.useState<Tenant | null>(null)
  const [confirmOpen, setConfirmOpen] = React.useState(false)

  const matches = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return tenants.slice(0, 5)
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.owner.toLowerCase().includes(q) ||
        t.region.toLowerCase().includes(q),
    )
  }, [query, tenants])

  if (isLoading) return <LoadingState label="Loading support…" />
  if (error) return <ErrorState message={error} />

  return (
    <>
      <PageHeader
        eyebrow="Platform admin"
        title="Support tools"
        description="Impersonate a tenant workspace and triage incoming support issues."
      />

      <Card>
        <CardHeader>
          <CardTitle>Tenant impersonation launcher</CardTitle>
          <CardDescription>Search a company, then confirm before entering their workspace.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="relative max-w-md">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPicked(null)
              }}
              placeholder="Search company name, owner, or region…"
              className="pl-8"
            />
          </div>
          <div className="overflow-hidden rounded-lg border">
            {matches.length === 0 ? (
              <p className="p-6 text-sm text-muted-foreground">No companies match that search.</p>
            ) : (
              <ul className="divide-y">
                {matches.map((tenant) => (
                  <li key={tenant.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setPicked(tenant)}
                      className="flex min-w-0 flex-1 flex-col text-left"
                    >
                      <span className="text-sm font-medium">{tenant.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {tenant.plan} · {tenant.region}
                      </span>
                    </button>
                    <StatusBadge status={tenant.status} />
                    <Button
                      size="sm"
                      variant={picked?.id === tenant.id ? "default" : "outline"}
                      onClick={() => {
                        setPicked(tenant)
                        setConfirmOpen(true)
                      }}
                    >
                      Impersonate
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support tickets</CardTitle>
          <CardDescription>Open issues from tenant admins and inspectors</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={supportTickets}
            columns={columns}
            rowKey={(t) => t.id}
            searchPlaceholder="Search tickets…"
            searchKeys={["id", "subject", "tenant", "requester"]}
            emptyTitle="No tickets"
            emptyDescription="The support queue is clear."
          />
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate {picked?.name}?</DialogTitle>
            <DialogDescription>
              You will switch into the company admin workspace for {picked?.name}. The session is
              logged for audit.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                toast.success(`Now viewing ${picked?.name}`)
                setConfirmOpen(false)
                router.push(ROUTES.company.dashboard)
              }}
            >
              Impersonate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
