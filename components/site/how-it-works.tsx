import {
  Container,
  MonoLabel,
  Section,
  SectionHeading,
} from "@/components/site/primitives";
import { STEPS } from "@/lib/content";

/**
 * A genuine sequence, so the steps are numbered and read left to right,
 * each held by a rule on its leading edge.
 */
export function HowItWorks() {
  return (
    <Section id="how-it-works" rule className="scroll-mt-20">
      <Container>
        <SectionHeading
          title="How it works"
          description="Three simple steps to transform your study experience."
        />

        <ol className="mt-10 grid sm:mt-16 md:grid-cols-3 md:gap-7 lg:gap-12">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="border-t border-line pb-2 pt-7 last:pb-0 md:border-l md:border-t-0 md:pb-0 md:pl-6 md:pt-0 lg:pl-7"
            >
              <MonoLabel>{String(i + 1).padStart(2, "0")}</MonoLabel>
              <h3 className="mt-7 text-title md:mt-10">{step.title}</h3>
              <p className="mt-3 max-w-[34ch] text-small text-ink-soft">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
