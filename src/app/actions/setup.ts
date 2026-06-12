"use server";

import { db } from "@/db";
import { sources, employees, contracts, clients } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function addSource(name: string) {
  await db.insert(sources).values({ name, userId: DEFAULT_USER_ID });
  revalidatePath("/setup");
}

export async function deleteSource(id: string) {
  await db.delete(sources).where(eq(sources.id, id));
  revalidatePath("/setup");
}

export async function addEmployee(name: string, baseRate: number) {
  await db.insert(employees).values({ name, baseRate: BigInt(baseRate * 100), userId: DEFAULT_USER_ID });
  revalidatePath("/setup");
}

export async function deleteEmployee(id: string) {
  await db.delete(employees).where(eq(employees.id, id));
  revalidatePath("/setup");
}

export async function addClient(name: string) {
  await db.insert(clients).values({ name, userId: DEFAULT_USER_ID });
  revalidatePath("/setup");
}

export async function deleteClient(id: string) {
  await db.delete(clients).where(eq(clients.id, id));
  revalidatePath("/setup");
}

export async function addContract(
  clientId: string,
  sourceId: string,
  billedRate: number,
  currency: string,
  isUpwork: boolean,
  whtRate: string
) {
  await db.insert(contracts).values({
    clientId,
    sourceId,
    billedRate: BigInt(billedRate * 100),
    currency,
    isUpwork,
    whtRate,
    userId: DEFAULT_USER_ID,
  });
  revalidatePath("/setup");
}

export async function deleteContract(id: string) {
  await db.delete(contracts).where(eq(contracts.id, id));
  revalidatePath("/setup");
}
