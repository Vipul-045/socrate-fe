"use client";

import * as Accordion from "@radix-ui/react-accordion";

import { Container, Section } from "@/components/site/primitives";
import { FAQS } from "@/lib/content";

/** The + collapses to a − on open; nothing else moves. */
function Indicator() {
  return (
    <span
      aria-hidden
      className="relative ml-4 mt-1.5 h-3 w-3 shrink-0 text-ink-soft transition-colors group-hover:text-ink sm:ml-6"
    >
      <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
      <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-200 ease-calm group-data-[state=open]:scale-y-0" />
    </span>
  );
}

export function Faq({
  title = "Frequently asked questions",
  description = "Everything you need to know about Socrate.",
  rule = true,
}: {
  title?: string;
  description?: string;
  rule?: boolean;
}) {
  return (
    <Section id="faqs" rule={rule} className="scroll-mt-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-6">
            <h2 className="text-h2 text-balance">{title}</h2>
            <p className="mt-5 max-w-[26ch] text-lede text-ink-soft">
              {description}
            </p>
          </div>

          <Accordion.Root
            type="single"
            collapsible
            className="lg:col-span-6 lg:col-start-7"
          >
            {FAQS.map((faq, i) => (
              <Accordion.Item
                key={faq.q}
                value={`faq-${i}`}
                className="border-t border-line last:border-b"
              >
                <Accordion.Header>
                  <Accordion.Trigger className="group flex w-full cursor-pointer items-start justify-between py-5 text-left text-[1.0625rem] font-medium leading-snug tracking-[-0.01em] text-ink">
                    <span>{faq.q}</span>
                    <Indicator />
                  </Accordion.Trigger>
                </Accordion.Header>
                <Accordion.Content className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
                  <p className="max-w-[52ch] pb-6 pr-8 text-small text-ink-soft">
                    {faq.a}
                  </p>
                </Accordion.Content>
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>
      </Container>
    </Section>
  );
}
