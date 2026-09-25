"use client"

import * as React from "react"
import { ArrowUpIcon } from "lucide-react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { cn } from "@/lib/utils"

/**
 * Fixed bottom-right control: appears after scrolling, smoothly returns to top.
 */
export function BackToTop({ threshold = 420 }: { threshold?: number }) {
  const reduceMotion = useReducedMotion()
  const [visible, setVisible] = React.useState(false)

  React.useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > threshold)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [threshold])

  const goTop = () => {
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  return (
    <AnimatePresence>
      {visible ? (
        <motion.button
          type="button"
          aria-label="Back to top"
          onClick={goTop}
          initial={reduceMotion ? false : { opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0, y: 10, scale: 0.92 }}
          transition={{ duration: 0.22, ease: [0.2, 0.8, 0.2, 1] }}
          className={cn(
            "fixed right-5 bottom-5 z-50 flex size-12 items-center justify-center rounded-full",
            "bg-primary text-primary-foreground shadow-[0_14px_32px_-12px_rgba(6,55,40,0.65)]",
            "ring-1 ring-primary/20 transition-colors hover:bg-primary-dark",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2",
            "sm:right-7 sm:bottom-7",
          )}
        >
          <ArrowUpIcon className="size-5" strokeWidth={2.4} />
        </motion.button>
      ) : null}
    </AnimatePresence>
  )
}
