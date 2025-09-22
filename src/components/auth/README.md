# Authentication System

This directory contains the complete authentication system for the i2i-mvp application, implementing secure whitelist-based access control with NextAuth.js.

## Overview

The authentication system provides:

- **Whitelist-based Access Control**: Only pre-approved users can access the application
- **Secure Password Hashing**: Uses bcrypt with 12 salt rounds
- **Session Management**: JWT-based sessions with 24-hour expiry
- **Route Protection**: Middleware and components for protecting routes
- **Form Validation**: Client-side validation with error handling

## Components

### LoginForm

A complete login form with validation and error handling.

```tsx
import { LoginForm } from "@/components/auth/LoginForm";

<LoginForm
  onSuccess={() => router.push("/dashboard")}
  className="max-w-md mx-auto"
/>;
```

**Features:**

- Email and password validation
- Password visibility toggle
- Loading states
- Error message display
- Responsive design

### AuthGuard

A component that protects routes and redirects unauthorized users.

```tsx
import { AuthGuard } from "@/components/auth/AuthGuard";

<AuthGuard requireWhitelisted={true}>
  <ProtectedContent />
</AuthGuard>;
```

**Props:**

- `requireWhitelisted`: Whether to require whitelisted status (default: true)
- `fallback`: Custom loading/error component
- `redirectTo`: Where to redirect unauthorized users (default: '/login')

### SessionProvider

Wraps the application with NextAuth session context.

```tsx
import { SessionProvider } from "@/components/auth/SessionProvider";

<SessionProvider>
  <App />
</SessionProvider>;
```

## Authentication Flow

### 1. User Login

1. User enters email and password
2. System validates input format
3. Checks if user is whitelisted
4. Verifies password against hashed version
5. Creates JWT session if successful

### 2. Route Protection

1. Middleware checks for valid session
2. Verifies user is whitelisted for protected routes
3. Redirects to login if unauthorized
4. Allows access if authenticated and whitelisted

### 3. Session Management

- Sessions expire after 24 hours
- JWT tokens contain user ID, email, and whitelist status
- Automatic session refresh on page load
- Secure logout clears session data

## API Routes

### Authentication Endpoints

#### `POST /api/auth/signin`

Login endpoint (handled by NextAuth)

#### `POST /api/auth/signout`

Logout endpoint (handled by NextAuth)

#### `GET /api/auth/me`

Get current user information

```typescript
// Response
{
  user: {
    id: string;
    email: string;
    isWhitelisted: boolean;
  }
}
```

## Server-Side Authentication

### Using AuthUtils

```typescript
import { AuthUtils } from "@/lib/auth-utils";

// Get current user (returns null if not authenticated)
const user = await AuthUtils.getCurrentUser();

// Require authentication (throws error if not authenticated)
const user = await AuthUtils.requireAuth();

// Require whitelisted user (throws error if not whitelisted)
const user = await AuthUtils.requireWhitelistedUser();

// Protect API routes
export const GET = AuthUtils.withAuth(async (req, user) => {
  // Handler code here
  return NextResponse.json({ data: "protected" });
});
```

### Manual Session Handling

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.isWhitelisted) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Handle authenticated request
}
```

## Client-Side Authentication

### Using the Auth Store

```typescript
import { useAuthStore } from "@/stores/auth-store";

function LoginComponent() {
  const { login, logout, isLoading, error, user } = useAuthStore();

  const handleLogin = async () => {
    await login({ email: "user@example.com", password: "password" });
  };

  const handleLogout = async () => {
    await logout();
  };
}
```

### Using NextAuth Hooks

```typescript
import { useSession, signIn, signOut } from "next-auth/react";

function Component() {
  const { data: session, status } = useSession();

  if (status === "loading") return <Loading />;
  if (!session) return <LoginButton />;

  return <AuthenticatedContent user={session.user} />;
}
```

## User Management

### Creating Test Users

```bash
# Create a test user for development
npm run auth:create-test-user
```

### Programmatic User Creation

```typescript
import { AuthUtils } from "@/lib/auth-utils";

// Create whitelisted user
const result = await AuthUtils.createWhitelistedUser(
  "user@example.com",
  "securePassword123"
);

if (result.success) {
  console.log("User created:", result.user);
} else {
  console.error("Error:", result.error);
}
```

### Updating Whitelist Status

```typescript
import { AuthUtils } from "@/lib/auth-utils";

// Update user whitelist status
const result = await AuthUtils.updateWhitelistStatus(userId, true);
```

## Security Features

### Password Security

- Passwords hashed with bcrypt (12 salt rounds)
- No plain text password storage
- Secure password comparison

### Session Security

- JWT tokens with 24-hour expiry
- Secure HTTP-only cookies (in production)
- Session invalidation on logout

### Input Validation

- Email format validation
- Password strength requirements
- XSS protection through proper escaping

### Route Protection

- Middleware-level authentication
- Component-level guards
- API route protection

## Environment Variables

Required environment variables:

```bash
# NextAuth configuration
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000

# Database (for user storage)
POSTGRES_URL=your-postgres-connection-string
```

## Error Handling

### Authentication Errors

The system handles various authentication errors:

- `CredentialsSignin`: Invalid email/password
- `AccessDenied`: User not whitelisted
- `Configuration`: Server configuration error
- `Verification`: Token verification failed

### Error Display

```typescript
import { ClientAuthUtils } from "@/lib/auth-utils";

const errorMessage = ClientAuthUtils.getErrorMessage(error);
```

## Testing

### Manual Testing

1. Create a test user:

   ```bash
   npm run auth:create-test-user
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Navigate to `/login` and test authentication

### Integration Testing

```typescript
// Example test
describe("Authentication", () => {
  it("should authenticate whitelisted user", async () => {
    const result = await AuthUtils.validateCredentials(
      "test@example.com",
      "password123"
    );

    expect(result.success).toBe(true);
    expect(result.user?.isWhitelisted).toBe(true);
  });
});
```

## Troubleshooting

### Common Issues

1. **"Authentication required" error**

   - Check if NEXTAUTH_SECRET is set
   - Verify database connection
   - Ensure user exists and is whitelisted

2. **Redirect loops**

   - Check middleware configuration
   - Verify session provider is properly wrapped
   - Ensure correct redirect URLs

3. **Session not persisting**
   - Check NEXTAUTH_URL matches your domain
   - Verify cookie settings
   - Check for client/server time sync issues

### Debug Mode

Enable debug logging:

```bash
NEXTAUTH_DEBUG=1 npm run dev
```

This will show detailed authentication logs in the console.
