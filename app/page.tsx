import { SiteShell } from "@/components/site/site-shell";
import { Hero } from "@/components/site/hero";
import { DemoVideo } from "@/components/site/demo-video";
import { HowItWorks } from "@/components/site/how-it-works";
import { Faq } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";

export default function HomePage() {
  return (
    <SiteShell>
      <Hero />
      <DemoVideo />
      <HowItWorks />
      <Faq />
      <CtaBand />
    </SiteShell>
  );
}
