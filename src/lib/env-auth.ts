// Simple environment-based authentication
// Whitelist managed through Vercel environment variables

interface User {
  email: string;
  password: string;
  isAdmin?: boolean;
}

// Parse users from environment variable
// Format: "email1:password1:admin,email2:password2,email3:password3:admin"
function parseUsersFromEnv(): User[] {
  const usersEnv = process.env.WHITELISTED_USERS || "";

  if (!usersEnv) {
    // Fallback users if env var not set
    return [
      {
        email: "maneesh@maneeshmandanna.com",
        password: "securepassword123",
        isAdmin: true,
      },
      { email: "mailpcp@gmail.com", password: "password123", isAdmin: true },
    ];
  }

  return usersEnv.split(",").map((userStr) => {
    const parts = userStr.trim().split(":");
    return {
      email: parts[0],
      password: parts[1],
      isAdmin: parts[2] === "admin",
    };
  });
}

// Get all whitelisted users
export function getWhitelistedUsers(): User[] {
  return parseUsersFromEnv();
}

// Check if user exists and password is correct
export function validateUser(email: string, password: string): User | null {
  const users = getWhitelistedUsers();
  const user = users.find(
    (u) =>
      u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );
  return user || null;
}

// Check if email is whitelisted
export function isEmailWhitelisted(email: string): boolean {
  const users = getWhitelistedUsers();
  return users.some((u) => u.email.toLowerCase() === email.toLowerCase());
}

// Check if user is admin
export function isUserAdmin(email: string): boolean {
  const users = getWhitelistedUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  return user?.isAdmin || false;
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
    isAdmin: isUserAdmin(email),
    loginTime: Date.now(),
  };
}

export function isValidSession(session: SimpleSession | null): boolean {
  if (!session) return false;

  // Session expires after 24 hours
  const sessionAge = Date.now() - session.loginTime;
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours

  return sessionAge < maxAge && isEmailWhitelisted(session.email);
}
