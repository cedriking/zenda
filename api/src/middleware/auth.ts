import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { JWT_REFRESH_SECRET, JWT_SECRET } from "../config/env.js";

/**
 * Standalone JWT instance — NOT an Elysia plugin.
 * Import and use in each module that needs JWT signing/verification.
 */
export const authBase = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: JWT_SECRET,
      exp: "1h",
    })
  )
  .use(
    jwt({
      name: "refreshJwt",
      secret: JWT_REFRESH_SECRET,
      exp: "7d",
    })
  )
  .derive(
    async ({
      jwt,
      headers,
    }): Promise<{ userId: string | null; workspaceId: string | null }> => {
      const authHeader = headers.authorization;
      if (!authHeader?.startsWith("Bearer ")) {
        return { userId: null, workspaceId: null };
      }
      const token = authHeader.slice(7);
      const payload = await jwt.verify(token);
      if (!payload) {
        return { userId: null, workspaceId: null };
      }
      return {
        userId: payload.sub ?? null,
        workspaceId:
          ((payload as Record<string, unknown>).workspaceId as string) ?? null,
      };
    }
  );

export type AuthBase = typeof authBase;
export { authBase as authPlugin };
