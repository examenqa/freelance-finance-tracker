"use server";

import { db } from "@/db";
import { timeEntries } from "@/db/schema";
import { revalidatePath } from "next/cache";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function addTimeEntry(
  employeeId: string,
  contractId: string,
  weekStart: string,
  hours: string
) {
  await db.insert(timeEntries).values({
    employeeId,
    contractId,
    weekStart,
    hours,
    userId: DEFAULT_USER_ID,
  });
  revalidatePath("/work");
  revalidatePath("/incoming");
}
