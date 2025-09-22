import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const { userId, isWhitelisted } = await request.json();

    if (!userId || typeof isWhitelisted !== "boolean") {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and whitelist status are required",
        },
        { status: 400 }
      );
    }

    // Update the user's whitelist status
    const user = await UserRepository.updateWhitelistStatus(
      userId,
      isWhitelisted
    );

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `User ${
        isWhitelisted ? "whitelisted" : "removed from whitelist"
      } successfully`,
      user: {
        id: user.id,
        email: user.email,
        isWhitelisted: user.isWhitelisted,
      },
    });
  } catch (error) {
    console.error("Error updating user whitelist status:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user status",
      },
      { status: 500 }
    );
  }
}
