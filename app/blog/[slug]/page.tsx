import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { Container, MonoLabel } from "@/components/site/primitives";
import { POSTS, getPost, formatPostDate, type Block } from "@/lib/blog";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }) {
  const post = getPost((await params).slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

/** Essay body is set in Crimson; headings drop back to the sans. */
function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2
                key={i}
                className="mb-[0.5em] mt-[clamp(2.125rem,3.6vw,3rem)] font-sans text-[clamp(1.3125rem,2.2vw,1.5625rem)] font-medium leading-tight tracking-[-0.024em] text-ink"
              >
                {block.text}
              </h2>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-[clamp(1.875rem,3.4vw,2.625rem)] border-l-2 border-[#d6d0c4] pl-[clamp(1.25rem,2.4vw,1.75rem)] text-[clamp(1.1875rem,2vw,1.375rem)] italic leading-[1.6] text-[#4a453d]"
              >
                {block.text}
              </blockquote>
            );
          case "list":
            return (
              <ol
                key={i}
                className="mb-[1.15em] flex list-decimal flex-col gap-[0.55em] pl-[1.4em]"
              >
                {block.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            );
          default:
            return (
              <p key={i} className="mb-[1.15em] last:mb-0">
                {block.text}
              </p>
            );
        }
      })}
    </>
  );
}

export default async function BlogPostPage({ params }: { params: Params }) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  return (
    <SiteShell>
      <article className="bg-paper pb-[clamp(3.5rem,7vw,5.5rem)] pt-[clamp(3rem,6vw,5rem)]">
        <Container>
          <div className="mx-auto max-w-[680px]">
          <Link
            href="/blog"
            className="group mb-[clamp(2rem,4vw,3rem)] inline-flex items-center gap-2 text-[13px] font-medium text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform duration-200 ease-calm group-hover:-translate-x-1"
              aria-hidden
            />
            All essays
          </Link>

          <header className="border-b border-line-strong pb-[clamp(1.75rem,3.4vw,2.5rem)]">
            <div className="mb-[clamp(1.25rem,2.4vw,1.75rem)] flex flex-wrap gap-[18px]">
              <MonoLabel as="span">{formatPostDate(post.date)}</MonoLabel>
              <MonoLabel as="span">{post.readingMinutes} min read</MonoLabel>
            </div>
            <h1 className="text-[clamp(1.875rem,4.4vw,2.875rem)] font-medium leading-[1.1] tracking-[-0.033em] text-balance">
              {post.title}
            </h1>
            <p className="mt-[clamp(1.125rem,2.2vw,1.625rem)] font-serif text-[clamp(1.1875rem,2vw,1.375rem)] italic leading-[1.55] text-pretty text-[#4a453d]">
              {post.excerpt}
            </p>
          </header>

          <div className="pt-[clamp(1.75rem,3.4vw,2.5rem)] font-serif text-[clamp(1.125rem,1.7vw,1.25rem)] leading-[1.75] text-[#332f29]">
            <Blocks blocks={post.body} />
          </div>

          <div className="mt-[clamp(2.5rem,5vw,3.75rem)] flex flex-wrap items-center justify-between gap-5 border-t border-line-strong pt-[clamp(1.5rem,3vw,2rem)]">
            <div>
              <p className="text-body font-medium tracking-[-0.015em]">
                Try it on your own notes
              </p>
              <p className="mt-1.5 text-small text-ink-soft">
                Free to start · No card required
              </p>
            </div>
            <Button className="h-12 rounded-lg px-6" asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
          </div>
        </Container>
      </article>
    </SiteShell>
  );
}
