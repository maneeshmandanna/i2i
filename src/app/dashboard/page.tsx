"use client";

import { useSession } from "next-auth/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Upload, History, Settings } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Welcome back, {session?.user?.email?.split("@")[0]}!
        </h2>
        <p className="text-gray-600 mt-1">
          Transform your mannequin apparel images into realistic human model
          images.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upload Images</CardTitle>
            <Upload className="h-4 w-4 ml-auto text-blue-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload mannequin apparel images for transformation
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Processing History
            </CardTitle>
            <History className="h-4 w-4 ml-auto text-green-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              View your recent image transformations
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Settings</CardTitle>
            <Settings className="h-4 w-4 ml-auto text-gray-600" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Configure transformation parameters
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Getting Started
        </h3>
        <p className="text-blue-700 text-sm">
          Ready to transform your apparel images? Start by uploading your
          mannequin photos, configure your transformation parameters, and let
          our AI create realistic human model images.
        </p>
      </div>
    </div>
  );
}
