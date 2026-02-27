/**
 * Generate a unique ID using crypto.randomUUID when available,
 * with a time+random fallback for environments that don't support it.
 */
export function generateId(prefix = "id"): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}
