import { percentageBps, roundDiv } from "./money";

/**
 * Parses a decimal value (string or number) into a scaled bigint.
 * E.g., parseDecimal("1.50", 2) => 150n
 */
export function parseDecimalToScaledBigInt(
  val: string | number,
  scale: number = 2,
): bigint {
  const numStr = Number(val).toFixed(scale);
  const [integerPart, fractionalPart] = numStr.split(".");
  return BigInt(integerPart + fractionalPart);
}

/**
 * Calculate the gross billed amount for a time entry.
 * @param hours Decimal string or number (e.g., "1.5" or 1.5)
 * @param billedRateMinor Billed rate in minor units (e.g., cents)
 */
export function calculateBilledAmount(
  hours: string | number,
  billedRateMinor: bigint,
): bigint {
  const hoursScaled = parseDecimalToScaledBigInt(hours, 2);
  // hoursScaled is multiplied by 100, so we must divide by 100 after multiplication
  return roundDiv(hoursScaled * billedRateMinor, 100n);
}

/**
 * Calculate Withholding Tax (WHT).
 * @param grossAmountMinor Gross amount in minor units
 * @param whtRate Decimal string for WHT rate (e.g., "0.0010" for 0.1%)
 */
export function calculateWHT(
  grossAmountMinor: bigint,
  whtRate: string | number,
): bigint {
  // Convert WHT rate to basis points (1 bp = 0.01% = 0.0001)
  // "0.0010" -> 0.1% -> 10 bps
  // If whtRate is "0.0010", Number("0.0010") * 10000 = 10
  const bps = parseDecimalToScaledBigInt(whtRate, 4); // "0.0010" -> 10n
  return percentageBps(grossAmountMinor, bps);
}

/**
 * Calculate GST RCM.
 * GST is 18% (1800 bps) of the service charge if RCM is applicable.
 * @param serviceChargeMinor Service charge in minor units
 * @param isRcmApplicable boolean
 */
export function calculateGSTRCM(
  serviceChargeMinor: bigint,
  isRcmApplicable: boolean,
): bigint {
  if (!isRcmApplicable) return 0n;
  const GST_RATE_BPS = 1800n; // 18%
  return percentageBps(serviceChargeMinor, GST_RATE_BPS);
}

/**
 * Calculate Net Incoming amount.
 * @param grossAmountMinor 
 * @param serviceChargeMinor 
 * @param whtMinor 
 */
export function calculateNetIncoming(
  grossAmountMinor: bigint,
  serviceChargeMinor: bigint,
  whtMinor: bigint,
): bigint {
  return grossAmountMinor - serviceChargeMinor - whtMinor;
}

/**
 * Calculate Agency Gains.
 * Gains = received gross income - deductions - paid payouts - expenses - GST RCM
 * Deductions could be service charge and wht.
 */
export function calculateAgencyGains(
  grossAmountMinor: bigint,
  serviceChargeMinor: bigint,
  whtMinor: bigint,
  payoutsMinor: bigint,
  expensesMinor: bigint,
  gstRcmMinor: bigint,
): bigint {
  return (
    grossAmountMinor -
    serviceChargeMinor -
    whtMinor -
    payoutsMinor -
    expensesMinor -
    gstRcmMinor
  );
}
