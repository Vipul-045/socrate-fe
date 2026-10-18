import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Container,
  MonoLabel,
  Section,
} from "@/components/site/primitives";
import { formatPostDate, latestPosts } from "@/lib/blog";

/** The two newest essays. Renders nothing until there's something to show. */
export function LatestPosts({ count = 2 }: { count?: number }) {
  const posts = latestPosts(count);
  if (posts.length === 0) return null;

  return (
    <Section id="blog" rule aria-labelledby="blog-title" className="scroll-mt-20">
      <Container>
        <div className="mb-[clamp(1.75rem,3.5vw,2.75rem)] flex flex-wrap items-end justify-between gap-4">
          <div>
            <MonoLabel className="mb-[clamp(1rem,2vw,1.25rem)]">
              From the blog
            </MonoLabel>
            <h2 id="blog-title" className="text-h2">
              Latest articles
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-small font-medium text-[#3f3b34] transition-colors hover:text-ink"
          >
            View all articles
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 ease-calm group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>

        <div className="grid gap-[clamp(1.75rem,3.5vw,3rem)] md:grid-cols-2">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border-t border-line-strong pt-[clamp(1.25rem,2.4vw,1.625rem)]"
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <div className="mb-3.5 flex flex-wrap gap-4">
                  <MonoLabel as="span">
                    <time dateTime={post.date}>{formatPostDate(post.date)}</time>
                  </MonoLabel>
                  <MonoLabel as="span">{post.readingMinutes} min read</MonoLabel>
                </div>
                <h3 className="text-[clamp(1.1875rem,2vw,1.4375rem)] font-medium leading-[1.25] tracking-[-0.024em] text-balance transition-colors group-hover:text-ink-soft">
                  {post.title}
                </h3>
                <p className="mt-3 text-body leading-[1.7] text-pretty text-ink-soft">
                  {post.excerpt}
                </p>
              </Link>
            </article>
          ))}
        </div>
      </Container>
    </Section>
  );
}
