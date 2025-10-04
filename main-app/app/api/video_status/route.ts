import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  chat_video,
  chat,
  chat_space,
  user,
  creditTransaction,
} from "@/lib/schema";

export async function POST(req: NextRequest) {
  // Verify authentication
  const secretKey = req.headers.get("x-secret-key");
  if (!secretKey || secretKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const {
    chatId,
    videoUrls,
  }: {
    chatId: string;
    videoUrls: Array<{
      id: string;
      url: string;
      status: "completed" | "failed";
    }>;
  } = body;

  if (!chatId || !videoUrls || videoUrls.length === 0) {
    return NextResponse.json(
      { error: "chatId and videoUrls are required" },
      { status: 400 }
    );
  }

  try {
    await db.transaction(async (tx) => {
      let totalCreditsDeducted = 0;
      let allCompleted = true;
      let anyFailed = false;

      // Update all video statuses first
      for (const videoUrl of videoUrls) {
        await tx
          .update(chat_video)
          .set({
            status: videoUrl.status,
            url: videoUrl.url,
            updatedAt: new Date(),
          })
          .where(eq(chat_video.id, videoUrl.id));

        if (videoUrl.status === "failed") {
          anyFailed = true;
        }
      }

      // Only process credit transaction when all videos are done (completed or failed)
      if (allCompleted) {
        // Get the first video to find the chatId
        const firstVideo = await tx
          .select({
            chatId: chat_video.chatId,
          })
          .from(chat_video)
          .where(eq(chat_video.id, videoUrls[0].id))
          .limit(1);

        if (firstVideo.length > 0) {
          const videoChatId = firstVideo[0].chatId;

          // Find pending transaction for this chat
          const pendingTransaction = await tx
            .select({
              id: creditTransaction.id,
              amount: creditTransaction.amount,
              balanceAfter: creditTransaction.balanceAfter,
              userId: creditTransaction.userId,
            })
            .from(creditTransaction)
            .where(eq(creditTransaction.chatId, videoChatId))
            .limit(1);

          if (pendingTransaction.length > 0) {
            const transaction = pendingTransaction[0];

            // Check if user is premium
            const userDetails = await tx
              .select({
                isPremium: user.isPremium,
              })
              .from(user)
              .where(eq(user.id, transaction.userId))
              .limit(1);

            if (userDetails.length > 0 && !userDetails[0].isPremium) {
              if (anyFailed) {
                // Mark transaction as failed - no credit deduction
                await tx
                  .update(creditTransaction)
                  .set({ transactionalStatus: "failed" })
                  .where(eq(creditTransaction.id, transaction.id));

                console.log(
                  `Marked transaction ${transaction.id} as failed - no credits deducted`
                );
              } else {
                // All videos completed successfully - deduct credits
                await tx
                  .update(user)
                  .set({ credits: transaction.balanceAfter })
                  .where(eq(user.id, transaction.userId));

                // Mark transaction as completed
                await tx
                  .update(creditTransaction)
                  .set({ transactionalStatus: "completed" })
                  .where(eq(creditTransaction.id, transaction.id));

                totalCreditsDeducted = Math.abs(transaction.amount);
                console.log(
                  `Completed transaction ${transaction.id} - deducted ${totalCreditsDeducted} credits`
                );
              }
            }
          }
        }
      }

      console.log(
        `Updated ${videoUrls.length} videos for chatId: ${chatId}. Status: ${
          allCompleted ? "All done" : "Still pending"
        }`
      );
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error updating video statuses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
