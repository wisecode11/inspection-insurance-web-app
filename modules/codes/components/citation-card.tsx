"use client"

import * as React from "react"
import { BookOpenIcon, LinkIcon } from "lucide-react"

import { GridCardActions } from "@/components/shared/grid-card"
import {
  LIST_TONES,
  ListCard,
  ListCardFooter,
  StatusPill,
  TagChip,
} from "@/components/shared/list-card"
import { cn } from "@/lib/utils"

export type CitationCardData = {
  id: string
  scope: string
  state: string
  code: string
  title: string
  body: string
  source?: string
  isActive: boolean
}

const LONG_BODY = 180

export function CitationCard({
  citation,
  actions,
}: {
  citation: CitationCardData
  actions?: React.ReactNode
}) {
  const [expanded, setExpanded] = React.useState(false)
  const isCompany = citation.scope === "tenant"
  const isLong = citation.body.length > LONG_BODY
  const sourceIsUrl = /^https?:\/\//i.test(citation.source ?? "")

  return (
    <ListCard
      accent={isCompany ? LIST_TONES.green.bar : LIST_TONES.gray.bar}
      label={`${citation.code} ${citation.title}`}
      className={cn(!citation.isActive && "opacity-70")}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-[10px] bg-[#0A3326] text-white">
            <BookOpenIcon className="size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col">
            <span
              className="truncate font-mono text-sm font-semibold tracking-tight text-foreground"
              title={citation.code}
            >
              {citation.code}
            </span>
            <span className="text-xs text-muted-foreground">Building code</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <TagChip className="font-mono tracking-wider">{citation.state || "—"}</TagChip>
          {actions ? <GridCardActions className="mt-0 -mr-1.5">{actions}</GridCardActions> : null}
        </div>
      </header>

      <div className="mt-3 flex flex-col gap-1.5">
        <h3
          className="line-clamp-2 text-base font-bold tracking-[-0.02em] text-foreground"
          title={citation.title}
        >
          {citation.title}
        </h3>
        <p
          className={cn(
            "text-[13px] leading-relaxed whitespace-pre-line text-muted-foreground",
            !expanded && "line-clamp-3",
          )}
        >
          {citation.body}
        </p>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-fit text-xs font-semibold text-primary hover:underline dark:text-[#7ddeb0]"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
      </div>

      <ListCardFooter className="mt-auto">
        <div className="flex flex-wrap items-center gap-1.5">
          <StatusPill tone={isCompany ? LIST_TONES.green : LIST_TONES.gray}>
            {isCompany ? "Company" : "Platform"}
          </StatusPill>
          {!citation.isActive ? (
            <span className="rounded-full bg-warning/14 px-2.5 py-[3px] text-[12.5px] font-semibold text-warning">
              Inactive
            </span>
          ) : null}
        </div>
        {citation.source ? (
          sourceIsUrl ? (
            <a
              href={citation.source}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-[#7ddeb0]"
            >
              <LinkIcon className="size-3 shrink-0" aria-hidden />
              <span className="truncate">Source</span>
            </a>
          ) : (
            <span className="min-w-0 truncate text-xs text-muted-foreground" title={citation.source}>
              {citation.source}
            </span>
          )
        ) : null}
      </ListCardFooter>
    </ListCard>
  )
}
