import { db } from "@zenda/db/client";
import {
  businessProfiles,
  receptionistProfiles,
  revokedTokens,
  users,
  workspaceMembers,
  workspaces,
} from "@zenda/db/schema";
import { loginSchema, signupSchema } from "@zenda/shared";
import { eq } from "drizzle-orm";
import { Elysia } from "elysia";
import { logger } from "../../infra/logger.js";
import { authBase } from "../../middleware/auth.js";
import { serverError } from "../../utils/errors.js";

export const authModule = new Elysia({ prefix: "/auth" })
  .use(authBase)
  .post("/signup", async ({ body, jwt, refreshJwt, set }) => {
    const rawBody = body as Record<string, unknown>;
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", details: parsed.error.issues };
    }
    const { name, email, password, businessName, language } = parsed.data;
    const signupSource = (rawBody.source as string) ?? "direct";

    try {
      // Check existing user
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (existing.length > 0) {
        set.status = 409;
        return { error: "Email already registered" };
      }

      // Hash password with Bun
      const passwordHash = await Bun.password.hash(password);

      // Create user, workspace, and defaults in a transaction
      const result = await db.transaction(async (tx) => {
        const [user] = await tx
          .insert(users)
          .values({ email, name, passwordHash })
          .returning();

        const baseSlug = businessName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .slice(0, 100)
          .replace(/^-|-$/g, "");

        // Ensure slug uniqueness by checking for collisions
        let slug = baseSlug;
        let suffix = 1;
        // eslint-disable-next-line no-constant-binary-expression
        while (true) {
          const [existing] = await tx
            .select({ id: workspaces.id })
            .from(workspaces)
            .where(eq(workspaces.slug, slug))
            .limit(1);
          if (!existing) {
            break;
          }
          suffix++;
          slug = `${baseSlug}-${suffix}`;
        }

        const [workspace] = await tx
          .insert(workspaces)
          .values({
            name: businessName,
            slug,
            defaultLanguage: language,
          })
          .returning();

        await tx.insert(workspaceMembers).values({
          workspaceId: workspace.id,
          userId: user.id,
          role: "owner",
        });

        await tx.insert(businessProfiles).values({
          workspaceId: workspace.id,
          name: businessName,
        });

        await tx.insert(receptionistProfiles).values({
          workspaceId: workspace.id,
          name: "Noa",
          tone: "professional",
        });

        return { user, workspace };
      });

      // Generate tokens with jti for revocation support
      const accessJti = crypto.randomUUID();
      const refreshJti = crypto.randomUUID();
      const accessToken = await jwt.sign({
        sub: result.user.id,
        workspaceId: result.workspace.id,
        jti: accessJti,
      });
      const refreshToken = await refreshJwt.sign({
        sub: result.user.id,
        workspaceId: result.workspace.id,
        jti: refreshJti,
      });

      logger.info("User signed up", {
        userId: result.user.id,
        workspaceId: result.workspace.id,
        source: signupSource,
      });

      return {
        accessToken,
        refreshToken,
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
        },
        workspace: {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
          planTier: "local_solo" as const,
          onboardingStep: result.workspace.onboardingStep,
        },
      };
    } catch (err: unknown) {
      logger.error("Signup error", { email, error: (err as Error).message });
      return serverError(set, "Failed to create account");
    }
  })
  .post("/login", async ({ body, jwt, refreshJwt, set }) => {
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      set.status = 400;
      return { error: "Validation failed", details: parsed.error.issues };
    }
    const { email, password } = parsed.data;

    try {
      // Find user
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);
      if (!user) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      // Verify password
      const valid = await Bun.password.verify(password, user.passwordHash);
      if (!valid) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      // Get workspace
      const [membership] = await db
        .select()
        .from(workspaceMembers)
        .where(eq(workspaceMembers.userId, user.id))
        .limit(1);
      const [workspace] = membership
        ? await db
            .select()
            .from(workspaces)
            .where(eq(workspaces.id, membership.workspaceId))
            .limit(1)
        : [];

      if (!workspace) {
        logger.error("No workspace found for user during login", {
          userId: user.id,
        });
        set.status = 401;
        return {
          error: "No workspace found for this user. Please contact support.",
        };
      }

      // Generate tokens with jti for revocation support
      const accessJti = crypto.randomUUID();
      const refreshJti = crypto.randomUUID();
      const accessToken = await jwt.sign({
        sub: user.id,
        workspaceId: workspace.id,
        jti: accessJti,
      });
      const refreshToken = await refreshJwt.sign({
        sub: user.id,
        workspaceId: workspace.id,
        jti: refreshJti,
      });

      logger.info("User logged in", { userId: user.id });

      return {
        accessToken,
        refreshToken,
        user: { id: user.id, email: user.email, name: user.name },
        workspace: {
          id: workspace.id,
          name: workspace.name,
          slug: workspace.slug,
          planTier: "local_solo" as const,
          onboardingStep: workspace.onboardingStep,
        },
      };
    } catch (err: unknown) {
      logger.error("Login error", { email, error: (err as Error).message });
      return serverError(set, "Login failed");
    }
  })
  .post("/refresh", async ({ body, jwt, refreshJwt, set }) => {
    const { refreshToken: token } = body as { refreshToken: string };
    if (!token) {
      set.status = 400;
      return { error: "Refresh token required" };
    }

    try {
      const payload = await refreshJwt.verify(token);
      if (!payload) {
        set.status = 401;
        return { error: "Invalid refresh token" };
      }

      // Check if the refresh token has been revoked
      const refreshJti = (payload as Record<string, unknown>).jti as
        | string
        | undefined;
      if (refreshJti) {
        const [revoked] = await db
          .select({ id: revokedTokens.id })
          .from(revokedTokens)
          .where(eq(revokedTokens.tokenJti, refreshJti))
          .limit(1);
        if (revoked) {
          set.status = 401;
          return { error: "Refresh token has been revoked" };
        }
      }

      const accessToken = await jwt.sign({
        sub: payload.sub,
        workspaceId: (payload as Record<string, unknown>).workspaceId as string,
        jti: crypto.randomUUID(),
      });
      const newRefreshToken = await refreshJwt.sign({
        sub: payload.sub,
        workspaceId: (payload as Record<string, unknown>).workspaceId as string,
        jti: crypto.randomUUID(),
      });

      // Revoke the old refresh token to prevent reuse
      if (refreshJti) {
        const oldUserId = payload.sub as string;
        await db
          .insert(revokedTokens)
          .values({ tokenJti: refreshJti, userId: oldUserId })
          .onConflictDoNothing();
      }

      return { accessToken, refreshToken: newRefreshToken };
    } catch (err: unknown) {
      logger.error("Token refresh error", { error: (err as Error).message });
      return serverError(set, "Token refresh failed");
    }
  })
  .post("/logout", async ({ jwt, refreshJwt, headers, body, set }) => {
    const authHeader = headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "No access token provided" };
    }

    try {
      const accessToken = authHeader.slice(7);
      const payload = await jwt.verify(accessToken);
      if (!payload) {
        set.status = 401;
        return { error: "Invalid access token" };
      }

      const jti = (payload as Record<string, unknown>).jti as
        | string
        | undefined;
      const userId = payload.sub as string;

      // Revoke the current access token
      if (jti) {
        await db
          .insert(revokedTokens)
          .values({
            tokenJti: jti,
            userId,
          })
          .onConflictDoNothing();
      }

      // Also revoke the refresh token if provided
      const { refreshToken: refresh_token } =
        (body as { refreshToken?: string }) ?? {};
      if (refresh_token) {
        const refreshPayload = await refreshJwt.verify(refresh_token);
        if (refreshPayload) {
          const refreshJti = (refreshPayload as Record<string, unknown>).jti as
            | string
            | undefined;
          const refreshUserId = refreshPayload.sub as string;
          if (refreshJti) {
            await db
              .insert(revokedTokens)
              .values({
                tokenJti: refreshJti,
                userId: refreshUserId,
              })
              .onConflictDoNothing();
          }
        }
      }

      logger.info("User logged out", { userId });
      return { success: true };
    } catch (err: unknown) {
      logger.error("Logout error", { error: (err as Error).message });
      return serverError(set, "Logout failed");
    }
  });
