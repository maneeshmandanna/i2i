"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading

    if (session?.user?.isWhitelisted) {
      // User is authenticated and whitelisted, redirect to dashboard
      router.push("/dashboard");
    } else {
      // Not authenticated or not whitelisted, redirect to login
      router.push("/login");
    }
  }, [session, status, router]);

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
