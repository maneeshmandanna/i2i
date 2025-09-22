import { NextRequest, NextResponse } from "next/server";
import { AuthUtils } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  try {
    const user = await AuthUtils.requireWhitelistedUser();

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        isWhitelisted: user.isWhitelisted,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
