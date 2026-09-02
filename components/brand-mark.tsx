import Link from "next/link"
import { ShieldIcon } from "lucide-react"

import { cn } from "@/lib/utils"

export function BrandMark({
  href = "/",
  subtitle,
  className,
  onDark = false,
  variant = "default",
}: {
  href?: string
  subtitle?: string
  className?: string
  onDark?: boolean
  variant?: "default" | "sidebar"
}) {
  const isSidebarDark = variant === "sidebar" || onDark

  const iconClass = isSidebarDark
    ? "bg-white/15 text-white"
    : "bg-primary text-primary-foreground"

  const titleClass = isSidebarDark
    ? "text-lg font-bold tracking-tight text-white"
    : "text-sm font-semibold tracking-tight text-foreground"

  const subtitleClass = isSidebarDark
    ? "text-xs text-white/65"
    : "text-xs text-muted-foreground"

  const content = (
    <>
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl",
          iconClass,
        )}
      >
        <ShieldIcon className="size-5" />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className={titleClass}>RoofClaim</span>
        {subtitle ? <span className={subtitleClass}>{subtitle}</span> : null}
      </span>
    </>
  )

  if (variant === "sidebar") {
    return <div className={cn("flex items-center gap-3", className)}>{content}</div>
  }

  return (
    <Link href={href} className={cn("flex items-center gap-2.5", className)}>
      {content}
    </Link>
  )
}
