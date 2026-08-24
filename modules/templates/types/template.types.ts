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

/** Fixed admin-editable narrative slots (ClaimCapture v4). Photo/checklist steps are not admin-configurable. */
export type NarrativeSlotKey =
  | "summary_of_findings"
  | "investigation_process"
  | "damage_definitions_assessment_criteria"
  | "existing_conditions"

export type NarrativeSlot = {
  key: NarrativeSlotKey
  title: string
  description: string
  placeholder: string
}

export const NARRATIVE_SLOTS: NarrativeSlot[] = [
  {
    key: "summary_of_findings",
    title: "Summary of Findings",
    description: "Company-wide default. Inspectors can tweak wording only on their own report.",
    placeholder: "Default summary language for every evidence package…",
  },
  {
    key: "investigation_process",
    title: "Investigation Process",
    description: "How the inspection is described in every report by default.",
    placeholder: "Default investigation process language…",
  },
  {
    key: "damage_definitions_assessment_criteria",
    title: "Damage Definitions & Assessment Criteria",
    description: "Definitions and criteria language used across reports.",
    placeholder: "Default damage definitions…",
  },
  {
    key: "existing_conditions",
    title: "Existing Conditions",
    description:
      "Use [ROOF AGE] where the inspector’s estimated roof age should be inserted automatically.",
    placeholder: "The estimated roof age is [ROOF AGE]…",
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
