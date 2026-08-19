import axios from "axios"

import { env } from "@/lib/config/env"

export const publicApiClient = axios.create({
  baseURL: env.apiUrl,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
})
