"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user has env session
    const envSession = localStorage.getItem("envSession");

    if (envSession) {
      try {
        const session = JSON.parse(envSession);
        // Check if session is still valid (24 hours)
        const sessionAge = Date.now() - session.loginTime;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours

        if (sessionAge < maxAge) {
          // Valid session, redirect to dashboard
          router.push("/env-dashboard");
          return;
        }
      } catch (error) {
        // Invalid session data, remove it
        localStorage.removeItem("envSession");
      }
    }

    // No valid session, redirect to login
    router.push("/env-login");
  }, [router]);

  // Show loading state while redirecting
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
