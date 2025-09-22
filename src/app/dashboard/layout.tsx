"use client";

import { ReactNode } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { LogOut, User } from "lucide-react";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900">
                  Image Processing Platform
                </h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="h-4 w-4" />
                  <span>{session?.user?.email}</span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center space-x-2"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
