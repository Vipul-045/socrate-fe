/**
 * Single source of truth for SEO metadata defaults.
 * Page-level `metadata` exports override these; edit wording here.
 */

export const SITE_NAME = "Socrate";

/** Canonical origin, no trailing slash. Used for metadataBase, canonicals, and OG urls. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://socrate.in";

export const DEFAULT_TITLE = "Socrate Study Platform";

export const DEFAULT_DESCRIPTION =
  "Upload any PDF and have an AI tutor explain, summarize, and quiz you instantly.";
