import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import { AUTH_COOKIE } from "@/lib/auth/constants"
import { ROUTES } from "@/lib/constants/routes"

const PLATFORM_REDIRECTS: Record<string, string> = {
  "/platform": ROUTES.superAdmin.users,
  "/platform/dashboard": ROUTES.superAdmin.users,
  "/platform/tenants": ROUTES.superAdmin.users,
  "/platform/billing": ROUTES.superAdmin.subscriptions,
  "/platform/usage": ROUTES.superAdmin.subscriptions,
  "/platform/settings": ROUTES.superAdmin.users,
  "/platform/support": ROUTES.superAdmin.users,
}

export function middleware(request: NextRequest) {
  const role = request.cookies.get(AUTH_COOKIE)?.value
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/platform")) {
    const target = PLATFORM_REDIRECTS[pathname] ?? ROUTES.superAdmin.users
    const url = request.nextUrl.clone()
    url.pathname = target
    return NextResponse.redirect(url)
  }

  const isSuperAdminConsole =
    pathname.startsWith(ROUTES.superAdmin.users) ||
    pathname.startsWith(ROUTES.superAdmin.subscriptions)

  if (isSuperAdminConsole && role !== "platform") {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.superAdmin.login
    return NextResponse.redirect(url)
  }

  if (pathname === ROUTES.superAdmin.login && role === "platform") {
    const url = request.nextUrl.clone()
    url.pathname = ROUTES.superAdmin.users
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith("/onboarding") && role !== "company") {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    url.searchParams.set("role", "company")
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
  matcher: [
    "/platform/:path*",
    "/platform",
    "/roofclaim/admin",
    "/roofclaim/admin/:path*",
    "/company/:path*",
    "/onboarding/:path*",
  ],
}
