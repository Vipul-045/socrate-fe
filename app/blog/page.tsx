import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { SiteShell } from "@/components/site/site-shell";
import { CtaBand } from "@/components/site/cta-band";
import {
  Container,
  MonoLabel,
  PageHeader,
  Section,
} from "@/components/site/primitives";
import { POSTS, formatPostDate } from "@/lib/blog";

export const metadata = {
  title: "Blog",
  description:
    "Occasional essays on study methods, memory, and building an AI tutor that actually teaches.",
};

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

          <ul>
            {POSTS.map((post) => (
              <li key={post.slug} className="border-t border-line">
                <article className="grid gap-4 py-10 sm:py-12 lg:grid-cols-12 lg:gap-10">
                  <MonoLabel
                    as="div"
                    className="leading-[1.7] lg:col-span-3 lg:pt-2"
                  >
                    {formatPostDate(post.date)}
                    <br />
                    {post.readingMinutes} min read
                  </MonoLabel>

                  <div className="lg:col-span-9">
                    <h2 className="text-h3 text-balance">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors duration-200 hover:text-ink-soft"
                      >
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-4 max-w-prose text-body text-ink-soft text-pretty">
                      {post.excerpt}
                    </p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group mt-4 inline-flex items-center gap-2 py-2 text-small font-medium text-ink"
                    >
                      Read essay
                      <ArrowRight
                        className="h-4 w-4 transition-transform duration-200 ease-calm group-hover:translate-x-1"
                        aria-hidden
                      />
                    </Link>
                  </div>
                </article>
              </li>
            ))}
          </ul>

          <p className="border-t border-line pt-10 text-small text-ink-faint">
            More essays coming soon.
          </p>
        </Container>
      </Section>

      <CtaBand />
    </SiteShell>
  );
}
