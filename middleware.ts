import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow access to public routes
  const publicRoutes = ["/", "/login", "/register"]
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next()
  }

  const userCookie = request.cookies.get("user")

  console.log("[v0] Middleware - pathname:", pathname)
  console.log("[v0] Middleware - userCookie:", userCookie?.value)

  if (!userCookie) {
    // Redirect to login if not authenticated
    console.log("[v0] Middleware - No cookie found, redirecting to login")
    return NextResponse.redirect(new URL("/login", request.url))
  }

  try {
    const decodedValue = decodeURIComponent(userCookie.value)
    const userData = JSON.parse(decodedValue)

    console.log("[v0] Middleware - Parsed user data:", userData)

    // Basic validation of user data structure
    if (!userData.email || !userData.role || !userData.name) {
      console.log("[v0] Middleware - Invalid user data structure")
      return NextResponse.redirect(new URL("/login", request.url))
    }

    if (pathname.startsWith("/patient") && userData.role !== "patient") {
      console.log("[v0] Middleware - Patient access denied for role:", userData.role)
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (pathname.startsWith("/doctor") && userData.role !== "doctor") {
      console.log("[v0] Middleware - Doctor access denied for role:", userData.role)
      return NextResponse.redirect(new URL("/login", request.url))
    }
    if (pathname.startsWith("/admin") && userData.role !== "admin") {
      console.log("[v0] Middleware - Admin access denied for role:", userData.role)
      return NextResponse.redirect(new URL("/login", request.url))
    }

    console.log("[v0] Middleware - Access granted for:", userData.role, "to", pathname)
    return NextResponse.next()
  } catch (error) {
    // Invalid cookie data, redirect to login
    console.log("[v0] Middleware - Cookie parsing error:", error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
