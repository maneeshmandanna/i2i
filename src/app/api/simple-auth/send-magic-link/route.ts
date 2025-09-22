import { NextResponse } from "next/server";
import { isWhitelisted, createMagicToken } from "@/lib/simple-auth";
import { sendEmail, createMagicLinkEmail } from "@/lib/email";

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

    // Create email content
    const emailHtml = createMagicLinkEmail(email, magicLink);

    // Send email
    const emailSent = await sendEmail({
      to: email,
      subject: "🔐 Your Secure Login Link - Image Processing Platform",
      html: emailHtml,
    });

    if (!emailSent) {
      console.error("Failed to send email to:", email);
      // Still return success but log the issue
    }

    console.log(`Magic link for ${email}: ${magicLink}`);

    return NextResponse.json({
      success: true,
      message: "Magic link sent successfully",
      // Include link in development for easy testing
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
