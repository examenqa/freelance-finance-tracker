"use server";

import { db } from "@/db";
import { payouts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { extractISTDateString } from "@/lib/date";

export async function markPayoutPaid(id: string, rawDateStr: string) {
  // Ensure strict IST date string formatting before writing to the database
  const paidDate = extractISTDateString(rawDateStr);

  await db
    .update(payouts)
    .set({ status: "paid", paidDate })
    .where(eq(payouts.id, id));

  revalidatePath("/payouts");
}

export async function deletePayout(id: string) {
  // Check current status before deleting to prevent orphans of settled periods
  const [existingPayout] = await db
    .select({ status: payouts.status })
    .from(payouts)
    .where(eq(payouts.id, id))
    .limit(1);

  if (!existingPayout) {
    throw new Error("Payout not found");
  }

  // Prevent deletion of paid payouts to maintain strict financial logs
  if (existingPayout.status === "paid") {
    throw new Error("Cannot delete a payout that has already been paid and reconciled.");
  }

  await db.delete(payouts).where(eq(payouts.id, id));
  revalidatePath("/payouts");
}
