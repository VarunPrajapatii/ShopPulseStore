/**
 * Shared storefront API base and store identity.
 * Store-scoped clients use the ID in the API URL, with an optional fallback.
 * Cookie-dependent browser requests use the storefront's same-origin rewrite.
 */

export const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function getOrderSessionApiUrl(pathOrUrl: string): string {
  if (!API_URL) {
    throw new Error('NEXT_PUBLIC_API_URL is not configured');
  }

  const apiUrl = new URL(API_URL);
  const apiPath = apiUrl.pathname.replace(/\/+$/, '');
  const isAbsolute = /^[a-z][a-z\d+.-]*:/i.test(pathOrUrl);
  const target = isAbsolute
    ? new URL(pathOrUrl)
    : new URL(
        pathOrUrl === apiPath || pathOrUrl.startsWith(`${apiPath}/`)
          ? pathOrUrl
          : `${apiPath}/${pathOrUrl.replace(/^\/+/, '')}`,
        apiUrl.origin
      );

  if (target.origin !== apiUrl.origin) {
    throw new Error(
      'Order session URL must use the configured admin API origin'
    );
  }

  return `/api-proxy${target.pathname}${target.search}${target.hash}`;
}

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
