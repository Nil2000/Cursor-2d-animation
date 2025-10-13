"use server";

import { db } from "@/lib/db";
import { paymentHistory } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function fetchPaymentHistory(userId: string) {
  try {
    const paymentHistories = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.userId, userId));
    return paymentHistories;
  } catch (error) {
    console.error("Error fetching payment history", error);
    return null;
  }
}
