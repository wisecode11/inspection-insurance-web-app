"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowRightIcon, CheckIcon } from "lucide-react"

import { Icon3D } from "@/components/marketing/icon-3d"
import { ThreeCanvas } from "@/components/marketing/three/three-canvas"
import { Button } from "@/components/ui/button"
import { ROUTES } from "@/lib/constants/routes"

const EASE = [0.22, 1, 0.36, 1] as const

const rise = {
  hidden: { opacity: 0, y: 18 },
  shown: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
}

const assurances = ["No card required", "Set up in minutes", "Invite your whole crew"]

/**
 * Closing call to action: dark brand panel with the pitch on the left and a
 * Three.js claim report on the right — evidence orbits the page and flies in,
 * and the approval seal pulses.
 */
export function FinalCta() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 28, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative isolate grid overflow-hidden rounded-[2rem] bg-[radial-gradient(ellipse_at_78%_45%,#13704f_0%,#0a4b37_42%,#063728_100%)] text-white shadow-[0_40px_90px_-40px_rgba(6,55,40,0.85)] ring-1 ring-white/10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
        >
          {/* Backdrop: faded blueprint grid + mint glow */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.08] [background-image:linear-gradient(white_1px,transparent_1px),linear-gradient(90deg,white_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_80%_80%_at_70%_50%,black,transparent)]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -top-32 -right-24 -z-10 size-[28rem] rounded-full bg-[radial-gradient(circle,rgba(106,232,176,0.28),transparent_65%)]"
          />

          <motion.div
            className="relative p-8 sm:p-12 lg:py-16 lg:pr-6 lg:pl-14"
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, amount: 0.4 }}
            transition={{ staggerChildren: 0.08, delayChildren: 0.15 }}
          >
            <motion.p
              variants={rise}
              className="text-xs font-semibold tracking-[0.18em] text-[#6ae8b0] uppercase"
            >
              Storm season is coming
            </motion.p>
            <motion.span
              variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.7, ease: EASE } } }}
              className="mt-3 block h-0.5 w-10 origin-left rounded-full bg-[#6ae8b0]/70"
            />
            <motion.h2
              variants={rise}
              className="mt-5 text-3xl font-bold tracking-tight text-balance text-white sm:text-4xl lg:text-[2.6rem] lg:leading-[1.12]"
            >
              Ready to tighten the <span className="text-[#6ae8b0]">claim file?</span>
            </motion.h2>
            <motion.p variants={rise} className="mt-5 max-w-md leading-relaxed text-white/70 sm:text-lg sm:leading-8">
              Start a company trial, invite your inspectors, and send your first carrier-ready report today.
            </motion.p>

            <motion.ul variants={rise} className="mt-7 flex flex-wrap gap-x-5 gap-y-2.5">
              {assurances.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="flex size-5 items-center justify-center rounded-full bg-[#12b76a] text-white">
                    <CheckIcon className="size-3" strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </motion.ul>

            <motion.div variants={rise} className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="group h-12 rounded-full bg-white px-7 text-primary-dark shadow-[0_16px_34px_-14px_rgba(106,232,176,0.55)] transition-all hover:-translate-y-0.5 hover:bg-[#e8fff4]"
                render={<Link href="/signup" />}
              >
                Get started free
                <ArrowRightIcon data-icon="inline-end" className="transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-white/25 bg-white/5 px-7 text-white backdrop-blur hover:bg-white/15 hover:text-white"
                render={<Link href={ROUTES.marketing.pricing} />}
              >
                View pricing
              </Button>
            </motion.div>

            <motion.p variants={rise} className="mt-6 text-sm text-white/55">
              Already on RoofClaim?{" "}
              <Link href="/login" className="font-semibold text-white underline-offset-4 hover:underline">
                Log in
              </Link>
            </motion.p>
          </motion.div>

          <div className="relative min-h-[22rem] sm:min-h-[26rem] lg:min-h-[30rem]">
            <ThreeCanvas
              scene="claimFile"
              fallback={
                <div className="absolute inset-0 flex items-center justify-center">
                  <Icon3D name="file" size={200} />
                </div>
              }
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
