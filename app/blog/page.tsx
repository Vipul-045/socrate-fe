import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteShell } from "@/components/site/site-shell";
import {
  Container,
  MonoLabel,
  PageHeader,
  Section,
} from "@/components/site/primitives";
import { POSTS, formatPostDate } from "@/lib/blog";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Blog",
  description:
    "Occasional essays on study methods, memory, and building an AI tutor that actually teaches.",
  path: "/blog",
});

export default function BlogPage() {
  return (
    <SiteShell>
      <Section>
        <Container>
          <PageHeader
            eyebrow="Writing"
            title="Notes on learning well"
            lede="Occasional essays on study methods, memory, and building an AI tutor that actually teaches."
          />

          {/* First screen, so the list carries on the header's entrance. */}
          <ul className="border-t border-line-strong">
            {POSTS.map((post, i) => (
              <li
                key={post.slug}
                style={{ "--rise-delay": `${200 + Math.min(i, 4) * 60}ms` } as CSSProperties}
                className="animate-rise-in border-b border-line-strong"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  className="group flex flex-col items-start gap-[clamp(0.875rem,4vw,4rem)] py-[clamp(1.75rem,3.6vw,2.75rem)] transition-colors duration-200 hover:bg-surface sm:flex-row"
                >
                  {/* One meta line on phones, a stacked date column beside the
                      essay from sm up. */}
                  <div className="flex flex-none flex-wrap gap-x-4 gap-y-2 sm:w-[150px] sm:flex-col">
                    <MonoLabel as="span">{formatPostDate(post.date)}</MonoLabel>
                    <MonoLabel as="span">{post.readingMinutes} min read</MonoLabel>
                  </div>

                  <article className="min-w-0 max-w-[620px] flex-1">
                    <h2 className="text-h3 text-balance">{post.title}</h2>
                    <p className="mt-3 text-body leading-[1.7] text-pretty text-ink-soft">
                      {post.excerpt}
                    </p>
                    <span className="mt-[18px] inline-flex items-center gap-2 text-[13px] font-medium text-[#3f3b34]">
                      Read essay
                      <ArrowRight
                        className="h-3.5 w-3.5 transition-transform duration-200 ease-calm group-hover:translate-x-1"
                        aria-hidden
                      />
                    </span>
                  </article>
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-[clamp(1.75rem,3vw,2.25rem)] text-xs leading-relaxed text-ink-muted">
            More essays coming soon.
          </p>
        </Container>
      </Section>
    </SiteShell>
  );
}
