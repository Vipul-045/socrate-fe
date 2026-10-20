import { ChevronDown } from "lucide-react";

import { SiteShell } from "@/components/site/site-shell";
import { Container, MonoLabel, Section } from "@/components/site/primitives";

export type LegalSection = {
  title: string;
  items: { label: string; text: string }[];
};

const slug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Shared shell for Privacy and Terms.
 *
 * Long-form reading, so the page is built as a contents column beside a
 * numbered section column — the numbers are a real sequence here, and the
 * contents list is what makes a policy navigable.
 */
export function LegalPage({
  title,
  updated,
  intro,
  sections,
}: {
  title: string;
  updated: string;
  intro: string;
  sections: LegalSection[];
}) {
  return (
    <SiteShell>
      <Section>
        <Container>
          <MonoLabel className="tracking-[0.16em] text-ink-soft">
            Last updated: {updated}
          </MonoLabel>
          <h1 className="mt-[clamp(1.375rem,3vw,1.875rem)] text-page text-balance">
            {title}
          </h1>
          <p className="mt-[clamp(1.25rem,2.6vw,1.75rem)] max-w-[560px] text-lede text-pretty text-ink-soft">
            {intro}
          </p>

          <div className="mt-[clamp(2.5rem,5vw,3.75rem)] grid items-start gap-[clamp(2rem,5vw,4.5rem)] lg:grid-cols-[minmax(220px,1fr)_minmax(0,2fr)]">
            {/* Phones and tablets: contents fold away behind one row so the
                policy itself starts on the first screen. */}
            <details className="group border-t border-line-strong lg:hidden">
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
                <MonoLabel as="span">
                  Contents · {sections.length} sections
                </MonoLabel>
                <ChevronDown
                  aria-hidden
                  className="h-4 w-4 text-ink-soft transition-transform duration-200 ease-calm group-open:rotate-180"
                />
              </summary>
              <nav aria-label="Contents" className="pb-3">
                <ul>
                  {sections.map((section, i) => (
                    <li key={section.title} className="border-t border-line">
                      <a
                        href={`#${slug(section.title)}`}
                        className="flex min-h-11 items-center gap-4 text-small text-ink-soft transition-colors duration-200 hover:text-ink"
                      >
                        <MonoLabel as="span" className="w-5 flex-none">
                          {String(i + 1).padStart(2, "0")}
                        </MonoLabel>
                        {section.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </details>

            <nav
              aria-label="Contents"
              className="hidden border-t border-line-strong pt-[18px] lg:sticky lg:top-[104px] lg:block"
            >
              <MonoLabel as="p">Contents</MonoLabel>
              <ul className="mt-3.5 flex flex-col gap-[9px]">
                {sections.map((section) => (
                  <li key={section.title}>
                    <a
                      href={`#${slug(section.title)}`}
                      className="text-small text-ink-soft transition-colors duration-200 hover:text-ink"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="max-w-[720px] border-b border-line-strong">
              {sections.map((section, i) => (
                <section
                  key={section.title}
                  id={slug(section.title)}
                  className="flex scroll-mt-[104px] gap-[clamp(1rem,2.4vw,1.75rem)] border-t border-line-strong py-[clamp(1.75rem,3.4vw,2.5rem)]"
                >
                  <MonoLabel as="span" className="flex-none pt-[5px]">
                    {String(i + 1).padStart(2, "0")}
                  </MonoLabel>

                  <div className="min-w-0">
                    <h2 className="mb-[clamp(1rem,2vw,1.375rem)] text-[clamp(1.1875rem,2vw,1.4375rem)] font-medium leading-tight tracking-[-0.022em]">
                      {section.title}
                    </h2>
                    <div className="flex flex-col gap-4">
                      {section.items.map((item) => (
                        <p
                          key={item.label}
                          className="text-body leading-[1.7] text-pretty text-ink-soft"
                        >
                          <span className="font-medium text-ink">
                            {item.label}
                          </span>{" "}
                          {item.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
