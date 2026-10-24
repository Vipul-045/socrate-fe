// lib/navigation.ts
//
// Where the site sends people: the app, and pages on this site named in a
// URL parameter (?next=, ?returnTo=). A parameter can only ever name a page
// here — never another site — so none of them is an open redirect.

/** The Socrate app. Signed in here means signed in there: one session (see lib/auth-api.ts). */
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://app.socrate.in";

const PROBE_ORIGIN = "https://socrate.invalid";

/**
 * `raw` as a path on this site (path, query and hash), or `fallback`. Parsed
 * the way the browser will parse it, so tricks like "//evil.com",
 * "/\evil.com" or a tab inside "/\t/evil.com" resolve to another origin and
 * are refused rather than slipping past a prefix check.
 */
export function safeInternalPath(raw: string | null | undefined, fallback: string): string {
  if (!raw || raw.length > 1024 || !raw.startsWith("/")) return fallback;
  try {
    const url = new URL(raw, PROBE_ORIGIN);
    if (url.origin !== PROBE_ORIGIN) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
