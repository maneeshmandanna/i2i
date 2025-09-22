import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db";
import { requireUserManagement } from "@/lib/auth-roles";

export async function GET() {
  try {
    // Check if user has admin/co-owner permissions
    await requireUserManagement();

    const users = await UserRepository.findAll();

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        isWhitelisted: user.isWhitelisted,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    // Handle authorization errors
    if (error instanceof Error && error.message.includes("Access denied")) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
