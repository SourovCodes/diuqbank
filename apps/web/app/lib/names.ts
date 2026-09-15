/** Up to two initials for an avatar, e.g. "Ayesha Rahman" → "AR". */
export function initials(name: string) {
  const letters = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return letters || "?";
}
