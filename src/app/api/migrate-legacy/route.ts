import { NextResponse } from "next/server";
import { db } from "@/db"; // Assuming db is exported from src/db/index.ts
import {
  clients,
  transactions,
  expenses,
  payouts,
  gstRcmLedger,
} from "@/db/schema";
import { extractISTDateString } from "@/lib/date";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Begin a transaction to ensure all or nothing migration
    await db.transaction(async (tx) => {
      // 1. Insert Clients
      if (data.clients && data.clients.length > 0) {
        await tx.insert(clients).values(
          data.clients.map((c: any) => ({
            id: c.id,
            userId: c.userId,
            name: c.name,
          }))
        ).onConflictDoNothing();
      }

      // 2. Insert Transactions
      if (data.transactions && data.transactions.length > 0) {
        await tx.insert(transactions).values(
          data.transactions.map((t: any) => ({
            id: t.id,
            userId: t.userId,
            clientId: t.clientId,
            grossAmount: BigInt(t.grossAmount || 0),
            serviceCharge: BigInt(t.serviceCharge || t.platformFee || 0),
            wht: BigInt(t.wht || 0),
            netPayout: BigInt(t.netPayout || 0),
            expectedAmount: BigInt(t.expectedAmount || 0),
            sourceCurrency: t.sourceCurrency || "USD",
            targetCurrency: t.targetCurrency || "INR",
            exchangeRate: BigInt(t.exchangeRate || 1000000),
            status: t.status || "settled",
            createdAt: extractISTDateString(t.createdAt),
          }))
        ).onConflictDoNothing();
      }

      // 3. Insert Expenses
      if (data.expenses && data.expenses.length > 0) {
        await tx.insert(expenses).values(
          data.expenses.map((e: any) => ({
            id: e.id,
            userId: e.userId,
            category: e.category,
            description: e.description,
            amount: BigInt(e.amount || 0),
            isRcmApplicable: e.isRcmApplicable || false,
            createdAt: extractISTDateString(e.createdAt),
          }))
        ).onConflictDoNothing();
      }

      // 4. Insert Payouts
      if (data.payouts && data.payouts.length > 0) {
        await tx.insert(payouts).values(
          data.payouts.map((p: any) => ({
            id: p.id,
            userId: p.userId,
            employeeId: p.employeeId,
            transactionId: p.transactionId || null,
            amount: BigInt(p.amount || 0),
            status: p.status || "unpaid",
            paidDate: p.paidDate ? extractISTDateString(p.paidDate) : null,
          }))
        ).onConflictDoNothing();
      }

      // 5. Insert GST RCM Ledger
      if (data.gstRcmLedger && data.gstRcmLedger.length > 0) {
        await tx.insert(gstRcmLedger).values(
          data.gstRcmLedger.map((g: any) => ({
            id: g.id,
            userId: g.userId,
            referenceType: g.referenceType,
            referenceId: g.referenceId,
            baseAmount: BigInt(g.baseAmount || 0),
            rcmLiability: BigInt(g.rcmLiability || 0),
            status: g.status || "unpaid",
            clearedAt: g.clearedAt ? extractISTDateString(g.clearedAt) : null,
          }))
        ).onConflictDoNothing();
      }
    });

    return NextResponse.json({ success: true, message: "Migration completed successfully." });
  } catch (error: any) {
    console.error("Migration failed:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Unknown error during migration" },
      { status: 500 }
    );
  }
}
