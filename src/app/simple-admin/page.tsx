"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Users, Plus, Trash2, Shield } from "lucide-react";
import { WHITELISTED_EMAILS, ADMIN_EMAILS } from "@/lib/simple-auth";

interface SimpleSession {
  email: string;
  isAdmin: boolean;
  loginTime: number;
}

export default function SimpleAdminPage() {
  const router = useRouter();
  const [session, setSession] = useState<SimpleSession | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    // Check session
    const sessionData = localStorage.getItem("simpleSession");
    if (!sessionData) {
      router.push("/simple-login");
      return;
    }

    const parsedSession = JSON.parse(sessionData);
    if (!parsedSession.isAdmin) {
      router.push("/simple-dashboard");
      return;
    }

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
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8 text-blue-500" />
            Admin Panel
          </h1>
          <p className="text-gray-600 mt-2">Manage whitelisted users</p>
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

      {message && (
        <Alert
          variant={message.type === "error" ? "destructive" : "default"}
          className="mb-6"
        >
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      {/* Instructions for Non-Technical Users */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3">
          📝 How to Add/Remove Users (For Non-Technical Team Members)
        </h2>
        <div className="space-y-2 text-blue-800">
          <p>
            <strong>To add a user:</strong> Ask a developer to add the email to
            the whitelist file
          </p>
          <p>
            <strong>To remove a user:</strong> Ask a developer to remove the
            email from the whitelist file
          </p>
          <p>
            <strong>File location:</strong> <code>src/lib/simple-auth.ts</code>{" "}
            → <code>WHITELISTED_EMAILS</code> array
          </p>
        </div>
      </div>

      {/* Current Whitelisted Users */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Whitelisted Users ({WHITELISTED_EMAILS.length})
          </h2>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {WHITELISTED_EMAILS.map((email, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="font-medium">{email}</span>
                  {ADMIN_EMAILS.includes(email) && (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  )}
                </div>
                <span className="text-sm text-green-600 font-medium">
                  ✅ Active
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simple Instructions */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">🔧 Developer Instructions</h2>
        </div>
        <div className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">To modify the whitelist:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                Open <code>src/lib/simple-auth.ts</code>
              </li>
              <li>
                Edit the <code>WHITELISTED_EMAILS</code> array
              </li>
              <li>Add or remove email addresses</li>
              <li>Save and deploy</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
