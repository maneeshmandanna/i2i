import { NextResponse } from "next/server";
import { verifyMagicToken, createSession } from "@/lib/simple-auth";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: "Token is required" }, { status: 400 });
    }

    // Verify the magic token
    const email = verifyMagicToken(token);

    if (!email) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Create session
    const session = createSession(email);

    return NextResponse.json({
      success: true,
      email,
      session,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
