import { NextResponse } from "next/server";
import { isWhitelisted, createMagicToken } from "@/lib/simple-auth";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if email is whitelisted
    if (!isWhitelisted(email)) {
      return NextResponse.json(
        { error: "Access denied. Email not whitelisted." },
        { status: 403 }
      );
    }

    // Generate magic token
    const token = createMagicToken(email);
    const magicLink = `${
      process.env.NEXTAUTH_URL || "http://localhost:3000"
    }/simple-auth/verify?token=${token}`;

    // In production, you'd send this via email service (SendGrid, etc.)
    // For now, we'll log it and return it for testing
    console.log(`Magic link for ${email}: ${magicLink}`);

    // TODO: Replace with actual email sending
    // await sendEmail({
    //   to: email,
    //   subject: 'Your secure login link',
    //   html: `Click here to login: <a href="${magicLink}">Access Platform</a>`
    // });

    return NextResponse.json({
      success: true,
      message: "Magic link sent successfully",
      // Remove this in production - only for testing
      magicLink: process.env.NODE_ENV === "development" ? magicLink : undefined,
    });
  } catch (error) {
    console.error("Error sending magic link:", error);
    return NextResponse.json(
      { error: "Failed to send magic link" },
      { status: 500 }
    );
  }
}
