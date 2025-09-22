import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    console.log("Testing auth for:", email);

    // Test the same logic as the auth provider
    const user = await UserRepository.verifyPassword(email, password);

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid credentials or user not found",
        },
        { status: 401 }
      );
    }

    if (!user.isWhitelisted) {
      return NextResponse.json(
        {
          success: false,
          message: "User not whitelisted",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        id: user.id,
        email: user.email,
        isWhitelisted: user.isWhitelisted,
      },
    });
  } catch (error) {
    console.error("Auth test error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Authentication test failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
