"use client"

import * as React from "react"
import Link from "next/link"
import {
  BoldIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ItalicIcon,
  ListIcon,
  PlusIcon,
  RotateCcwIcon,
} from "lucide-react"
import { toast } from "@/lib/toast"

import {
  HeroBand,
  heroGhostButtonClass,
  heroPrimaryButtonClass,
} from "@/components/shared/list-page-hero"
import { ErrorState, LoadingSkeleton } from "@/components/shared/resource-state"
import { Checkbox } from "@/components/ui/checkbox"
import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"
import { getErrorMessage } from "@/lib/api/errors"
import { useTemplates } from "@/modules/templates/hooks/use-templates"
import { templateService } from "@/modules/templates/services/template.service"
import {
  NARRATIVE_SLOTS,
  type NarrativeSlotKey,
  type ReportSection,
  type ReportTemplate,
} from "@/modules/templates/types/template.types"

type SectionId = NarrativeSlotKey | "disclaimer" | "codes"

type SectionMeta = {
  id: SectionId
  title: string
  kind: "narrative" | "disclaimer" | "codes"
  hint?: string
}

const PLACEHOLDER_RE = /\[[A-Z0-9 _]+\]/g

function findSection(
  sections: ReportSection[],
  key: NarrativeSlotKey,
  title: string,
): ReportSection | undefined {
  return (
    sections.find((row) => row.key === key) ||
    sections.find((row) => row.title.toLowerCase() === title.toLowerCase())
  )
}

function readNarrativeBodies(template: ReportTemplate): Record<NarrativeSlotKey, string> {
  const next = {} as Record<NarrativeSlotKey, string>
  for (const slot of NARRATIVE_SLOTS) {
    next[slot.key] = findSection(template.sections, slot.key, slot.title)?.body || ""
  }
  if (!next.damage_definitions_assessment_criteria.trim() && template.definitions?.trim()) {
    next.damage_definitions_assessment_criteria = template.definitions
  }
  return next
}

function mergeNarrativeIntoSections(
  sections: ReportSection[],
  bodies: Record<NarrativeSlotKey, string>,
): ReportSection[] {
  const next = sections.map((section) => ({ ...section }))

  for (const slot of NARRATIVE_SLOTS) {
    const body = bodies[slot.key]
    const existingIndex = next.findIndex(
      (row) =>
        row.key === slot.key || row.title.toLowerCase() === slot.title.toLowerCase(),
    )

    if (existingIndex >= 0) {
      next[existingIndex] = {
        ...next[existingIndex],
        key: slot.key,
        title: slot.title,
        body,
        include: true,
      }
      continue
    }

    next.push({
      id: `sec-${slot.key}`,
      key: slot.key,
      title: slot.title,
      include: true,
      sortOrder: next.length,
      body,
    })
  }

  return next.map((section, index) => ({ ...section, sortOrder: index }))
}

function wrapSelection(
  value: string,
  start: number,
  end: number,
  before: string,
  after: string,
) {
  const selected = value.slice(start, end) || "text"
  const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
  const cursor = start + before.length + selected.length + after.length
  return { next, cursor }
}

function collectPlaceholders(sections: SectionMeta[]) {
  const found = new Set<string>(["[ROOF AGE]"])
  for (const section of sections) {
    const matches = section.hint?.match(PLACEHOLDER_RE) ?? []
    for (const match of matches) found.add(match)
  }
  return [...found]
}

function previewBody(text: string, max = 220) {
  const clean = text.replace(/\s+/g, " ").trim()
  if (!clean) return "No wording yet for this section."
  if (clean.length <= max) return clean
  return `${clean.slice(0, max).trim()}…`
}

const PANEL_CLASS =
  "rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(14,27,22,0.04),0_16px_36px_-22px_rgba(6,36,27,0.35)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.35),0_16px_36px_-22px_rgba(0,0,0,0.55)]"

const ACTIVE_NAV_CLASS =
  "border-primary/25 bg-primary/10 text-foreground dark:border-[#1FB86A]/40 dark:bg-[#1FB86A]/15 dark:text-[#f3faf6]"

const PREVIEW_ACTIVE_CLASS =
  "border-[#E9A23B]/45 bg-[#FFF4E2]/80 dark:border-[#D9820F]/45 dark:bg-[#D9820F]/15"

