-- Create partners table
CREATE TABLE IF NOT EXISTS "partners" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(200) NOT NULL,
  "email" varchar(255) NOT NULL,
  "website" varchar(500),
  "referral_code" varchar(20) NOT NULL,
  "how_refer" text,
  "status" varchar(20) NOT NULL DEFAULT 'pending',
  "created_at" timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "partners_email_unique" ON "partners" ("email");
CREATE UNIQUE INDEX IF NOT EXISTS "partners_referral_code_unique" ON "partners" ("referral_code");

-- Create referrals table
CREATE TABLE IF NOT EXISTS "referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "partner_id" uuid NOT NULL REFERENCES "partners" ("id"),
  "referred_email" varchar(255) NOT NULL,
  "status" varchar(20) NOT NULL DEFAULT 'signed_up',
  "revenue_cents" integer DEFAULT 0,
  "commission_cents" integer DEFAULT 0,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
