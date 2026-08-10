// lib/geo.ts

const INDIA_COUNTRY_CODE = "IN";

/**
 * Resolves the ISO-3166-1 alpha-2 country code for a request.
 *
 * Order of precedence:
 *  1. `x-vercel-ip-country` — set automatically by Vercel's edge network
 *     for every request, no extra package needed. This is "Vercel geolocation".
 *  2. A best-effort IP lookup (ipinfo.io) for non-Vercel environments
 *     (local dev, self-hosted, etc).
 *  3. "UNKNOWN" if nothing resolves — callers must treat unknown as
 *     non-India / global pricing, never assume the discounted region.
 */
export async function resolveCountryCode(headersList: Headers): Promise<string> {
  const vercelCountry = headersList.get("x-vercel-ip-country");
  if (vercelCountry) return vercelCountry.toUpperCase();

  const ip = getClientIp(headersList);
  if (ip) {
    const country = await lookupCountryByIp(ip);
    if (country) return country.toUpperCase();
  }

  return "UNKNOWN";
}

function getClientIp(headersList: Headers): string | null {
  const forwardedFor = headersList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0]!.trim();
  return headersList.get("x-real-ip");
}

async function lookupCountryByIp(ip: string): Promise<string | null> {
  // Loopback / local addresses can't be geolocated — don't waste a call.
  if (ip === "127.0.0.1" || ip === "::1") return null;

  try {
    const token = process.env.IPINFO_TOKEN;
    const url = token
      ? `https://ipinfo.io/${ip}/json?token=${token}`
      : `https://ipinfo.io/${ip}/json`;

    const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
    if (!res.ok) return null;

    const data = (await res.json()) as { country?: string };
    return data.country ?? null;
  } catch {
    // Network error, timeout, rate limit, etc — fail safe, don't block checkout.
    return null;
  }
}

export function isIndia(countryCode: string): boolean {
  return countryCode === INDIA_COUNTRY_CODE;
}