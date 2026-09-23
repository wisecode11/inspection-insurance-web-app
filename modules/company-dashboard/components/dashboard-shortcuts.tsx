import Link from "next/link"
import {
  ArrowRightIcon,
  CreditCardIcon,
  FileStackIcon,
  ScrollTextIcon,
} from "lucide-react"

import { ROUTES } from "@/lib/constants/routes"
import { cn } from "@/lib/utils"

const shortcuts = [
  {
    title: "Create job",
    href: ROUTES.company.jobs,
    icon: FileStackIcon,
  },
  {
    title: "Codes & standards",
    href: ROUTES.company.codes,
    icon: ScrollTextIcon,
  },
  {
    title: "Subscription",
    href: ROUTES.company.billing,
    icon: CreditCardIcon,
  },
] as const

/** Dark “Operational Kit” shortcut panel. */
export function DashboardShortcuts({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-xl bg-primary p-5 text-white shadow-[0_12px_32px_-16px_rgba(12,40,46,0.55)] sm:p-6",
        className,
      )}
    >
      <p className="text-[11px] font-semibold tracking-[0.14em] text-white/55 uppercase">
        Shortcuts
      </p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight">Operational kit</h2>
      <p className="mt-1 text-sm text-white/65">Jump into common company admin tasks</p>

      <ul className="mt-5 flex flex-col gap-2">
        {shortcuts.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="group flex items-center gap-3 rounded-lg bg-white/8 px-3.5 py-3 ring-1 ring-white/10 transition-colors hover:bg-white/14"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-white/10">
                <item.icon className="size-4" aria-hidden />
              </span>
              <span className="flex-1 text-sm font-medium">{item.title}</span>
              <ArrowRightIcon className="size-4 text-white/45 transition-transform group-hover:translate-x-0.5 group-hover:text-white/80" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
