import {
  Container,
  MonoLabel,
  Section,
} from "@/components/site/primitives";
import { Reveal } from "@/components/motion/reveal";
import { FEATURES, type Feature } from "@/lib/content";

/**
 * /features in depth: one ruled band per feature. What it does sits on the
 * left; how students use it, the problem it solves and where it helps sit
 * in a ruled column on the right. Stacks under lg.
 */

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-line-strong py-[clamp(1.25rem,2.4vw,1.625rem)]">
      <h3 className="text-body font-medium tracking-[-0.01em] text-ink">{title}</h3>
      {children}
    </div>
  );
}

function FeatureSection({ feature, index }: { feature: Feature; index: number }) {
  const titleId = `${feature.id}-title`;

  return (
    <Section id={feature.id} rule aria-labelledby={titleId} className="scroll-mt-20">
      <Container>
        <div className="grid gap-[clamp(1.75rem,5vw,4.5rem)] lg:grid-cols-12">
          <Reveal className="min-w-0 lg:col-span-5">
            <MonoLabel className="mb-[clamp(1.125rem,2.2vw,1.5rem)]">
              {String(index + 1).padStart(2, "0")}
            </MonoLabel>
            <h2 id={titleId} className="text-h2 text-balance">
              {feature.title}
            </h2>
            {feature.body.map((paragraph) => (
              <p
                key={paragraph}
                className="mt-[clamp(1rem,2vw,1.25rem)] text-base leading-[1.7] text-pretty text-ink-soft"
              >
                {paragraph}
              </p>
            ))}
          </Reveal>

          <Reveal
            delay={0.1}
            className="min-w-0 border-b border-line-strong lg:col-span-6 lg:col-start-7"
          >
            <Detail title="How students use it">
              <p className="mt-2 text-small leading-[1.7] text-pretty text-ink-soft">
                {feature.howTo}
              </p>
            </Detail>
            <Detail title="The problem it solves">
              <p className="mt-2 text-small leading-[1.7] text-pretty text-ink-soft">
                {feature.problem}
              </p>
            </Detail>
            <Detail title="Useful for">
              <ul className="mt-3 flex flex-col gap-2.5">
                {feature.useCases.map((useCase) => (
                  <li
                    key={useCase}
                    className="flex gap-2.5 text-small leading-normal text-ink-soft before:text-[#a39d91] before:content-['·']"
                  >
                    {useCase}
                  </li>
                ))}
              </ul>
            </Detail>
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}

export function FeatureSections() {
  return (
    <>
      {FEATURES.map((feature, i) => (
        <FeatureSection key={feature.id} feature={feature} index={i} />
      ))}
    </>
  );
}
