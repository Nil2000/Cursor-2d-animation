import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import {
  pgTable,
  text,
  timestamp,
  boolean,
  pgEnum,
  real,
  integer,
} from "drizzle-orm/pg-core";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  credits: integer("credits").notNull().default(0),
  isPremium: boolean("is_premium").default(false),
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

export const videoQuality = pgEnum("video_quality", ["high", "medium", "low"]);

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
  quality: videoQuality().notNull(),
  creditsCost: integer("credits_cost").notNull().default(1),
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

// payment status enum
export const paymentStatus = pgEnum("payment_status", [
  "pending",
  "completed",
  "failed",
]);

// payment history table
export const paymentHistory = pgTable("payment_history", {
  paymentId: text("payment_id").primaryKey(),
  status: paymentStatus().notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  amount: real().notNull(),
  currency: text("currency").notNull(),
  cfPaymentId: text("cf_payment_id"),
  bankReference: text("bank_reference"),
  creditsAdded: integer("credits_added").notNull(),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

// one to many relation user to payment history
export const user_payment_history_relation = relations(user, ({ many }) => ({
  paymentHistory: many(paymentHistory),
}));

export const payment_history_user_relation = relations(
  paymentHistory,
  ({ one }) => ({
    user: one(user, {
      fields: [paymentHistory.userId],
      references: [user.id],
    }),
  })
);

// Credit transaction types
export const creditTransactionType = pgEnum("credit_transaction_type", [
  "purchase", // Credits added via payment
  "video_generation", // Credits deducted for video
  "refund", // Credits refunded
  "bonus", // Free credits/promotions
]);

// Transactional status enum
export const transactionalStatus = pgEnum("transactional_status", [
  "pending",
  "completed",
  "failed",
]);

// Credit transaction history table
export const creditTransaction = pgTable("credit_transaction", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => createId()),
  type: creditTransactionType().notNull(),
  amount: integer("amount").notNull(), // positive for additions, negative for deductions
  balanceAfter: integer("balance_after").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").notNull(),
  transactionalStatus: transactionalStatus().notNull().default("pending"),

  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),

  // Optional references to link transactions to their source
  paymentId: text("payment_id").references(() => paymentHistory.paymentId, {
    onDelete: "cascade",
  }),
  chatId: text("chat_id").references(() => chat.id, {
    onDelete: "cascade",
  }),
});

// Relations for credit transactions
export const user_credit_transactions_relation = relations(
  user,
  ({ many }) => ({
    creditTransactions: many(creditTransaction),
  })
);

export const credit_transaction_user_relation = relations(
  creditTransaction,
  ({ one }) => ({
    user: one(user, {
      fields: [creditTransaction.userId],
      references: [user.id],
    }),
  })
);

export const credit_transaction_payment_relation = relations(
  creditTransaction,
  ({ one }) => ({
    payment: one(paymentHistory, {
      fields: [creditTransaction.paymentId],
      references: [paymentHistory.paymentId],
    }),
  })
);

export const credit_transaction_chat_relation = relations(
  creditTransaction,
  ({ one }) => ({
    chat: one(chat, {
      fields: [creditTransaction.chatId],
      references: [chat.id],
    }),
  })
);

export const payment_history_credit_transactions_relation = relations(
  paymentHistory,
  ({ many }) => ({
    creditTransactions: many(creditTransaction),
  })
);

export const chat_credit_transactions_relation = relations(
  chat,
  ({ many }) => ({
    creditTransactions: many(creditTransaction),
  })
);
