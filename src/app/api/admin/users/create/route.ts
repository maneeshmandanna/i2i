import { NextResponse } from "next/server";
import { UserRepository } from "@/lib/db";
import { requireUserManagement } from "@/lib/auth-roles";

export async function POST(request: Request) {
  try {
    // Check if user has admin/co-owner permissions
    await requireUserManagement();

    const {
      email,
      password,
      isWhitelisted = true,
      role = "user",
    } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await UserRepository.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Create the user
    const user = await UserRepository.createWithHashedPassword(
      email,
      password,
      isWhitelisted,
      role
    );

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: user.id,
        email: user.email,
        isWhitelisted: user.isWhitelisted,
      },
    });
  } catch (error) {
    console.error("Error creating user:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create user",
      },
      { status: 500 }
    );
  }
}
