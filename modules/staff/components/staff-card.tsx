"use client"

import * as React from "react"
import { MailIcon, PhoneIcon } from "lucide-react"

import { AvatarInitials, GridCard, GridCardActions } from "@/components/shared/grid-card"
import { StatusBadge, type StatusVariant } from "@/components/shared/status-badge"
import { cn } from "@/lib/utils"
import type { StaffMember } from "@/modules/staff/types/staff.types"

const accentByStatus: Record<string, string> = {
  active: "bg-success",
  suspended: "bg-danger",
  invited: "bg-warning",
  pending_setup: "bg-warning",
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 rounded-xl bg-primary-tint/45 px-2 py-2.5">
      <span className="text-lg leading-none font-semibold tabular-nums text-foreground">{value}</span>
      <span className="text-center text-[0.65rem] font-semibold tracking-wider text-muted-foreground/80 uppercase">
        {label}
      </span>
    </div>
  )
}

export function StaffCard({
  member,
  statusVariant,
  onOpen,
  actions,
}: {
  member: StaffMember
  statusVariant: StatusVariant
  onOpen?: () => void
  actions?: React.ReactNode
}) {
  const assigned = member.jobsAssigned ?? 0
  const completed = member.jobsCompleted ?? 0
  const reports = member.reportsSubmitted ?? 0
  const total = member.jobsTotal || assigned + completed
  const completion =
    member.productivity?.completionRate != null
      ? Math.round(member.productivity.completionRate)
      : total > 0
        ? Math.round((completed / total) * 100)
        : null
  const inactive = member.status === "deactivated" || member.status === "suspended"

  return (
    <GridCard
      accent={accentByStatus[member.status] ?? "bg-muted-foreground/40"}
      onOpen={onOpen}
      label={member.name}
    >
      <header className="flex items-start gap-3">
        <AvatarInitials
          name={member.name}
          className={cn("size-12 text-base", inactive && "from-muted-foreground to-muted-foreground")}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="truncate text-base font-semibold tracking-tight capitalize" title={member.name}>
            {member.name}
          </h3>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-foreground/[0.05] px-1.5 py-0.5 text-[0.7rem] font-semibold text-muted-foreground">
              Inspector
            </span>
            <StatusBadge
              status={statusVariant}
              label={member.status.replaceAll("_", " ")}
              className="rounded-full capitalize"
            />
          </div>
        </div>
        {actions ? <GridCardActions>{actions}</GridCardActions> : null}
      </header>

      <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
        <a
          href={`mailto:${member.email}`}
          onClick={(event) => event.stopPropagation()}
          className="flex min-w-0 items-center gap-2 hover:text-primary"
        >
          <MailIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
          <span className="truncate">{member.email}</span>
        </a>
        <span className="flex items-center gap-2">
          <PhoneIcon className="size-3.5 shrink-0 text-primary" aria-hidden />
          {member.profile?.phone || "No phone"}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="Assigned" value={assigned} />
        <Stat label="Completed" value={completed} />
        <Stat label="Reports" value={reports} />
      </div>

      {completion != null ? (
        <div className="mt-auto flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion rate</span>
            <span className="font-semibold tabular-nums">{completion}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-primary-tint">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-success transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completion))}%` }}
            />
          </div>
        </div>
      ) : null}
    </GridCard>
  )
}
