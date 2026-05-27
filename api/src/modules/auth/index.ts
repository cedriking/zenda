import { db, Prisma } from "@zenda/db/client";
import { loginSchema, signupSchema } from "@zenda/shared";
import { Elysia } from "elysia";
import { buildPasswordResetEmailHtml, sendEmail } from "../../infra/email.js";
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
    const referralCode = rawBody.referralCode as string | undefined;

    try {
      // Check existing user
      const existing = await db.user.findFirst({
        where: { email },
      });
      if (existing) {
        set.status = 409;
        return { error: "Email already registered" };
      }

      // Hash password with Bun
      const passwordHash = await Bun.password.hash(password);

      // Create user, workspace, and defaults in a transaction
      const result = await db.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: { email, name, passwordHash },
        });

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
          const collision = await tx.workspace.findFirst({
            where: { slug },
            select: { id: true },
          });
          if (!collision) {
            break;
          }
          suffix++;
          slug = `${baseSlug}-${suffix}`;
        }

        const workspace = await tx.workspace.create({
          data: {
            name: businessName,
            slug,
            defaultLanguage: language,
          },
        });

        await tx.workspaceMember.create({
          data: {
            workspaceId: workspace.id,
            userId: user.id,
            role: "owner",
          },
        });

        await tx.businessProfile.create({
          data: {
            workspaceId: workspace.id,
            name: businessName,
          },
        });

        await tx.receptionistProfile.create({
          data: {
            workspaceId: workspace.id,
            name: "Noa",
            tone: "professional",
          },
        });

        return { user, workspace };
      });

      // Track referral if a valid referral code was provided
      if (referralCode) {
        try {
          const partner = await db.partner.findFirst({
            where: { referralCode },
            select: { id: true },
          });
          if (partner) {
            await db.referral.create({
              data: {
                partnerId: partner.id,
                referredEmail: email,
                status: "signed_up",
              },
            });
            logger.info("Referral tracked", {
              partnerId: partner.id,
              referredEmail: email,
            });
          }
        } catch (refErr) {
          logger.error("Failed to track referral", {
            error: (refErr as Error).message,
          });
        }
      }

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
      const user = await db.user.findFirst({
        where: { email },
      });
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
      const membership = await db.workspaceMember.findFirst({
        where: { userId: user.id },
      });
      const workspace = membership
        ? await db.workspace.findFirst({
            where: { id: membership.workspaceId },
          })
        : null;

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
        const revoked = await db.revokedToken.findFirst({
          where: { tokenJti: refreshJti },
        });
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
        try {
          await db.revokedToken.create({
            data: { tokenJti: refreshJti, userId: oldUserId },
          });
        } catch (err: unknown) {
          // Ignore unique constraint violations (token already revoked)
          const pgErr = err as { code?: string } | undefined;
          if (
            !(
              pgErr?.code === "23505" ||
              (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2002")
            )
          ) {
            throw err;
          }
        }
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
        try {
          await db.revokedToken.create({
            data: {
              tokenJti: jti,
              userId,
            },
          });
        } catch (err: unknown) {
          // Ignore unique constraint violations (token already revoked)
          const pgErr = err as { code?: string } | undefined;
          if (
            !(
              pgErr?.code === "23505" ||
              (err instanceof Prisma.PrismaClientKnownRequestError &&
                err.code === "P2002")
            )
          ) {
            throw err;
          }
        }
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
            try {
              await db.revokedToken.create({
                data: {
                  tokenJti: refreshJti,
                  userId: refreshUserId,
                },
              });
            } catch (err: unknown) {
              // Ignore unique constraint violations (token already revoked)
              const pgErr = err as { code?: string } | undefined;
              if (
                !(
                  pgErr?.code === "23505" ||
                  (err instanceof Prisma.PrismaClientKnownRequestError &&
                    err.code === "P2002")
                )
              ) {
                throw err;
              }
            }
          }
        }
      }

      logger.info("User logged out", { userId });
      return { success: true };
    } catch (err: unknown) {
      logger.error("Logout error", { error: (err as Error).message });
      return serverError(set, "Logout failed");
    }
  })
  // --- Password Reset Flow ---
  .post("/forgot-password", async ({ body, set }) => {
    const { email } = body as { email?: string };
    if (!email || typeof email !== "string") {
      set.status = 400;
      return { error: "Email is required" };
    }

    try {
      const user = await db.user.findFirst({
        where: { email: email.toLowerCase().trim() },
        select: { id: true, email: true, name: true },
      });

      // Always return success to prevent email enumeration
      if (!user) {
        logger.info("Password reset requested for unknown email", { email });
        return { success: true };
      }

      // Generate a cryptographically secure token
      const token = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      // Invalidate any existing unused tokens for this user
      await db.passwordResetToken.updateMany({
        where: {
          userId: user.id,
          usedAt: null,
        },
        data: { usedAt: new Date() },
      });

      // Insert new token
      await db.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
        },
      });

      // Send reset email
      const { subject, html } = buildPasswordResetEmailHtml(token);
      await sendEmail({ to: user.email, subject, html });

      logger.info("Password reset email sent", { userId: user.id });
      return { success: true };
    } catch (err: unknown) {
      logger.error("Forgot password error", {
        email,
        error: (err as Error).message,
      });
      // Still return success to prevent enumeration
      return { success: true };
    }
  })
  .post("/reset-password", async ({ body, set }) => {
    const { token, newPassword } = body as {
      token?: string;
      newPassword?: string;
    };

    if (!token || typeof token !== "string") {
      set.status = 400;
      return { error: "Token is required" };
    }
    if (
      !newPassword ||
      typeof newPassword !== "string" ||
      newPassword.length < 8
    ) {
      set.status = 400;
      return { error: "Password must be at least 8 characters" };
    }

    try {
      // Find valid token
      const now = new Date();
      const resetToken = await db.passwordResetToken.findFirst({
        where: {
          token,
          usedAt: null,
          expiresAt: { gt: now },
        },
      });

      if (!resetToken) {
        set.status = 400;
        return { error: "Invalid or expired reset token" };
      }

      // Hash new password
      const passwordHash = await Bun.password.hash(newPassword);

      // Update user password and mark token as used
      await db.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: resetToken.userId },
          data: { passwordHash, updatedAt: new Date() },
        });

        await tx.passwordResetToken.update({
          where: { id: resetToken.id },
          data: { usedAt: new Date() },
        });
      });

      logger.info("Password reset successful", { userId: resetToken.userId });
      return { success: true };
    } catch (err: unknown) {
      logger.error("Reset password error", { error: (err as Error).message });
      return serverError(set, "Password reset failed");
    }
  });
