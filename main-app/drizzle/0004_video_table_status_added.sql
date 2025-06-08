CREATE TYPE "public"."chat_video_status" AS ENUM('pending', 'completed', 'failed');--> statement-breakpoint
ALTER TABLE "chat_video" ALTER COLUMN "url" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "chat_video" ADD COLUMN "status" "chat_video_status" DEFAULT 'pending';