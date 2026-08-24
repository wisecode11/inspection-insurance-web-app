"use client"

import * as React from "react"
import { Loader2Icon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { env } from "@/lib/config/env"
import { cn } from "@/lib/utils"

const GIS_SRC = "https://accounts.google.com/gsi/client"

type CredentialResponse = {
  credential?: string
}

type GoogleAccountsId = {
  initialize: (config: {
    client_id: string
    callback: (response: CredentialResponse) => void
    auto_select?: boolean
    cancel_on_tap_outside?: boolean
  }) => void
  prompt: (momentListener?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
  renderButton: (
    parent: HTMLElement,
    options: {
      theme?: string
      size?: string
      text?: string
      shape?: string
      width?: number
      logo_alignment?: string
    },
  ) => void
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

let gisPromise: Promise<void> | null = null

function loadGis(): Promise<void> {
  if (typeof window === "undefined") return Promise.reject(new Error("Google sign-in requires a browser"))
  if (window.google?.accounts?.id) return Promise.resolve()
  if (gisPromise) return gisPromise

  gisPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`)
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true })
      existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in")), { once: true })
      return
    }
    const script = document.createElement("script")
    script.src = GIS_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error("Failed to load Google sign-in"))
    document.head.appendChild(script)
  })

  return gisPromise
}

type GoogleSignInButtonProps = {
  disabled?: boolean
  label?: string
  className?: string
  onCredential: (idToken: string) => void | Promise<void>
  onError?: (message: string) => void
}

export function GoogleSignInButton({
  disabled = false,
  label = "Continue with Google",
  className,
  onCredential,
  onError,
}: GoogleSignInButtonProps) {
  const buttonRef = React.useRef<HTMLDivElement>(null)
  const onCredentialRef = React.useRef(onCredential)
  const onErrorRef = React.useRef(onError)
  const [ready, setReady] = React.useState(false)
  const [busy, setBusy] = React.useState(false)

  React.useEffect(() => {
    onCredentialRef.current = onCredential
  }, [onCredential])

  React.useEffect(() => {
    onErrorRef.current = onError
  }, [onError])

  React.useEffect(() => {
    if (!env.googleClientId) return

    let cancelled = false

    async function setup() {
      try {
        await loadGis()
        if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return

        window.google.accounts.id.initialize({
          client_id: env.googleClientId,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: async (response) => {
            const token = response.credential
            if (!token) {
              onErrorRef.current?.("Google sign-in was cancelled.")
              return
            }
            setBusy(true)
            try {
              await onCredentialRef.current(token)
            } catch (err) {
              const message = err instanceof Error ? err.message : "Google sign-in failed"
              onErrorRef.current?.(message)
            } finally {
              setBusy(false)
            }
          },
        })

        buttonRef.current.innerHTML = ""
        const width = Math.max(buttonRef.current.offsetWidth || 320, 240)
        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width,
          logo_alignment: "left",
        })
        if (!cancelled) setReady(true)
      } catch (err) {
        if (!cancelled) {
          onErrorRef.current?.(err instanceof Error ? err.message : "Google sign-in unavailable")
        }
      }
    }

    void setup()
    return () => {
      cancelled = true
    }
  }, [])

  if (!env.googleClientId) return null

  return (
    <div className={cn("relative w-full", className)}>
      {!ready || busy || disabled ? (
        <Button
          type="button"
          variant="outline"
          disabled
          className="h-10 w-full gap-2 border-border bg-background text-foreground"
        >
          {(busy || !ready) && <Loader2Icon className="size-4 animate-spin" />}
          {busy ? "Continuing…" : label}
        </Button>
      ) : null}
      <div
        ref={buttonRef}
        className={cn(
          "flex w-full justify-center overflow-hidden [&_iframe]:!w-full",
          (!ready || busy || disabled) && "pointer-events-none absolute inset-0 opacity-0",
        )}
        aria-hidden={!ready || busy || disabled}
      />
    </div>
  )
}
