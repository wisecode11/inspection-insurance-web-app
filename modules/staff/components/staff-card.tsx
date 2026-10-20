"use client"

import * as React from "react"
import { MailIcon, PhoneIcon } from "lucide-react"

import { GridCardActions, initialsOf } from "@/components/shared/grid-card"
import {
  FactBox,
  LIST_TONES,
  ListCard,
  ListCardFooter,
  SquareAvatar,
  StatusPill,
  TagChip,
  type ListTone,
} from "@/components/shared/list-card"
import { cn } from "@/lib/utils"
import type { StaffMember } from "@/modules/staff/types/staff.types"

const toneByStatus: Record<string, ListTone> = {
  active: LIST_TONES.green,
  invited: LIST_TONES.amber,
  pending_setup: LIST_TONES.amber,
  suspended: LIST_TONES.red,
  deactivated: LIST_TONES.gray,
}

export function StaffCard({
  member,
  onOpen,
  actions,
}: {
  member: StaffMember
  onOpen?: () => void
  actions?: React.ReactNode
}) {
  const tone = toneByStatus[member.status] ?? LIST_TONES.gray
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
    <ListCard accent={tone.bar} onOpen={onOpen} label={member.name}>
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <SquareAvatar
            initials={initialsOf(member.name)}
            className={cn("size-10 rounded-xl text-[13px]", inactive && "bg-muted-foreground")}
          />
          <div className="min-w-0">
            <h3
              className="truncate text-base font-bold tracking-[-0.02em] text-foreground capitalize"
              title={member.name}
            >
              {member.name}
            </h3>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <TagChip>Inspector</TagChip>
              <StatusPill tone={tone} className="capitalize">
                {member.status.replaceAll("_", " ")}
              </StatusPill>
            </div>
          </div>
        </div>
        {actions ? <GridCardActions className="mt-0 -mr-1.5">{actions}</GridCardActions> : null}
      </header>

      <div className="mt-3 flex flex-col gap-1 text-[13px] text-muted-foreground">
        <a
          href={`mailto:${member.email}`}
          onClick={(event) => event.stopPropagation()}
          className="flex min-w-0 items-center gap-1.5 hover:text-primary dark:hover:text-[#7ddeb0]"
        >
          <MailIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate">{member.email}</span>
        </a>
        <span className="flex items-center gap-1.5">
          <PhoneIcon className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          {member.profile?.phone || "No phone"}
        </span>
      </div>

      <dl className="mt-3 mb-3 grid grid-cols-3 gap-2">
        <FactBox label="Assigned" value={<span className="tabular-nums">{assigned}</span>} />
        <FactBox label="Completed" value={<span className="tabular-nums">{completed}</span>} />
        <FactBox label="Reports" value={<span className="tabular-nums">{reports}</span>} />
      </dl>

      <ListCardFooter className="mt-auto">
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Completion rate</span>
            <span className="font-semibold tabular-nums text-foreground">
              {completion != null ? `${completion}%` : "—"}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-linear-to-r from-[#1FB86A] to-[#3DD388] transition-[width] duration-500"
              style={{ width: `${Math.min(100, Math.max(0, completion ?? 0))}%` }}
            />
          </div>
        </div>
      </ListCardFooter>
    </ListCard>
  )
}
