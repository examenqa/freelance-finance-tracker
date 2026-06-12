import test from 'node:test';
import assert from 'node:assert/strict';
import { extractISTDateString } from './date';

test('fiscal year boundary timezone simulation', () => {
  const originalTZ = process.env.TZ;
  
  // Explicitly override Node environment timezone to UTC to simulate Edge execution bounds
  process.env.TZ = 'UTC';

  // Test Case: Late-night March 31st UTC timestamp
  // March 31st 2026, 22:00:00 UTC
  // IST is UTC + 5:30 -> This equals April 1st 03:30:00 IST
  const inputDate = new Date('2026-03-31T22:00:00.000Z');

  const result = extractISTDateString(inputDate);
  
  // Assertion guarantees the edge runtime interceptor correctly shifts the fiscal year boundary
  assert.equal(result, '2026-04-01', 'Should properly roll over to April 1st IST from late March 31 UTC');

  // Teardown
  process.env.TZ = originalTZ;
});
