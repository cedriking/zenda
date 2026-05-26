import { db } from "@zenda/db/client";
import { partners } from "@zenda/db/schema";
import { eq } from "drizzle-orm";
import { Elysia, t } from "elysia";
import { logger } from "../../infra/logger.js";
import { badRequest } from "../../utils/errors.js";

function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ZEN-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export const partnersModule = new Elysia({ prefix: "/partners" }).post(
  "/signup",
  async ({ body, set }) => {
    const { name, email, website, howRefer } = body;

    if (!(name && email)) {
      return badRequest(set, "Name and email are required");
    }

    // Check for existing partner with same email
    const existing = await db
      .select()
      .from(partners)
      .where(eq(partners.email, email))
      .limit(1);

    if (existing.length > 0) {
      const partner = existing[0];
      const baseUrl = process.env.APP_URL ?? "https://zenda.bot";
      const referralLink = `${baseUrl}?ref=${partner.referralCode}`;
      return {
        referralCode: partner.referralCode,
        referralLink,
      };
    }

    // Generate unique referral code
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await db
        .select()
        .from(partners)
        .where(eq(partners.referralCode, referralCode))
        .limit(1);
      if (existingCode.length === 0) {
        break;
      }
      referralCode = generateReferralCode();
      attempts++;
    }

    await db.insert(partners).values({
      name,
      email,
      website: website || null,
      howRefer: howRefer || null,
      referralCode,
      status: "active",
    });

    logger.info("Partner signed up", { email, referralCode });

    const baseUrl = process.env.APP_URL ?? "https://zenda.bot";
    const referralLink = `${baseUrl}?ref=${referralCode}`;

    return {
      referralCode,
      referralLink,
    };
  },
  {
    body: t.Object({
      name: t.String({ minLength: 1, maxLength: 200 }),
      email: t.String({ minLength: 1, maxLength: 255 }),
      website: t.Optional(t.String({ maxLength: 500 })),
      howRefer: t.Optional(t.String()),
    }),
  }
);
