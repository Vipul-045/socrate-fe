import { Fragment } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, MonoLabel } from "@/components/site/primitives";
import { HeroScrollFade } from "@/components/motion/hero-scroll-fade";
import { RevealGroup, RevealItem } from "@/components/motion/reveal";
import {
  FREE_TIER_NOTE,
  STUDY_PILLARS,
  STUDY_PILLARS_HEADING,
} from "@/lib/content";
import { ENTITY_DESCRIPTION } from "@/lib/seo";
import { cn } from "@/lib/utils";

const heroButton = "h-[50px] rounded-lg px-[26px] text-[15px] tracking-[-0.008em]";

export function Hero({ showStats = true }: { showStats?: boolean }) {
  return (
    <section
      id="top"
      className="bg-paper pb-[clamp(3rem,6vw,4.5rem)] pt-[clamp(3.5rem,11vw,8.25rem)] [@media(max-height:500px)]:pt-12"
    >
      <Container>
        {/* One orchestrated entrance on first paint — CSS, so it doesn't wait
            for hydration — then the copy only eases back as you scroll. */}
        <HeroScrollFade className="mx-auto max-w-[880px] text-center">
          <MonoLabel className="animate-rise-in text-balance tracking-[0.12em] text-ink-soft sm:tracking-[0.16em]">
            Built so nothing goes over your head
          </MonoLabel>

          <h1 className="mt-[clamp(1.5rem,3vw,2.125rem)] animate-rise-in text-display text-balance [--rise-delay:60ms]">
            Everything you need to study, in one place.
          </h1>

          {/* The tagline, kept as the softer second line under the headline. */}
          <p className="mt-[clamp(0.875rem,1.8vw,1.25rem)] animate-rise-in text-[clamp(1.375rem,min(0.6rem+3vw,0.7rem+4.5vh),2.25rem)] font-medium leading-[1.12] tracking-[-0.032em] text-balance text-ink-soft [--rise-delay:120ms]">
            Drop your notes. Walk out knowing everything.
          </p>

          <p className="mx-auto mt-[clamp(1.375rem,3vw,1.875rem)] max-w-[600px] animate-rise-in text-lede text-pretty text-ink-soft [--rise-delay:180ms]">
            {ENTITY_DESCRIPTION}
          </p>

          <div className="mt-[clamp(1.875rem,4vw,2.5rem)] flex animate-rise-in flex-col items-stretch justify-center gap-2.5 [--rise-delay:240ms] sm:flex-row sm:items-center">
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

          {/* Each clause stays whole, so a narrow screen breaks the line
              after a dot rather than mid-phrase. */}
          <p className="mt-[clamp(1.25rem,2.6vw,1.625rem)] animate-rise-in text-xs tracking-[0.01em] text-balance text-ink-faint [--rise-delay:300ms]">
            {FREE_TIER_NOTE.split(" · ").map((part, i, parts) => (
              <Fragment key={part}>
                {i > 0 ? " " : null}
                <span className="whitespace-nowrap">
                  {part}
                  {i < parts.length - 1 ? " ·" : null}
                </span>
              </Fragment>
            ))}
          </p>
        </HeroScrollFade>

        {showStats ? (
          <div className="mt-[clamp(3.5rem,7vw,5.5rem)]">
            <h2 className="mb-[clamp(1.5rem,3vw,2.25rem)] text-center text-[clamp(1.25rem,2.2vw,1.5rem)] font-medium tracking-[-0.025em] text-balance text-ink">
              {STUDY_PILLARS_HEADING}
            </h2>
            <RevealGroup as="ul" className="grid border-t border-line sm:grid-cols-3">
              {STUDY_PILLARS.map((pillar, i) => (
                <RevealItem
                  as="li"
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
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
