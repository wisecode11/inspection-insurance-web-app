"use client"

import { useEffect, useState } from "react"

type TypewriterTextProps = {
  phrases: string[]
  /** One cursor color per phrase; cycles if shorter than `phrases`. */
  colors?: string[]
  className?: string
  typeMs?: number
  deleteMs?: number
  holdMs?: number
  gapMs?: number
}

export function TypewriterText({
  phrases,
  colors = ["#2f9e6e"],
  className,
  typeMs = 75,
  deleteMs = 28,
  holdMs = 1900,
  gapMs = 300,
}: TypewriterTextProps) {
  // Start on the full first phrase so SSR / no-JS / reduced-motion show real copy.
  const [index, setIndex] = useState(0)
  const [text, setText] = useState(phrases[0] ?? "")
  const [deleting, setDeleting] = useState(true)

  const target = phrases[index] ?? ""
  const typing = !deleting && text.length < target.length
  const cursorColor = colors[index % colors.length]

  useEffect(() => {
    if (phrases.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let delay: number
    let step: () => void

    if (deleting) {
      if (text.length === 0) {
        delay = gapMs
        step = () => {
          setIndex((i) => (i + 1) % phrases.length)
          setDeleting(false)
        }
      } else {
        delay = text === target ? holdMs : deleteMs
        step = () => setText((t) => t.slice(0, -1))
      }
    } else if (text.length < target.length) {
      delay = typeMs
      step = () => setText(target.slice(0, text.length + 1))
    } else {
      delay = holdMs
      step = () => setDeleting(true)
    }

    const id = window.setTimeout(step, delay)
    return () => window.clearTimeout(id)
  }, [text, target, deleting, phrases, typeMs, deleteMs, holdMs, gapMs])

  return (
    <span className={className}>
      <span aria-hidden>
        {Array.from(text).map((char, i) => (
          <span
            key={`${index}-${i}`}
            className="motion-safe:animate-[char-blur-in_0.4s_ease-out_both]"
          >
            {char}
          </span>
        ))}
      </span>
      <span
        aria-hidden
        className="ml-[0.18em] inline-block h-[0.3em] rounded-full align-middle transition-[width,background-color] duration-300 ease-out"
        style={{
          backgroundColor: cursorColor,
          width: typing ? "0.95em" : "0.3em",
        }}
      />
      <span className="sr-only">{phrases[0]}</span>
    </span>
  )
}
