/**
 * Shared storefront API base and store identity.
 * Store-scoped clients use the ID in the API URL, with an optional fallback.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getStoreId(): string | undefined {
  if (API_URL) {
    try {
      const segments = new URL(API_URL).pathname.split('/').filter(Boolean);
      return segments[segments.length - 1] || process.env.NEXT_PUBLIC_STORE_ID;
    } catch {
      return process.env.NEXT_PUBLIC_STORE_ID;
    }
  }
  return process.env.NEXT_PUBLIC_STORE_ID;
}
