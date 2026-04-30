CREATE TABLE "revoked_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_jti" varchar(36) NOT NULL,
	"user_id" varchar(36) NOT NULL,
	"revoked_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "revoked_tokens_token_jti_unique" UNIQUE("token_jti")
);
--> statement-breakpoint
CREATE TABLE "waitlist_entries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(200),
	"business_type" varchar(100),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "conversations_workspace_idx";--> statement-breakpoint
DROP INDEX "customers_phone_idx";--> statement-breakpoint
CREATE INDEX "idx_revoked_tokens_jti" ON "revoked_tokens" USING btree ("token_jti");--> statement-breakpoint
CREATE INDEX "idx_revoked_tokens_revoked_at" ON "revoked_tokens" USING btree ("revoked_at");--> statement-breakpoint
CREATE UNIQUE INDEX "waitlist_email_unique" ON "waitlist_entries" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX "conversations_workspace_customer_unique" ON "conversations" USING btree ("workspace_id","customer_id","channel");--> statement-breakpoint
CREATE UNIQUE INDEX "customers_phone_unique" ON "customers" USING btree ("workspace_id","phone_number");