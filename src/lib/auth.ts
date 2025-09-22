import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { UserRepository } from "./db";
import { z } from "zod";

// Login schema validation
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const authOptions: NextAuthOptions = {
  providers: [
    // Temporarily disabled Google OAuth to fix verification issue
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
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
            role: user.role,
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
    async jwt({ token, user }) {
      // Include user data in JWT token
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.isWhitelisted = user.isWhitelisted;
        token.role = user.role;
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
          role: token.role as string,
        };
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
    verifyRequest: "/login", // Redirect verification requests to login
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
