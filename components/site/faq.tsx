import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container, Section } from "@/components/site/primitives";
import { FaqList } from "@/components/site/faq-list";
import { Reveal } from "@/components/motion/reveal";
import { FAQS, type FaqItem } from "@/lib/content";
import { cn } from "@/lib/utils";

export { FaqList };

export function Faq({
  items = FAQS,
  title = "Frequently asked questions",
  description = "Everything you need to know about Socrate.",
  rule = true,
  seeAll = false,
}: {
  items?: readonly FaqItem[];
  title?: string;
  description?: string;
  rule?: boolean;
  /** Link to the full list on /faq — for sections that show only a few. */
  seeAll?: boolean;
}) {
  return (
    <Section id="faqs" rule={rule} aria-labelledby="faqs-title" className="scroll-mt-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          {/* The reveal sits inside the sticky column, never on it: a
              transform on a sticky element would fight the pinning. */}
          <div className="lg:sticky lg:top-[104px] lg:col-span-6 lg:self-start">
            <Reveal>
              <h2 id="faqs-title" className="text-h2 text-balance">
                {title}
              </h2>
              <p className="mt-5 max-w-[26ch] text-lede text-ink-soft">
                {description}
              </p>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="lg:col-span-6 lg:col-start-7">
            <FaqList items={items} />
            {seeAll ? (
              <Link
                href="/faq"
                className="group mt-6 inline-flex items-center gap-2 py-3 text-small font-medium text-[#3f3b34] transition-colors hover:text-ink"
              >
                See all questions
                <ArrowRight
                  className="h-3.5 w-3.5 transition-transform duration-200 ease-calm group-hover:translate-x-1"
                  aria-hidden
                />
              </Link>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

/**
 * A one-line pointer to /faq for pages that used to repeat the whole list
 * (features, pricing). Keeps the answers in one place.
 */
export function FaqPointer({
  text = "Questions about uploads, privacy or billing?",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <Section rule className={cn("py-[clamp(2.5rem,5vw,3.5rem)]", className)}>
      <Container>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
          <p className="text-lede text-pretty text-ink-soft">{text}</p>
          <Link
            href="/faq"
            className="group -my-3 inline-flex shrink-0 items-center gap-2 self-start py-3 text-small font-medium text-[#3f3b34] transition-colors hover:text-ink md:self-auto"
          >
            Read the Socrate FAQ
            <ArrowRight
              className="h-3.5 w-3.5 transition-transform duration-200 ease-calm group-hover:translate-x-1"
              aria-hidden
            />
          </Link>
        </div>
      </Container>
    </Section>
  );
}
