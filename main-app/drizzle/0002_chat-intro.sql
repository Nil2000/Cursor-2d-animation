CREATE TYPE "public"."type" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TABLE "chat" (
	"id" text PRIMARY KEY NOT NULL,
	"type" "type",
	"body" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"context_id" text DEFAULT '',
	"chat_space_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_space" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"user_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chat_video" (
	"id" text PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"created_at" timestamp NOT NULL,
	"updated_at" timestamp NOT NULL,
	"chat_id" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chat" ADD CONSTRAINT "chat_chat_space_id_chat_space_id_fk" FOREIGN KEY ("chat_space_id") REFERENCES "public"."chat_space"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_space" ADD CONSTRAINT "chat_space_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_video" ADD CONSTRAINT "chat_video_chat_id_chat_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chat"("id") ON DELETE cascade ON UPDATE no action;