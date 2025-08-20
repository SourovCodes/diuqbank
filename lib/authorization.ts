import { auth } from "@/lib/auth";

/**
 * Checks if the current user has the specified permission
 * @param permissionName - The permission name to check for
 * @returns Promise<boolean> - Whether the user has the permission
 */
export async function hasPermission(permissionName: string): Promise<{
  allowed: boolean;
}> {
  const session = await auth();

  console.log("Checking permission for:", permissionName);

  // If no session, user is not logged in
  if (!session?.user?.email) {
    return { allowed: false };
  }

  // Check if user is super admin. SUPER_ADMIN_EMAIL can be a single email or comma-separated list.
  const superAdminEnv = process.env.SUPER_ADMIN_EMAIL || "";
  // Split by comma, trim whitespace, ignore empty, make case-insensitive
  const superAdminEmails = superAdminEnv
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const userEmail = session.user.email.toLowerCase();
  const allowed = superAdminEmails.includes(userEmail);
  return { allowed };
}
