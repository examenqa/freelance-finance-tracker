import type { db as database } from "@/db";
import { gstRcmLedger } from "@/db/schema";
import { percentageBps } from "./money";

export const rcmVendorTypes = [
  "foreign_platform_service",
  "foreign_professional_service",
  "domestic_unregistered",
  "domestic_registered",
] as const;

export type RcmVendorType = (typeof rcmVendorTypes)[number];
export type RcmReferenceType = "transaction" | "expense";

const GST_RATE_BPS_BY_VENDOR_TYPE: Record<RcmVendorType, bigint> = {
  foreign_platform_service: 1_800n,
  foreign_professional_service: 1_800n,
  domestic_unregistered: 1_800n,
  domestic_registered: 0n,
};

type RcmWriter = Pick<typeof database, "insert">;

type WriteRcmLedgerInput = {
  tx: RcmWriter;
  userId: string;
  referenceType: RcmReferenceType;
  referenceId: string;
  baseAmount: bigint;
  vendorType: RcmVendorType;
};

export async function writeRcmLedgerEntry({
  tx,
  userId,
  referenceType,
  referenceId,
  baseAmount,
  vendorType,
}: WriteRcmLedgerInput) {
  const rcmLiability = percentageBps(
    baseAmount,
    GST_RATE_BPS_BY_VENDOR_TYPE[vendorType],
  );

  if (rcmLiability === 0n) {
    return null;
  }

  const [entry] = await tx
    .insert(gstRcmLedger)
    .values({
      userId,
      referenceType,
      referenceId,
      baseAmount,
      rcmLiability,
      status: "unpaid",
    })
    .returning();

  return entry;
}
