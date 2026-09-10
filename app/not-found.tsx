import Link from "next/link";

import { SiteShell } from "@/components/site/site-shell";
import { Button } from "@/components/ui/button";
import { Container, MonoLabel, Section } from "@/components/site/primitives";

export default function NotFound() {
  return (
    <SiteShell>
      <Section>
        <Container>
          <div className="max-w-measure py-[clamp(2rem,6vw,5rem)]">
            <MonoLabel>Error 404</MonoLabel>
            <h1 className="mt-6 text-h1">This page isn&apos;t here.</h1>
            <p className="mt-6 text-lede text-ink-soft">
              The link may be out of date. Start from the home page, or head
              straight to your documents.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" asChild>
                <Link href="/">Back to home</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/features">See what Socrate does</Link>
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </SiteShell>
  );
}
