import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db";

export async function GET() {
  try {
    const users = await UserRepository.findAll();

    return NextResponse.json({
      success: true,
      users: users.map((user) => ({
        id: user.id,
        email: user.email,
        isWhitelisted: user.isWhitelisted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
      },
      { status: 500 }
    );
  }
}
