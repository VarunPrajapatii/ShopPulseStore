/**
 * GSTIN validator — storefront-local implementation.
 *
 * GSTIN validation and buyer invoice helpers for checkout.
 * Do NOT import from the admin repo.
 *
 * A valid GSTIN is 15 characters:
 *   [0-9]{2}   — state code (2 digits)
 *   [A-Z]{5}   — PAN chars 1-5
 *   [0-9]{4}   — PAN chars 6-9
 *   [A-Z]{1}   — PAN char 10
 *   [1-9A-Z]{1}— entity number within state
 *   Z          — always 'Z'
 *   [0-9A-Z]{1}— Mod-36 checksum character
 */

const GSTIN_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const CHARSET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Validates the format and Mod-36 checksum of a GSTIN.
 *
 * Always pass an UPPERCASED string. The function does not normalise case
 * itself so that callers can show the raw input while validating.
 */
export function validateGstin(input: string): boolean {
  const s = input.toUpperCase();
  if (!GSTIN_RE.test(s)) return false;

  // Mod-36 checksum over the first 14 characters (1-indexed position p).
  let sum = 0;
  for (let i = 0; i < 14; i++) {
    const p = i + 1; // 1-indexed position
    const factor = p % 2 === 1 ? 1 : 2;
    const v = CHARSET.indexOf(s[i]) * factor;
    const add = Math.floor(v / 36) + (v % 36);
    sum += add;
  }

  const check = (36 - (sum % 36)) % 36;
  const expected = CHARSET[check];
  return expected === s[14];
}

/**
 * Derives the 2-digit state code from the first two characters of a GSTIN.
 * Callers must only invoke this after `validateGstin` returns `true`.
 */
export function deriveStateCode(gstin: string): string {
  return gstin.slice(0, 2);
}
