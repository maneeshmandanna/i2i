import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (
    pathname === "/" ||
    pathname.startsWith("/env-login") ||
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/env-auth") ||
    pathname.startsWith("/_next") ||
    pathname.includes("favicon.ico")
  ) {
    return NextResponse.next();
  }

  // For protected routes, redirect to login if no session
  if (
    pathname.startsWith("/env-dashboard") ||
    pathname.startsWith("/env-admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin")
  ) {
    // In middleware, we can't access localStorage, so we'll let the client-side handle auth
    // The pages themselves will check for valid sessions
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (api routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
