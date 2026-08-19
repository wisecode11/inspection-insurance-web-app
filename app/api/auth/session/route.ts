import { NextResponse } from "next/server"

import { AUTH_COOKIE } from "@/lib/auth/constants"
import { parseRole } from "@/lib/auth/role"

export async function POST(request: Request) {
  const body = (await request.json()) as { role?: string; email?: string }
  const role = parseRole(body.role) ?? "company"

  const response = NextResponse.json({ ok: true, role })
  response.cookies.set(AUTH_COOKIE, role, {
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
    sameSite: "lax",
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(AUTH_COOKIE, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    sameSite: "lax",
  })
  return response
}
