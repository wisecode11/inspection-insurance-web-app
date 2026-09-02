import type { CSSProperties, ReactNode } from "react"

import { AppSidebarDesktop, AppSidebarMobile } from "@/components/layout/app-sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { SidebarProvider } from "@/components/ui/sidebar"
import type { Role } from "@/types/role"

/**
 * Full-viewport shell — green sidebar flush left, grey canvas fills the rest.
 * Internal curve between sidebar and content is preserved; no outer margins.
 */
export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  return (
    <SidebarProvider
      className="h-svh w-full overflow-hidden bg-sidebar"
      style={
        {
          "--app-sidebar-width": "16.5rem",
          "--sidebar-width": "16.5rem",
        } as CSSProperties
      }
    >
      <div className="app-frame flex h-svh w-full overflow-hidden bg-[var(--color-bg-canvas)] md:bg-sidebar">
        <AppSidebarDesktop role={role} />
        <AppSidebarMobile role={role} />

        <div className="app-main relative flex h-svh min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg-canvas)] md:rounded-tl-[2.75rem] md:rounded-bl-[2.75rem]">
          <TopBar role={role} />
          <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto px-4 pb-6 sm:gap-6 sm:px-5 sm:pb-8 lg:px-6">
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
