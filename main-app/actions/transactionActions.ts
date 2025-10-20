"use server";

import { db } from "@/lib/db";
import { creditTransaction } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function fetchCreditTransactions(userId: string) {
  try {
    const creditTransactions = await db
      .select()
      .from(creditTransaction)
      .where(eq(creditTransaction.userId, userId));
    return creditTransactions;
  } catch (error) {
    console.error("Error fetching credit transactions", error);
    return null;
  }
}
