import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, pgEnum } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// Chat related tables
export const chatType = pgEnum("type", ["user", "assistant"]);
export const chatVideoStatus = pgEnum("chat_video_status", [
  "pending",
  "completed",
  "failed",
]);
export const chat_space = pgTable("chat_space", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  title: text("title"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});
export const chat = pgTable("chat", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  type: chatType().notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  contextId: text("context_id").default(""),
  chatSpaceId: text("chat_space_id")
    .notNull()
    .references(() => chat_space.id, { onDelete: "cascade" }),
});
export const chat_space_chats_relation = relations(chat_space, ({ many }) => ({
  chats: many(chat),
}));
export const chats_chat_space_relation = relations(chat, ({ one }) => ({
  chatSpace: one(chat_space, {
    fields: [chat.chatSpaceId],
    references: [chat_space.id],
  }),
}));
export const chat_video = pgTable("chat_video", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  url: text("url"),
  status: chatVideoStatus().default("pending"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chat.id, { onDelete: "cascade" }),
});
export const chat_chat_videos_relation = relations(chat, ({ many }) => ({
  chat_videos: many(chat_video),
}));
export const chat_video_chat_relation = relations(chat_video, ({ one }) => ({
  chat: one(chat, {
    fields: [chat_video.chatId],
    references: [chat.id],
  }),
}));
