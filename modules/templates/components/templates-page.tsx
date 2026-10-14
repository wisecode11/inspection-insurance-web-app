"use client"

import * as React from "react"
import Link from "next/link"
import { CheckIcon } from "lucide-react"
import { toast } from "@/lib/toast"

import { ListPageHero, heroPrimaryButtonClass } from "@/components/shared/list-page-hero"
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

function findSection(
  sections: ReportSection[],
  key: NarrativeSlotKey,
  title: string
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
  bodies: Record<NarrativeSlotKey, string>
): ReportSection[] {
  const next = sections.map((section) => ({ ...section }))

  for (const slot of NARRATIVE_SLOTS) {
    const body = bodies[slot.key]
    const existingIndex = next.findIndex(
      (row) =>
        row.key === slot.key || row.title.toLowerCase() === slot.title.toLowerCase()
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

  React.useEffect(() => {
    if (!data) return
    const preferred =
      data.templates.find((row) => row.isDefault) || data.templates[0] || null
    if (!preferred) return
    setTemplate(preferred)
    setBodies(readNarrativeBodies(preferred))
    setLegalFooter(preferred.legalFooter || "")
    setCitationIds(preferred.codeCitationIds || [])
  }, [data])

  const citations = data?.citations ?? []

  async function saveTemplate() {
    if (!template) return
    setSaving(true)
    try {
      const sections = mergeNarrativeIntoSections(template.sections, bodies)
      const updated = await templateService.update(template.id, {
        sections,
        legalFooter: legalFooter.trim(),
        definitions: bodies.damage_definitions_assessment_criteria,
        codeCitationIds: citationIds,
        isDefault: true,
      })
      setTemplate(updated)
      setBodies(readNarrativeBodies(updated))
      setLegalFooter(updated.legalFooter || "")
      setCitationIds(updated.codeCitationIds || [])
      toast.success("Saved")
      await reload?.()
    } catch (err) {
      toast.error(getErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) return <LoadingSkeleton rows={8} />
  if (error) return <ErrorState message={error} />
  if (!template) {
    return <ErrorState message="No report language defaults found." />
  }


  const sections: SectionMeta[] = [
    ...NARRATIVE_SLOTS.map((slot) => ({ id: slot.key, title: slot.title, tone: "green" as const })),
    { id: "disclaimer", title: "Disclaimer", tone: "amber" },
    { id: "codes", title: "Codes & standards", tone: "green" },
  ]
  const numberOf = (id: string) => sections.findIndex((s) => s.id === id) + 1
  const narrative = (key: NarrativeSlotKey) => NARRATIVE_SLOTS.find((slot) => slot.key === key)!

  const narrativeCard = (key: NarrativeSlotKey, className?: string) => {
    const slot = narrative(key)
    return (
      <SectionCard
        key={key}
        id={key}
        number={numberOf(key)}
        title={slot.title}
        hint={slot.hint}
        htmlFor={`tpl-${key}`}
        className={className}
      >
        <textarea
          id={`tpl-${key}`}
          rows={key === "damage_definitions_assessment_criteria" ? 3 : 4}
          value={bodies[key]}
          onChange={(e) => setBodies((current) => ({ ...current, [key]: e.target.value }))}
          className={textareaClass}
        />
      </SectionCard>
    )
  }

  return (
    <>
      <ListPageHero
        eyebrow="Company admin"
        title="Report language"
        description="Default wording used in evidence package PDFs."
        actions={
          <button
            type="button"
            disabled={saving}
            onClick={() => void saveTemplate()}
            className={cn(heroPrimaryButtonClass, "disabled:cursor-not-allowed disabled:opacity-70")}
          >
            <CheckIcon className="size-4" />
            {saving ? "Saving…" : "Save"}
          </button>
        }
      />

      <div className="relative z-10 grid items-start gap-4 lg:grid-cols-[13.5rem_minmax(0,1fr)]">
        <SectionsNav sections={sections} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {narrativeCard("summary_of_findings")}
          {narrativeCard("investigation_process")}
          {narrativeCard("damage_definitions_assessment_criteria", "xl:col-span-2")}
          {narrativeCard("existing_conditions", "xl:col-span-2")}

          <SectionCard id="disclaimer" number={numberOf("disclaimer")} title="Disclaimer" tone="amber" htmlFor="tpl-disclaimer">
            <textarea
              id="tpl-disclaimer"
              rows={3}
              value={legalFooter}
              onChange={(e) => setLegalFooter(e.target.value)}
              className={cn(textareaClass, "focus:border-[#E9A23B] focus:ring-[#E9A23B]/15")}
            />
          </SectionCard>

          <SectionCard
            id="codes"
            number={numberOf("codes")}
            title="Codes & standards"
            hint={
              <>
                Manage citations in{" "}
                <Link
                  href={ROUTES.company.codes}
                  className="font-semibold text-[#14965A] underline underline-offset-2 hover:text-[#0F7A48]"
                >
                  Codes &amp; standards
                </Link>
                .
              </>
            }
          >
            <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto">
              {citations.length === 0 ? (
                <p className="rounded-xl border border-dashed border-[#DCE4DF] bg-[#F7F9F8] px-4 py-3 text-sm text-[#6B7A73]">
                  No citations yet.
                </p>
              ) : (
                citations.map((citation) => {
                  const checked = citationIds.includes(citation.id)
                  return (
                    <label
                      key={citation.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors hover:border-[#BFE3CC]",
                        checked ? "border-[#9FDDB9] bg-[#F1FBF5]" : "border-[#E9EFEB] bg-[#F7F9F8]",
                      )}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(value) => {
                          const next = Boolean(value)
                          setCitationIds((current) =>
                            next
                              ? [...current, citation.id]
                              : current.filter((id) => id !== citation.id)
                          )
                        }}
                      />
                      <span className="min-w-0 flex-1 truncate text-sm">
                        <b className="font-semibold text-[#0E1B16]">
                          {citation.state} {citation.code}
                        </b>
                        <span className="mx-2 text-[#A6B2AC]">—</span>
                        <span className="text-[#6B7A73]">{citation.title}</span>
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </SectionCard>
        </div>
      </div>
    </>
  )
}

type SectionMeta = { id: string; title: string; tone: "green" | "amber" }

const sectionDomId = (id: string) => `tpl-section-${id}`

/** Grey at rest, white with a green ring while editing. */
const textareaClass =
  "w-full resize-y rounded-xl border border-[#E9EFEB] bg-[#F7F9F8] px-3.5 py-3 text-sm leading-[1.75] text-[#0E1B16] outline-none transition-[border-color,box-shadow,background-color] duration-150 placeholder:text-[#A6B2AC] focus:border-[#1FB86A] focus:bg-white focus:ring-4 focus:ring-[#1FB86A]/12"

/** Renders "[ROOF AGE]"-style placeholders in hints as amber code chips. */
function HintText({ text }: { text: string }) {
  return (
    <>
      {text.split(/(\[[A-Z0-9 _]+\])/).map((part, i) =>
        /^\[[A-Z0-9 _]+\]$/.test(part) ? (
          <code
            key={i}
            className="mx-0.5 rounded-md border border-[#F5D9A8] bg-[#FFF4E2] px-1.5 py-px font-mono text-[11px] font-semibold text-[#C2700A]"
          >
            {part}
          </code>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        ),
      )}
    </>
  )
}

function NumberBadge({ number, tone, solid }: { number: number; tone: "green" | "amber"; solid?: boolean }) {
  return (
    <span
      className={cn(
        "grid size-7 shrink-0 place-items-center rounded-lg font-mono text-[11px] font-bold transition-colors duration-200",
        solid
          ? "bg-[#0A3326] text-white"
          : tone === "amber"
            ? "border border-[#F6DDB8] bg-[#FFF4E2] text-[#C2700A]"
            : "border border-[#E4EBE7] bg-white text-[#6B7A73]",
      )}
    >
      {String(number).padStart(2, "0")}
    </span>
  )
}

/** Standalone section card; gets a green edge + ring while one of its fields is focused. */
function SectionCard({
  id,
  number,
  title,
  hint,
  tone = "green",
  htmlFor,
  className,
  children,
}: {
  id: string
  number: number
  title: string
  hint?: React.ReactNode
  tone?: "green" | "amber"
  htmlFor?: string
  className?: string
  children: React.ReactNode
}) {
  const amber = tone === "amber"
  return (
    <section
      id={sectionDomId(id)}
      data-tpl-section={id}
      className={cn(
        "relative scroll-mt-6 overflow-hidden rounded-2xl border border-[#E4EBE7] p-4 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_10px_28px_-22px_rgba(14,27,22,0.25)] transition-[border-color,box-shadow] duration-200 sm:p-5",
        amber
          ? "bg-linear-to-b from-[#FFF6EA] to-white to-60% focus-within:border-[#F1C989] focus-within:shadow-[0_0_0_3px_rgba(233,162,59,0.12)]"
          : "bg-white focus-within:border-[#9FDDB9] focus-within:shadow-[0_0_0_3px_rgba(31,184,106,0.12),0_10px_28px_-22px_rgba(14,27,22,0.25)]",
        className,
      )}
    >
      {/* left accent shown while editing */}
      <span
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] opacity-0 transition-opacity duration-200 [section:focus-within>&]:opacity-100",
          amber ? "bg-[#E9A23B]" : "bg-[#1FB86A]",
        )}
      />
      <div className="mb-3.5 flex items-center gap-3">
        <span
          className={cn(
            "grid h-7 min-w-8 shrink-0 place-items-center rounded-lg px-1.5 font-mono text-[11px] font-bold",
            amber ? "bg-[#FDE7C4] text-[#C2700A]" : "bg-[#DDF3E6] text-[#155A45]",
          )}
        >
          {String(number).padStart(2, "0")}
        </span>
        <div className="min-w-0">
          {htmlFor ? (
            <label htmlFor={htmlFor} className="block text-[15px] leading-5 font-bold text-[#0E1B16]">
              {title}
            </label>
          ) : (
            <h2 className="text-[15px] leading-5 font-bold text-[#0E1B16]">{title}</h2>
          )}
          {hint ? (
            <p className="mt-0.5 text-xs text-[#6B7A73]">
              {typeof hint === "string" ? <HintText text={hint} /> : hint}
            </p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  )
}

/**
 * Sticky "Sections" index. Highlights the section being edited, or the one in view;
 * clicking jumps to it and focuses its field.
 */
function SectionsNav({ sections }: { sections: SectionMeta[] }) {
  const [active, setActive] = React.useState(sections[0]?.id ?? "")
  const focusedRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    // Editing wins over scroll position.
    const onFocusIn = (event: FocusEvent) => {
      const id = (event.target as HTMLElement | null)
        ?.closest<HTMLElement>("[data-tpl-section]")
        ?.dataset.tplSection
      focusedRef.current = id ?? null
      if (id) setActive(id)
    }
    const onFocusOut = () => {
      focusedRef.current = null
    }
    document.addEventListener("focusin", onFocusIn)
    document.addEventListener("focusout", onFocusOut)

    // Scroll spy: the section crossing the upper third of the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        if (focusedRef.current) return
        const hit = entries.find((entry) => entry.isIntersecting)
        const id = (hit?.target as HTMLElement | undefined)?.dataset.tplSection
        if (id) setActive(id)
      },
      { rootMargin: "-25% 0px -65% 0px" },
    )
    document.querySelectorAll("[data-tpl-section]").forEach((el) => observer.observe(el))

    return () => {
      document.removeEventListener("focusin", onFocusIn)
      document.removeEventListener("focusout", onFocusOut)
      observer.disconnect()
    }
  }, [])

  function jumpTo(id: string) {
    setActive(id)
    const section = document.getElementById(sectionDomId(id))
    if (!section) return
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    section.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "start" })
    section.querySelector<HTMLElement>("textarea, input")?.focus({ preventScroll: true })
  }

  return (
    <nav
      aria-label="Report sections"
      className="hidden rounded-2xl border border-[#E4EBE7] bg-white p-3 shadow-[0_1px_2px_rgba(14,27,22,0.04),0_16px_36px_-22px_rgba(6,36,27,0.35)] lg:sticky lg:top-4 lg:block"
    >
      <p className="px-2 pt-1 pb-2.5 text-[11px] font-bold tracking-[0.14em] text-[#7B8A83] uppercase">Sections</p>
      <ol className="relative flex flex-col gap-1">
        {/* dashed connector behind the number badges */}
        <span aria-hidden className="absolute top-5 bottom-5 left-[1.4rem] border-l border-dashed border-[#D3DED8]" />
        {sections.map((section, index) => {
          const isActive = section.id === active
          return (
            <li key={section.id} className="relative">
              <button
                type="button"
                onClick={() => jumpTo(section.id)}
                aria-current={isActive ? "true" : undefined}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl border px-2 py-1.5 text-left text-[13px] leading-snug font-semibold transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#1FB86A]",
                  isActive
                    ? "border-[#CDE8D6] bg-[#EEF9F2] text-[#0A3326]"
                    : "border-transparent text-[#3B4A44] hover:bg-[#F4F7F5]",
                )}
              >
                <NumberBadge number={index + 1} tone={section.tone} solid={isActive} />
                <span className="min-w-0">{section.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
