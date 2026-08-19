"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { MoreHorizontalIcon } from "lucide-react"
import { toast } from "sonner"

import { PageHeader } from "@/components/shared/page-header"
import { DataTable, type Column } from "@/components/shared/data-table"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { ROUTES } from "@/lib/constants/routes"
import { useTenants } from "@/modules/platform-tenants/hooks/use-tenants"
import { tenantService } from "@/modules/platform-tenants/services/tenant.service"
import type { Tenant } from "@/modules/platform-tenants/types/tenant.types"
import { ErrorState, LoadingState } from "@/components/shared/resource-state"

type StatusFilter = "all" | Tenant["status"]

function stopRowClick(event: React.MouseEvent) {
  event.stopPropagation()
}

export default function TenantsPage() {
  const router = useRouter()
  const { data: tenants = [], isLoading, error, reload } = useTenants()
  const [status, setStatus] = React.useState<StatusFilter>("all")
  const [selected, setSelected] = React.useState<Tenant | null>(null)
  const [impersonate, setImpersonate] = React.useState<Tenant | null>(null)

  const rows = React.useMemo(
    () => (status === "all" ? tenants : tenants.filter((t) => t.status === status)),
    [tenants, status],
  )

  if (isLoading) return <LoadingState label="Loading tenants…" />
  if (error) return <ErrorState message={error} />

  function confirmImpersonate() {
    if (!impersonate) return
    toast.success(`Now viewing ${impersonate.name}`)
    setImpersonate(null)
    setSelected(null)
    router.push(ROUTES.company.dashboard)
  }

  const columns: Column<Tenant>[] = [
    {
      key: "name",
      header: "Company",
      sortable: true,
      accessor: (t) => t.name,
      cell: (t) => (
        <div className="flex flex-col">
          <span className="font-medium">{t.name}</span>
          <span className="text-xs text-muted-foreground">{t.region}</span>
        </div>
      ),
    },
    {
      key: "plan",
      header: "Plan",
      sortable: true,
      accessor: (t) => t.plan,
    },
    {
      key: "seats",
      header: "Seats used",
      sortable: true,
      accessor: (t) => t.seatsUsed,
      cell: (t) => (
        <span className="tabular-nums">
          {t.seatsUsed} / {t.seatsTotal}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      accessor: (t) => t.status,
      cell: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "created",
      header: "Created",
      sortable: true,
      accessor: (t) => t.created,
      cell: (t) => <span className="text-muted-foreground tabular-nums">{t.created}</span>,
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      cell: (t) => (
        <div onClick={stopRowClick}>
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
              <MoreHorizontalIcon />
              <span className="sr-only">Row actions</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSelected(t)}>View</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setImpersonate(t)}>Impersonate</DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={async () => {
                  await tenantService.suspend(t.id)
                  await reload()
                  toast.message(`${t.name} marked as suspended`)
                }}
              >
                Suspend
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
        eyebrow="Platform admin"
        title="Tenants"
        description="Every roofing company on RoofClaim, with plan, seats, and account status."
      />

      <DataTable
        data={rows}
        columns={columns}
        rowKey={(t) => t.id}
        searchPlaceholder="Search companies…"
        searchKeys={["name", "plan", "region", "owner"]}
        onRowClick={setSelected}
        emptyTitle="No tenants match"
        emptyDescription="Try a different search or status filter."
        toolbar={
          <Select value={status} onValueChange={(value) => setStatus(value as StatusFilter)}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="trial">Trial</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <Sheet open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <SheetContent className="sm:max-w-md">
          {selected && (
            <>
              <SheetHeader>
                <SheetTitle>{selected.name}</SheetTitle>
                <SheetDescription>
                  {selected.region} · {selected.owner}
                </SheetDescription>
              </SheetHeader>
              <div className="flex flex-col gap-5 overflow-y-auto px-4 pb-2">
                <StatusBadge status={selected.status} />
                <Separator />
                <DetailRow label="Owner" value={selected.owner} />
                <DetailRow label="Email" value={selected.ownerEmail} />
                <DetailRow label="Created" value={selected.created} />
                <Separator />
                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Subscription
                </p>
                <DetailRow label="Plan" value={selected.plan} />
                <DetailRow label="MRR" value={`$${selected.mrr.toLocaleString()}`} />
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Seats</span>
                    <span className="font-medium tabular-nums">
                      {selected.seatsUsed} / {selected.seatsTotal}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.min(100, (selected.seatsUsed / selected.seatsTotal) * 100)}%` }}
                    />
                  </div>
                </div>
                <Separator />
                <p className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                  Usage summary
                </p>
                <DetailRow label="Inspections" value={selected.inspections.toLocaleString()} />
                <DetailRow label="Storage" value={`${selected.storageGb} GB`} />
              </div>
              <SheetFooter>
                <Button variant="outline" onClick={() => setImpersonate(selected)}>
                  Impersonate
                </Button>
                <Button
                  variant="destructive"
                  onClick={async () => {
                    if (!selected) return
                    await tenantService.suspend(selected.id)
                    await reload()
                    toast.message(`${selected.name} marked as suspended`)
                    setSelected(null)
                  }}
                >
                  Suspend
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!impersonate} onOpenChange={(open) => !open && setImpersonate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Impersonate tenant?</DialogTitle>
            <DialogDescription>
              You will enter the {impersonate?.name} workspace as a company admin. This session is
              for support only and is audited.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImpersonate(null)}>
              Cancel
            </Button>
            <Button onClick={confirmImpersonate}>Impersonate</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  )
}
