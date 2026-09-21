import type { CSSProperties, ReactNode } from "react"

import { AppSidebarDesktop, AppSidebarMobile } from "@/components/layout/app-sidebar"
import { TopBar } from "@/components/layout/top-bar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { COMPANY_SHELL_MAX_CLASS } from "@/lib/constants/layout"
import type { Role } from "@/types/role"
import { cn } from "@/lib/utils"

/**
 * Company admin: forest-green → cream organic background (SVG, no component blur).
 * Platform admin: green left sidebar frame.
 */
export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  if (role === "company") {
    return (
      <div
        className="app-frame company-shell relative flex h-svh w-full overflow-hidden"
        style={
          {
            backgroundColor: "#f7f5f0",
            backgroundImage: "url(/backgrounds/company-shell-bw.svg)",
            backgroundSize: "cover",
            backgroundPosition: "center top",
            backgroundRepeat: "no-repeat",
          } as CSSProperties
        }
      >
        <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <TopBar role={role} />
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-3 pb-10 sm:px-4 sm:pb-12 lg:px-6">
            <div
              className={cn(
                "mx-auto flex w-full flex-col gap-6 sm:gap-8 [&>*]:shrink-0",
                COMPANY_SHELL_MAX_CLASS,
              )}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
    )
  }

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

        <div className="app-main relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[var(--color-bg-canvas)] md:rounded-tl-[2.75rem] md:rounded-bl-[2.75rem]">
          <TopBar role={role} />
          <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pb-6 sm:px-5 sm:pb-8 lg:px-6">
            <div className="flex flex-col gap-5 sm:gap-6 [&>*]:shrink-0">{children}</div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
