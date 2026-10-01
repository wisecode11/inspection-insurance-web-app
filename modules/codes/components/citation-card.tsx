"use client"

import * as React from "react"
import { BookOpenIcon, Building2Icon, GlobeIcon, LinkIcon } from "lucide-react"

import { GridCard, GridCardActions } from "@/components/shared/grid-card"
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
    <GridCard
      accent={isCompany ? "bg-primary" : "bg-muted-foreground/40"}
      className={cn(!citation.isActive && "opacity-70")}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-tint text-primary">
            <BookOpenIcon className="size-5" aria-hidden />
          </span>
          <div className="flex min-w-0 flex-col">
            <span className="truncate font-mono text-sm font-semibold tracking-tight text-foreground" title={citation.code}>
              {citation.code}
            </span>
            <span className="text-xs text-muted-foreground">Building code</span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <span className="rounded-lg bg-foreground/[0.05] px-2 py-1 font-mono text-xs font-bold tracking-wider text-foreground">
            {citation.state || "—"}
          </span>
          {actions ? <GridCardActions className="mt-0">{actions}</GridCardActions> : null}
        </div>
      </header>

      <div className="flex flex-col gap-1.5">
        <h3 className="line-clamp-2 text-base font-semibold tracking-tight" title={citation.title}>
          {citation.title}
        </h3>
        <p
          className={cn(
            "text-sm leading-relaxed whitespace-pre-line text-muted-foreground",
            !expanded && "line-clamp-3",
          )}
        >
          {citation.body}
        </p>
        {isLong ? (
          <button
            type="button"
            onClick={() => setExpanded((value) => !value)}
            className="w-fit text-xs font-semibold text-primary hover:underline"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
      </div>

      <footer className="mt-auto flex items-center justify-between gap-3 border-t border-border/70 pt-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isCompany ? "bg-primary-tint text-primary" : "bg-foreground/[0.05] text-muted-foreground",
            )}
          >
            {isCompany ? (
              <Building2Icon className="size-3" aria-hidden />
            ) : (
              <GlobeIcon className="size-3" aria-hidden />
            )}
            {isCompany ? "Company" : "Platform"}
          </span>
          {!citation.isActive ? (
            <span className="rounded-full bg-warning/14 px-2 py-0.5 text-xs font-medium text-warning">
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
              className="inline-flex min-w-0 items-center gap-1 text-xs font-medium text-primary hover:underline"
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
      </footer>
    </GridCard>
  )
}
