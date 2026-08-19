import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { AUTH_COOKIE } from "@/lib/auth/constants"

export function middleware(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIE)?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/onboarding") && role !== "company") {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("role", "company")
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/platform") && role !== "platform") {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("role", "platform")
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/company") && role !== "company") {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("role", "company")
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/platform/:path*", "/company/:path*", "/onboarding/:path*"],
}
