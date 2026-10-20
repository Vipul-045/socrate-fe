import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SiteShell } from "@/components/site/site-shell";
import { Container, MonoLabel, Section } from "@/components/site/primitives";

export default function NotFound() {
  return (
    <SiteShell>
      <Section className="py-[clamp(5rem,14vw,10rem)]">
        <Container>
          <div className="mx-auto max-w-[560px] text-center">
            <MonoLabel className="tracking-[0.16em] text-ink-soft">
              Error 404
            </MonoLabel>
            <h1 className="mt-[clamp(1.375rem,3vw,1.875rem)] text-page text-balance">
              This page isn&apos;t here
            </h1>
            <p className="mx-auto mt-[clamp(1.25rem,2.6vw,1.75rem)] max-w-measure text-lede text-pretty text-ink-soft">
              The link may be old, or the page may have moved. Everything else
              is right where you left it.
            </p>
            <div className="mt-[clamp(1.875rem,4vw,2.5rem)] flex flex-col items-stretch justify-center gap-2.5 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-[50px] rounded-lg px-[26px] text-[15px] tracking-[-0.008em]"
                asChild
              >
                <Link href="/">
                  Back to home
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-[50px] rounded-lg px-[22px] text-[15px] tracking-[-0.008em]"
                asChild
              >
                <Link href="/contact">Contact us</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
