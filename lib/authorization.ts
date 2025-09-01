import { auth } from "@/lib/auth";
import { headers } from "next/headers";


/**
 * Checks if the current user has the specified permission
 * @param permissionName - The permission name to check for
 * @returns Promise<boolean> - Whether the user has the permission
 */
export async function hasPermission(permissionName: string): Promise<{
  allowed: boolean;
}> {
  console.log("Checking permission for:", permissionName);
  const session = await auth.api.getSession({
    headers: await headers()
  })

  // If no session, user is not logged in
  if (!session?.user?.email || !session?.user?.emailVerified) {
    return { allowed: false };
  }

  // Check if user is super admin
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const allowed = Boolean(
    superAdminEmail && session.user.email === superAdminEmail
  );
  return { allowed };
}
