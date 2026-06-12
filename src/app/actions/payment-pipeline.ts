"use server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { clients, transactions } from "@/db/schema";
import { convertMinorUnits } from "@/lib/finance/money";
import { rcmVendorTypes, writeRcmLedgerEntry } from "@/lib/finance/rcm";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const minorUnitString = z
  .string()
  .regex(/^\d+$/, "Use a non-negative integer string in minor currency units")
  .transform((value) => BigInt(value));

const uuid = z.string().uuid();

export const paymentPipelineSchema = z
  .object({
    clientId: uuid,
    grossUsdCents: minorUnitString,
    platformFeeUsdCents: minorUnitString,
    wiseConversionFeeInrPaise: minorUnitString,
    exchangeRate: minorUnitString.describe(
      "Scaled by 1,000,000 as INR paise per USD cent",
    ),
    status: z.enum(["pending", "settled", "failed"]).default("settled"),
    isRcmApplicable: z.boolean().default(false),
    rcmVendorType: z.enum(rcmVendorTypes).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.platformFeeUsdCents > value.grossUsdCents) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["platformFeeUsdCents"],
        message: "Platform fee cannot exceed gross amount",
      });
    }

    if (value.isRcmApplicable && !value.rcmVendorType) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rcmVendorType"],
        message: "RCM vendor type is required when RCM is applicable",
      });
    }
  });

export type PaymentPipelineInput = z.input<typeof paymentPipelineSchema>;

export async function createInternationalPayment(input: PaymentPipelineInput) {
  const payload = paymentPipelineSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new Error("Authentication required");
  }

  const netSourceUsdCents =
    payload.grossUsdCents - payload.platformFeeUsdCents;
  const convertedInrPaise = convertMinorUnits(
    netSourceUsdCents,
    payload.exchangeRate,
  );

  if (payload.wiseConversionFeeInrPaise > convertedInrPaise) {
    throw new Error("Wise conversion fee cannot exceed converted payout");
  }

  const netPayoutInrPaise =
    convertedInrPaise - payload.wiseConversionFeeInrPaise;

  const result = await db.transaction(async (tx) => {
    await tx.execute(
      sql`select set_config('request.jwt.claim.sub', ${user.id}, true)`,
    );

    const [client] = await tx
      .select({ id: clients.id })
      .from(clients)
      .where(and(eq(clients.id, payload.clientId), eq(clients.userId, user.id)))
      .limit(1);

    if (!client) {
      throw new Error("Client not found");
    }

    const [payment] = await tx
      .insert(transactions)
      .values({
        userId: user.id,
        clientId: payload.clientId,
        grossAmount: payload.grossUsdCents,
        platformFee: payload.platformFeeUsdCents,
        conversionFee: payload.wiseConversionFeeInrPaise,
        netPayout: netPayoutInrPaise,
        sourceCurrency: "USD",
        targetCurrency: "INR",
        exchangeRate: payload.exchangeRate,
        status: payload.status,
      })
      .returning();

    const rcmEntry =
      payload.isRcmApplicable && payload.rcmVendorType
        ? await writeRcmLedgerEntry({
            tx,
            userId: user.id,
            referenceType: "transaction",
            referenceId: payment.id,
            baseAmount: netPayoutInrPaise,
            vendorType: payload.rcmVendorType,
          })
        : null;

    return { payment, rcmEntry };
  });

  return {
    transactionId: result.payment.id,
    grossUsdCents: result.payment.grossAmount.toString(),
    platformFeeUsdCents: result.payment.platformFee.toString(),
    wiseConversionFeeInrPaise: result.payment.conversionFee.toString(),
    netPayoutInrPaise: result.payment.netPayout.toString(),
    rcmLedgerId: result.rcmEntry?.id ?? null,
  };
}
