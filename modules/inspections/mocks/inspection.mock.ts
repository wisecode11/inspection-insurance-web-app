import type { DamageTag, Inspection, PhotoEvidence, TestSquare } from "@/modules/inspections/types/inspection.types"

let inspections: Inspection[] = [
  { id: "RC-2041", address: "482 Maple Crest Dr", city: "Denver, CO", inspector: "Marta Flynn", date: "2026-08-15", status: "approved", claimStatus: "approved", weather: "verified", photos: 46, damageTags: 12, testSquares: 4 },
  { id: "RC-2040", address: "17 Birchwood Ln", city: "Aurora, CO", inspector: "Devon Ross", date: "2026-08-15", status: "submitted", claimStatus: "pending", weather: "verified", photos: 38, damageTags: 9, testSquares: 3 },
  { id: "RC-2039", address: "9021 Sunset Ridge", city: "Lakewood, CO", inspector: "Priya Shah", date: "2026-08-14", status: "submitted", claimStatus: "submitted", weather: "mismatch", photos: 51, damageTags: 15, testSquares: 4 },
  { id: "RC-2038", address: "330 Elm Hollow Ct", city: "Denver, CO", inspector: "Marta Flynn", date: "2026-08-14", status: "approved", claimStatus: "approved", weather: "verified", photos: 42, damageTags: 8, testSquares: 3 },
  { id: "RC-2037", address: "1145 Copperfield Way", city: "Boulder, CO", inspector: "Leo Martin", date: "2026-08-13", status: "draft", claimStatus: "draft", weather: "verified", photos: 12, damageTags: 3, testSquares: 1 },
  { id: "RC-2036", address: "76 Windmill Pass", city: "Littleton, CO", inspector: "Devon Ross", date: "2026-08-13", status: "submitted", claimStatus: "pending", weather: "verified", photos: 44, damageTags: 11, testSquares: 4 },
  { id: "RC-2035", address: "5590 Prairie Vista", city: "Denver, CO", inspector: "Priya Shah", date: "2026-08-12", status: "approved", claimStatus: "approved", weather: "verified", photos: 39, damageTags: 10, testSquares: 3 },
  { id: "RC-2034", address: "218 Cedar Bluff", city: "Golden, CO", inspector: "Leo Martin", date: "2026-08-12", status: "submitted", claimStatus: "failed", weather: "mismatch", photos: 33, damageTags: 7, testSquares: 2 },
  { id: "RC-2033", address: "44 Harborview Rd", city: "Denver, CO", inspector: "Marta Flynn", date: "2026-08-11", status: "approved", claimStatus: "approved", weather: "verified", photos: 48, damageTags: 13, testSquares: 4 },
  { id: "RC-2032", address: "890 Stonegate Blvd", city: "Aurora, CO", inspector: "Devon Ross", date: "2026-08-11", status: "draft", claimStatus: "draft", weather: "verified", photos: 8, damageTags: 2, testSquares: 1 },
  { id: "RC-2031", address: "12 Foxglove Terr", city: "Lakewood, CO", inspector: "Priya Shah", date: "2026-08-10", status: "submitted", claimStatus: "pending", weather: "verified", photos: 41, damageTags: 9, testSquares: 3 },
  { id: "RC-2030", address: "705 Aspen Grove", city: "Boulder, CO", inspector: "Leo Martin", date: "2026-08-09", status: "approved", claimStatus: "approved", weather: "verified", photos: 45, damageTags: 12, testSquares: 4 },
]

const photoLabels = [
  "North slope overview",
  "South slope overview",
  "Ridge line",
  "Chimney flashing",
  "Valley detail",
  "Gutter and drip edge",
  "Test square A",
  "Test square B",
  "Hail impact close-up",
  "Creased shingle",
  "Vent boot",
  "Elevation context",
]

export function listInspectionsMock(): Inspection[] {
  return inspections.map((row) => ({ ...row }))
}

export function getInspectionMock(id: string): Inspection | undefined {
  const match = inspections.find((row) => row.id === id)
  return match ? { ...match } : undefined
}

export function inspectionPhotosMock(insp: Inspection): PhotoEvidence[] {
  const count = Math.min(insp.photos, 12)
  return Array.from({ length: count }, (_, i) => ({
    id: `${insp.id}-p-${i + 1}`,
    label: photoLabels[i % photoLabels.length],
    slope: ["North 4:12", "South 4:12", "West 5:12", "East 5:12"][i % 4],
    gps: `${(39.7392 + i * 0.00021).toFixed(5)}° N, ${(104.9903 + i * 0.00017).toFixed(5)}° W`,
    timestamp: `${insp.date} 09:${String(14 + i).padStart(2, "0")} MT`,
  }))
}

export function inspectionDamageTagsMock(insp: Inspection): DamageTag[] {
  const tags: DamageTag[] = [
    { id: `${insp.id}-d1`, area: "North slope", type: "Hail hits", severity: "severe", count: Math.max(6, insp.damageTags + 18) },
    { id: `${insp.id}-d2`, area: "South slope", type: "Creased shingles", severity: "moderate", count: Math.max(3, insp.damageTags) },
    { id: `${insp.id}-d3`, area: "Ridge", type: "Granule loss", severity: "moderate", count: Math.max(4, insp.damageTags - 2) },
    { id: `${insp.id}-d4`, area: "Chimney", type: "Lifted flashing", severity: insp.weather === "mismatch" ? "minor" : "moderate", count: 3 },
    { id: `${insp.id}-d5`, area: "West slope", type: "Wind lift", severity: "minor", count: 5 },
  ]
  return tags.slice(0, Math.max(3, Math.min(5, insp.damageTags)))
}

export function inspectionTestSquaresMock(insp: Inspection): TestSquare[] {
  return Array.from({ length: Math.max(insp.testSquares, 1) }, (_, i) => {
    const hits = [11, 8, 6, 4][i] ?? 5
    return {
      id: `${insp.id}-ts-${i + 1}`,
      label: `Test square ${String.fromCharCode(65 + i)}`,
      slope: ["North 4:12", "South 4:12", "West 5:12", "East 5:12"][i % 4],
      hits,
      threshold: 6,
    }
  })
}

export function approveInspectionMock(id: string): Inspection | undefined {
  inspections = inspections.map((row) =>
    row.id === id ? { ...row, status: "approved", claimStatus: "approved" } : row,
  )
  return getInspectionMock(id)
}
