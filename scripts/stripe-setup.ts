#!/usr/bin/env bun
/**
 * Stripe Product & Price Setup Script
 *
 * Creates Stripe products and prices for all Zenda plan tiers.
 * Run with: STRIPE_SECRET_KEY=sk_live_xxx bun run scripts/stripe-setup.ts
 *
 * After running, set these env vars in production:
 *   STRIPE_PRICE_LOCAL_SOLO_MONTHLY
 *   STRIPE_PRICE_LOCAL_STARTER_MONTHLY
 *   STRIPE_PRICE_LOCAL_PRO_MONTHLY
 *   STRIPE_PRICE_LOCAL_BUSINESS_MONTHLY
 */

import Stripe from "stripe";
import { PLANS } from "../packages/shared/src/constants/plans.js";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("ERROR: STRIPE_SECRET_KEY is required");
  console.error(
    "Usage: STRIPE_SECRET_KEY=sk_live_xxx bun run scripts/stripe-setup.ts"
  );
  process.exit(1);
}

const stripe = new Stripe(key);

const isLive = key.startsWith("sk_live_");
console.log(`Stripe mode: ${isLive ? "LIVE" : "TEST"}`);
console.log("");

async function setupProducts() {
  const envVars: string[] = [];

  for (const [tier, config] of Object.entries(PLANS)) {
    console.log(
      `Setting up: ${config.name} ($${config.monthlyPriceCents / 100}/mo)`
    );

    // Check if product already exists
    const existing = await stripe.products.list({ limit: 100 });
    let product = existing.data.find((p) => p.metadata.tier === tier);

    if (product) {
      console.log(`  Product exists: ${product.id}`);
    } else {
      product = await stripe.products.create({
        name: `Zenda ${config.name}`,
        description: config.description,
        metadata: { tier },
      });
      console.log(`  Created product: ${product.id}`);
    }

    // Check if price already exists for this product
    const prices = await stripe.prices.list({ product: product.id, limit: 10 });
    let monthlyPrice = prices.data.find(
      (p) => p.recurring?.interval === "month" && p.metadata.tier === tier
    );

    if (monthlyPrice) {
      console.log(`  Monthly price exists: ${monthlyPrice.id}`);
    } else {
      monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: config.monthlyPriceCents,
        currency: "usd",
        recurring: { interval: "month" },
        metadata: { tier, period: "monthly" },
      });
      console.log(`  Created monthly price: ${monthlyPrice.id}`);
    }

    const envKey = `STRIPE_PRICE_${tier.toUpperCase()}_MONTHLY`;
    envVars.push(`${envKey}=${monthlyPrice.id}`);
  }

  console.log("");
  console.log("=== Set these environment variables ===");
  console.log("");
  for (const line of envVars) {
    console.log(line);
  }
  console.log("");

  // Create a webhook endpoint if in live mode
  if (isLive) {
    console.log("IMPORTANT: Create a Stripe webhook endpoint:");
    console.log("  URL: https://zenda.bot/billing/webhook");
    console.log(
      "  Events: checkout.session.completed, customer.subscription.created,"
    );
    console.log(
      "          customer.subscription.updated, customer.subscription.deleted,"
    );
    console.log("          invoice.paid, invoice.payment_failed");
    console.log("");
    console.log(
      "After creating the webhook, set STRIPE_WEBHOOK_SECRET in your .env"
    );
  }
}

setupProducts().catch((err) => {
  console.error("Setup failed:", err.message);
  process.exit(1);
});
