/**
 * Admin check utility.
 * Admin users are configured via ADMIN_EMAILS env var (comma-separated).
 */
export function isAdmin(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
  if (adminEmails.length === 0) return false;
  return adminEmails.includes(userEmail.toLowerCase());
}
