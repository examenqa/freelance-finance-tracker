"use server";

import { db } from "@/db";
import { timeEntries, transactions, payouts, contracts, employees } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  calculateBilledAmount,
  calculateWHT,
  calculateNetIncoming,
  parseDecimalToScaledBigInt,
} from "@/lib/finance/math";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000000";

export async function createIncomingTransaction(
  timeEntryIds: string[],
  exchangeRateStr: string,
  serviceChargeStr: string,
  dateStr: string
) {
  if (!timeEntryIds || timeEntryIds.length === 0) return;

  await db.transaction(async (tx) => {
    // 1. Fetch entries with their contract and employee data
    const entries = await tx
      .select({
        id: timeEntries.id,
        hours: timeEntries.hours,
        employeeId: timeEntries.employeeId,
        contractId: timeEntries.contractId,
        billedRate: contracts.billedRate,
        whtRate: contracts.whtRate,
        clientId: contracts.clientId,
        currency: contracts.currency,
        empBaseRate: employees.baseRate,
      })
      .from(timeEntries)
      .innerJoin(contracts, eq(timeEntries.contractId, contracts.id))
      .innerJoin(employees, eq(timeEntries.employeeId, employees.id))
      .where(inArray(timeEntries.id, timeEntryIds));

    if (entries.length === 0) return;

    let totalGross = 0n;
    let totalWht = 0n;

    for (const entry of entries) {
      const gross = calculateBilledAmount(entry.hours, entry.billedRate);
      totalGross += gross;
      const wht = calculateWHT(gross, entry.whtRate);
      totalWht += wht;
    }

    const serviceCharge = parseDecimalToScaledBigInt(serviceChargeStr || "0", 2);
    // Currency exchange rates can have higher precision, assuming 6 decimals based on standard math module practices, 
    // or just store the scaled rate matching the schema definitions.
    // The previous math.ts used scale 6 for EXCHANGE_RATE_SCALE, so parse to scale 6:
    const exchangeRate = parseDecimalToScaledBigInt(exchangeRateStr || "1", 6); 

    const netPayout = calculateNetIncoming(totalGross, serviceCharge, totalWht);

    const clientId = entries[0].clientId;
    const sourceCurrency = entries[0].currency;

    // 2. Insert Transaction
    const [newTx] = await tx
      .insert(transactions)
      .values({
        userId: DEFAULT_USER_ID,
        clientId,
        grossAmount: totalGross,
        serviceCharge,
        wht: totalWht,
        netPayout,
        exchangeRate,
        sourceCurrency,
        targetCurrency: "INR",
        createdAt: dateStr,
      })
      .returning({ id: transactions.id });

    // 3. Mark Time Entries as Billed
    await tx
      .update(timeEntries)
      .set({ status: "billed", transactionId: newTx.id })
      .where(inArray(timeEntries.id, timeEntryIds));

    // 4. Generate Unpaid Payouts
    const payoutInserts = entries.map((entry) => {
      // Payout = hours * employee rate
      const payoutAmount = calculateBilledAmount(entry.hours, entry.empBaseRate);
      return {
        userId: DEFAULT_USER_ID,
        employeeId: entry.employeeId,
        transactionId: newTx.id,
        amount: payoutAmount,
        status: "unpaid" as const,
      };
    });

    await tx.insert(payouts).values(payoutInserts);
  });

  revalidatePath("/incoming");
  revalidatePath("/work");
  revalidatePath("/payouts");
}
