export type DefaultLanguage = {
  roof_damage: string
  hail_damage: string
  wind_damage: string
  missing_shingles: string
  interior_damage: string
}

export type ReportSection = {
  id: string
  key: string
  title: string
  include: boolean
  sortOrder: number
  body: string
}

export type ReportTemplate = {
  id: string
  name: string
  description: string
  version: number
  isDefault: boolean
  isActive: boolean
  sections: ReportSection[]
  definitions: string
  legalFooter: string
  defaultLanguage: DefaultLanguage
  codeCitationIds: string[]
  includeWeatherPage: boolean
  includeTestSquares: boolean
  includeCollateral: boolean
  includePhotoIndex: boolean
}

/** Fixed admin-editable narrative slots. Photo/checklist steps are not admin-configurable. */
export type NarrativeSlotKey =
  | "summary_of_findings"
  | "investigation_process"
  | "damage_definitions_assessment_criteria"
  | "existing_conditions"

export type NarrativeSlot = {
  key: NarrativeSlotKey
  title: string
  hint?: string
  placeholder?: string
}

export const NARRATIVE_SLOTS: NarrativeSlot[] = [
  {
    key: "summary_of_findings",
    title: "Summary of Findings",
  },
  {
    key: "investigation_process",
    title: "Investigation Process",
  },
  {
    key: "damage_definitions_assessment_criteria",
    title: "Damage Definitions & Assessment Criteria",
  },
  {
    key: "existing_conditions",
    title: "Existing Conditions",
    hint: "Use [ROOF AGE] for estimated roof age.",
  },
]

export type CodeCitationOption = {
  id: string
  state: string
  code: string
  title: string
  body: string
  source?: string
  isActive: boolean
}
