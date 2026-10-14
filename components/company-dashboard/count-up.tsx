"use client"

import * as React from "react"
import { animate, useInView, useReducedMotion } from "framer-motion"

/** Counts from 0 to `value` the first time it scrolls into view. */
export function CountUp({
  value,
  format = (n) => n.toLocaleString("en-US"),
  duration = 1.2,
}: {
  value: number
  format?: (n: number) => string
  duration?: number
}) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: "0px 0px -5% 0px" })
  const reduceMotion = useReducedMotion()
  const [shown, setShown] = React.useState(0)

  React.useEffect(() => {
    if (!inView) return
    if (reduceMotion) {
      setShown(value)
      return
    }
    const controls = animate(0, value, {
      duration,
      ease: [0.25, 1, 0.5, 1],
      onUpdate: (v) => setShown(Math.round(v)),
    })
    return () => controls.stop()
  }, [inView, reduceMotion, value, duration])

  return <span ref={ref}>{format(shown)}</span>
}
