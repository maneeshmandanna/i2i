"use client";

import { useState } from "react";
import { signIn, getSession } from "next-auth/react";

export default function TestNextAuthPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testNextAuth = async () => {
    setLoading(true);
    try {
      console.log("Testing NextAuth signin...");

      const result = await signIn("credentials", {
        email: "maneesh@maneeshmandanna.com",
        password: "securepassword123",
        redirect: false,
      });

      console.log("SignIn result:", result);

      // Get session after signin
      const session = await getSession();
      console.log("Session after signin:", session);

      setResult({
        signInResult: result,
        session: session,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("NextAuth test error:", error);
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testSession = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      setResult({ session, timestamp: new Date().toISOString() });
    } catch (error) {
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Test NextAuth</h1>

      <div className="space-x-4 mb-4">
        <button
          onClick={testNextAuth}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test NextAuth SignIn"}
        </button>

        <button
          onClick={testSession}
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? "Testing..." : "Test Session"}
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h2 className="font-bold">Result:</h2>
          <pre className="mt-2 text-sm overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
