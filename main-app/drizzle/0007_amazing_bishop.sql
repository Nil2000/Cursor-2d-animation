CREATE TYPE "public"."credit_transaction_type" AS ENUM('purchase', 'video_generation', 'refund', 'bonus');--> statement-breakpoint
CREATE TYPE "public"."payment_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
CREATE TABLE "credit_transaction" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "credit_transaction_type" NOT NULL,
	"amount" integer NOT NULL,
	"balance_after" integer NOT NULL,
	"description" text,
	"created_at" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"payment_id" text,
	"chat_video_id" text
);
--> statement-breakpoint
CREATE TABLE "payment_history" (
	"payment_id" text PRIMARY KEY NOT NULL,
	"status" "payment_status" NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"amount" real NOT NULL,
	"currency" text NOT NULL,
	"cf_payment_id" text,
	"bank_reference" text,
	"credits_added" integer NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat_video" ADD COLUMN "credits_cost" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "credits" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "is_premium" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_payment_id_payment_history_payment_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payment_history"("payment_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_chat_video_id_chat_video_id_fk" FOREIGN KEY ("chat_video_id") REFERENCES "public"."chat_video"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payment_history" ADD CONSTRAINT "payment_history_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;