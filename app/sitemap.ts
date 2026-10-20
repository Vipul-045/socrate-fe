import type { MetadataRoute } from "next";

import { POSTS, latestPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/seo";

/**
 * Indexable pages only — /login and /checkout are noindex and stay out.
 * `lastModified` is set only where we have a real date; a build timestamp on
 * every URL teaches search engines to ignore the field.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const newestPost = latestPosts(1)[0];

  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/features") },
    { url: absoluteUrl("/pricing") },
    { url: absoluteUrl("/faq") },
    { url: absoluteUrl("/about") },
    {
      url: absoluteUrl("/blog"),
      ...(newestPost && { lastModified: newestPost.date }),
    },
    ...POSTS.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: post.date,
    })),
    { url: absoluteUrl("/contact") },
    { url: absoluteUrl("/privacy") },
    { url: absoluteUrl("/terms") },
  ];
}
