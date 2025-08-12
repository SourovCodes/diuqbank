import { auth } from "@/lib/auth";
import type { Session } from "next-auth";

/**
 * Checks if the current user has the specified permission
 * @param permissionName - The permission name to check for
 * @returns Promise<boolean> - Whether the user has the permission
 */
export async function hasPermission(permissionName: string): Promise<{
  allowed: boolean;
  session: Session | null;
}> {
  const session = (await auth()) as Session | null;

  console.log("Checking permission for:", permissionName);

  // If no session, user is not logged in
  if (!session?.user?.email) {
    return { allowed: false, session };
  }

  // Check if user is super admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const allowed = Boolean(
    superAdminEmail && session.user.email === superAdminEmail
  );
  return { allowed, session };
}
