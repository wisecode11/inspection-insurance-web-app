"use client"

import Link from "next/link"
import { CheckCircle2Icon } from "lucide-react"
import { motion, useReducedMotion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Plan } from "@/modules/platform-billing/types/billing.types"

function PlanCard({ plan, className }: { plan: Plan; className?: string }) {
  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-6",
        plan.highlight && "border-primary ring-2 ring-primary/20",
        className,
      )}
    >
      {plan.highlight && (
        <span className="mb-3 w-fit rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
          Most popular
        </span>
      )}
      <h3 className="text-lg font-semibold">{plan.name}</h3>
      <p className="mt-3 text-3xl font-bold tracking-tight">
        ${plan.price}
        <span className="text-base font-normal text-muted-foreground"> / mo</span>
      </p>
      <ul className="mt-6 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2 text-sm">
            <CheckCircle2Icon className="mt-0.5 size-4 shrink-0 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
      <Button
        className="mt-8 w-full"
        variant={plan.highlight ? "default" : "outline"}
        render={<Link href="/signup" />}
      >
        Get started
      </Button>
    </article>
  )
}

/**
 * Pricing: Pro (center) shows first. On scroll-in, Starter expands left and
 * Enterprise expands right from behind the center card.
 */
export function PricingExpandCards({ plans }: { plans: Plan[] }) {
  const reduceMotion = useReducedMotion()

  const highlightIndex = Math.max(
    0,
    plans.findIndex((plan) => plan.highlight),
  )
  const left = plans[highlightIndex - 1] ?? null
  const center = plans[highlightIndex] ?? plans[0]
  const right = plans[highlightIndex + 1] ?? null

  const ease = [0.22, 1, 0.36, 1] as const
  const col = "w-[calc((100%-2.5rem)/3)]"

  return (
    <div className="mx-auto mt-14 max-w-5xl">
      {/* Mobile: center first, then sides */}
      <motion.div
        className="flex flex-col gap-5 md:hidden"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.3 }}
      >
        <motion.div
          variants={
            reduceMotion
              ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
              : {
                  hidden: { opacity: 0, y: 16 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease } },
                }
          }
        >
          <PlanCard plan={center} />
        </motion.div>
        {left ? (
          <motion.div
            variants={
              reduceMotion
                ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
                : {
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease, delay: 0.12 },
                    },
                  }
            }
          >
            <PlanCard plan={left} />
          </motion.div>
        ) : null}
        {right ? (
          <motion.div
            variants={
              reduceMotion
                ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
                : {
                    hidden: { opacity: 0, y: 16 },
                    show: {
                      opacity: 1,
                      y: 0,
                      transition: { duration: 0.45, ease, delay: 0.2 },
                    },
                  }
            }
          >
            <PlanCard plan={right} />
          </motion.div>
        ) : null}
      </motion.div>

      {/* Desktop: sides expand out from under the center card */}
      <motion.div
        className="relative hidden overflow-x-clip md:block"
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.4 }}
      >
        {/* Height from tallest card — invisible grid keeps layout stable */}
        <div className="grid grid-cols-3 gap-5 opacity-0" aria-hidden>
          {left ? <PlanCard plan={left} /> : <div />}
          <PlanCard plan={center} />
          {right ? <PlanCard plan={right} /> : <div />}
        </div>

        {left ? (
          <motion.div
            className={cn("absolute top-0 left-0", col)}
            variants={
              reduceMotion
                ? {
                    hidden: { opacity: 1, x: 0, scale: 1 },
                    show: { opacity: 1, x: 0, scale: 1 },
                  }
                : {
                    hidden: {
                      opacity: 0,
                      x: "calc(100% + 1.25rem)",
                      scale: 0.94,
                    },
                    show: {
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: { duration: 0.8, ease, delay: 0.1 },
                    },
                  }
            }
          >
            <PlanCard plan={left} />
          </motion.div>
        ) : null}

        <motion.div
          className={cn("absolute top-0 left-1/2 z-10 -translate-x-1/2", col)}
          variants={
            reduceMotion
              ? { hidden: { opacity: 1, scale: 1 }, show: { opacity: 1, scale: 1 } }
              : {
                  hidden: { opacity: 1, scale: 1.05 },
                  show: {
                    opacity: 1,
                    scale: 1.03,
                    transition: { duration: 0.55, ease },
                  },
                }
          }
        >
          <PlanCard plan={center} />
        </motion.div>

        {right ? (
          <motion.div
            className={cn("absolute top-0 right-0", col)}
            variants={
              reduceMotion
                ? {
                    hidden: { opacity: 1, x: 0, scale: 1 },
                    show: { opacity: 1, x: 0, scale: 1 },
                  }
                : {
                    hidden: {
                      opacity: 0,
                      x: "calc(-100% - 1.25rem)",
                      scale: 0.94,
                    },
                    show: {
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: { duration: 0.8, ease, delay: 0.1 },
                    },
                  }
            }
          >
            <PlanCard plan={right} />
          </motion.div>
        ) : null}
      </motion.div>
    </div>
  )
}
