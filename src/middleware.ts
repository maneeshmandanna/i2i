import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to public routes and test endpoints
    if (
      pathname === "/" ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/test-") ||
      pathname.startsWith("/api/debug") ||
      pathname.startsWith("/api/admin/migrate-roles") ||
      pathname.startsWith("/test-")
    ) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check role-based access for admin routes
    if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
      const userRole = token.role as string;
      if (userRole !== "admin" && userRole !== "co-owner") {
        const loginUrl = new URL("/login?error=AccessDenied", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    // Check if user is whitelisted for other protected routes
    if (pathname.startsWith("/dashboard")) {
      if (!token.isWhitelisted) {
        const loginUrl = new URL("/login?error=AccessDenied", req.url);
        return NextResponse.redirect(loginUrl);
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to public routes
        if (
          pathname === "/" ||
          pathname.startsWith("/login") ||
          pathname.startsWith("/api/auth") ||
          pathname.startsWith("/api/test-") ||
          pathname.startsWith("/api/debug") ||
          pathname.startsWith("/api/admin/migrate-roles") ||
          pathname.startsWith("/test-")
        ) {
          return true;
        }

        // Require authentication for protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - test- (test pages)
     * - api/auth (NextAuth)
     * - api/test- (test APIs)
     * - api/debug (debug APIs)
     */
    "/((?!_next/static|_next/image|favicon.ico|test-|api/auth|api/test-|api/debug).*)",
  ],
};
