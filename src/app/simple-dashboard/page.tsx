"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Image, User, Settings } from "lucide-react";

interface SimpleSession {
  email: string;
  isAdmin: boolean;
  loginTime: number;
}

export default function SimpleDashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<SimpleSession | null>(null);

  useEffect(() => {
    // Check session
    const sessionData = localStorage.getItem("simpleSession");
    if (!sessionData) {
      router.push("/simple-login");
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    setSession(parsedSession);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("simpleSession");
    router.push("/simple-login");
  };

  if (!session) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Welcome to the Image Processing Platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, <strong>{session.email}</strong>
          </span>
          {session.isAdmin && (
            <Button
              variant="outline"
              onClick={() => router.push("/simple-admin")}
            >
              Admin Panel
            </Button>
          )}
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* User Info */}
      <div className="bg-white p-6 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <User className="h-5 w-5" />
          Your Account
        </h2>
        <div className="space-y-2">
          <p>
            <strong>Email:</strong> {session.email}
          </p>
          <p>
            <strong>Access Level:</strong>
            <span
              className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                session.isAdmin
                  ? "bg-purple-100 text-purple-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {session.isAdmin ? "Admin" : "User"}
            </span>
          </p>
          <p>
            <strong>Login Time:</strong>{" "}
            {new Date(session.loginTime).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Coming Soon */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Image className="h-5 w-5" />
          Image Processing
        </h2>
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
          <p className="text-gray-500 mb-6">
            Upload and transform mannequin apparel images to human models.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              🚀 <strong>Simple & Secure:</strong> Passwordless authentication
              <br />✅ <strong>Whitelisted Access:</strong> Only approved users
              <br />
              🔒 <strong>Magic Links:</strong> Secure, time-limited access
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
