export const EXCHANGE_RATE_SCALE = 1_000_000n;

export function roundDiv(numerator: bigint, denominator: bigint): bigint {
  if (denominator <= 0n) {
    throw new Error("Denominator must be positive");
  }

  return (numerator + denominator / 2n) / denominator;
}

export function convertMinorUnits(
  amountMinor: bigint,
  scaledExchangeRate: bigint,
): bigint {
  if (amountMinor < 0n) {
    throw new Error("Amount cannot be negative");
  }

  if (scaledExchangeRate <= 0n) {
    throw new Error("Exchange rate must be positive");
  }

  return roundDiv(amountMinor * scaledExchangeRate, EXCHANGE_RATE_SCALE);
}

export function percentageBps(amountMinor: bigint, bps: bigint): bigint {
  if (amountMinor < 0n || bps < 0n) {
    throw new Error("Amount and basis points cannot be negative");
  }

  return roundDiv(amountMinor * bps, 10_000n);
}
