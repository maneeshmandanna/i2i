import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/connection";

export async function POST() {
  try {
    console.log("🔄 Running role migration in production...");

    // Add role column to users table (IF NOT EXISTS prevents errors if already exists)
    await db.execute(
      sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'user' NOT NULL`
    );

    // Update existing users to have appropriate roles
    await db.execute(
      sql`UPDATE users SET role = 'admin' WHERE email = 'maneesh@maneeshmandanna.com'`
    );

    // Create index for role queries (IF NOT EXISTS prevents errors if already exists)
    await db.execute(
      sql`CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)`
    );

    console.log("✅ Role migration completed in production!");

    return NextResponse.json({
      success: true,
      message: "Role migration completed successfully",
      changes: [
        "Added role column to users table",
        "Set maneesh@maneeshmandanna.com as admin",
        "Created index on role column",
      ],
    });
  } catch (error) {
    console.error("❌ Migration failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Migration failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
