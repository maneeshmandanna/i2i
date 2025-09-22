"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { LoginForm } from "@/components/auth/LoginForm";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const error = searchParams.get("error");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session?.user?.isWhitelisted) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      case "AccessDenied":
        return "Access denied. Your account is not whitelisted for this application.";
      case "Configuration":
        return "There was a problem with the server configuration. Please try again later.";
      default:
        return null;
    }
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Image Processing Platform
          </h2>
          <p className="mt-2 text-gray-600">
            Transform mannequin apparel images to human models
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <LoginForm onSuccess={handleLoginSuccess} />

        <div className="mt-6 text-center">
          <div className="text-sm text-gray-500">
            <p>
              For access to this platform, please contact your administrator.
            </p>
            <p className="mt-1">Only whitelisted users can sign in.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
