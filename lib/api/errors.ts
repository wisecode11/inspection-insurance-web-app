import axios from "axios"

export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message
  // Raw axios errors carry a generic "Request failed with status code N" — prefer the server's message.
  if (axios.isAxiosError(error)) return normalizeApiError(error).message
  if (error instanceof Error) return error.message
  return "Something went wrong"
}

export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    if (!error.response) {
      const message =
        error.code === "ECONNABORTED"
          ? "The server took too long to respond. Please try again."
          : "Can't reach the server. Check your internet connection and try again."
      return new ApiError(message)
    }

    const status = error.response.status
    const payload = error.response.data
    const serverMessage =
      payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string"
        ? payload.message
        : ""
    const message =
      serverMessage || (status >= 500 ? "Something went wrong on our end. Please try again." : "Request failed")
    return new ApiError(message, status)
  }

  if (error instanceof ApiError) return error
  return new ApiError(getErrorMessage(error))
}
