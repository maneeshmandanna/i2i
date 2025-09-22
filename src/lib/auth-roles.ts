import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { UserRole } from "@/types/database";

// Role hierarchy: admin > co-owner > user
const ROLE_HIERARCHY: Record<UserRole, number> = {
  admin: 3,
  "co-owner": 2,
  user: 1,
};

// Check if user has required role or higher
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Check if user can manage other users (admin or co-owner)
export function canManageUsers(userRole: UserRole): boolean {
  return hasRole(userRole, "co-owner");
}

// Get current user session with role check
export async function getCurrentUserWithRole() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    throw new Error("Authentication required");
  }

  return {
    ...session.user,
    role: session.user.role as UserRole,
  };
}

// Require specific role or higher
export async function requireRole(requiredRole: UserRole) {
  const user = await getCurrentUserWithRole();

  if (!hasRole(user.role, requiredRole)) {
    throw new Error(`Access denied. Required role: ${requiredRole} or higher`);
  }

  return user;
}

// Require user management permissions
export async function requireUserManagement() {
  const user = await getCurrentUserWithRole();

  if (!canManageUsers(user.role)) {
    throw new Error("Access denied. Admin or co-owner role required");
  }

  return user;
}
