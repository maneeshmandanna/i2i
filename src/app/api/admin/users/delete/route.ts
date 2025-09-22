import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db";
import { requireUserManagement } from "@/lib/auth-roles";

export async function POST(request: Request) {
  try {
    // Check if user has admin/co-owner permissions
    await requireUserManagement();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 }
      );
    }

    // Delete the user
    const success = await UserRepository.deleteUser(userId);

    if (!success) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete user or user not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 }
    );
  }
}
