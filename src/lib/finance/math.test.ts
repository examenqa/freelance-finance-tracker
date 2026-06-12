import { describe, it, expect } from "vitest";
import {
  calculateBilledAmount,
  calculateWHT,
  calculateGSTRCM,
  calculateNetIncoming,
  calculateAgencyGains,
  parseDecimalToScaledBigInt,
} from "./math";

describe("Math Module - Independent Financial Fixtures", () => {
  it("should calculate billed amount accurately", () => {
    // Fixture: 1.50 hours at $50.00/hr = $75.00
    const hours = "1.50";
    const rateMinor = 5000n; // $50.00
    const expectedBilledMinor = 7500n; // $75.00

    expect(calculateBilledAmount(hours, rateMinor)).toBe(expectedBilledMinor);
  });

  it("should calculate WHT accurately with given rate", () => {
    // Fixture: Gross $1,000.00, WHT rate 0.1% = $1.00
    const grossAmountMinor = 100000n; // $1000.00
    const whtRate = "0.0010"; // 0.1%
    const expectedWHTMinor = 100n; // $1.00

    expect(calculateWHT(grossAmountMinor, whtRate)).toBe(expectedWHTMinor);
  });

  it("should calculate GST RCM accurately", () => {
    // Fixture: Service Charge $20.00, GST 18% = $3.60
    const serviceChargeMinor = 2000n; // $20.00
    const expectedGSTMinor = 360n; // $3.60

    expect(calculateGSTRCM(serviceChargeMinor, true)).toBe(expectedGSTMinor);
    expect(calculateGSTRCM(serviceChargeMinor, false)).toBe(0n);
  });

  it("should calculate Net Incoming accurately", () => {
    // Fixture: Gross $1000.00 - SC $20.00 - WHT $1.00 = Net $979.00
    const grossAmountMinor = 100000n;
    const serviceChargeMinor = 2000n;
    const whtMinor = 100n;
    const expectedNetMinor = 97900n;

    expect(calculateNetIncoming(grossAmountMinor, serviceChargeMinor, whtMinor)).toBe(
      expectedNetMinor,
    );
  });

  it("should calculate Agency Gains accurately", () => {
    // Fixture: Gross ($1000.00) - SC($20.00) - WHT($1.00) - Payouts($400.00) - Expenses($50.00) - GST($3.60) = $525.40
    const grossAmountMinor = 100000n;
    const serviceChargeMinor = 2000n;
    const whtMinor = 100n;
    const payoutsMinor = 40000n;
    const expensesMinor = 5000n;
    const gstRcmMinor = 360n;

    const expectedGainsMinor = 52540n;

    expect(
      calculateAgencyGains(
        grossAmountMinor,
        serviceChargeMinor,
        whtMinor,
        payoutsMinor,
        expensesMinor,
        gstRcmMinor,
      ),
    ).toBe(expectedGainsMinor);
  });

  it("should properly scale decimals to prevent float errors", () => {
    // 0.1 + 0.2 usually fails in float
    const val1 = "0.10";
    const val2 = "0.20";
    const b1 = parseDecimalToScaledBigInt(val1, 2); // 10n
    const b2 = parseDecimalToScaledBigInt(val2, 2); // 20n
    
    expect(b1 + b2).toBe(30n); // 0.30 -> 30n
  });
});
