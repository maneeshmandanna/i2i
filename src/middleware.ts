import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // Allow access to auth pages without authentication
    if (pathname.startsWith("/login") || pathname.startsWith("/api/auth")) {
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
          pathname.startsWith("/api/auth")
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
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
