import { Elysia } from "elysia";

/**
 * Typed context plugin for route modules.
 * Provides workspaceId and userId on the Elysia context with correct types.
 *
 * At runtime, these values are derived by the global auth middleware in src/index.ts.
 * This plugin exists solely to satisfy TypeScript's type checker.
 */
export const typedContext = new Elysia().decorate({
  userId: null as string | null,
  workspaceId: null as string | null,
  workspace: null as Record<string, unknown> | null,
});
