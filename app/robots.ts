import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/seo";

/**
 * /login and /checkout are deliberately NOT disallowed here: they carry a
 * `noindex` meta tag, and crawlers can only honour that if they may fetch the page.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/api/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
