import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, MonoLabel } from "@/components/site/primitives";
import {
  FREE_TIER_NOTE,
  STUDY_PILLARS,
  STUDY_PILLARS_HEADING,
} from "@/lib/content";
import { cn } from "@/lib/utils";

const heroButton = "h-[50px] rounded-lg px-[26px] text-[15px] tracking-[-0.008em]";

export function Hero({ showStats = true }: { showStats?: boolean }) {
  return (
    <section
      id="top"
      className="bg-paper pb-[clamp(3rem,6vw,4.5rem)] pt-[clamp(4.5rem,11vw,8.25rem)]"
    >
      <Container>
        {/* One orchestrated entrance on load, then the page stays still. */}
        <div className="mx-auto max-w-[880px] animate-rise-in text-center">
          <MonoLabel className="tracking-[0.16em] text-ink-soft">
            Built so nothing goes over your head
          </MonoLabel>

          <h1 className="mt-[clamp(1.5rem,3vw,2.125rem)] text-display text-balance">
            Drop your notes.
            <br />
            <span className="text-ink-soft">Walk out knowing everything.</span>
          </h1>

          <p className="mx-auto mt-[clamp(1.375rem,3vw,1.875rem)] max-w-measure text-lede text-pretty text-ink-soft">
            Upload any document and have an AI tutor explain, summarize, and quiz
            you instantly.
          </p>

          <div className="mt-[clamp(1.875rem,4vw,2.5rem)] flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center">
            <Button size="lg" className={heroButton} asChild>
              <Link href="/login">
                Get Started Free
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className={cn(heroButton, "px-[22px]")}
              asChild
            >
              <a href="#demo">Watch the demo</a>
            </Button>
          </div>

          <p className="mt-[clamp(1.25rem,2.6vw,1.625rem)] text-xs tracking-[0.01em] text-balance text-ink-faint">
            {FREE_TIER_NOTE}
          </p>
        </div>

        {showStats ? (
          <div className="mt-[clamp(3.5rem,7vw,5.5rem)]">
            <h2 className="mb-[clamp(1.5rem,3vw,2.25rem)] text-center text-[clamp(1.25rem,2.2vw,1.5rem)] font-medium tracking-[-0.025em] text-balance text-ink">
              {STUDY_PILLARS_HEADING}
            </h2>
            <ul className="grid border-t border-line sm:grid-cols-3">
              {STUDY_PILLARS.map((pillar, i) => (
                <li
                  key={pillar.title}
                  className={cn(
                    "px-[clamp(1.125rem,2.5vw,2rem)] py-[clamp(1.5rem,3vw,2rem)] text-center",
                    i > 0 && "border-t border-line sm:border-l sm:border-t-0",
                  )}
                >
                  <MonoLabel as="span" className="text-xs tracking-[0.1em] text-ink-faint">
                    {String(i + 1).padStart(2, "0")}
                  </MonoLabel>
                  <h3 className="mt-2.5 text-[clamp(1.375rem,2.4vw,1.75rem)] font-medium tracking-[-0.03em] text-ink">
                    {pillar.title}
                  </h3>
                  <p className="mx-auto mt-2 max-w-[30ch] text-small text-pretty text-ink-soft">
                    {pillar.description}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
