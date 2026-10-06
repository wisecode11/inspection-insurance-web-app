"use client"

import * as React from "react"

export type AuthSceneStatus = "idle" | "loading" | "error"

export type AuthSceneState = {
  /** Id of the focused form control, or null. */
  focus: string | null
  /** 0..1 — how complete the credentials are; each quarter locks one vault ring. */
  progress: number
  status: AuthSceneStatus
}

type Update = (patch: Partial<AuthSceneState>) => void

const initialState: AuthSceneState = { focus: null, progress: 0, status: "idle" }

const StateContext = React.createContext<AuthSceneState>(initialState)
const UpdateContext = React.createContext<Update>(() => {})

/**
 * Lets auth forms drive the vault scene without re-rendering themselves:
 * forms only read the stable updater, the scene reads the state.
 */
export function AuthSceneProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState(initialState)

  const update = React.useCallback<Update>((patch) => {
    setState((current) => {
      const next = { ...current, ...patch }
      return next.focus === current.focus &&
        next.progress === current.progress &&
        next.status === current.status
        ? current
        : next
    })
  }, [])

  return (
    <UpdateContext.Provider value={update}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </UpdateContext.Provider>
  )
}

export function useAuthSceneState() {
  return React.useContext(StateContext)
}

/**
 * Wires a form to the scene: syncs progress + status, and returns focus
 * handlers to spread on the <form> (focus events bubble in React).
 */
export function useAuthScene({
  progress,
  loading,
  error,
}: {
  progress: number
  loading: boolean
  error: string
}) {
  const update = React.useContext(UpdateContext)

  React.useEffect(() => {
    update({ progress: Math.min(1, Math.max(0, progress)) })
  }, [progress, update])

  React.useEffect(() => {
    update({ status: loading ? "loading" : error ? "error" : "idle" })
  }, [loading, error, update])

  return React.useMemo(
    () => ({
      onFocus: (event: React.FocusEvent<HTMLFormElement>) => update({ focus: event.target.id || null }),
      onBlur: () => update({ focus: null }),
    }),
    [update],
  )
}
