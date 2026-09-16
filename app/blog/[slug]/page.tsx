import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { SiteShell } from "@/components/site/site-shell";
import { CtaBand } from "@/components/site/cta-band";
import { Container, MonoLabel, Section } from "@/components/site/primitives";
import { POSTS, getPost, formatPostDate, type Block } from "@/lib/blog";

export function generateStaticParams() {
  return POSTS.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) return { title: "Not found" };
  return { title: post.title, description: post.excerpt };
}

function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <>
      {blocks.map((block, i) => {
        switch (block.type) {
          case "h2":
            return (
              <h2 key={i} className="mt-12 text-title sm:mt-14 sm:text-[1.375rem]">
                {block.text}
              </h2>
            );
          case "quote":
            return (
              <blockquote
                key={i}
                className="my-10 border-l border-ink pl-6 text-lede text-ink text-pretty sm:my-12 sm:pl-8"
              >
                {block.text}
              </blockquote>
            );
          case "list":
            return (
              <ul key={i} className="mt-6 space-y-3">
                {block.items.map((item) => (
                  <li
                    key={item}
                    className="flex gap-3 text-body text-ink-soft before:text-ink-faint before:content-['·']"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={i} className="mt-6 text-body text-ink-soft text-pretty">
                {block.text}
              </p>
            );
        }
      })}
    </>
  );
}

export default function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = getPost(params.slug);
  if (!post) notFound();

  return (
    <SiteShell>
      <Section>
        <Container>
          <Link
            href="/blog"
            className="group -my-2 inline-flex items-center gap-2 py-2 text-small text-ink-soft transition-colors hover:text-ink"
          >
            <ArrowLeft
              className="h-4 w-4 transition-transform duration-200 ease-calm group-hover:-translate-x-1"
              aria-hidden
            />
            All essays
          </Link>

          <article className="mt-10 max-w-prose sm:mt-14">
            <MonoLabel>
              {formatPostDate(post.date)} · {post.readingMinutes} min read
            </MonoLabel>
            <h1 className="mt-6 text-h1 text-balance sm:mt-8">{post.title}</h1>
            <p className="mt-6 border-b border-line pb-10 text-lede text-ink-soft text-pretty">
              {post.excerpt}
            </p>
            <div className="mt-2">
              <Blocks blocks={post.body} />
            </div>
          </article>
        </Container>
      </Section>

      <CtaBand
        title={<>Try it on your own notes.</>}
        note="Free to start. Cancel anytime."
      />
    </SiteShell>
  );
}
