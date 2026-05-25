/**
 * Create the founding customer coupon in Stripe.
 * 50% off for 3 months, one-time use per customer.
 * Run: STRIPE_SECRET_KEY=sk_live_... bun run scripts/create-founding-coupon.ts
 */
import Stripe from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
if (!key) {
  console.error("STRIPE_SECRET_KEY is required");
  process.exit(1);
}

const stripe = new Stripe(key);

async function main() {
  // Check if founding coupon already exists
  const existing = await stripe.coupons.list({ limit: 100 });
  const found = existing.data.find(
    (c) => c.metadata.purpose === "founding_customer"
  );

  if (found) {
    console.log(`Founding coupon already exists: ${found.id}`);
    console.log(`Set STRIPE_FOUNDING_COUPON_ID=${found.id}`);
    return;
  }

  const coupon = await stripe.coupons.create({
    percent_off: 50,
    duration: "repeating",
    duration_in_months: 3,
    max_redemptions: 100,
    name: "Zenda Founding Customer - 50% off 3 months",
    metadata: { purpose: "founding_customer" },
  });

  console.log(`Created founding coupon: ${coupon.id}`);
  console.log(`Set STRIPE_FOUNDING_COUPON_ID=${coupon.id}`);
}

main().catch(console.error);
