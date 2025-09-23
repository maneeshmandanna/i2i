import { NextResponse } from "next/server";
import { validateUser, createSession } from "@/lib/env-auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Validate user credentials
    const user = validateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials or user not whitelisted" },
        { status: 401 }
      );
    }

    // Create session
    const session = createSession(user.email);

    return NextResponse.json({
      success: true,
      message: "Login successful",
      session,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
