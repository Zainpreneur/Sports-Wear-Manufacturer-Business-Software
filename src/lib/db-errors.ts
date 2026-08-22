import "server-only";

/**
 * True if `error` is a Prisma "unique constraint failed" error (P2002),
 * without depending on the generated client's exact error-class export path.
 */
export function isUniqueConstraintError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === "P2002"
  );
}
