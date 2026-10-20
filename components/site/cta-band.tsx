import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, Section } from "@/components/site/primitives";
import { Reveal } from "@/components/motion/reveal";

type Action = { label: string; href: string };

/**
 * Closing call to action. `split` (interior pages) puts the button beside
 * the heading; `centered` (homepage) stacks everything with a supporting
 * line and an optional secondary action.
 */
export function CtaBand({
  title = "Start with your next document.",
  note = "Free to start. Cancel anytime.",
  action = { label: "Get Started Free", href: "/login" },
  variant = "split",
  lede,
  secondary,
}: {
  title?: React.ReactNode;
  note?: string;
  action?: Action;
  variant?: "split" | "centered";
  lede?: string;
  secondary?: Action;
}) {
  const primaryButton = (
    <Button
      size="lg"
      className="h-[52px] w-full rounded-lg px-7 text-[15px] tracking-[-0.008em] sm:w-auto"
      asChild
    >
      <Link href={action.href}>
        {action.label}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </Link>
    </Button>
  );

  if (variant === "centered") {
    return (
      <Section
        tone="surface"
        rule
        aria-labelledby="cta-title"
        className="py-[clamp(5rem,10vw,8.5rem)]"
      >
        <Container>
          <Reveal className="mx-auto max-w-[720px] text-center">
            <h2
              id="cta-title"
              className="text-[clamp(1.875rem,4.6vw,3.25rem)] font-medium leading-[1.06] tracking-[-0.035em] text-balance"
            >
              {title}
            </h2>
            {lede ? (
              <p className="mx-auto mt-[clamp(1rem,2vw,1.25rem)] max-w-[440px] text-base leading-[1.6] text-pretty text-ink-soft">
                {lede}
              </p>
            ) : null}
            <div className="mt-[clamp(1.75rem,3.5vw,2.25rem)] flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center">
              {primaryButton}
              {secondary ? (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-[52px] w-full rounded-lg border-[#d6d0c4] bg-transparent px-6 text-[15px] tracking-[-0.008em] text-[#3f3b34] hover:bg-[#e9e5dd] hover:text-ink sm:w-auto"
                  asChild
                >
                  <Link href={secondary.href}>{secondary.label}</Link>
                </Button>
              ) : null}
            </div>
            <p className="mt-[clamp(1.125rem,2.2vw,1.375rem)] text-xs tracking-[0.01em] text-ink-soft">
              {note}
            </p>
          </Reveal>
        </Container>
      </Section>
    );
  }

  return (
    <Section tone="surface" rule className="py-[clamp(4.5rem,9vw,7.5rem)]">
      <Container>
        <Reveal className="flex flex-col gap-[clamp(1.5rem,4vw,3rem)] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="max-w-measure text-h1 text-balance">{title}</h2>
            <p className="mt-3.5 text-body text-ink-soft">{note}</p>
          </div>
          <div className="sm:self-start lg:self-auto">{primaryButton}</div>
        </Reveal>
      </Container>
    </Section>
  );
}
