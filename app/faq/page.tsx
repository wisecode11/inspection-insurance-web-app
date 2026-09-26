import type { Metadata } from "next"
import { ChevronDownIcon } from "lucide-react"

import { MarketingPage } from "@/components/marketing/marketing-page"

export const metadata: Metadata = {
  title: "FAQ — RoofClaim",
  description:
    "Answers to common questions about RoofClaim, the RoofCheck app, storm checks, and billing.",
}

const groups = [
  {
    title: "Product",
    items: [
      {
        q: "Who is RoofClaim for?",
        a: "Roofing and storm-restoration companies that need to send insurance carriers a complete, verifiable inspection file: photos, damage findings, test squares, and a weather check on the date of loss.",
      },
      {
        q: "What is the difference between the company portal and the mobile app?",
        a: "Inspectors use the RoofCheck mobile app on the roof to capture photos and findings. Office staff use the company portal to manage jobs, review evidence, invite staff, set branding, and export reports.",
      },
      {
        q: "What does the storm check do?",
        a: "It cross-checks weather data for the property location against the reported date of loss and flags mismatches before the file goes to the carrier.",
      },
      {
        q: "Can reports carry our own branding?",
        a: "Yes. Upload your logo and set your colors once in the company portal, and every exported PDF report uses them.",
      },
    ],
  },
  {
    title: "Field & evidence",
    items: [
      {
        q: "Are photos GPS and time stamped?",
        a: "Yes. Every photo captured in the app records location and time, so adjusters can trust where and when it was taken.",
      },
      {
        q: "How do test squares work?",
        a: "Inspectors capture test-square photos for each roof direction and record hail hits, which are compared against the repair threshold in the report.",
      },
      {
        q: "How do inspectors get access?",
        a: "A company admin invites them from the Staff page. Access can be disabled at any time.",
      },
    ],
  },
  {
    title: "Account & billing",
    items: [
      {
        q: "Is there a free trial?",
        a: "Yes. Sign up as a company to start a trial, then choose a plan during onboarding.",
      },
      {
        q: "How is pricing calculated?",
        a: "Plans are seat-based. See the Pricing page for current plans and what each one includes.",
      },
      {
        q: "Can I change or cancel my plan?",
        a: "Yes. Company admins manage their subscription from the Billing page in the company portal.",
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <MarketingPage
      eyebrow="FAQ"
      title="Questions, answered"
      description="What roofing companies usually ask before moving their inspections into RoofClaim."
    >
      <section className="py-20 md:py-24">
        <div className="mx-auto flex max-w-3xl flex-col gap-12 px-4 sm:px-6">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase">
                {group.title}
              </h2>
              <div className="mt-4 divide-y rounded-2xl border bg-card">
                {group.items.map((item) => (
                  <details
                    key={item.q}
                    className="group px-5 py-4 [&_summary::-webkit-details-marker]:hidden"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                      {item.q}
                      <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </MarketingPage>
  )
}
