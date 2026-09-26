import type { LucideIcon } from "lucide-react"
import {
  CameraIcon,
  ClipboardListIcon,
  CloudSunIcon,
  FileTextIcon,
  MapPinIcon,
  PaletteIcon,
  ShieldIcon,
  SquareCheckIcon,
  UsersIcon,
  ZapIcon,
} from "lucide-react"

import { FeaturePhone } from "@/components/marketing/feature-phone"
import { Icon3D, type Icon3DKey } from "@/components/marketing/icon-3d"
import { TypewriterText } from "@/components/marketing/typewriter-text"
import { cn } from "@/lib/utils"

const cursorColors = ["#2f9e6e", "#e0a526", "#3b82c4", "#d9634c"]

const features = [
  {
    title: "Jobs & reports",
    description: "Search inspections, open evidence, approve, and export.",
    icon: ClipboardListIcon,
    icon3d: "clipboard" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/75",
    tag: "Office",
    gridClass: "lg:col-span-3 lg:row-span-2 lg:col-start-1 lg:row-start-1",
    featured: true,
  },
  {
    title: "Storm check",
    description: "NOAA cross-check on the date of loss.",
    icon: CloudSunIcon,
    icon3d: "weather" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
    tag: "Weather",
    gridClass: "lg:col-start-4 lg:row-start-1",
    compact: true,
  },
  {
    title: "Test squares",
    description: "Hail hits vs. the repair threshold.",
    icon: SquareCheckIcon,
    icon3d: "clipboard" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-success to-success/80",
    tag: "Hail",
    gridClass: "lg:col-start-5 lg:row-start-1",
    compact: true,
  },
  {
    title: "Photo evidence",
    description: "GPS-stamped photos with slope context.",
    icon: CameraIcon,
    icon3d: "camera" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/70",
    tag: "Field",
    gridClass: "lg:col-span-2 lg:col-start-4 lg:row-start-2",
    compact: true,
  },
  {
    title: "Damage tags",
    description: "Hail, wind, and flashing by slope.",
    icon: MapPinIcon,
    icon3d: "zap" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-warning to-warning/80 text-warning-foreground",
    tag: "Findings",
    gridClass: "lg:col-start-1 lg:row-start-3",
    compact: true,
  },
  {
    title: "Staff",
    description: "Invite inspectors. Disable access.",
    icon: UsersIcon,
    icon3d: "users" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/90",
    tag: "Team",
    gridClass: "lg:col-start-2 lg:row-start-3",
    compact: true,
  },
  {
    title: "Branding",
    description: "Logo and colors on the report header.",
    icon: PaletteIcon,
    icon3d: "palette" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary to-primary/85 text-primary-foreground",
    tag: "Brand",
    gridClass: "lg:col-start-3 lg:row-start-3",
    compact: true,
  },
  {
    title: "PDF export",
    description: "Carrier-ready packet in one click.",
    icon: FileTextIcon,
    icon3d: "file" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-success to-success/85",
    tag: "Share",
    gridClass: "lg:col-start-4 lg:row-start-3",
    compact: true,
  },
  {
    title: "Platform",
    description: "Tenants, billing, and support tools.",
    icon: ShieldIcon,
    icon3d: "platform" as Icon3DKey,
    iconBg: "bg-gradient-to-br from-primary/90 to-primary",
    tag: "SaaS",
    gridClass: "lg:col-start-5 lg:row-start-3",
    compact: true,
  },
] as const

const phoneFeatures = features.slice(0, 5)
const extraFeatures = features.slice(5)

const featurePhrases = ["file the claim", "verify the storm", "send the report"]

function FeatureIcon({
  icon: Icon,
  icon3d,
  className,
  large,
  compact,
}: {
  icon: LucideIcon
  icon3d?: Icon3DKey
  className?: string
  large?: boolean
  compact?: boolean
}) {
  if (icon3d) {
    const px = large ? 56 : compact ? 36 : 48
    return (
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center bg-transparent",
          large ? "size-14" : compact ? "size-9" : "size-12",
        )}
      >
        <Icon3D name={icon3d} size={px} className="drop-shadow-[0_8px_14px_rgba(16,24,40,0.14)]" />
      </span>
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl text-white shadow-[0_10px_22px_-12px_rgba(6,55,40,0.55)]",
        large ? "size-14 rounded-2xl" : compact ? "size-9" : "size-12",
        className,
      )}
    >
      <Icon className={large ? "size-7" : compact ? "size-4" : "size-6"} />
    </div>
  )
}

export function FeaturesSection() {
  return (
  <section id="features" className="scroll-mt-20 bg-muted/30 py-20 md:py-28">
    <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 min-[820px]:grid-cols-[1fr_auto] min-[820px]:gap-16">
      <div className="min-w-0 justify-self-center min-[820px]:justify-self-start">
        <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
          <ZapIcon className="size-3.5" />
          Company + platform toolkit
        </div>
        <h2 className="text-[clamp(2.2rem,4.6vw,2.9rem)] leading-[1.15] font-bold tracking-[-0.03em]">
          Everything you need to
          <span className="block min-h-[1.15em] whitespace-nowrap text-primary">
            <TypewriterText
              phrases={featurePhrases}
              colors={cursorColors}
            />
          </span>
        </h2>
        <p className="mt-5 mb-9 max-w-[30rem] text-base leading-relaxed text-muted-foreground">
          Photo evidence, storm checks, and carrier-ready reports for your
          office and every inspector in the field.
        </p>

        <p className="text-[0.85rem] text-muted-foreground/80">Also included</p>
        <ul className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
          {extraFeatures.map((feature) => (
            <li key={feature.title} className="flex items-start gap-3">
              <FeatureIcon
                icon={feature.icon}
                icon3d={feature.icon3d}
                className={feature.iconBg}
                compact
              />
              <div>
                <p className="text-[0.85rem] leading-tight font-bold">{feature.title}</p>
                <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <FeaturePhone
        className="justify-self-center min-[820px]:justify-self-end"
        items={phoneFeatures.map((feature) => ({
          title: feature.title,
          description: feature.description,
          tag: feature.tag,
          iconClassName: "bg-transparent shadow-none",
          icon: <Icon3D name={feature.icon3d} size={26} className="drop-shadow-none" />,
        }))}
      />
    </div>
  </section>
  )
}
