"use client"

import { Icon3D, type Icon3DKey } from "@/components/marketing/icon-3d"
import { Reveal } from "@/components/marketing/reveal"
import { cn } from "@/lib/utils"

const PORTALS: {
  title: string
  text: string
  icon: Icon3DKey
}[] = [
  {
    title: "Evidence-grade photos",
    text: "GPS and time on every file.",
    icon: "camera",
  },
  {
    title: "Priority support",
    text: "Help when a claim is on the clock.",
    icon: "headphones",
  },
  {
    title: "Secure workspace",
    text: "Role-based company and platform access.",
    icon: "shield",
  },
  {
    title: "Same-day setup",
    text: "Invite inspectors and start a job.",
    icon: "zap",
  },
]

/**
 * Homepage portals strip — floating gradient cards with photoreal 3D icons
 * (matches the marketing reference layout).
 */
export function PortalsSection() {
  return (
    <section
      id="portals"
      className="scroll-mt-20 relative overflow-hidden border-t bg-[#F3F5F7] py-16 md:py-20"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-1/2 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(circle at 70% 40%, rgba(16,185,129,0.08), transparent 55%), linear-gradient(135deg, transparent 40%, rgba(148,163,184,0.12) 41%, transparent 42%), linear-gradient(45deg, transparent 55%, rgba(148,163,184,0.08) 56%, transparent 57%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-6">
        {PORTALS.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.07}>
            <article
              className={cn(
                "flex h-full flex-col items-center rounded-[1.35rem] border border-white/80 px-6 py-8 text-center",
                "bg-[linear-gradient(145deg,#ffffff_0%,#f7f8fa_55%,#eef1f4_100%)]",
                "shadow-[0_22px_50px_-28px_rgba(15,23,42,0.35),0_2px_8px_rgba(15,23,42,0.04)]",
                "transition-transform duration-300 hover:-translate-y-1",
              )}
            >
              <div className="flex size-[6.5rem] items-center justify-center sm:size-[7.25rem]">
                <Icon3D name={item.icon} size={116} priority={i < 2} />
              </div>
              <h3 className="mt-5 text-[1.05rem] font-semibold tracking-tight text-foreground">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.text}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  )
}
