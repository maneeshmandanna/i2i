"use client";

import { useEffect, ReactNode } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: ReactNode;
  requireWhitelisted?: boolean;
  fallback?: ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireWhitelisted = true,
  fallback,
  redirectTo = "/login",
}: AuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (!session) {
      // Not authenticated, redirect to login
      router.push(redirectTo);
      return;
    }

    if (requireWhitelisted && !session.user.isWhitelisted) {
      // User not whitelisted, redirect to login with error
      router.push(`${redirectTo}?error=AccessDenied`);
      return;
    }
  }, [session, status, router, requireWhitelisted, redirectTo]);

  // Show loading state
  if (status === "loading") {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Not authenticated
  if (!session) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      )
    );
  }

  // Not whitelisted
  if (requireWhitelisted && !session.user.isWhitelisted) {
    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-600">Access denied. User not whitelisted.</p>
          </div>
        </div>
      )
    );
  }

  // Authenticated and authorized
  return <>{children}</>;
}

// Higher-order component version
export function withAuthGuard<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<AuthGuardProps, "children">
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard {...options}>
        <Component {...props} />
      </AuthGuard>
    );
  };
}
