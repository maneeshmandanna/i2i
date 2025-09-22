"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const userRole = session.user.role;
  const isAdmin = userRole === "admin" || userRole === "co-owner";

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to the Image Processing Platform
        </p>
      </div>

      {/* User Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {session.user.email}
          </p>
          <p>
            <strong>Role:</strong>
            <span
              className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                userRole === "admin"
                  ? "bg-purple-100 text-purple-800"
                  : userRole === "co-owner"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            </span>
          </p>
          <p>
            <strong>Status:</strong>
            <span className="ml-2 px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
              Whitelisted
            </span>
          </p>
        </div>
      </div>

      {/* Admin Access */}
      {isAdmin && (
        <Alert className="mb-6">
          <AlertDescription>
            You have administrative privileges.
            <Button
              variant="link"
              className="p-0 ml-2 h-auto"
              onClick={() => router.push("/admin")}
            >
              Access Admin Panel →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Coming Soon */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Image Processing</h2>
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">
            <svg
              className="mx-auto h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Image Processing Coming Soon
          </h3>
          <p className="text-gray-500">
            Upload and transform mannequin apparel images to human models.
          </p>
        </div>
      </div>
    </div>
  );
}
