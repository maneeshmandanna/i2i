// Simple whitelist configuration
// Non-technical users can edit this file to add/remove emails

export const WHITELIST_EMAILS = [
  "maneesh@maneeshmandanna.com",
  // Add more emails here, one per line:
  // 'user@example.com',
  // 'admin@company.com',
];

// Check if email is in the simple whitelist
export function isEmailWhitelisted(email: string): boolean {
  return WHITELIST_EMAILS.includes(email.toLowerCase());
}
