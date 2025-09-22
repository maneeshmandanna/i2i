import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db";

export async function GET() {
  try {
    // Test database connection by trying to find a user
    const user = await UserRepository.findByEmail(
      "maneesh@maneeshmandanna.com"
    );

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userFound: !!user,
      userEmail: user?.email || "Not found",
      userWhitelisted: user?.isWhitelisted || false,
    });
  } catch (error) {
    console.error("Database test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Database connection failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
