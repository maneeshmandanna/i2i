"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Settings, Shield } from "lucide-react";

interface EnvSession {
  email: string;
  isAdmin: boolean;
  loginTime: number;
}

export default function EnvAdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<EnvSession | null>(null);

  useEffect(() => {
    // Check session
    const sessionData = localStorage.getItem("envSession");
    if (!sessionData) {
      router.push("/env-login");
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    if (!parsedSession.isAdmin) {
      router.push("/env-dashboard");
      return;
    }

    setSession(parsedSession);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("envSession");
    router.push("/env-login");
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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">
            Manage whitelisted users via environment variables
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome, <strong>{session.email}</strong>
          </span>
          <Button variant="outline" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      {/* Instructions for Managing Users */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <Settings className="h-5 w-5" />
          How to Manage Users (Vercel Environment Variables)
        </h2>
        <div className="space-y-3 text-blue-800">
          <div>
            <p>
              <strong>1. Go to Vercel Dashboard:</strong>
            </p>
            <p className="ml-4">Project Settings → Environment Variables</p>
          </div>
          <div>
            <p>
              <strong>2. Add/Edit WHITELISTED_USERS variable:</strong>
            </p>
            <code className="block ml-4 bg-blue-100 p-2 rounded text-sm">
              email1:password1:admin,email2:password2,email3:password3:admin
            </code>
          </div>
          <div>
            <p>
              <strong>3. Format explanation:</strong>
            </p>
            <ul className="ml-4 list-disc">
              <li>
                <code>email:password</code> - Regular user
              </li>
              <li>
                <code>email:password:admin</code> - Admin user
              </li>
              <li>Separate multiple users with commas</li>
            </ul>
          </div>
          <div>
            <p>
              <strong>4. Redeploy</strong> after changing environment variables
            </p>
          </div>
        </div>
      </div>

      {/* Current Environment Variable */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Current Configuration
          </h2>
        </div>
        <div className="p-6">
          <Alert>
            <AlertDescription>
              <strong>Environment Variable:</strong> WHITELISTED_USERS
              <br />
              <strong>Location:</strong> Vercel Dashboard → Project Settings →
              Environment Variables
              <br />
              <strong>Current Status:</strong>{" "}
              {process.env.WHITELISTED_USERS
                ? "Set"
                : "Using fallback defaults"}
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Example Configuration */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Example Configuration</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="font-semibold mb-2">WHITELISTED_USERS value:</p>
            <code className="block text-sm bg-gray-100 p-3 rounded">
              maneesh@maneeshmandanna.com:securepass123:admin,user@company.com:userpass456,admin@company.com:adminpass789:admin
            </code>
            <div className="mt-3 text-sm text-gray-600">
              <p>
                <strong>This creates:</strong>
              </p>
              <ul className="list-disc ml-4 mt-1">
                <li>maneesh@maneeshmandanna.com (Admin)</li>
                <li>user@company.com (Regular User)</li>
                <li>admin@company.com (Admin)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
