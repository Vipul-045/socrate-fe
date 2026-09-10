import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container, MonoLabel } from "@/components/site/primitives";
import { FREE_TIER_NOTE } from "@/lib/content";

export function Hero() {
  return (
    <section className="bg-paper pb-[clamp(3rem,6vw,5rem)] pt-[clamp(3.5rem,9vw,8.5rem)]">
      <Container className="text-center">
        {/* One orchestrated entrance on load, then the page stays still. */}
        <div className="animate-rise-in [animation-delay:0ms]">
          <MonoLabel>Built so nothing goes over your head</MonoLabel>
        </div>

        <h1 className="mx-auto mt-8 max-w-[14ch] animate-rise-in text-display text-balance [animation-delay:60ms] sm:mt-12">
          Drop your notes.{" "}
          <span className="text-ink-soft">Walk out knowing everything.</span>
        </h1>

        <p className="mx-auto mt-7 max-w-[34rem] animate-rise-in text-lede text-ink-soft [animation-delay:120ms] sm:mt-11">
          Upload any document and have an AI tutor explain, summarize, and quiz
          you instantly.
        </p>

        <div className="mt-9 flex animate-rise-in flex-col items-stretch justify-center gap-3 [animation-delay:180ms] sm:flex-row sm:items-center sm:gap-4 md:mt-11">
          <Button size="lg" asChild>
            <Link href="/login">
              Get Started Free
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <a href="#demo">Watch the demo</a>
          </Button>
        </div>

        <p className="mt-8 animate-rise-in text-small text-balance text-ink-faint [animation-delay:240ms] sm:mt-10">
          {FREE_TIER_NOTE}
        </p>
      </Container>
    </section>
  );
}
