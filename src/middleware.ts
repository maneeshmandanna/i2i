import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to auth pages and test endpoints without authentication
    if (
      pathname.startsWith("/login") ||
      pathname.startsWith("/api/auth") ||
      pathname.startsWith("/api/test-")
    ) {
      return NextResponse.next();
    }

    // Redirect to login if not authenticated
    if (!token) {
      const loginUrl = new URL("/login", req.url);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user is whitelisted for protected routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/api/")) {
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
          pathname.startsWith("/api/test-")
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
     * Temporarily disable middleware to debug Vercel SSO redirect issue
     * Only protect specific routes for now
     */
    "/dashboard/:path*",
    "/api/((?!auth|test-).*)",
  ],
};
