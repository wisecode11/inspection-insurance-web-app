import type { Metadata } from "next"
import Image from "next/image"
import {
  CameraIcon,
  ClipboardCheckIcon,
  CloudSunIcon,
  FileTextIcon,
  MapPinIcon,
  SquareCheckIcon,
} from "lucide-react"

import { MarketingPage } from "@/components/marketing/marketing-page"
import { Reveal } from "@/components/marketing/reveal"

export const metadata: Metadata = {
  title: "Mobile app — RoofClaim",
  description:
    "The RoofCheck inspector app: guided roof capture with GPS-stamped photos, damage tags, and test squares.",
}

const highlights = [
  {
    icon: CameraIcon,
    title: "Guided photo capture",
    text: "A step-by-step shot list so inspectors never miss an elevation, overview, or close-up.",
  },
  {
    icon: MapPinIcon,
    title: "GPS & time on every photo",
    text: "Location and timestamp are stamped at capture, so adjusters stop asking for reshoots.",
  },
  {
    icon: SquareCheckIcon,
    title: "Hail test squares",
    text: "Record test-square hits for each roof direction against the repair threshold.",
  },
  {
    icon: ClipboardCheckIcon,
    title: "Damage tags & checklists",
    text: "Tag hail, wind, and flashing damage by slope and component while on the roof.",
  },
  {
    icon: CloudSunIcon,
    title: "Storm check",
    text: "Cross-check weather on the date of loss before the file leaves the property.",
  },
  {
    icon: FileTextIcon,
    title: "Straight to the office",
    text: "Submitted inspections land in the company portal, ready to review and export as a branded PDF.",
  },
]

const captureSteps = [
  { title: "Elevations", text: "Four sides plus any additional structures." },
  { title: "Collateral damage", text: "Gutters, vents, and other components with damage tags." },
  { title: "Hail impacts", text: "Overview and close-ups on metal and shingles." },
  { title: "Test squares", text: "Test-square photos for each roof direction." },
  { title: "Wear & tie-ins", text: "Wear conditions and roof transition points." },
  { title: "Overviews & notes", text: "Wide roof shots and structured build notes." },
]

export default function MobileAppPage() {
  return (
    <MarketingPage
      eyebrow="Mobile app"
      title="The field app your inspectors actually finish"
      description="RoofCheck walks every inspector through the same carrier-ready capture sequence, then sends the evidence straight to your office."
    >
      <section className="py-20 md:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <ul className="grid gap-5 sm:grid-cols-2">
              {highlights.map((item) => (
                <li key={item.title} className="rounded-2xl border bg-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <p className="mt-4 font-semibold">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1} className="order-1 flex justify-center lg:order-2">
            <Image
              src="/images/hero-phone-inspector-hd-no-bg.png"
              alt="Inspector using the RoofCheck app on a roof"
              width={2048}
              height={2048}
              sizes="(min-width: 1024px) 34rem, 90vw"
              className="h-auto w-full max-w-[34rem]"
            />
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold tracking-[0.18em] text-primary uppercase">
              Capture sequence
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Same inspection, every roof
            </h2>
            <p className="mt-4 text-muted-foreground">
              Inspectors move through each step in order and can skip what doesn&apos;t apply.
            </p>
          </div>
          <ol className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {captureSteps.map((step, i) => (
              <li key={step.title}>
                <Reveal delay={i * 0.05} className="flex h-full gap-4 rounded-2xl border bg-card p-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-semibold">{step.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </MarketingPage>
  )
}
