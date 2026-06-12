"use server";

import { db } from "@/db";
import { expenses, recurringExpenses } from "@/db/schema";
import { eq, like, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

// --- TEMPLATES ---
export async function addRecurringExpense(name: string, amount: number, category: string) {
  await db.insert(recurringExpenses).values({
    userId: DEFAULT_USER_ID,
    name,
    amount: BigInt(amount * 100),
    category,
  });
  revalidatePath("/expenses");
}

export async function deleteRecurringExpense(id: string) {
  await db.delete(recurringExpenses).where(eq(recurringExpenses.id, id));
  revalidatePath("/expenses");
}

// --- ONE-OFF EXPENSES ---
export async function addExpense(category: string, description: string, amount: number, dateStr: string, isRcmApplicable: boolean = false) {
  await db.insert(expenses).values({
    userId: DEFAULT_USER_ID,
    category,
    description,
    amount: BigInt(amount * 100),
    createdAt: dateStr, // expected YYYY-MM-DD
    isRcmApplicable,
  });
  revalidatePath("/expenses");
}

export async function deleteExpense(id: string) {
  await db.delete(expenses).where(eq(expenses.id, id));
  revalidatePath("/expenses");
}

// --- GENERATOR ---
export async function generateMonthlyExpenses(yearMonth: string) {
  // yearMonth expected as "YYYY-MM"
  const marker = `[Auto-Generated ${yearMonth}]`;

  // Idempotency: Verify that we haven't already generated for this exact YYYY-MM boundary
  const existing = await db
    .select({ id: expenses.id })
    .from(expenses)
    .where(like(expenses.description, `%${marker}%`))
    .limit(1);

  if (existing.length > 0) {
    throw new Error(`Expenses for ${yearMonth} have already been generated.`);
  }

  const templates = await db.select().from(recurringExpenses);
  if (templates.length === 0) {
    throw new Error("No recurring templates found.");
  }

  const inserts = templates.map((tpl) => ({
    userId: DEFAULT_USER_ID,
    category: tpl.category,
    // Safely append marker so we can track and prevent double-charges
    description: `${tpl.name} ${marker}`,
    // Point-in-time pricing: copy current amount as hardcoded value
    amount: tpl.amount,
    createdAt: `${yearMonth}-01`, // Default to 1st of the month
    isRcmApplicable: false, // Could expand schema to track this on templates, assuming false for now
  }));

  await db.insert(expenses).values(inserts);
  revalidatePath("/expenses");
}
