/**
 * Admin check utility.
 * Admin users are configured via:
 * 1. ADMIN_EMAILS env var (comma-separated), OR
 * 2. profiles.role = 'admin' in database
 */
export function isAdmin(userEmail?: string | null): boolean {
  // Check environment variable
  if (userEmail) {
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim().toLowerCase());
    if (adminEmails.length > 0 && adminEmails.includes(userEmail.toLowerCase())) {
      return true;
    }
  }
  
  return false;
}

/**
 * Check if user is admin by user ID (database check)
 * For use in API routes - checks profiles.role
 */
export async function isUserAdmin(userId: string, pool: any): Promise<boolean> {
  if (!userId) return false;
  
  const result = await pool.query(
    'SELECT role FROM profiles WHERE id = $1',
    [userId]
  );
  
  return result.rows.length > 0 && result.rows[0].role === 'admin';
}
