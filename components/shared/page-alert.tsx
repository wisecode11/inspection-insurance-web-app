import type { ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import { AlertCircleIcon, CheckCircle2Icon, InfoIcon } from "lucide-react"

import { cn } from "@/lib/utils"

const toneStyles = {
  info: {
    wrap: "border-sky-200/80 bg-sky-50/90 text-sky-950",
    icon: "bg-sky-100 text-sky-700",
    Icon: InfoIcon,
  },
  warning: {
    wrap: "border-amber-200/80 bg-amber-50/90 text-amber-950",
    icon: "bg-amber-100 text-amber-700",
    Icon: AlertCircleIcon,
  },
  success: {
    wrap: "border-emerald-200/80 bg-emerald-50/90 text-emerald-950",
    icon: "bg-emerald-100 text-emerald-700",
    Icon: CheckCircle2Icon,
  },
} as const

export function PageAlert({
  title,
  description,
  tone = "info",
  icon: CustomIcon,
  action,
  className,
}: {
  title: string
  description?: string
  tone?: keyof typeof toneStyles
  icon?: LucideIcon
  action?: ReactNode
  className?: string
}) {
  const config = toneStyles[tone]
  const Icon = CustomIcon ?? config.Icon

  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-3 rounded-xl border px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between",
        config.wrap,
        className,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          className={cn(
            "flex size-9 shrink-0 items-center justify-center rounded-lg",
            config.icon,
          )}
        >
          <Icon className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{title}</p>
          {description ? (
            <p className="mt-0.5 text-sm leading-relaxed opacity-80">{description}</p>
          ) : null}
        </div>
      </div>
      {action ? <div className="shrink-0 sm:ml-auto">{action}</div> : null}
    </div>
  )
}
