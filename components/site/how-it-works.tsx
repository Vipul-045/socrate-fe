import Link from "next/link";
import { ArrowRight } from "lucide-react";

import {
  Container,
  MonoLabel,
  Section,
} from "@/components/site/primitives";
import { JOURNEY, TOOLS } from "@/lib/content";
import { cn } from "@/lib/utils";

/**
 * The study journey as a timeline. Each step sits on a shared rule with a
 * node at its leading edge; with no column gap the rules join into one
 * line on desktop. The last step is filled in — that's where you end up.
 */
export function HowItWorks() {
  return (
    <Section
      id="how-it-works"
      rule
      aria-labelledby="journey-title"
      className="scroll-mt-20 py-[clamp(4rem,8vw,7rem)]"
    >
      <Container>
        <div className="mb-[clamp(2.75rem,5.5vw,4.5rem)] flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-[620px]">
            <MonoLabel className="mb-[clamp(1rem,2vw,1.25rem)]">
              How Socrate works
            </MonoLabel>
            <h2
              id="journey-title"
              className="text-[clamp(1.75rem,3.8vw,2.75rem)] font-medium leading-[1.06] tracking-[-0.034em] text-balance"
            >
              From your material to exam-ready
            </h2>
          </div>
          <p className="max-w-[380px] text-base leading-[1.65] text-pretty text-ink-soft">
            Socrate turns your study material into everything you need to learn,
            practice and revise.
          </p>
        </div>

        <ol className="grid gap-y-[clamp(2.25rem,4vw,3rem)] pl-1 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map((step, i) => {
            const last = i === JOURNEY.length - 1;
            return (
              <li
                key={step.title}
                className={cn(
                  "relative min-w-0 border-t pr-[clamp(1.25rem,2.4vw,2rem)] pt-[clamp(1.75rem,3vw,2.25rem)]",
                  last ? "border-ink" : "border-[#d6d0c4]",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "absolute -top-[5px] left-0 h-[9px] w-[9px] rounded-full",
                    last ? "bg-ink" : "border border-ink bg-paper",
                  )}
                />
                <div className="flex items-baseline gap-3">
                  <MonoLabel as="span">{String(i + 1).padStart(2, "0")}</MonoLabel>
                  <h3 className="text-[clamp(1.25rem,2vw,1.4375rem)] font-medium leading-[1.2] tracking-[-0.024em]">
                    {step.title}
                  </h3>
                </div>
                <p className="mt-2.5 text-body font-medium leading-[1.45] tracking-[-0.01em] text-pretty text-[#3f3b34]">
                  {step.lead}
                </p>
                <p className="mt-2.5 text-small text-pretty text-ink-soft">
                  {step.description}
                </p>
                <div className="mt-[18px] flex flex-wrap gap-1.5">
                  {step.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex h-[26px] items-center rounded-md border border-line-strong bg-card px-2.5 font-mono text-xs text-[#3f3b34]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </li>
            );
          })}
        </ol>

        <div className="mt-[clamp(3rem,6vw,4.5rem)] flex flex-col gap-4 border-t border-line pt-[clamp(1.25rem,2.4vw,1.625rem)] md:flex-row md:items-center md:justify-between md:gap-8">
          <ul
            aria-label="Included tools"
            className="flex flex-wrap items-center gap-x-3.5 gap-y-2.5"
          >
            {TOOLS.map((tool, i) => (
              <li
                key={tool}
                className="flex items-center gap-3.5 font-mono text-[13px] tracking-[0.02em] text-[#3f3b34]"
              >
                {i > 0 ? (
                  <span aria-hidden className="text-[#c9c3b6]">
                    ·
                  </span>
                ) : null}
                {tool}
              </li>
            ))}
          </ul>
          <Link
            href="/features"
            className="group inline-flex shrink-0 items-center gap-2 text-small font-medium text-[#3f3b34] transition-colors hover:text-ink"
          >
            See all features
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
