import { SiteShell } from "@/components/site/site-shell";
import { Hero } from "@/components/site/hero";
import { ValueProps } from "@/components/site/value-props";
import { DemoVideo } from "@/components/site/demo-video";
import { HowItWorks } from "@/components/site/how-it-works";
import { Faq } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";
import { Container } from "@/components/site/primitives";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />

      <section aria-label="Why Socrate" className="pb-[clamp(3rem,5vw,4.5rem)]">
        <Container>
          <ValueProps />
        </Container>
      </section>

      <DemoVideo />
      <HowItWorks />
      <Faq />
      <CtaBand />
    </SiteShell>
  );
}
