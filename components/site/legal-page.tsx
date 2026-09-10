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
          <MonoLabel>Last updated: {updated}</MonoLabel>
          <h1 className="mt-6 max-w-[16ch] text-h1 sm:mt-8">{title}</h1>
          <p className="mt-6 max-w-[34rem] text-lede text-ink-soft text-pretty sm:mt-8">
            {intro}
          </p>

          <div className="mt-[clamp(2.5rem,5vw,4.5rem)] grid gap-x-10 gap-y-10 lg:grid-cols-12">
            <nav
              aria-label="Contents"
              className="border-t border-line pt-7 lg:col-span-4"
            >
              <MonoLabel as="p">Contents</MonoLabel>
              <ul className="mt-6">
                {sections.map((section) => (
                  <li key={section.title}>
                    <a
                      href={`#${slug(section.title)}`}
                      className="text-body text-ink-soft transition-colors duration-200 hover:text-ink"
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-line lg:col-span-7 lg:col-start-6">
              {sections.map((section, i) => (
                <section
                  key={section.title}
                  id={slug(section.title)}
                  className="grid scroll-mt-24 gap-y-5 border-b border-line py-10 sm:py-12 lg:grid-cols-[3.25rem_1fr] lg:gap-y-0"
                >
                  <MonoLabel as="p" className="lg:pt-2.5">
                    {String(i + 1).padStart(2, "0")}
                  </MonoLabel>

                  <div>
                    <h2 className="text-[clamp(1.25rem,1.8vw,1.5rem)] font-semibold leading-snug tracking-[-0.018em]">
                      {section.title}
                    </h2>
                    <div className="mt-6 space-y-5">
                      {section.items.map((item) => (
                        <p
                          key={item.label}
                          className="text-body text-ink-soft text-pretty"
                        >
                          <span className="font-semibold text-ink">
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
