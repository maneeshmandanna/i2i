import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRepository } from "./db";
import { NextRequest, NextResponse } from "next/server";

// Server-side authentication utilities
export class AuthUtils {
  /**
   * Get the current authenticated user from server session
   */
  static async getCurrentUser() {
    const session = await getServerSession(authOptions);
    return session?.user || null;
  }

  /**
   * Require authentication for API routes
   */
  static async requireAuth() {
    const user = await this.getCurrentUser();
    if (!user) {
      throw new Error("Authentication required");
    }
    return user;
  }

  /**
   * Require whitelisted user for API routes
   */
  static async requireWhitelistedUser() {
    const user = await this.requireAuth();
    if (!user.isWhitelisted) {
      throw new Error("Access denied. User not whitelisted.");
    }
    return user;
  }

  /**
   * Create authentication middleware for API routes
   */
  static withAuth(
    handler: (req: NextRequest, user: any) => Promise<NextResponse>
  ) {
    return async (req: NextRequest) => {
      try {
        const user = await this.requireWhitelistedUser();
        return await handler(req, user);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Authentication failed";
        return NextResponse.json({ error: message }, { status: 401 });
      }
    };
  }

  /**
   * Validate user credentials
   */
  static async validateCredentials(email: string, password: string) {
    try {
      // Check if user is whitelisted
      const isWhitelisted = await UserRepository.isWhitelisted(email);
      if (!isWhitelisted) {
        return { success: false, error: "User not whitelisted" };
      }

      // Verify password
      const user = await UserRepository.verifyPassword(email, password);
      if (!user) {
        return { success: false, error: "Invalid credentials" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("Credential validation error:", error);
      return { success: false, error: "Authentication failed" };
    }
  }

  /**
   * Check if email is whitelisted
   */
  static async isEmailWhitelisted(email: string): Promise<boolean> {
    try {
      return await UserRepository.isWhitelisted(email);
    } catch (error) {
      console.error("Whitelist check error:", error);
      return false;
    }
  }

  /**
   * Create a new whitelisted user (admin function)
   */
  static async createWhitelistedUser(email: string, password: string) {
    try {
      // Check if user already exists
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return { success: false, error: "User already exists" };
      }

      // Create user
      const user = await UserRepository.createWithHashedPassword(
        email,
        password,
        true // isWhitelisted
      );

      return { success: true, user };
    } catch (error) {
      console.error("User creation error:", error);
      return { success: false, error: "Failed to create user" };
    }
  }

  /**
   * Update user whitelist status (admin function)
   */
  static async updateWhitelistStatus(userId: string, isWhitelisted: boolean) {
    try {
      const user = await UserRepository.update(userId, { isWhitelisted });
      if (!user) {
        return { success: false, error: "User not found" };
      }

      return { success: true, user };
    } catch (error) {
      console.error("Whitelist update error:", error);
      return { success: false, error: "Failed to update whitelist status" };
    }
  }
}

// Client-side authentication utilities
export class ClientAuthUtils {
  /**
   * Handle authentication errors
   */
  static getErrorMessage(error: string | null): string | null {
    switch (error) {
      case "CredentialsSignin":
        return "Invalid email or password. Please try again.";
      case "AccessDenied":
        return "Access denied. Your account is not whitelisted for this application.";
      case "Configuration":
        return "There was a problem with the server configuration. Please try again later.";
      case "Verification":
        return "Unable to verify your credentials. Please try again.";
      default:
        return error
          ? "An authentication error occurred. Please try again."
          : null;
    }
  }

  /**
   * Validate email format
   */
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    message?: string;
  } {
    if (password.length < 8) {
      return {
        isValid: false,
        message: "Password must be at least 8 characters long",
      };
    }

    if (!/(?=.*[a-z])/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one lowercase letter",
      };
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one uppercase letter",
      };
    }

    if (!/(?=.*\d)/.test(password)) {
      return {
        isValid: false,
        message: "Password must contain at least one number",
      };
    }

    return { isValid: true };
  }
}
