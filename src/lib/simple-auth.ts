// Simple, secure authentication system
import crypto from "crypto";

// Simple whitelist - easy for non-techs to manage
export const WHITELISTED_EMAILS = [
  "maneesh@maneeshmandanna.com",
  "mailpcp@gmail.com",
  // Add more emails here:
  // 'user@company.com',
  // 'admin@example.com',
];

// Admin emails (can manage whitelist)
export const ADMIN_EMAILS = [
  "maneesh@maneeshmandanna.com",
  "mailpcp@gmail.com",
];

// Check if email is whitelisted
export function isWhitelisted(email: string): boolean {
  return WHITELISTED_EMAILS.includes(email.toLowerCase().trim());
}

// Check if email is admin
export function isAdmin(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim());
}

// Generate secure magic link token
export function generateMagicToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

// Verify magic token (simple in-memory store for demo)
const magicTokens = new Map<string, { email: string; expires: number }>();

export function createMagicToken(email: string): string {
  const token = generateMagicToken();
  const expires = Date.now() + 15 * 60 * 1000; // 15 minutes

  magicTokens.set(token, { email, expires });

  // Clean up expired tokens
  setTimeout(() => {
    magicTokens.delete(token);
  }, 15 * 60 * 1000);

  return token;
}

export function verifyMagicToken(token: string): string | null {
  const data = magicTokens.get(token);

  if (!data || Date.now() > data.expires) {
    magicTokens.delete(token);
    return null;
  }

  // Token is valid, remove it (one-time use)
  magicTokens.delete(token);
  return data.email;
}

// Simple session management
export interface SimpleSession {
  email: string;
  isAdmin: boolean;
  loginTime: number;
}

export function createSession(email: string): SimpleSession {
  return {
    email,
    isAdmin: isAdmin(email),
    loginTime: Date.now(),
  };
}

export function isValidSession(session: SimpleSession | null): boolean {
  if (!session) return false;

  // Session expires after 24 hours
  const sessionAge = Date.now() - session.loginTime;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  return sessionAge < maxAge && isWhitelisted(session.email);
}
