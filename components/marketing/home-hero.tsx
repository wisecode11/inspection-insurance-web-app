import type { CSSProperties } from "react"
import Image from "next/image"
import Link from "next/link"
import {
  ArrowRightIcon,
  BadgeCheckIcon,
  CameraIcon,
  CloudLightningIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  MapPinIcon,
  PaletteIcon,
  PlayIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  SquareCheckIcon,
  StarIcon,
} from "lucide-react"

import { HeroStage } from "@/components/marketing/hero-stage"
import { Icon3DCanvas } from "@/components/marketing/three/icon-3d-canvas"
import { TypewriterText } from "@/components/marketing/typewriter-text"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"

const phrases = ["for roofing claims", "for storm damage", "for faster approvals", "for carrier reviews"]
const cursorColors = ["#2f9e6e", "#e0a526", "#3b82c4", "#d9634c"]

const avatars = [
  { name: "Sam Rivera", src: "/avatars/avatar-12.jpg" },
  { name: "Casey Nguyen", src: "/avatars/avatar-33.jpg" },
  { name: "Dana Cole", src: "/avatars/avatar-47.jpg" },
  { name: "Morgan Jones", src: "/avatars/avatar-5.jpg" },
]

const capabilities = [
  { icon: MapPinIcon, model: "pin", label: "GPS on every photo" },
  { icon: CloudLightningIcon, model: "storm", label: "NOAA storm verification" },
  { icon: SquareCheckIcon, model: "squares", label: "Test squares" },
  { icon: CameraIcon, model: "camera", label: "Damage tags by slope" },
  { icon: FileTextIcon, model: "pdf", label: "Carrier-ready PDFs" },
  { icon: PaletteIcon, model: "palette", label: "Your branding on every report" },
  { icon: SmartphoneIcon, model: "phone", label: "Inspector mobile app" },
  { icon: LayoutDashboardIcon, model: "dashboard", label: "Company + platform portals" },
  { icon: ShieldCheckIcon, model: "shield", label: "Role-based access" },
] as const

/** Inline delay for the staggered `.landing-rise` entrance. */
const rise = (seconds: number) => ({ "--rise-delay": `${seconds}s` }) as CSSProperties

/**
 * Homepage hero: copy on the left, a live Three.js roof inspection on the
 * right, and an endless capability strip along the bottom edge.
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden bg-[#f3f9f6]">
      {/* Backdrop: soft glows + a faded blueprint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 size-[36rem] rounded-full bg-[radial-gradient(circle,rgba(106,232,176,0.35),transparent_65%)]" />
        <div className="absolute top-1/4 -right-32 size-[44rem] rounded-full bg-[radial-gradient(circle,rgba(18,183,106,0.18),transparent_65%)]" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(10,75,55,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(10,75,55,0.07)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_60%_40%,black,transparent)]" />
      </div>

      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)] items-center gap-4 px-4 pt-12 pb-6 sm:px-6 sm:pt-16 lg:min-h-[calc(100svh-4.25rem-4.5rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-6 lg:pt-8 lg:pb-8">
        <div className="relative z-10 min-w-0 max-w-xl">
          <Link
            href={ROUTES.marketing.features}
            className="landing-rise group inline-flex items-center gap-2.5 rounded-full border border-primary/15 bg-white/70 py-1 pr-3 pl-1 text-xs font-medium text-primary-dark shadow-[0_6px_20px_-12px_rgba(6,55,40,0.4)] backdrop-blur transition-colors hover:border-primary/30"
          >
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-dark px-2.5 py-1 text-[11px] font-semibold text-white">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#6ae8b0] opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex size-1.5 rounded-full bg-[#6ae8b0]" />
              </span>
              Live
            </span>
            Inspection evidence platform
            <ArrowRightIcon className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>

          <h1
            style={rise(0.08)}
            className="landing-rise mt-6 text-[2.6rem] leading-[1.02] font-bold tracking-[-0.035em] text-balance text-primary-dark sm:text-6xl lg:text-[3.5rem] xl:text-[3.9rem]"
          >
            <span className="text-shimmer">Stronger files</span>
            <br />
            <TypewriterText
              phrases={phrases}
              colors={cursorColors}
              className="font-serif text-[0.9em] font-normal tracking-[-0.02em] text-primary"
            />
          </h1>

          <p
            style={rise(0.16)}
            className="landing-rise mt-6 max-w-md text-base leading-7 text-[#4f625a] sm:text-lg sm:leading-8"
          >
            Capture the roof, verify the storm, and send a branded report carriers can actually
            use — every photo GPS-stamped and storm-checked.
          </p>

          <div style={rise(0.24)} className="landing-rise mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="group h-12 rounded-full bg-primary-dark px-7 shadow-[0_16px_34px_-14px_rgba(6,55,40,0.75)] transition-all hover:-translate-y-0.5 hover:bg-primary-dark/90"
              render={<Link href="/signup" />}
            >
              Start free trial
              <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-primary-dark/20 bg-white/60 px-6 text-primary-dark backdrop-blur hover:bg-white"
              render={<Link href={ROUTES.marketing.howItWorks} />}
            >
              <span className="flex size-6 items-center justify-center rounded-full bg-primary/10">
                <PlayIcon className="size-3 fill-current" />
              </span>
              See how it works
            </Button>
          </div>

          <div style={rise(0.32)} className="landing-rise mt-10 flex flex-wrap items-center gap-x-5 gap-y-3">
            <div className="flex -space-x-3" aria-hidden>
              {avatars.map((avatar) => (
                <Image
                  key={avatar.src}
                  src={avatar.src}
                  alt=""
                  width={40}
                  height={40}
                  className="size-10 rounded-full border-2 border-white object-cover shadow-sm"
                />
              ))}
              <span className="flex size-10 items-center justify-center rounded-full border-2 border-white bg-primary-dark text-[11px] font-semibold text-white shadow-sm">
                +40
              </span>
            </div>
            <div>
              <div className="flex items-center gap-0.5 text-warning" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <StarIcon key={i} className="size-3.5 fill-current" />
                ))}
              </div>
              <p className="mt-1 text-sm text-[#4f625a]">
                Trusted by <span className="font-semibold text-primary-dark">40+ roofing companies</span>
              </p>
            </div>
            <span className="hidden h-8 w-px bg-primary-dark/10 sm:block" aria-hidden />
            <p className="flex items-center gap-1.5 text-sm text-[#4f625a]">
              <BadgeCheckIcon className="size-4 text-primary" />
              No card required
            </p>
          </div>
        </div>

        <div style={rise(0.12)} className="landing-rise relative mt-8 min-w-0 lg:mt-0">
          <HeroStage />
        </div>
      </div>

      {/* Capability strip */}
      <div className="marquee relative border-y border-primary/10 bg-white/60 backdrop-blur [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
        <div className="marquee-track flex w-max items-center gap-10 py-3.5">
          {[0, 1].map((copy) => (
            <div key={copy} className="flex items-center gap-10" aria-hidden={copy === 1}>
              {capabilities.map(({ icon: Icon, model, label }) => (
                <span key={label} className="flex items-center gap-2.5 text-sm font-medium whitespace-nowrap text-primary-dark/80">
                  <Icon3DCanvas
                    name={model}
                    size={44}
                    fallback={
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="size-4" />
                      </span>
                    }
                  />
                  {label}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
