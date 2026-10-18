import {
  Container,
  MonoLabel,
  Section,
} from "@/components/site/primitives";
import { AUDIENCES } from "@/lib/content";

export function WhoItsFor() {
  return (
    <Section id="who" rule aria-labelledby="who-title" className="scroll-mt-20">
      <Container>
        <div className="mb-[clamp(2.25rem,4.5vw,3.5rem)] max-w-[560px]">
          <MonoLabel className="mb-[clamp(1rem,2vw,1.25rem)]">
            Who it&apos;s for
          </MonoLabel>
          <h2 id="who-title" className="text-h2 text-balance">
            Built for anyone with something to learn.
          </h2>
        </div>

        <ul className="grid gap-[clamp(1.75rem,3.5vw,3rem)] md:grid-cols-3">
          {AUDIENCES.map((audience) => (
            <li
              key={audience.title}
              className="border-t border-ink pt-[clamp(1.125rem,2.2vw,1.5rem)]"
            >
              <h3 className="mb-2.5 text-title">{audience.title}</h3>
              <p className="text-body leading-[1.7] text-pretty text-ink-soft">
                {audience.description}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
