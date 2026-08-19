import type { Tenant } from "@/modules/platform-tenants/types/tenant.types"

let tenants: Tenant[] = [
  { id: "t-001", name: "Summit Ridge Roofing", plan: "Pro", seatsUsed: 12, seatsTotal: 15, status: "active", created: "2024-03-12", mrr: 499, inspections: 284, storageGb: 62, owner: "Sam Rivera", ownerEmail: "sam@summitridge.co", region: "Denver, CO" },
  { id: "t-002", name: "Ironclad Exteriors", plan: "Enterprise", seatsUsed: 44, seatsTotal: 50, status: "active", created: "2023-11-02", mrr: 1499, inspections: 912, storageGb: 214, owner: "Dana Cole", ownerEmail: "dana@ironclad.com", region: "Dallas, TX" },
  { id: "t-003", name: "Peak & Gable Co.", plan: "Starter", seatsUsed: 3, seatsTotal: 5, status: "trial", created: "2025-06-28", mrr: 0, inspections: 21, storageGb: 4, owner: "Morgan Lee", ownerEmail: "morgan@peakgable.com", region: "Portland, OR" },
  { id: "t-004", name: "Cornerstone Roofing", plan: "Pro", seatsUsed: 9, seatsTotal: 15, status: "active", created: "2024-08-19", mrr: 499, inspections: 176, storageGb: 39, owner: "Alex Park", ownerEmail: "alex@cornerstone.io", region: "Atlanta, GA" },
  { id: "t-005", name: "Blue Sky Contractors", plan: "Starter", seatsUsed: 5, seatsTotal: 5, status: "suspended", created: "2024-01-30", mrr: 149, inspections: 88, storageGb: 12, owner: "Riley Fox", ownerEmail: "riley@bluesky.com", region: "Phoenix, AZ" },
  { id: "t-006", name: "Apex Storm Restoration", plan: "Enterprise", seatsUsed: 31, seatsTotal: 40, status: "active", created: "2023-09-14", mrr: 1499, inspections: 743, storageGb: 188, owner: "Casey Nguyen", ownerEmail: "casey@apexstorm.com", region: "Tampa, FL" },
  { id: "t-007", name: "Northgate Roof Systems", plan: "Pro", seatsUsed: 14, seatsTotal: 15, status: "active", created: "2024-05-06", mrr: 499, inspections: 331, storageGb: 71, owner: "Jamie Ortiz", ownerEmail: "jamie@northgate.com", region: "Chicago, IL" },
  { id: "t-008", name: "Redwood Roofing Group", plan: "Pro", seatsUsed: 7, seatsTotal: 15, status: "trial", created: "2025-07-11", mrr: 0, inspections: 12, storageGb: 3, owner: "Taylor Kim", ownerEmail: "taylor@redwood.com", region: "Sacramento, CA" },
  { id: "t-009", name: "Beacon Hill Exteriors", plan: "Starter", seatsUsed: 4, seatsTotal: 5, status: "active", created: "2024-10-22", mrr: 149, inspections: 64, storageGb: 9, owner: "Jordan Blake", ownerEmail: "jordan@beaconhill.com", region: "Boston, MA" },
  { id: "t-010", name: "Vanguard Roof & Solar", plan: "Enterprise", seatsUsed: 52, seatsTotal: 60, status: "active", created: "2023-07-01", mrr: 1899, inspections: 1204, storageGb: 302, owner: "Quinn Adams", ownerEmail: "quinn@vanguard.com", region: "San Diego, CA" },
  { id: "t-011", name: "Homestead Roofing", plan: "Starter", seatsUsed: 2, seatsTotal: 5, status: "trial", created: "2025-08-02", mrr: 0, inspections: 6, storageGb: 1, owner: "Avery Stone", ownerEmail: "avery@homestead.com", region: "Nashville, TN" },
  { id: "t-012", name: "Titan Roof Pros", plan: "Pro", seatsUsed: 11, seatsTotal: 15, status: "active", created: "2024-02-18", mrr: 499, inspections: 219, storageGb: 48, owner: "Reese Carter", ownerEmail: "reese@titanroof.com", region: "Houston, TX" },
]

export function listTenantsMock(): Tenant[] {
  return tenants.map((row) => ({ ...row }))
}

export function getTenantMock(id: string): Tenant | undefined {
  const match = tenants.find((row) => row.id === id)
  return match ? { ...match } : undefined
}

export function suspendTenantMock(id: string): Tenant | undefined {
  tenants = tenants.map((row) => (row.id === id ? { ...row, status: "suspended" } : row))
  return getTenantMock(id)
}
