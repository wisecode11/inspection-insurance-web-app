"use client"

import * as React from "react"

import { getErrorMessage } from "@/lib/api/errors"

export function useAsyncData<T>(loader: () => Promise<T>, key = "default") {
  const loaderRef = React.useRef(loader)
  loaderRef.current = loader

  const [data, setData] = React.useState<T | undefined>(undefined)
  const [isLoading, setIsLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  const reload = React.useCallback(() => {
    void key
    setIsLoading(true)
    setError(null)
    return loaderRef.current()
      .then((result) => {
        setData(result)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        setError(getErrorMessage(err))
        setIsLoading(false)
      })
  }, [key])

  React.useEffect(() => {
    void reload()
  }, [reload])

  return { data, isLoading, error, reload, setData }
}
