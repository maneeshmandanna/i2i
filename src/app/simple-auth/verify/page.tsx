"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function VerifyMagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invalid or missing token");
      return;
    }

    verifyToken(token);
  }, [token, verifyToken]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch("/api/simple-auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(`Welcome, ${data.email}!`);

        // Store session
        localStorage.setItem("simpleSession", JSON.stringify(data.session));

        // Redirect based on admin status
        setTimeout(() => {
          if (data.session.isAdmin) {
            router.push("/simple-admin");
          } else {
            router.push("/simple-dashboard");
          }
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.error || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <div className="text-center">
          {status === "loading" && (
            <>
              <Loader2 className="mx-auto h-12 w-12 text-blue-500 animate-spin mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verifying...
              </h1>
              <p className="text-gray-600">
                Please wait while we verify your login link.
              </p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Login Successful!
              </h1>
              <p className="text-gray-600 mb-4">{message}</p>
              <p className="text-sm text-blue-600">
                Redirecting you to the platform...
              </p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Verification Failed
              </h1>
              <p className="text-gray-600 mb-6">{message}</p>
              <Button onClick={() => router.push("/simple-login")}>
                Try Again
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
