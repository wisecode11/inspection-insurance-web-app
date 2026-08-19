import type { Citation, FeatureFlag, PlatformTemplate } from "@/modules/platform-settings/types/settings.types"

let flags: FeatureFlag[] = [
  { id: "ff-1", name: "AI damage auto-tagging", description: "Suggest damage tags from uploaded photos.", enabled: true, stage: "GA" },
  { id: "ff-2", name: "Weather verification v2", description: "New NOAA data source for storm cross-checks.", enabled: true, stage: "Beta" },
  { id: "ff-3", name: "Multi-language reports", description: "Generate reports in Spanish and French.", enabled: false, stage: "Alpha" },
  { id: "ff-4", name: "Drone imagery import", description: "Import geotagged drone photo sets.", enabled: false, stage: "Planned" },
  { id: "ff-5", name: "Carrier direct submission", description: "Submit evidence packets to insurers via API.", enabled: true, stage: "Beta" },
]

let citations: Citation[] = [
  { id: "cit-1", code: "IRC R908.3", state: "CO", title: "Roof covering replacement", body: "Roof covering shall be replaced when hail or wind damage exceeds the manufacturer's repair criteria for the slope." },
  { id: "cit-2", code: "IBC 1507.2", state: "CO", title: "Asphalt shingle application", body: "Asphalt shingles shall be fastened according to manufacturer instructions and local wind-uplift requirements." },
  { id: "cit-3", code: "IRC R905.2.6", state: "TX", title: "Attachment", body: "Asphalt shingles shall have the specified number of fasteners per shingle, increased in high-wind regions." },
  { id: "cit-4", code: "FBC 1507.2.7", state: "FL", title: "Wind resistance of asphalt shingles", body: "Shingles shall be tested in accordance with ASTM D7158 or ASTM D3161 for the applicable wind speed." },
  { id: "cit-5", code: "IRC R903.2", state: "GA", title: "Flashing", body: "Flashing shall be installed to prevent moisture entry at wall, vent, and chimney intersections." },
]

let template: PlatformTemplate = {
  name: "RoofClaim standard evidence report",
  intro:
    "This report documents roof condition, weather verification, and photographic evidence for the insurance claim file.",
}

export function listFlagsMock(): FeatureFlag[] {
  return flags.map((row) => ({ ...row }))
}

export function saveFlagsMock(next: FeatureFlag[]): FeatureFlag[] {
  flags = next.map((row) => ({ ...row }))
  return listFlagsMock()
}

export function listCitationsMock(): Citation[] {
  return citations.map((row) => ({ ...row }))
}

export function saveCitationsMock(next: Citation[]): Citation[] {
  citations = next.map((row) => ({ ...row }))
  return listCitationsMock()
}

export function getTemplateMock(): PlatformTemplate {
  return { ...template }
}

export function saveTemplateMock(next: PlatformTemplate): PlatformTemplate {
  template = { ...next }
  return getTemplateMock()
}
