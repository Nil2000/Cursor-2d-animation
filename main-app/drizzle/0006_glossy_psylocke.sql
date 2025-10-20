CREATE TYPE "public"."video_quality" AS ENUM('high', 'medium', 'low');--> statement-breakpoint
ALTER TABLE "chat_video" ADD COLUMN "quality" "video_quality" NOT NULL;