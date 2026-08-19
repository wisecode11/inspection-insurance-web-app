export type ApiResponse<T> = {
  success: boolean
  data: T
  message?: string
}

export type ApiErrorShape = {
  success: false
  message: string
  status?: number
}
