import { db } from "@zenda/db/client";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { badRequest, serverError } from "../../utils/errors.js";

export const supportModule = new Elysia({ prefix: "/support" })

  // Contact/support form
  .post(
    "/contact",
    async ({ body, set }) => {
      try {
        const { email, subject } = body as Record<string, string>;

        logger.info("Support request", { email, subject });

        // In production, send to support email or ticket system
        return {
          received: true,
          message: "We'll get back to you within 24 hours.",
        };
      } catch (err) {
        logger.error("Failed to process support request", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to process support request");
      }
    },
    {
      body: t.Object({
        email: t.String(),
        name: t.String(),
        subject: t.String(),
        message: t.String(),
      }),
    }
  )

  // Early access waitlist
  .post(
    "/waitlist",
    async ({ body, set }) => {
      try {
        const data = body as Record<string, string>;

        if (!data.email?.includes("@")) {
          return badRequest(set, "Valid email is required");
        }

        // Prevent duplicates by checking the DB
        const existing = await db.waitlistEntry.findFirst({
          where: { email: data.email },
        });

        if (existing) {
          return { status: "already_registered" };
        }

        await db.waitlistEntry.create({
          data: {
            email: data.email,
            name: data.name ?? null,
            businessType: data.businessType ?? null,
          },
        });

        const total = await db.waitlistEntry.count();

        logger.info("Waitlist signup", {
          email: data.email,
          position: total,
        });

        return { status: "registered", position: total };
      } catch (err) {
        logger.error("Failed to register for waitlist", {
          error: (err as Error).message,
        });
        return serverError(set, "Failed to register for waitlist");
      }
    },
    {
      body: t.Object({
        email: t.String(),
        name: t.Optional(t.String()),
        businessType: t.Optional(t.String()),
      }),
    }
  )

  // Get waitlist count (admin)
  .get("/waitlist/count", async ({ set }) => {
    try {
      const total = await db.waitlistEntry.count();

      return { count: total };
    } catch (err) {
      logger.error("Failed to get waitlist count", {
        error: (err as Error).message,
      });
      return serverError(set, "Failed to get waitlist count");
    }
  });
