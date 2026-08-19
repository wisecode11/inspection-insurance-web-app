import type { ReactNode } from "react"
import { AppShell } from "@/components/layout/app-shell"

export default function CompanyLayout({ children }: { children: ReactNode }) {
  return <AppShell role="company">{children}</AppShell>
}
