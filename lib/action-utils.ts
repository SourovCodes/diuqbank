import { hasPermission } from "./authorization";

// Standard action result shape used across server actions
export type ActionResult<T = unknown> =
  | { success: true; data?: T }
  | { success: false; error: string };

// Ensure the current user has a specific permission
export async function ensurePermission(
  permission: string
): Promise<ActionResult<void>> {
  if (!(await hasPermission(permission))) {
    return { success: false, error: "Unauthorized" };
  }
  return { success: true };
}

// Parse a numeric id safely with a consistent error message
export function parseNumericId(
  id: string,
  label: string = "ID"
): ActionResult<number> {
  const numericId = parseInt(id, 10);
  if (Number.isNaN(numericId)) {
    return { success: false, error: `Invalid ${label}.` };
  }
  return { success: true, data: numericId };
}

// Build a common pagination meta block
export function getPaginationMeta(
  totalCount: number,
  page: number,
  pageSize: number
) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  return {
    currentPage: page,
    totalPages,
    totalCount,
    pageSize,
  } as const;
}
