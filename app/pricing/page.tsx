import { SiteShell } from "@/components/site/site-shell";
import { Pricing } from "@/components/site/pricing/pricing";
import { Faq } from "@/components/site/faq";
import { CtaBand } from "@/components/site/cta-band";

export const metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing. Start free. Upgrade when ready.",
};

export default function PricingPage() {
  return (
    <SiteShell>
      <Pricing />
      <Faq />
      <CtaBand />
    </SiteShell>
  );
}
