CREATE TYPE "public"."transactional_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
ALTER TABLE "credit_transaction" RENAME COLUMN "chat_video_id" TO "chat_id";--> statement-breakpoint
ALTER TABLE "credit_transaction" DROP CONSTRAINT "credit_transaction_chat_video_id_chat_video_id_fk";
--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD COLUMN "transactionalStatus" "transactional_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "credit_transaction" ADD CONSTRAINT "credit_transaction_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;