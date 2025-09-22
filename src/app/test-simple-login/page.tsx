"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

export default function TestSimpleLoginPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testLogin = async () => {
    setLoading(true);
    try {
      console.log("Testing simple login...");

      const result = await signIn("credentials", {
        email: "maneesh@maneeshmandanna.com",
        password: "securepassword123",
        redirect: false,
      });

      console.log("Login result:", result);
      setResult(result);

      if (result?.ok) {
        // Redirect manually if successful
        window.location.href = "/admin";
      }
    } catch (error) {
      console.error("Login error:", error);
      setResult({
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Login Test</h1>

      <button
        onClick={testLogin}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Signing In..." : "Test Simple Login"}
      </button>

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