export default function TemplatesPage() {
  const { data, isLoading, error, reload } = useTemplates()
  const [template, setTemplate] = React.useState<ReportTemplate | null>(null)
  const [bodies, setBodies] = React.useState<Record<NarrativeSlotKey, string>>({
    summary_of_findings: "",
    investigation_process: "",
    damage_definitions_assessment_criteria: "",
    existing_conditions: "",
  })
  const [legalFooter, setLegalFooter] = React.useState("")
  const [citationIds, setCitationIds] = React.useState<string[]>([])
  const [saving, setSaving] = React.useState(false)
  const [activeId, setActiveId] = React.useState<SectionId>("summary_of_findings")
  const baselineRef = React.useRef<{
    bodies: Record<NarrativeSlotKey, string>
    legalFooter: string
    citationIds: string[]
  } | null>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  React.useEffect(() => {
    if (!data) return
    const preferred =
      data.templates.find((row) => row.isDefault) || data.templates[0] || null
    if (!preferred) return
    const nextBodies = readNarrativeBodies(preferred)
    const nextFooter = preferred.legalFooter || ""
    const nextCitations = preferred.codeCitationIds || []
    setTemplate(preferred)
    setBodies(nextBodies)
    setLegalFooter(nextFooter)
    setCitationIds(nextCitations)
    baselineRef.current = {
      bodies: nextBodies,
      legalFooter: nextFooter,
      citationIds: nextCitations,
    }
  }, [data])

  const citations = data?.citations ?? []

  const sections: SectionMeta[] = React.useMemo(
    () => [
      ...NARRATIVE_SLOTS.map((slot) => ({
        id: slot.key as SectionId,
        title: slot.title,
        kind: "narrative" as const,
        hint: slot.hint,
      })),
      { id: "disclaimer", title: "Disclaimer", kind: "disclaimer" },
      { id: "codes", title: "Codes & standards", kind: "codes" },
    ],
    [],
  )

  const activeIndex = Math.max(
    0,
    sections.findIndex((section) => section.id === activeId),
  )
  const active = sections[activeIndex] ?? sections[0]
  const prev = sections[activeIndex - 1]
  const next = sections[activeIndex + 1]
  const placeholders = collectPlaceholders(sections)

  const activeBody =
    active.kind === "narrative"
      ? bodies[active.id as NarrativeSlotKey]
      : active.kind === "disclaimer"
        ? legalFooter
        : ""

  async function saveTemplate() {
    if (!template) return
    setSaving(true)
    try {
      const nextSections = mergeNarrativeIntoSections(template.sections, bodies)
      const updated = await templateService.update(template.id, {
        sections: nextSections,
        legalFooter: legalFooter.trim(),
        definitions: bodies.damage_definitions_assessment_criteria,
        codeCitationIds: citationIds,
        isDefault: true,
      })
      setTemplate(updated)
      const nextBodies = readNarrativeBodies(updated)
      const nextFooter = updated.legalFooter || ""
      const nextCitations = updated.codeCitationIds || []
      setBodies(nextBodies)
      setLegalFooter(nextFooter)
      setCitationIds(nextCitations)
      baselineRef.current = {
        bodies: nextBodies,
        legalFooter: nextFooter,
        citationIds: nextCitations,
      }
      toast.success("Saved")
      await reload?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  function resetActiveSection() {
    const baseline = baselineRef.current
    if (!baseline || !active) return
    if (active.kind === "narrative") {
      const key = active.id as NarrativeSlotKey
      setBodies((current) => ({ ...current, [key]: baseline.bodies[key] }))
    } else if (active.kind === "disclaimer") {
      setLegalFooter(baseline.legalFooter)
    } else {
      setCitationIds(baseline.citationIds)
    }
    toast.info("Section reset")
  }

  function applyWrap(before: string, after: string) {
    if (active.kind !== "narrative") return
    const el = textareaRef.current
    if (!el) return
    const start = el.selectionStart
    const end = el.selectionEnd
    const key = active.id as NarrativeSlotKey
    const { next: nextValue, cursor } = wrapSelection(bodies[key], start, end, before, after)
    setBodies((current) => ({ ...current, [key]: nextValue }))
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(cursor, cursor)
    })
  }

  function insertPlaceholder(token: string) {
    if (active.kind !== "narrative") {
      toast.info("Placeholders can be inserted in narrative sections")
      return
    }
    const el = textareaRef.current
    const key = active.id as NarrativeSlotKey
    const value = bodies[key]
    const start = el?.selectionStart ?? value.length
    const end = el?.selectionEnd ?? value.length
    const nextValue = `${value.slice(0, start)}${token}${value.slice(end)}`
    setBodies((current) => ({ ...current, [key]: nextValue }))
    requestAnimationFrame(() => {
      const cursor = start + token.length
      el?.focus()
      el?.setSelectionRange(cursor, cursor)
    })
  }

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState message={error} />
  if (!template || !active) {
    return <ErrorState message="No report language defaults found." />
  }

  return (
    <div className="relative flex flex-col gap-6 pb-4">
      {/* Full-bleed green band — continues the navbar; content stays in the shell gutters */}
      <header className="relative">
        <HeroBand className="-top-6 -bottom-[48px]" />
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-5 pt-3 pb-1">
          <div className="min-w-0">
            <p className="text-xs font-medium tracking-wide text-[#B9D3C7]">
              Settings <span className="mx-1.5 text-white/35">/</span> Report language
            </p>
            <h1 className="mt-2.5 text-[clamp(28px,3.2vw,40px)] leading-none font-bold tracking-[-0.035em] text-white">
              Report language
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[#B9D3C7] sm:text-base">
              Default wording used in evidence package PDFs. Edit one section at a time and see it
              on the page.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={resetActiveSection} className={heroGhostButtonClass}>
              <RotateCcwIcon className="size-4" />
              Reset section
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void saveTemplate()}
              className={cn(heroPrimaryButtonClass, "disabled:cursor-not-allowed disabled:opacity-70")}
            >
              <CheckIcon className="size-4" />
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </header>

      {/* Three-column workspace — same max-width/gutter alignment as the hero text */}
      <div className="relative z-10 grid items-start gap-5 xl:grid-cols-[minmax(15rem,17.5rem)_minmax(0,1fr)_minmax(16rem,20rem)]">
        {/* Left: sections + placeholders */}
        <aside className="flex flex-col gap-4 xl:sticky xl:top-4">
          <nav aria-label="Report sections" className={cn(PANEL_CLASS, "p-3")}>
            <p className="px-2 pt-1 pb-2.5 text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Sections
            </p>
            <ol className="flex flex-col gap-1">
              {sections.map((section, index) => {
                const isActive = section.id === active.id
                return (
                  <li key={section.id}>
                    <button
                      type="button"
                      onClick={() => setActiveId(section.id)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl border px-2 py-2 text-left text-[13px] leading-snug font-semibold transition-colors",
                        isActive ? ACTIVE_NAV_CLASS : "border-transparent text-foreground/80 hover:bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "grid size-7 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold",
                          isActive
                            ? "bg-[#0A3326] text-white dark:bg-[#1FB86A] dark:text-[#06241B]"
                            : "border border-border bg-muted text-muted-foreground",
                        )}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="min-w-0">{section.title}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>

          <div className={cn(PANEL_CLASS, "p-4")}>
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              Placeholders
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Click to insert into the active narrative section.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {placeholders.map((token) => (
                <button
                  key={token}
                  type="button"
                  onClick={() => insertPlaceholder(token)}
                  className="rounded-md border border-[#F5D9A8] bg-[#FFF4E2] px-2 py-1 font-mono text-[11px] font-semibold text-[#C2700A] transition-colors hover:border-[#E9A23B] dark:border-[#D9820F]/45 dark:bg-[#D9820F]/18 dark:text-[#FBBF24]"
                >
                  {token}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: focused editor */}
        <section className={cn(PANEL_CLASS, "flex min-h-[32rem] flex-col overflow-hidden")}>
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
            <div className="flex min-w-0 items-start gap-3">
              <span className="mt-0.5 grid size-9 shrink-0 place-items-center rounded-full bg-primary/15 font-mono text-[12px] font-bold text-primary dark:bg-[#1FB86A]/20 dark:text-[#9BEBC0]">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0">
                <h2 className="text-base font-bold tracking-[-0.02em] text-foreground sm:text-lg">
                  {active.title}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Section {activeIndex + 1} of {sections.length}
                  {active.kind === "narrative" ? " · Markdown supported" : null}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[12px] font-semibold text-primary dark:bg-[#1FB86A]/18 dark:text-[#9BEBC0]">
              Default wording
            </span>
          </div>

          {active.kind === "narrative" ? (
            <>
              <div className="flex flex-wrap items-center gap-1 border-b border-border bg-muted/30 px-3 py-2 sm:px-4">
                <ToolbarButton label="Bold" onClick={() => applyWrap("**", "**")}>
                  <BoldIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Italic" onClick={() => applyWrap("_", "_")}>
                  <ItalicIcon className="size-4" />
                </ToolbarButton>
                <ToolbarButton label="Bullet list" onClick={() => applyWrap("\n- ", "")}>
                  <ListIcon className="size-4" />
                </ToolbarButton>
                <span className="mx-1 h-5 w-px bg-border" aria-hidden />
                <button
                  type="button"
                  onClick={() => insertPlaceholder(placeholders[0] || "[ROOF AGE]")}
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <PlusIcon className="size-3.5" />
                  Insert placeholder
                </button>
              </div>
              <textarea
                ref={textareaRef}
                value={activeBody}
                onChange={(e) =>
                  setBodies((current) => ({
                    ...current,
                    [active.id as NarrativeSlotKey]: e.target.value,
                  }))
                }
                placeholder="Write the default wording for this section…"
                className="min-h-[22rem] flex-1 resize-none bg-card px-5 py-4 text-[15px] leading-[1.75] text-foreground outline-none placeholder:text-muted-foreground caret-[#1FB86A] sm:px-6"
              />
            </>
          ) : null}

          {active.kind === "disclaimer" ? (
            <textarea
              value={legalFooter}
              onChange={(e) => setLegalFooter(e.target.value)}
              placeholder="Legal disclaimer shown at the end of the PDF…"
              className="min-h-[22rem] flex-1 resize-none bg-card px-5 py-4 text-[15px] leading-[1.75] text-foreground outline-none placeholder:text-muted-foreground caret-[#1FB86A] sm:px-6"
            />
          ) : null}

          {active.kind === "codes" ? (
            <div className="flex min-h-[22rem] flex-1 flex-col gap-3 overflow-y-auto px-5 py-4 sm:px-6">
              <p className="text-sm text-muted-foreground">
                Choose citations included by default. Manage the library in{" "}
                <Link
                  href={ROUTES.company.codes}
                  className="font-semibold text-primary underline underline-offset-2 hover:text-primary/80 dark:text-[#9BEBC0]"
                >
                  Codes &amp; standards
                </Link>
                .
              </p>
              {citations.length === 0 ? (
                <p className="rounded-xl border border-dashed border-border bg-muted/50 px-4 py-6 text-sm text-muted-foreground">
                  No citations yet.
                </p>
              ) : (
                citations.map((citation) => {
                  const checked = citationIds.includes(citation.id)
                  return (
                    <label
                      key={citation.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors",
                        checked
                          ? "border-primary/30 bg-primary/10 dark:border-[#1FB86A]/40 dark:bg-[#1FB86A]/12"
                          : "border-border bg-muted/50 hover:border-primary/30",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const on = Boolean(value)
                          setCitationIds((current) =>
                            on
                              ? [...current, citation.id]
                              : current.filter((id) => id !== citation.id),
                          )
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        <b className="font-semibold text-foreground">
                          {citation.state} {citation.code}
                        </b>
                        <span className="mx-2 text-muted-foreground/50">—</span>
                        <span className="text-muted-foreground">{citation.title}</span>
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          ) : null}

          <footer className="mt-auto flex items-center justify-between gap-3 border-t border-border px-4 py-3 sm:px-5">
            {prev ? (
              <button
                type="button"
                onClick={() => setActiveId(prev.id)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
              >
                <ChevronLeftIcon className="size-4" />
                {prev.title}
              </button>
            ) : (
              <span />
            )}
            {next ? (
              <button
                type="button"
                onClick={() => setActiveId(next.id)}
                className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#0A3326] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#0E4434]"
              >
                {next.title}
                <ChevronRightIcon className="size-4" />
              </button>
            ) : (
              <span className="text-sm text-muted-foreground">Last section</span>
            )}
          </footer>
        </section>

        {/* Right: live PDF preview */}
        <aside className="xl:sticky xl:top-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[11px] font-bold tracking-[0.14em] text-muted-foreground uppercase">
              PDF preview
            </p>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("tpl-pdf-preview")
                el?.scrollIntoView({ behavior: "smooth", block: "nearest" })
              }}
              className="text-xs font-semibold text-primary hover:underline dark:text-[#9BEBC0]"
            >
              Open full preview
            </button>
          </div>
          <div id="tpl-pdf-preview" className={cn(PANEL_CLASS, "overflow-hidden")}>
            <div className="border-b border-border bg-muted/60 px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.16em] text-muted-foreground uppercase">
                Evidence package
              </p>
              <p className="mt-0.5 text-sm font-semibold text-foreground">Report language draft</p>
            </div>
            <div className="flex max-h-[34rem] flex-col gap-0 overflow-y-auto bg-card p-3">
              {sections.map((section) => {
                const isActive = section.id === active.id
                const body =
                  section.kind === "narrative"
                    ? bodies[section.id as NarrativeSlotKey]
                    : section.kind === "disclaimer"
                      ? legalFooter
                      : citationIds.length
                        ? `${citationIds.length} citation${citationIds.length === 1 ? "" : "s"} selected`
                        : "No citations selected"
                return (
                  <button
                    key={section.id}
                    type="button"
                    onClick={() => setActiveId(section.id)}
                    className={cn(
                      "rounded-xl border px-3.5 py-3 text-left transition-colors",
                      isActive ? PREVIEW_ACTIVE_CLASS : "border-transparent hover:bg-muted/60",
                    )}
                  >
                    <p className="text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase">
                      {section.title}
                    </p>
                    <p
                      className={cn(
                        "mt-1 text-[13px] leading-relaxed",
                        isActive ? "text-foreground" : "text-muted-foreground",
                      )}
                    >
                      {previewBody(body)}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            The highlighted block updates as you type.
          </p>
        </aside>
      </div>
    </div>
  )
}

function ToolbarButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className="grid size-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  )
}
