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

// Reusable pagination type used by list pages
export type Pagination = {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
};

// A safe fallback pagination used by list pages
export const defaultPagination: Pagination = {
  currentPage: 1,
  totalPages: 1,
  totalCount: 0,
  pageSize: 10,
};

// Common base for list search params
export type SearchParamsBase = {
  page?: string;
  search?: string;
};

// Parse standard list page search params into primitives
export async function parseListSearchParams(
  searchParams: Promise<SearchParamsBase>
): Promise<{ page: number; search?: string }> {
  const awaited = await searchParams;
  const page = parseInt(awaited.page ?? "1", 10);
  const search = awaited.search || undefined;
  return { page, search };
}

// Format a simple total label consistently across pages
export function formatTotalLabel(label: string, count: number) {
  return `Total: ${count} ${label}${count !== 1 ? "s" : ""}`;
}
