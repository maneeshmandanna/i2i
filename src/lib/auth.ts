import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { UserRepository } from "./db";
import { z } from "zod";

// Login schema validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          // Validate input
          const { email, password } = loginSchema.parse(credentials);

          // Check if user is whitelisted
          const isWhitelisted = await UserRepository.isWhitelisted(email);
          if (!isWhitelisted) {
            throw new Error("Access denied. User not whitelisted.");
          }

          // Verify password
          const user = await UserRepository.verifyPassword(email, password);
          if (!user) {
            throw new Error("Invalid credentials");
          }

          // Return user object for session
          return {
            id: user.id,
            email: user.email,
            isWhitelisted: user.isWhitelisted,
          };
        } catch (error) {
          console.error("Authentication error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  jwt: {
    maxAge: 24 * 60 * 60, // 24 hours
  },
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth, check if user is whitelisted
      if (account?.provider === "google") {
        const isWhitelisted = await UserRepository.isWhitelisted(user.email!);
        if (!isWhitelisted) {
          return false; // Deny access if not whitelisted
        }
        return true;
      }

      // For credentials provider, authorization is handled in the provider
      return true;
    },
    async jwt({ token, user, account }) {
      // Include user data in JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;

        // For Google OAuth, check whitelist status
        if (account?.provider === "google") {
          token.isWhitelisted = await UserRepository.isWhitelisted(user.email!);
        } else {
          token.isWhitelisted = user.isWhitelisted;
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Include user data in session
      if (token) {
        session.user = {
          id: token.id as string,
          email: token.email as string,
          isWhitelisted: token.isWhitelisted as boolean,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Helper function to get server session
export async function getServerSession() {
  const { getServerSession } = await import("next-auth");
  return getServerSession(authOptions);
}

// Helper function to check if user is authenticated
export async function requireAuth() {
  const session = await getServerSession();
  if (!session?.user) {
    throw new Error("Authentication required");
  }
  return session.user;
}

// Helper function to check if user is whitelisted
export async function requireWhitelistedUser() {
  const user = await requireAuth();
  if (!user.isWhitelisted) {
    throw new Error("Access denied. User not whitelisted.");
  }
  return user;
}
