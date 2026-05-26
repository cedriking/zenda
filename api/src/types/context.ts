/**
 * Augmented context type for route handlers.
 * These properties are derived by the global auth middleware in src/index.ts
 * but Elysia's type system doesn't propagate them to child module instances.
 */
export interface AuthedContext {
  userId: string | null;
  workspace: Record<string, unknown> | null;
  workspaceId: string | null;
}
